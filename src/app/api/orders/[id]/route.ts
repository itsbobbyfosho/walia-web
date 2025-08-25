import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// --- Update order status (used by OrderStatusControl) ---
const PatchSchema = z.object({
  status: z.enum([
    'RECEIVED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'READY_FOR_PICKUP',
    'DELIVERED',
    'CANCELLED',
  ]),
});

export async function PATCH(req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params as { id: string };
    const { status } = PatchSchema.parse(await req.json());

    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true, variant: true } } },
    });

    return NextResponse.json(order, { status: 200 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    if (err?.code === 'P2025') {
      // Prisma record not found
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// --- Get a single order (used by /orders/[id]) ---
export async function GET(req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params as { id: string };
    const order = await db.order.findUnique({
      where: { id },
      include: { items: { include: { product: true, variant: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}