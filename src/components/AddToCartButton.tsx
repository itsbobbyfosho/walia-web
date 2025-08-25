'use client';

import { useState } from 'react';

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // TEMP: use your test CUSTOMER_ID until auth is wired
  const CUSTOMER_ID = 'f53f12f6-19a6-45a6-a71f-e35b11291ab6';

  async function add() {
    try {
      setLoading(true);
      setMsg(null);
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: CUSTOMER_ID,
          productId,
          qty: 1,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to add to cart');
      }
      setMsg('Added!');
    } catch (e: any) {
      setMsg(e.message || 'Error');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 2000);
    }
  }

  return (
    <button
      onClick={add}
      disabled={loading}
      className="mt-2 inline-flex items-center rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? 'Adding…' : 'Add to cart'}
      {msg && <span className="ml-2 text-gray-600">{msg}</span>}
    </button>
  );
}