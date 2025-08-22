import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const OrderSchema = z.object({
  customerId: z.string().uuid(),
  deliveryMethod: z.enum(['PICKUP', 'DELIVERY']),
  address1: z.string().min(3).optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = OrderSchema.parse(body);

    const cart = await db.cart.findFirst({
      where: { customerId: data.customerId },
      include: { items: { include: { product: true, variant: true } } },
    });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const shopId = cart.items[0].product.shopId;
    if (!cart.items.every(i => i.product.shopId === shopId)) {
      return NextResponse.json({ error: 'Cart must contain items from a single shop' }, { status: 400 });
    }

    let address1: string | null = null;
    let address2: string | null = null;
    let city: string | null = null;
    let postalCode: string | null = null;

    if (data.deliveryMethod === 'DELIVERY') {
      if (!data.address1 || !data.city || !data.postalCode) {
        return NextResponse.json({ error: 'Address, city, and postalCode are required for delivery' }, { status: 400 });
      }
      if (data.city.trim().toLowerCase() !== 'calgary') {
        return NextResponse.json({ error: 'Delivery is Calgary-only for MVP' }, { status: 400 });
      }
      address1 = data.address1;
      address2 = data.address2 ?? null;
      city = data.city;
      postalCode = data.postalCode;
    }

    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 400 });

    const subtotalCents = cart.items.reduce((s, it) => s + it.qty * it.unitPriceCents, 0);
    const taxCents = Math.round(subtotalCents * 0.05);
    const deliveryFeeCents = data.deliveryMethod === 'DELIVERY' ? (shop.deliveryFeeCents ?? 0) : 0;
    const totalCents = subtotalCents + taxCents + deliveryFeeCents;

    for (const item of cart.items) {
      if (item.product.stockQty < item.qty) {
        return NextResponse.json({ error: `Insufficient stock for ${item.product.name}` }, { status: 400 });
      }
    }

    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          shopId,
          customerId: data.customerId,
          status: 'RECEIVED',
          subtotalCents,
          taxCents,
          deliveryFeeCents,
          totalCents,
          currency: 'CAD',
          deliveryMethod: data.deliveryMethod,
          address1,
          address2,
          city,
          postalCode,
        },
      });

      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: item.productId,
            variantId: item.variantId ?? null,
            qty: item.qty,
            unitPriceCents: item.unitPriceCents,
          },
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.qty } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return NextResponse.json(order, { status: 201 });
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

  const orders = await db.order.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  return NextResponse.json(orders);
}