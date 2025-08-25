import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params as { id: string };

    const orders = await db.order.findMany({
      where: { shopId: id },
      include: { items: { include: { product: true, variant: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}