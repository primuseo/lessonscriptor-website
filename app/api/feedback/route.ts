import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { getDb } from '@/lib/db';
import { handlePreflight, jsonResponse } from '@/lib/cors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit('feedback', { requests: 5, window: '3600 s' }, ip);
  if (!rl.success) {
    return jsonResponse(
      { error: 'Too many feedback submissions. Please try later.' },
      429,
      request
    );
  }

  let body: { text?: string; version?: string; lang?: string; source?: string; email?: string; reasonCode?: string; event_type?: string; variant?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }

  const { text, version, lang, source, email, reasonCode, event_type, variant } = body;

  // Telemetry events (review-prompt gate: shown/yes/no/rate_clicked) carry no
  // user text and shouldn't trigger the Resend notification below.
  const isEvent = typeof event_type === 'string' && event_type.trim().length > 0;

  if (!isEvent && (!text || typeof text !== 'string' || !text.trim())) {
    return jsonResponse({ error: 'text is required' }, 400, request);
  }

  // Optional — the user is not required to leave contact details. Loosely
  // validated (not a full RFC 5322 check) since this only gates whether we
  // store a follow-up address, not whether the feedback itself is accepted.
  const trimmedEmail = (email || '').trim().slice(0, 254);
  const sanitizedEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) ? trimmedEmail : '';

  const sanitized = isEvent ? null : text!.trim().slice(0, 2000);
  const sanitizedReasonCode = (reasonCode || '').trim().slice(0, 40) || null;
  const sanitizedEventType = isEvent ? event_type!.trim().slice(0, 30) : null;
  const sanitizedVariant = (variant || '').trim().slice(0, 10) || null;
  const sql = getDb();

  try {
    await sql`
      INSERT INTO feedback (text, extension_version, lang, source, ip, email, reason_code, event_type, variant)
      VALUES (
        ${sanitized},
        ${(version || '').slice(0, 20)},
        ${(lang || '').slice(0, 10)},
        ${(source || 'unknown').slice(0, 30)},
        ${ip},
        ${sanitizedEmail || null},
        ${sanitizedReasonCode},
        ${sanitizedEventType},
        ${sanitizedVariant}
      )
    `;

    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    if (!isEvent && resendKey && toEmail) {
      const resend = new Resend(resendKey);
      const fromEmail = process.env.CONTACT_FROM_EMAIL || 'noreply@lessonscriptor.com';
      resend.emails.send({
        from: `LessonScriptor <${fromEmail}>`,
        to: toEmail,
        subject: `Uninstall feedback: ${sanitized!.slice(0, 60)}`,
        text: `Source: ${source || 'uninstall'}\nVersion: ${version || '—'}\nLang: ${lang || '—'}\nFollow-up email: ${sanitizedEmail || '—'}\n\n${sanitized}`,
      }).catch(e => console.error('[Feedback] Resend error:', e));
    }

    return jsonResponse({ ok: true }, 200, request);
  } catch (err) {
    console.error('[Feedback] DB error:', err);
    return jsonResponse({ error: 'Internal error' }, 500, request);
  }
}
