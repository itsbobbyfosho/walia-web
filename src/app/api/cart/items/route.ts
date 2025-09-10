// src/app/api/cart/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST: add to cart
const AddSchema = z.object({
  customerId: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.number().int().min(1).max(999).default(1),
});

export async function POST(req: NextRequest) {
  try {
    const { customerId, productId, qty } = AddSchema.parse(await req.json());

    const customer = await db.profile.findUnique({ where: { id: customerId } });
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 400 });

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 400 });
    }

    // find or create cart
    let cart = await db.cart.findFirst({ where: { customerId } });
    if (!cart) cart = await db.cart.create({ data: { customerId } });

    // find existing item
    const existing = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + qty, unitPriceCents: product.priceCents },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          qty,
          unitPriceCents: product.priceCents,
        },
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    if (e?.name === 'ZodError') return NextResponse.json({ error: e.flatten() }, { status: 400 });
    console.error('POST /cart/items error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH: update qty (<=0 deletes)
const PatchSchema = z.object({
  itemId: z.string().uuid(),
  qty: z.number().int().min(0).max(999),
});

export async function PATCH(req: NextRequest) {
  try {
    const { itemId, qty } = PatchSchema.parse(await req.json());

    const item = await db.cartItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 400 });

    if (qty <= 0) {
      await db.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await db.cartItem.update({ where: { id: itemId }, data: { qty } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    if (e?.name === 'ZodError') return NextResponse.json({ error: e.flatten() }, { status: 400 });
    console.error('PATCH /cart/items error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE: remove item
const DeleteSchema = z.object({
  itemId: z.string().uuid(),
});

export async function DELETE(req: NextRequest) {
  try {
    const { itemId } = DeleteSchema.parse(await req.json());
    await db.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    if (e?.name === 'ZodError') return NextResponse.json({ error: e.flatten() }, { status: 400 });
    console.error('DELETE /cart/items error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}