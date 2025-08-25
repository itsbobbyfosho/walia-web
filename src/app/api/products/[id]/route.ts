import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// PATCH body schema (allow partial updates)
const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  priceCents: z.number().int().nonnegative().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export async function GET(req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params as { id: string };
    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params as { id: string };
    const data = PatchSchema.parse(await req.json());

    const updated = await db.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}