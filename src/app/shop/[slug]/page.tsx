// src/app/shop/[slug]/page.tsx
import { baseUrl } from "@/lib/env";
import AddToCartButton from "@/components/AddToCartButton";

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

async function getShop(slug: string): Promise<ShopResp> {
  const res = await fetch(`${baseUrl()}/api/shops/by-slug/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Shop not found");
  }
  return res.json();
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await getShop(slug);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{shop.name}</h1>
        {shop.description && (
          <p className="text-gray-600 mt-1">{shop.description}</p>
        )}
      </div>

      <ul className="grid gap-4">
        {shop.products.map((p) => (
          <li key={p.id} className="border rounded-xl p-4">
            <div className="font-medium">{p.name}</div>
            {p.description && (
              <div className="text-sm text-gray-600 mt-1">{p.description}</div>
            )}
            <div className="mt-2">
              ${(p.priceCents / 100).toFixed(2)} CAD
            </div>
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