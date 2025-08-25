// src/app/page.tsx
import Link from "next/link";
import { baseUrl } from "@/lib/env";

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

async function getShops(): Promise<Shop[]> {
  const res = await fetch(`${baseUrl()}/api/shops`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load shops");
  return res.json();
}

export default async function Home() {
  const shops = await getShops();

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