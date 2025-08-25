// src/app/orders/page.tsx
import Link from "next/link";

type OrderItem = { id: string; qty: number };

type Order = {
  id: string;
  status: string;
  deliveryMethod: 'PICKUP' | 'DELIVERY';
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
};

const CUSTOMER_ID = "f53f12f6-19a6-45a6-a71f-e35b11291ab6"; // TEMP until auth

async function getOrders(): Promise<Order[]> {
  const res = await fetch(
    `http://localhost:3000/api/orders?customerId=${CUSTOMER_ID}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

function fmtMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)} CAD`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Link
                  href={`/orders/${o.id}`}
                  className="font-medium underline underline-offset-4"
                >
                  Order #{o.id.slice(0, 8)}
                </Link>
                <div className="text-sm text-gray-600">{fmtDate(o.createdAt)}</div>
              </div>
              <div className="mt-1 text-sm">
                Status: <span className="font-medium">{o.status}</span> · Method:{" "}
                <span className="font-medium">{o.deliveryMethod}</span> · Items:{" "}
                <span className="font-medium">{o.items.length}</span>
              </div>
              <div className="mt-2 font-semibold">{fmtMoney(o.totalCents)}</div>
              <div className="mt-2">
                <Link href={`/orders/${o.id}`} className="text-sm underline">
                  View details →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}