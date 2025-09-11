// src/app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Order = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
};

const CUSTOMER_ID = process.env.NEXT_PUBLIC_CUSTOMER_ID as string;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!CUSTOMER_ID) throw new Error('Missing NEXT_PUBLIC_CUSTOMER_ID');
        const res = await fetch(`/api/orders?customerId=${encodeURIComponent(CUSTOMER_ID)}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to load orders (${res.status})${text ? `: ${text}` : ''}`);
        }
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (e: any) {
        setError(String(e?.message ?? e));
      }
    })();
  }, []);

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Your Orders</h1>
        <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
      </main>
    );
  }

  if (!orders) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Your Orders</h1>
        <p className="text-gray-600">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="border rounded-xl p-4">
              <div className="font-medium">Order {o.id.slice(0, 8)}…</div>
              <div className="text-sm text-gray-600">
                Placed: {new Date(o.createdAt).toLocaleString()}
              </div>
              <div className="text-sm">Status: {o.status}</div>
              <div className="text-sm">
                Total: ${(o.totalCents / 100).toFixed(2)} {o.currency}
              </div>
              <Link
                href={`/orders/${o.id}`}
                className="inline-block mt-2 underline"
              >
                View details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}