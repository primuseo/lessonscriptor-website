import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getDb } from '@/lib/db'

const REPORT_TO_EMAIL = 'dev@primuseo.com'

const GROQ_RPM_LIMIT = 400
const GROQ_ASH_LIMIT = 400_000
const CAPACITY_FLAG_RATIO = 0.5

function fmt(n: unknown): string {
  const num = Number(n ?? 0)
  return Number.isFinite(num) ? num.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0'
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expected = process.env.WEEKLY_REPORT_SECRET
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()

  try {
    const [
      totalUsers,
      totalTrialUsers,
      totalPurchasedUsers,
      trialConverted,
      newUsersByType,
      purchasesWeek,
      purchasesAllTime,
      activeUsersWeek,
      secondsWeek,
      peakConcurrentRow,
      peakRpmRow,
      peakAshRow,
      feedbackWeek,
    ] = await Promise.all([
      sql`SELECT count(*) AS c FROM users`,
      sql`SELECT count(*) AS c FROM users WHERE is_trial`,
      sql`SELECT count(*) AS c FROM users WHERE total_seconds_purchased > 0`,
      sql`SELECT count(*) AS c FROM users WHERE is_trial AND total_seconds_purchased > 0`,
      sql`SELECT is_trial, count(*) AS c FROM users WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY is_trial`,
      sql`SELECT count(*) AS c, coalesce(sum(seconds),0) AS s FROM credit_transactions WHERE type='purchase' AND created_at > NOW() - INTERVAL '7 days'`,
      sql`SELECT count(*) AS c, coalesce(sum(seconds),0) AS s FROM credit_transactions WHERE type='purchase'`,
      sql`SELECT count(DISTINCT user_email) AS c FROM credit_transactions WHERE type='deduction' AND created_at > NOW() - INTERVAL '7 days'`,
      sql`SELECT coalesce(sum(abs(seconds)),0) AS s FROM credit_transactions WHERE type='deduction' AND created_at > NOW() - INTERVAL '7 days'`,
      sql`SELECT max(cu) AS m FROM (SELECT date_trunc('minute',created_at) AS m, count(DISTINCT user_email) AS cu FROM credit_transactions WHERE type='deduction' AND created_at > NOW() - INTERVAL '7 days' GROUP BY 1) t`,
      sql`SELECT max(rc) AS m FROM (SELECT date_trunc('minute',created_at) AS m, count(*) AS rc FROM credit_transactions WHERE type='deduction' AND created_at > NOW() - INTERVAL '7 days' GROUP BY 1) t`,
      sql`SELECT max(ah) AS m FROM (SELECT date_trunc('hour',created_at) AS h, coalesce(sum(abs(seconds)),0) AS ah FROM credit_transactions WHERE type='deduction' AND created_at > NOW() - INTERVAL '7 days' GROUP BY 1) t`,
      sql`SELECT source, count(*) AS c FROM feedback WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY source ORDER BY count(*) DESC`,
    ])

    const newTrial = (newUsersByType as { is_trial: boolean; c: string }[]).find(r => r.is_trial)?.c ?? '0'
    const newNonTrial = (newUsersByType as { is_trial: boolean; c: string }[]).find(r => !r.is_trial)?.c ?? '0'

    const peakConcurrent = Number(peakConcurrentRow[0]?.m ?? 0)
    const peakRpm = Number(peakRpmRow[0]?.m ?? 0)
    const peakAsh = Number(peakAshRow[0]?.m ?? 0)

    const rpmFlag = peakRpm >= GROQ_RPM_LIMIT * CAPACITY_FLAG_RATIO
    const ashFlag = peakAsh >= GROQ_ASH_LIMIT * CAPACITY_FLAG_RATIO
    const capacityFlagged = rpmFlag || ashFlag

    const feedbackRows = feedbackWeek as { source: string; c: string }[]
    const feedbackLine = feedbackRows.length
      ? feedbackRows.map(r => `${r.source || 'unknown'}: ${r.c}`).join(', ')
      : 'none this week'

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const dateRange = `${weekAgo.toISOString().slice(0, 10)} to ${now.toISOString().slice(0, 10)}`

    const body = `LessonScriptor Weekly Usage Report — ${dateRange}

SIGNUPS
Total users ever: ${fmt(totalUsers[0]?.c)}
New this week — trial: ${fmt(newTrial)}, non-trial: ${fmt(newNonTrial)}
(created_at was added 2026-08-26 — "new this week" undercounts until real history accumulates)

TRIALS & CONVERSION
Total trial users ever: ${fmt(totalTrialUsers[0]?.c)}
Trial users who ever converted to paid: ${fmt(trialConverted[0]?.c)}

PURCHASES
This week: ${fmt(purchasesWeek[0]?.c)} purchases, ${fmt(purchasesWeek[0]?.s)} seconds sold
All-time: ${fmt(purchasesAllTime[0]?.c)} purchases, ${fmt(purchasesAllTime[0]?.s)} seconds sold

TRANSCRIPTION USAGE (last 7 days)
Active transcribing users: ${fmt(activeUsersWeek[0]?.c)}
Total seconds transcribed: ${fmt(secondsWeek[0]?.s)}

CAPACITY HEADROOM (last 7 days, vs Groq Dev plan for whisper-large-v3-turbo)
Peak concurrent users (same minute): ${fmt(peakConcurrent)}
Peak requests/minute: ${fmt(peakRpm)} (limit ${fmt(GROQ_RPM_LIMIT)})
Peak audio-seconds/hour: ${fmt(peakAsh)} (limit ${fmt(GROQ_ASH_LIMIT)})
${capacityFlagged ? '⚠️ Within 50% of a Groq capacity limit this week — worth a look.' : 'Well within capacity — no action needed.'}

FEEDBACK / CHURN (last 7 days)
${feedbackLine}
`

    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.CONTACT_FROM_EMAIL
    if (!apiKey || !fromEmail) {
      console.error('[WeeklyReport] Missing RESEND_API_KEY or CONTACT_FROM_EMAIL')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: REPORT_TO_EMAIL,
      subject: `LessonScriptor Weekly Usage Report — ${dateRange}`,
      text: body,
    })

    if (error) {
      console.error('[WeeklyReport] Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, dateRange, capacityFlagged })
  } catch (err) {
    console.error('[WeeklyReport] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
