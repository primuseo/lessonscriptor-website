import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getDb } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth';
import { handlePreflight, jsonResponse } from '@/lib/cors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { takeDailySlot } from './daily-cap';
import { buildMessages, outputTokenBudget, validateLineResults, validateNotes, validateRequest, type Rejection } from './magic';

// "Magic" transcript tools for the extension (Format, Clean up, Organize, Notes).
// Payers only, no hours deducted. Transcript text is never logged.

export const maxDuration = 60;

const groqClient = process.env.GROQ_API_KEY
  ? new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1', maxRetries: 0 })
  : null;

// Groq retires models often and an org can block some (403), so fall through
// the chain on model errors and rate limits. The log line names the model used.
const MODEL_CHAIN = [
  process.env.MAGIC_MODEL,
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'openai/gpt-oss-20b',
].filter((m, i, all): m is string => !!m && all.indexOf(m) === i);

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

async function isPayer(email: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    SELECT is_unlimited,
           EXISTS (SELECT 1 FROM credit_transactions WHERE user_email = ${email} AND type = 'purchase') AS paid
    FROM users WHERE email = ${email}
  `;
  return rows.length > 0 && (rows[0].is_unlimited === true || rows[0].paid === true);
}

// Cloudflare drops the connection at 100 s; keep the whole chain well under it.
const CHAIN_BUDGET_MS = 50_000;
// Only "this model is unavailable to us" and rate limits move on to the next
// model. A cut-off or invalid answer would fail the same way on the next one.
const NEXT_MODEL_STATUSES = new Set([403, 404, 429, 503]);

// gpt-oss and qwen3 think before answering, and that thinking counts against
// max_tokens. Keep gpt-oss thinking short and leave room for it on every model.
const REASONING_HEADROOM = 2_000;
const isGptOss = (model: string) => model.startsWith('openai/gpt-oss');

async function complete(messages: ReturnType<typeof buildMessages>, maxTokens: number): Promise<{ raw: unknown; model: string }> {
  const deadline = Date.now() + CHAIN_BUDGET_MS;
  let lastError: unknown = new Error('No model available');
  for (const model of MODEL_CHAIN) {
    const remaining = deadline - Date.now();
    if (remaining < 3_000) break;
    try {
      const res = await groqClient!.chat.completions.create({
        model,
        messages,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        max_tokens: maxTokens + REASONING_HEADROOM,
        ...(isGptOss(model) ? { reasoning_effort: 'low' as const } : {}),
      }, { timeout: remaining });
      const choice = res.choices[0];
      if (choice?.finish_reason === 'length') {
        console.warn(`[Magic] ${model} hit max_tokens=${maxTokens + REASONING_HEADROOM} (used ${res.usage?.completion_tokens ?? '?'})`);
        throw new Error('Output cut off');
      }
      return { raw: JSON.parse(choice?.message?.content || ''), model };
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const next = NEXT_MODEL_STATUSES.has(status ?? 0);
      console.warn(`[Magic] ${model} failed (${status ?? (err as Error)?.message})${next ? ', trying next model' : ''}`);
      if (!next) break;
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit('magic', { requests: 30, window: '60 s' }, ip);
  if (!rl.success) {
    return jsonResponse({ error: 'Too many requests. Please slow down.', code: 'rate_limited' }, 429, request);
  }

  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;
  const { email } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }
  const parsed = validateRequest(body);
  if (!parsed.ok) return jsonResponse({ error: parsed.error }, 400, request);

  try {
    if (!(await isPayer(email))) {
      return jsonResponse({ error: 'Magic tools are available after your first purchase.', code: 'upgrade_required' }, 402, request);
    }
  } catch (err) {
    console.error('[Magic] Payer check failed:', err);
    return jsonResponse({ error: 'Internal server error' }, 500, request);
  }

  if (!takeDailySlot(email)) {
    return jsonResponse({ error: 'Daily Magic limit reached. Try again tomorrow.', code: 'daily_limit' }, 429, request);
  }
  if (!groqClient) {
    return jsonResponse({ error: 'Magic is not configured' }, 503, request);
  }

  const messages = buildMessages(
    parsed.mode,
    parsed.mode === 'notes_merge' ? { partials: parsed.partials } : { lines: parsed.lines },
    parsed.language
  );
  const inputChars = messages[1].content.length;
  const started = Date.now();

  // 500, not 502: Cloudflare replaces 502 bodies with its own HTML page.
  let raw: unknown;
  let model: string;
  try {
    ({ raw, model } = await complete(messages, outputTokenBudget(messages[1].content)));
  } catch {
    return jsonResponse({ error: 'Magic is temporarily unavailable. Please try again.', code: 'upstream' }, 500, request);
  }

  if (parsed.mode === 'notes' || parsed.mode === 'notes_merge') {
    const notes = validateNotes(raw);
    console.log(`[Magic] ${parsed.mode} model=${model} chars=${inputChars} ok=${!!notes} ms=${Date.now() - started}`);
    if (!notes) return jsonResponse({ error: 'Could not build notes. Please try again.', code: 'invalid_output' }, 500, request);
    return jsonResponse({ notes }, 200, request);
  }

  const rejected: Rejection[] = [];
  const items = validateLineResults(parsed.mode, parsed.lines, raw, rejected);
  const reasons = rejected.map(r => r.reason.split(' ')[0]).join(',');
  console.log(`[Magic] ${parsed.mode} model=${model} lines=${parsed.lines.length} applied=${items.length} chars=${inputChars} ms=${Date.now() - started}${reasons ? ` rejected=${reasons}` : ''}`);
  return jsonResponse({ items, rejected }, 200, request);
}
