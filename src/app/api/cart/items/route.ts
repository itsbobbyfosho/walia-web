import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

/** ADD item */
const AddItemSchema = z.object({
  customerId: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  qty: z.number().int().positive().default(1),
});

/** UPDATE qty */
const UpdateItemSchema = z.object({
  cartItemId: z.string().uuid(),
  qty: z.number().int().nonnegative(), // 0 = remove
});

/** REMOVE item */
const RemoveItemSchema = z.object({
  cartItemId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const data = AddItemSchema.parse(await req.json());

    const customer = await db.profile.findUnique({ where: { id: data.customerId } });
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 400 });

    let cart = await db.cart.findFirst({ where: { customerId: data.customerId } });
    if (!cart) cart = await db.cart.create({ data: { customerId: data.customerId } });

    const product = await db.product.findUnique({ where: { id: data.productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 400 });

    let unitPriceCents = product.priceCents;

    if (data.variantId) {
      const variant = await db.productVariant.findUnique({ where: { id: data.variantId } });
      if (!variant || variant.productId !== product.id) {
        return NextResponse.json({ error: 'Invalid variant for product' }, { status: 400 });
      }
      unitPriceCents += variant.priceDiffCents ?? 0;
    }

    const existing = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: data.variantId ?? null,
      },
    });

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + data.qty },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: data.variantId ?? null,
          qty: data.qty,
          unitPriceCents,
        },
      });
    }

    const fullCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true, variant: true } } },
    });

    return NextResponse.json(fullCart, { status: 201 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { cartItemId, qty } = UpdateItemSchema.parse(await req.json());

    const item = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });
    if (!item) return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });

    if (qty === 0) {
      await db.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await db.cartItem.update({ where: { id: cartItemId }, data: { qty } });
    }

    const fullCart = await db.cart.findUnique({
      where: { id: item.cartId },
      include: { items: { include: { product: true, variant: true } } },
    });

    return NextResponse.json(fullCart, { status: 200 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { cartItemId } = RemoveItemSchema.parse(await req.json());

    const item = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });
    if (!item) return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });

    await db.cartItem.delete({ where: { id: cartItemId } });

    const fullCart = await db.cart.findUnique({
      where: { id: item.cartId },
      include: { items: { include: { product: true, variant: true } } },
    });

    return NextResponse.json(fullCart, { status: 200 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}