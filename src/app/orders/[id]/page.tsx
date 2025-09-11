// src/app/orders/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import OrderStatusControl from '@/components/OrderStatusControl';

type OrderItem = {
  id: string;
  productId: string;
  variantId: string | null;
  qty: number;
  unitPriceCents: number;
  product?: {
    name?: string;
  } | null;
};

type Order = {
  id: string;
  shopId: string;
  customerId: string;
  status: string;
  subtotalCents: number;
  taxCents: number | null;
  deliveryFeeCents: number | null;
  totalCents: number;
  currency: string;
  deliveryMethod: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  postalCode: string | null;
  placedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id?.toString() ?? '';

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setBusy(true);
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to load order (${res.status})${text ? `: ${text}` : ''}`);
      }
      const data: Order = await res.json();
      setOrder(data);
      setError(null);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Order</h1>
        <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Order</h1>
        <p className="text-gray-600">{busy ? 'Loading…' : 'Not found'}</p>
      </main>
    );
  }

  const lineTotal = (it: OrderItem) => ((it.qty * it.unitPriceCents) / 100).toFixed(2);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Order {order.id.slice(0, 8)}…</h1>

      <div className="text-sm text-gray-600">
        Placed: {order.placedAt ? new Date(order.placedAt).toLocaleString() : new Date(order.createdAt).toLocaleString()}
      </div>

      <div className="border rounded-xl p-4 space-y-2">
        <div>Status: <span className="font-medium">{order.status}</span></div>
        <OrderStatusControl
          orderId={order.id}
          current={order.status}
          onUpdated={load}
        />
      </div>

      <div className="border rounded-xl p-4">
        <h2 className="font-medium mb-2">Items</h2>
        <ul className="space-y-2">
          {order.items.map((it) => (
            <li key={it.id} className="border rounded-lg p-3">
              <div className="font-medium">{it.product?.name || it.productId}</div>
              <div className="text-sm text-gray-600">Qty: {it.qty} • Unit: ${(it.unitPriceCents / 100).toFixed(2)}</div>
              <div className="text-sm">Line: ${lineTotal(it)}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border rounded-xl p-4 space-y-1">
        <div>Subtotal: ${(order.subtotalCents / 100).toFixed(2)}</div>
        {order.taxCents != null && <div>Tax: ${(order.taxCents / 100).toFixed(2)}</div>}
        {order.deliveryFeeCents != null && <div>Delivery: ${(order.deliveryFeeCents / 100).toFixed(2)}</div>}
        <div className="font-semibold">Total: ${(order.totalCents / 100).toFixed(2)} {order.currency}</div>
      </div>
    </main>
  );
}