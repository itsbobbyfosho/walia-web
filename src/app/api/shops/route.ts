import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const ShopSchema = z.object({
  ownerId: z.string().uuid(),
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  phone: z.string().optional(),
  address1: z.string().min(3),
  address2: z.string().optional(),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  deliveryMethod: z.enum(['PICKUP', 'DELIVERY', 'BOTH']).optional(),
  deliveryFeeCents: z.number().int().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = ShopSchema.parse(body);

    const owner = await db.profile.findUnique({ where: { id: data.ownerId } });
    if (!owner) return NextResponse.json({ error: 'Owner not found' }, { status: 400 });

    const existing = await db.shop.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });

    const shop = await db.shop.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        phone: data.phone,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        postalCode: data.postalCode,
        deliveryMethod: data.deliveryMethod ?? 'BOTH',
        deliveryFeeCents: data.deliveryFeeCents ?? 0,
        isActive: false,
      },
    });

    return NextResponse.json(shop, { status: 201 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const shops = await db.shop.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(shops);
}