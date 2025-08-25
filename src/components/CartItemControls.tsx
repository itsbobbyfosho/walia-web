// src/components/CartItemControls.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartItemControls({
  cartItemId,
  qty,
}: {
  cartItemId: string;
  qty: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setQty(next: number) {
    setLoading(true);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, qty: Math.max(0, next) }),
      });
      if (!res.ok) throw new Error('Update failed');
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Could not update cart item');
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });
      if (!res.ok) throw new Error('Remove failed');
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Could not remove item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        onClick={() => setQty(qty - 1)}
        disabled={loading}
        className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="text-sm w-6 text-center">{qty}</span>
      <button
        onClick={() => setQty(qty + 1)}
        disabled={loading}
        className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
        aria-label="Increase quantity"
      >
        +
      </button>
      <button
        onClick={remove}
        disabled={loading}
        className="ml-3 rounded-md border px-2 py-1 text-sm disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}