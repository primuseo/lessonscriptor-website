import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getDb } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth';
import { handlePreflight, jsonResponse } from '@/lib/cors';

import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 30;

const MAX_ACTIVE_SESSIONS = 2;
const GRACE_PERIOD_SECONDS = 600;

const SILENCE_HALLUCINATIONS = new Set([
  'thanks for watching', 'thank you for watching', 'thank you', 'thanks',
  'thanks for listening', 'thank you for listening', 'please subscribe',
  'like and subscribe', 'subtitles by', 'sous-titres par', 'sous-titres réalisés par',
  'merci', 'merci de votre attention', "merci d'avoir regardé",
  'gracias', 'gracias por ver', 'gracias por vernos',
  'danke', 'danke fürs zuschauen',
  'obrigado', 'obrigada',
]);

function isHallucination(text: string | undefined): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().replace(/[.,!?…\s]+$/g, '').trim();
  if (!normalized) return true;
  return SILENCE_HALLUCINATIONS.has(normalized);
}

const DEFAULT_PROVIDER = process.env.TRANSCRIPTION_PROVIDER || 'groq';

const groqClient = process.env.GROQ_API_KEY
  ? new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
  : null;
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function looksLikeSilence(buffer: Buffer): boolean {
  if (buffer.length < 100) return true;
  const step = Math.max(1, Math.floor(buffer.length / 200));
  let sum = 0;
  let count = 0;
  for (let i = 0; i < buffer.length; i += step) {
    sum += buffer[i];
    count++;
  }
  const avg = sum / count;
  return avg < 3 || (avg > 125 && avg < 131);
}

const LANGUAGE_NAME_TO_ISO: Record<string, string> = {
  afrikaans:'af',albanian:'sq',amharic:'am',arabic:'ar',armenian:'hy',azerbaijani:'az',
  basque:'eu',belarusian:'be',bengali:'bn',bosnian:'bs',breton:'br',bulgarian:'bg',
  burmese:'my',castilian:'es',catalan:'ca',chinese:'zh',croatian:'hr',czech:'cs',
  danish:'da',dutch:'nl',english:'en',estonian:'et',faroese:'fo',finnish:'fi',
  flemish:'nl',french:'fr',galician:'gl',georgian:'ka',german:'de',greek:'el',
  gujarati:'gu',haitian:'ht',hausa:'ha',hawaiian:'haw',hebrew:'he',hindi:'hi',
  hungarian:'hu',icelandic:'is',indonesian:'id',italian:'it',japanese:'ja',
  javanese:'jv',kannada:'kn',kazakh:'kk',khmer:'km',korean:'ko',lao:'lo',latin:'la',
  latvian:'lv',letzeburgesch:'lb',lingala:'ln',lithuanian:'lt',luxembourgish:'lb',
  macedonian:'mk',malagasy:'mg',malay:'ms',malayalam:'ml',maltese:'mt',maori:'mi',
  marathi:'mr',moldavian:'ro',moldovan:'ro',mongolian:'mn',myanmar:'my',nepali:'ne',
  norwegian:'no',nynorsk:'nn',occitan:'oc',panjabi:'pa',pashto:'ps',persian:'fa',
  polish:'pl',portuguese:'pt',punjabi:'pa',pushto:'ps',romanian:'ro',russian:'ru',
  sanskrit:'sa',serbian:'sr',shona:'sn',sindhi:'sd',sinhala:'si',sinhalese:'si',
  slovak:'sk',slovenian:'sl',somali:'so',spanish:'es',sundanese:'su',swahili:'sw',
  swedish:'sv',tagalog:'tl',tajik:'tg',tamil:'ta',tatar:'tt',telugu:'te',thai:'th',
  tibetan:'bo',turkish:'tr',turkmen:'tk',ukrainian:'uk',urdu:'ur',uzbek:'uz',
  valencian:'ca',vietnamese:'vi',welsh:'cy',yiddish:'yi',yoruba:'yo',
};

function toIsoCode(lang: string | null | undefined): string | null {
  if (!lang) return null;
  if (lang.length <= 3) return lang;
  return LANGUAGE_NAME_TO_ISO[lang.toLowerCase()] || null;
}

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit('transcribe', { requests: 20, window: '60 s' }, ip);
  if (!rl.success) {
    return jsonResponse(
      { error: 'Too many transcription requests. Please slow down.' },
      429,
      request
    );
  }

  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const { email } = auth;

  let body: {
    audioData?: string;
    mimeType?: string;
    durationSeconds?: number;
    detectedLanguage?: string | null;
    previousTranscript?: string;
    customDictionary?: string;
    provider?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }

  const { audioData, mimeType, durationSeconds, detectedLanguage, previousTranscript, customDictionary, provider: requestedProvider } = body;

  const provider =
    (requestedProvider === 'groq' && groqClient) ? 'groq'
    : (requestedProvider === 'openai' && openaiClient) ? 'openai'
    : (DEFAULT_PROVIDER === 'groq' && groqClient) ? 'groq'
    : (openaiClient) ? 'openai'
    : null;

  if (!provider) {
    return jsonResponse({ error: 'No transcription API key configured on server.' }, 500, request);
  }

  const openai = provider === 'groq' ? groqClient! : openaiClient!;
  const WHISPER_MODEL = provider === 'groq' ? 'whisper-large-v3' : 'whisper-1';

  if (!audioData || !mimeType || typeof durationSeconds !== 'number') {
    return jsonResponse({ error: 'audioData, mimeType and durationSeconds are required' }, 400, request);
  }

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 3600) {
    return jsonResponse({ error: 'durationSeconds must be a positive number ≤ 3600' }, 400, request);
  }

  const sql = getDb();

  try {
    // Self-heal stale sessions globally
    await sql`
      UPDATE users SET active_sessions = 0
      WHERE active_sessions > 0
        AND last_active_at < NOW() - INTERVAL '5 minutes'
    `;

    // Implicit heartbeat
    await sql`
      UPDATE users SET last_active_at = NOW() WHERE email = ${email}
    `;
  } catch (err) {
    console.error('[Transcribe] DB error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500, request);
  }

  let rows;
  try {
    rows = await sql`
      SELECT credits_seconds_remaining, active_sessions, is_unlimited
      FROM users WHERE email = ${email}
    `;
  } catch (err) {
    console.error('[Transcribe] DB error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500, request);
  }

  if (rows.length === 0) {
    return jsonResponse({ error: 'No account found. Purchase a credit pack to get started.' }, 403, request);
  }

  const user = rows[0];
  const credits = parseFloat(user.credits_seconds_remaining);
  const unlimited = user.is_unlimited === true;

  if (user.active_sessions >= MAX_ACTIVE_SESSIONS) {
    await sql`
      UPDATE users SET active_sessions = 1
      WHERE email = ${email} AND active_sessions >= ${MAX_ACTIVE_SESSIONS}
    `;
    const recheck = await sql`
      SELECT active_sessions FROM users WHERE email = ${email}
    `;
    if (recheck[0]?.active_sessions >= MAX_ACTIVE_SESSIONS) {
      return jsonResponse({ error: 'Too many active sessions. Close another tab to continue.' }, 429, request);
    }
  }

  if (!unlimited && credits <= -GRACE_PERIOD_SECONDS) {
    return jsonResponse({
      error: 'grace_period_exceeded',
      message: "You've used your grace period. Buy more credits to continue.",
      debt_seconds: Math.abs(credits),
    }, 402, request);
  }

  const audioBuffer = Buffer.from(audioData, 'base64');
  if (looksLikeSilence(audioBuffer)) {
    return jsonResponse(
      { text: '', silent: true, credits_seconds_remaining: unlimited ? Infinity : credits },
      200,
      request
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transcriptionParams: any = {
    file: new File([audioBuffer], 'audio.webm', { type: mimeType }),
    model: WHISPER_MODEL,
    response_format: 'verbose_json',
    temperature: 0,
  };
  const isoLanguage = toIsoCode(detectedLanguage);
  if (isoLanguage) {
    transcriptionParams.language = isoLanguage;
  }

  const promptParts: string[] = [];
  if (previousTranscript && typeof previousTranscript === 'string') {
    promptParts.push(previousTranscript.slice(-200));
  }
  if (customDictionary && typeof customDictionary === 'string') {
    promptParts.push(customDictionary.slice(0, 200));
  }
  if (promptParts.length > 0) {
    transcriptionParams.prompt = promptParts.join('. ');
  }

  let transcription;
  try {
    transcription = await openai.audio.transcriptions.create(transcriptionParams);
  } catch (err) {
    console.error('[Transcribe] Whisper API error:', err);
    return jsonResponse({ error: 'Transcription service unavailable. Please try again.' }, 502, request);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseLanguage = toIsoCode((transcription as any).language) || isoLanguage || null;

  if (isHallucination(transcription.text)) {
    return jsonResponse(
      { text: '', silent: true, hallucination: true, credits_seconds_remaining: unlimited ? Infinity : credits },
      200,
      request
    );
  }

  if (!unlimited) {
    try {
      await sql`
        UPDATE users
        SET credits_seconds_remaining = credits_seconds_remaining - ${durationSeconds},
            total_seconds_transcribed = total_seconds_transcribed + ${durationSeconds},
            credits_last_updated = NOW()
        WHERE email = ${email}
      `;

      await sql`
        INSERT INTO credit_transactions (user_email, type, seconds)
        VALUES (${email}, 'deduction', ${-durationSeconds})
      `;
    } catch (err) {
      console.error('[Transcribe] Credit deduction error:', err);
    }
  }

  return jsonResponse({
    text: transcription.text,
    detectedLanguage: responseLanguage,
    credits_seconds_remaining: unlimited ? Infinity : credits - durationSeconds,
    is_unlimited: unlimited,
  }, 200, request);
}
