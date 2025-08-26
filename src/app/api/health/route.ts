// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const rows = await db.$queryRaw<{ now: Date }[]>`select now() as now`;
    return NextResponse.json({ ok: true, now: rows?.[0]?.now ?? null }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || 'unknown',
        code: e?.code || null,
        hint: 'Verify DATABASE_URL and password encoding (%21 for !), plus ?pgbouncer=true&connection_limit=1&sslmode=require.',
      },
      { status: 500 }
    );
  }
}