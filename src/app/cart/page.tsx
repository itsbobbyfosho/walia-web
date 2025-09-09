// src/app/cart/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type CartItem = {
  id: string;
  productId: string;
  qty: number;
  unitPriceCents: number;
};

type CartResp =
  | { id: string; items: CartItem[] }
  | { id: null; items: CartItem[] };

const CUSTOMER_ID = process.env.NEXT_PUBLIC_CUSTOMER_ID as string;

export default function CartPage() {
  const [cart, setCart] = useState<CartResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!CUSTOMER_ID) {
          throw new Error('Missing NEXT_PUBLIC_CUSTOMER_ID');
        }
        const res = await fetch(
          `/api/cart?customerId=${encodeURIComponent(CUSTOMER_ID)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(
            `Failed to load cart (${res.status})${text ? `: ${text}` : ''}`
          );
        }
        const data: CartResp = await res.json();
        setCart(data);
      } catch (e: any) {
        setError(String(e?.message ?? e));
      }
    })();
  }, []);

  const subtotalCents = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (sum, it) => sum + it.qty * it.unitPriceCents,
      0
    );
  }, [cart]);

  if (error) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Your Cart</h1>
        <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
      </main>
    );
  }

  if (!cart) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Your Cart</h1>
        <p className="text-gray-600">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Cart</h1>

      {cart.items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <ul className="space-y-3">
          {cart.items.map((it) => (
            <li key={it.id} className="border rounded-xl p-4">
              <div className="font-medium">Item: {it.productId}</div>
              <div className="text-sm text-gray-600">
                Qty: {it.qty} • Unit: ${(it.unitPriceCents / 100).toFixed(2)}
              </div>
              <div className="mt-1">
                Line: ${((it.qty * it.unitPriceCents) / 100).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-2 border-t">
        <div className="font-medium">
          Subtotal: ${(subtotalCents / 100).toFixed(2)}
        </div>
        <div className="text-sm text-gray-600">Tax & fees at checkout.</div>
      </div>
    </main>
  );
}