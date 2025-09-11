// src/components/CheckoutButton.tsx
'use client';

import { useState } from 'react';

const CUSTOMER_ID = process.env.NEXT_PUBLIC_CUSTOMER_ID as string;

export default function CheckoutButton({ disabled = false }: { disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleCheckout() {
    try {
      setErr(null);
      setBusy(true);

      if (!CUSTOMER_ID) throw new Error('Missing NEXT_PUBLIC_CUSTOMER_ID');

      // 1) Create order from the current cart
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: CUSTOMER_ID,
          deliveryMethod: 'PICKUP', // simple default for now
        }),
      });
      if (!orderRes.ok) {
        const text = await orderRes.text().catch(() => '');
        throw new Error(`Create order failed (${orderRes.status}) ${text}`);
      }
      const order = await orderRes.json(); // expects { id: string, ... }

      // 2) Create Stripe PaymentIntent for that order
      const piRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!piRes.ok) {
        const text = await piRes.text().catch(() => '');
        throw new Error(`Create payment failed (${piRes.status}) ${text}`);
      }
      const pi = await piRes.json(); // { paymentIntentId, clientSecret }

      // 3) For now, just route user to Orders (payment is test-mode handled in Dashboard)
      alert(`Order placed!\nOrder ID: ${order.id}\nPI: ${pi.paymentIntentId}`);
      window.location.href = '/orders';
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <button
        onClick={handleCheckout}
        disabled={busy || disabled}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {busy ? 'Processing…' : 'Checkout'}
      </button>
      {err && <p className="text-sm text-red-600 whitespace-pre-wrap">{err}</p>}
      <p className="text-xs text-gray-500">
        Test mode: after placing an order, you can confirm the payment in the Stripe Dashboard.
      </p>
    </div>
  );
}