import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const BodySchema = z.object({
  status: z.enum([
    'RECEIVED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'READY_FOR_PICKUP',
    'DELIVERED',
    'CANCELLED',
  ]),
});

// PATCH /api/orders/:id  -> { status: "PREPARING" }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = BodySchema.parse(await req.json());

    const order = await db.order.update({
      where: { id: params.id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 200 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await db.order.findUnique({
      where: { id: params.id },
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