// src/components/CheckoutButton.tsx
'use client';

import { useState } from 'react';

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [debug, setDebug] = useState<{ orderId?: string; pi?: string } | null>(null);

  // TEMP until auth is wired
  const CUSTOMER_ID = 'f53f12f6-19a6-45a6-a71f-e35b11291ab6';

  async function handleCheckout() {
    setLoading(true);
    setMsg(null);
    setDebug(null);
    try {
      // 1) Create order from cart (PICKUP for now)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: CUSTOMER_ID,
          deliveryMethod: 'PICKUP',
        }),
      });

      if (!orderRes.ok) {
        const e = await orderRes.json().catch(() => ({}));
        throw new Error(e?.error || 'Failed to create order');
      }

      const order = await orderRes.json();

      // 2) Create PaymentIntent for that order
      const payRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!payRes.ok) {
        const e = await payRes.json().catch(() => ({}));
        throw new Error(e?.error || 'Failed to start checkout');
      }

      const pay = await payRes.json();
      setMsg('Order placed! Payment intent created.');
      setDebug({ orderId: order.id, pi: pay.paymentIntentId });

      // Note: For real card entry we’ll wire Stripe Elements next.
      // In test mode, you can confirm PI via Stripe CLI like:
      //   stripe payment_intents confirm <pi_id> -d payment_method=pm_card_visa
    } catch (err: any) {
      setMsg(err?.message || 'Checkout failed');
    } finally {
      setLoading(false);
      // keep debug visible; clear message after a bit
      setTimeout(() => setMsg(null), 4000);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? 'Placing order…' : 'Checkout (Pickup)'}
      </button>
      {msg && <div className="mt-2 text-sm text-gray-700">{msg}</div>}
      {debug?.pi && (
        <div className="mt-1 text-xs text-gray-500">
          Order ID: {debug.orderId} • PI: {debug.pi}
        </div>
      )}
    </div>
  );
}