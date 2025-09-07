// src/app/shop/[slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AddToCartButton from '@/components/AddToCartButton';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  imageUrls: string[];
};

type ShopResp = {
  id: string;
  name: string;
  description?: string | null;
  products: Product[];
};

export default function ShopPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug?.toString() ?? '';

  const [shop, setShop] = useState<ShopResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`/api/shops/by-slug/${slug}`, { cache: 'no-store' });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to load shop (${res.status}): ${text || res.statusText}`);
        }
        const data: ShopResp = await res.json();
        setShop(data);
      } catch (e: any) {
        setError(String(e?.message ?? e));
      }
    })();
  }, [slug]);

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-3">Shop Error</h1>
        <pre className="whitespace-pre-wrap text-sm bg-red-50 border border-red-200 p-3 rounded">
{error}
        </pre>
      </main>
    );
  }

  if (!shop) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Loading shop…</h1>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{shop.name}</h1>
        {shop.description && <p className="text-gray-600 mt-1">{shop.description}</p>}
      </div>

      <ul className="grid gap-4">
        {shop.products.map((p) => (
          <li key={p.id} className="border rounded-xl p-4">
            <div className="font-medium">{p.name}</div>
            {p.description && (
              <div className="text-sm text-gray-600 mt-1">{p.description}</div>
            )}
            <div className="mt-2">${(p.priceCents / 100).toFixed(2)} CAD</div>
            <AddToCartButton productId={p.id} />
          </li>
        ))}
        {shop.products.length === 0 && (
          <li className="text-gray-500">No products yet.</li>
        )}
      </ul>
    </main>
  );
}