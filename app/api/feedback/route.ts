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

  let body: { text?: string; version?: string; lang?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }

  const { text, version, lang, source } = body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return jsonResponse({ error: 'text is required' }, 400, request);
  }

  const sanitized = text.trim().slice(0, 2000);
  const sql = getDb();

  try {
    await sql`
      INSERT INTO feedback (text, extension_version, lang, source, ip)
      VALUES (
        ${sanitized},
        ${(version || '').slice(0, 20)},
        ${(lang || '').slice(0, 10)},
        ${(source || 'unknown').slice(0, 30)},
        ${ip}
      )
    `;

    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    if (resendKey && toEmail) {
      const resend = new Resend(resendKey);
      const fromEmail = process.env.CONTACT_FROM_EMAIL || 'noreply@lessonscriptor.com';
      resend.emails.send({
        from: `LessonScriptor <${fromEmail}>`,
        to: toEmail,
        subject: `Uninstall feedback: ${sanitized.slice(0, 60)}`,
        text: `Source: ${source || 'uninstall'}\nVersion: ${version || '—'}\nLang: ${lang || '—'}\n\n${sanitized}`,
      }).catch(e => console.error('[Feedback] Resend error:', e));
    }

    return jsonResponse({ ok: true }, 200, request);
  } catch (err) {
    console.error('[Feedback] DB error:', err);
    return jsonResponse({ error: 'Internal error' }, 500, request);
  }
}
