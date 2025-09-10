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
  const [busy, setBusy] = useState<string | null>(null); // itemId while updating

  async function loadCart() {
    if (!CUSTOMER_ID) {
      setError('Missing NEXT_PUBLIC_CUSTOMER_ID');
      return;
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
  }

  useEffect(() => {
    (async () => {
      try {
        await loadCart();
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

  async function updateQty(itemId: string, nextQty: number) {
    try {
      setBusy(itemId);
      if (nextQty <= 0) {
        // remove
        const del = await fetch('/api/cart/items', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId }),
        });
        if (!del.ok) throw new Error(`Remove failed (${del.status})`);
      } else {
        const res = await fetch('/api/cart/items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, qty: nextQty }),
        });
        if (!res.ok) throw new Error(`Update failed (${res.status})`);
      }
      await loadCart();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(null);
    }
  }

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
                Unit: ${(it.unitPriceCents / 100).toFixed(2)}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => updateQty(it.id, it.qty - 1)}
                  disabled={!!busy}
                >
                  −
                </button>
                <span className="min-w-8 text-center">{busy === it.id ? '…' : it.qty}</span>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => updateQty(it.id, it.qty + 1)}
                  disabled={!!busy}
                >
                  +
                </button>
                <button
                  className="ml-4 px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => updateQty(it.id, 0)}
                  disabled={!!busy}
                >
                  Remove
                </button>
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