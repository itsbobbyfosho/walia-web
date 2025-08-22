import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const UpdateShopSchema = z.object({
  isActive: z.boolean().optional(),
  commissionBps: z.number().int().min(0).max(10000).optional(),    // 1000 = 10%
  deliveryFeeCents: z.number().int().min(0).optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  deliveryMethod: z.enum(['PICKUP','DELIVERY','BOTH']).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = UpdateShopSchema.parse(await req.json());
    const shop = await db.shop.update({ where: { id: params.id }, data });
    return NextResponse.json(shop, { status: 200 });
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