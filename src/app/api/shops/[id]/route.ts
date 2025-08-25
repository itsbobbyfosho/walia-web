import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),     // no nulls
  phone: z.string().optional(),           // no nulls
  address1: z.string().optional(),        // no nulls
  address2: z.string().optional(),        // treat as empty string if you want to clear
  city: z.string().optional(),
  postalCode: z.string().optional(),
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
    const parsed = PatchSchema.parse(await req.json());

    // Only include provided keys
    const data = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v !== undefined)
    );

    const updated = await db.shop.update({
      where: { id },
      data, // all strings/booleans/numbers, no nulls
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