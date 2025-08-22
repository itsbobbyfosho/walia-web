import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const ProductSchema = z.object({
  shopId: z.string().uuid(),
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().default('CAD'),
  sku: z.string().optional(),
  stockQty: z.number().int().nonnegative().default(0),
  imageUrls: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = ProductSchema.parse(body);

    const shop = await db.shop.findUnique({ where: { id: data.shopId } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 400 });

    const product = await db.product.create({
      data: {
        shopId: data.shopId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        currency: data.currency || 'CAD',
        sku: data.sku,
        stockQty: data.stockQty ?? 0,
        imageUrls: data.imageUrls ?? [],
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate field (likely slug already used)' }, { status: 409 });
    }
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get('shopId') || undefined;

  const products = await db.product.findMany({
    where: { ...(shopId ? { shopId } : {}), isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}