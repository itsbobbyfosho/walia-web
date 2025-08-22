import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

// PATCH /api/products/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = UpdateSchema.parse(await req.json());
    const product = await db.product.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(product, { status: 200 });
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