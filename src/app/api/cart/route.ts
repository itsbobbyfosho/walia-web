import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const CartSchema = z.object({ customerId: z.string().uuid() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId } = CartSchema.parse(body);

    const customer = await db.profile.findUnique({ where: { id: customerId } });
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 400 });

    let cart = await db.cart.findFirst({ where: { customerId }, include: { items: true } });
    if (!cart) {
      cart = await db.cart.create({ data: { customerId }, include: { items: true } });
    }
    return NextResponse.json(cart, { status: 201 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');
  if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 });

  const cart = await db.cart.findFirst({ where: { customerId }, include: { items: true } });
  if (!cart) return NextResponse.json({ id: null, items: [] }, { status: 200 });

  return NextResponse.json(cart, { status: 200 });
}