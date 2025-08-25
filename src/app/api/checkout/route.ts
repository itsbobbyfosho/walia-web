import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const Body = z.object({
  orderId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { orderId } = Body.parse(await req.json());

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.totalCents <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const intent = await stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: 'cad',
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: { orderId: order.id, shopId: order.shopId },
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        provider: 'stripe',
        providerPaymentId: intent.id,
        status: 'PENDING',
        amountCents: order.totalCents,
      },
    });

    return NextResponse.json(
      { paymentIntentId: intent.id, clientSecret: intent.client_secret },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}