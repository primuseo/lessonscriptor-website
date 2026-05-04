import { NextResponse } from 'next/server';

const ALLOWED_EXTENSION_ID = process.env.ALLOWED_EXTENSION_ID;

function getAllowedOrigins(): string[] | null {
  if (!ALLOWED_EXTENSION_ID) return null; // allow all
  return [
    `chrome-extension://${ALLOWED_EXTENSION_ID}`,
  ];
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  if (!allowed) return true;
  if (allowed.includes(origin)) return true;
  // Firefox extensions
  if (origin.startsWith('moz-extension://')) return true;
  return false;
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowedOrigin = isOriginAllowed(origin)
    ? (origin || '*')
    : '';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function handlePreflight(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export function jsonResponse(
  data: unknown,
  status: number,
  request: Request
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(request),
  });
}
