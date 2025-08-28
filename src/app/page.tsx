// src/app/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";

export const runtime = "nodejs"; // ensure Prisma runs in Node on Vercel
export const dynamic = "force-dynamic"; // 


export default async function Home() {
  const shops = await db.shop.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, description: true },
    orderBy: { createdAt: "desc" },
  });

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