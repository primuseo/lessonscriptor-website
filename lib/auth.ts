import { NextResponse } from 'next/server';
import { getDb } from './db';
import { corsHeaders } from './cors';

export interface AuthUser {
  email: string;
}

export async function requireAuth(request: Request): Promise<AuthUser | NextResponse> {
  const headers = corsHeaders(request);
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing Authorization header' },
      { status: 401, headers }
    );
  }

  const key = authHeader.slice(7).trim();
  if (!key) {
    return NextResponse.json(
      { error: 'Empty license key' },
      { status: 401, headers }
    );
  }

  const sql = getDb();

  try {
    const rows = await sql`
      SELECT email FROM users WHERE license_key = ${key} LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid license key' },
        { status: 401, headers }
      );
    }

    return { email: rows[0].email };
  } catch (err) {
    console.error('[Auth] License key lookup failed:', err);
    return NextResponse.json(
      { error: 'Auth error' },
      { status: 500, headers }
    );
  }
}

export function isAuthError(result: AuthUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
