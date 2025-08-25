// src/app/shop-admin/page.tsx
import OrderStatusControl from "../../components/OrderStatusControl";

type OrderItem = { id: string; qty: number };
type Order = {
  id: string;
  status: string;
  deliveryMethod: "PICKUP" | "DELIVERY";
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
};

const SHOP_ID = "f07e4a2e-ee08-4590-81a7-d1f3d2192567"; // Walia Market

async function getShopOrders(): Promise<Order[]> {
  const res = await fetch(
    `http://localhost:3000/api/shops/${SHOP_ID}/orders`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load shop orders");
  return res.json();
}

function money(cents: number) {
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

export default async function ShopAdminPage() {
  const orders = await getShopOrders();

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Shop Admin · Walia Market</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Order #{o.id.slice(0, 8)}</div>
                <div className="text-sm text-gray-600">{fmtDate(o.createdAt)}</div>
              </div>

              <div className="mt-1 text-sm">
                Method: <span className="font-medium">{o.deliveryMethod}</span> · Items:{" "}
                <span className="font-medium">{o.items.length}</span>
              </div>
              <div className="mt-1 font-semibold">{money(o.totalCents)}</div>

              <div className="mt-3">
                <OrderStatusControl orderId={o.id} current={o.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}