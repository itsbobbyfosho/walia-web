import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  deliveryMethod: z.enum(['PICKUP', 'DELIVERY', 'BOTH']).optional(),
  deliveryFeeCents: z.number().int().nonnegative().optional(),
  commissionBps: z.number().int().min(0).max(10000).optional(),
});

export async function GET(req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params as { id: string };
    const shop = await db.shop.findUnique({ where: { id } });
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }
    return NextResponse.json(shop, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params as { id: string };
    const data = PatchSchema.parse(await req.json());

    const updated = await db.shop.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}