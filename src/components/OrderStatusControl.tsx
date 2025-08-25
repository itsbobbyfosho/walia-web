// src/components/OrderStatusControl.tsx
'use client';

import { useState } from 'react';

const STATUSES = [
  'RECEIVED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'READY_FOR_PICKUP',
  'DELIVERED',
  'CANCELLED',
] as const;

export default function OrderStatusControl({
  orderId,
  current,
  onUpdated,
}: {
  orderId: string;
  current: string;
  onUpdated?: (next: string) => void;
}) {
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function update() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || 'Update failed');
      }
      setMsg('Updated');
      onUpdated?.(status);
    } catch (e: any) {
      setMsg(e?.message || 'Failed');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 2000);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={loading}
        className="rounded-md border px-2 py-1 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        onClick={update}
        disabled={loading}
        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save'}
      </button>
      {msg && <span className="text-xs text-gray-600">{msg}</span>}
    </div>
  );
}