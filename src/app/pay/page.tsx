// src/app/pay/page.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string;
const CUSTOMER_ID = process.env.NEXT_PUBLIC_CUSTOMER_ID as string;

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    try {
      if (!stripe || !elements) return;
      if (!CUSTOMER_ID) throw new Error('Missing NEXT_PUBLIC_CUSTOMER_ID');

      setBusy(true);

      // 1) Create an order from the current cart
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: CUSTOMER_ID,
          deliveryMethod: 'PICKUP',
        }),
      });
      if (!orderRes.ok) {
        const text = await orderRes.text().catch(() => '');
        throw new Error(`Create order failed (${orderRes.status}) ${text}`);
      }
      const order = await orderRes.json(); // { id: string, ... }

      // 2) Create a PaymentIntent for that order
      const piRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!piRes.ok) {
        const text = await piRes.text().catch(() => '');
        throw new Error(`Create payment failed (${piRes.status}) ${text}`);
      }
      const { clientSecret, paymentIntentId } = await piRes.json();

      // 3) Confirm the card payment on-site
      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Card element not ready');

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      }

      setMsg(`Payment succeeded! PI: ${paymentIntentId}`);
      // Webhook will mark order as PAID — take user to orders page
      setTimeout(() => (window.location.href = '/orders'), 800);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <CardElement options={{ hidePostalCode: true }} />
      <button
        type="submit"
        disabled={busy || !stripe}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {busy ? 'Processing…' : 'Pay now'}
      </button>
      {err && <p className="text-sm text-red-600 whitespace-pre-wrap">{err}</p>}
      {msg && <p className="text-sm text-green-600 whitespace-pre-wrap">{msg}</p>}
      <p className="text-xs text-gray-500">
        Use Stripe test card <b>4242 4242 4242 4242</b>, any future date, any CVC.
      </p>
    </form>
  );
}

export default function PayPage() {
  if (!STRIPE_PK) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Checkout</h1>
        <p className="text-red-600">Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</p>
      </main>
    );
  }

  const stripePromise = loadStripe(STRIPE_PK);

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </main>
  );
}