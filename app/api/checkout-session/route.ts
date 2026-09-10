import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT u.license_key
    FROM credit_transactions ct
    JOIN users u ON u.email = ct.user_email
    WHERE ct.reference_id = ${sessionId}
    LIMIT 1
  `;

  return NextResponse.json({ licenseKey: rows[0]?.license_key ?? null });
}
