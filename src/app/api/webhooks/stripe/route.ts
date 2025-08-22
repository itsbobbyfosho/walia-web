// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

export const runtime = 'nodejs'; // needed to access raw body with req.text()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  if (!webhookSecret) return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });

  let event: Stripe.Event;

  // IMPORTANT: use raw body for signature verification
  const rawBody = await req.text();
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Stripe verify error:', err?.message || err);
    return NextResponse.json({ error: `Webhook Error: ${err?.message || 'invalid'}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;

        // Try to update an existing Payment record
        const existing = await db.payment.findFirst({
          where: { providerPaymentId: pi.id },
        });

        if (existing) {
          await db.payment.update({
            where: { id: existing.id },
            data: { status: 'SUCCEEDED' },
          });
        } else if (pi.metadata?.orderId) {
          await db.payment.create({
            data: {
              orderId: pi.metadata.orderId,
              provider: 'stripe',
              providerPaymentId: pi.id,
              status: 'SUCCEEDED',
              amountCents: typeof pi.amount === 'number' ? pi.amount : 0,
            },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const existing = await db.payment.findFirst({
          where: { providerPaymentId: pi.id },
        });
        if (existing) {
          await db.payment.update({
            where: { id: existing.id },
            data: { status: 'FAILED' },
          });
        }
        break;
      }

      default:
        // ignore other events for now
        break;
    }
  } catch (e) {
    console.error('Webhook handler error:', e);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}