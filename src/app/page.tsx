// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export default function Home() {
  const [shops, setShops] = useState<Shop[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/shops', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load shops (${res.status})`);
        const data: Shop[] = await res.json();
        setShops(data);
      } catch (e: any) {
        setError(String(e?.message ?? e));
      }
    })();
  }, []);

  if (error) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-3">Home Page Error</h1>
        <pre className="whitespace-pre-wrap text-sm bg-red-50 border border-red-200 p-3 rounded">
{error}
        </pre>
      </main>
    );
  }

  if (!shops) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Shops in Calgary</h1>
        <p className="text-gray-600">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Shops in Calgary</h1>
      <ul className="space-y-3">
        {shops.map((s) => (
          <li key={s.id} className="border rounded-xl p-4">
            <div className="font-medium">{s.name}</div>
            {s.description && (
              <div className="text-sm text-gray-600">{s.description}</div>
            )}
            <Link href={`/shop/${s.slug}`} className="inline-block mt-2 underline">
              View shop
            </Link>
          </li>
        ))}
        {shops.length === 0 && (
          <li className="text-gray-500">No active shops yet.</li>
        )}
      </ul>
    </main>
  );
}