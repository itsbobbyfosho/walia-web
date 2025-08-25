// src/app/orders/[id]/page.tsx
import Link from "next/link";
import OrderStatusControl from "../../../components/OrderStatusControl";

type OrderItem = {
  id: string;
  qty: number;
  unitPriceCents: number;
  product: { name: string };
};

type Order = {
  id: string;
  status: string;
  deliveryMethod: "PICKUP" | "DELIVERY";
  totalCents: number;
  subtotalCents: number;
  taxCents: number;
  deliveryFeeCents: number | null;
  currency: string;
  createdAt: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  items: OrderItem[];
};

async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`http://localhost:3000/api/orders/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Order not found");
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

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id.slice(0, 8)}</h1>
        <Link href="/orders" className="text-sm underline">
          Back to orders
        </Link>
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        <div> Status: <span className="font-medium">{order.status}</span></div>
        <div>Placed: {fmtDate(order.createdAt)}</div>
        <div>Method: {order.deliveryMethod}</div>
        {order.deliveryMethod === "DELIVERY" && (
          <div className="mt-1">
            Deliver to: {order.address1}
            {order.address2 ? `, ${order.address2}` : ""}, {order.city} {order.postalCode}
          </div>
        )}
        <div className="pt-2">
          <OrderStatusControl orderId={order.id} current={order.status} />
          {/* After saving, refresh the page to see the new status. */}
        </div>
      </div>

      <ul className="divide-y rounded-xl border">
        {order.items.map((i) => (
          <li key={i.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{i.product.name}</div>
              <div className="text-sm text-gray-600">Qty: {i.qty}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-700">Unit: {money(i.unitPriceCents)}</div>
              <div className="text-sm text-gray-600">Line: {money(i.unitPriceCents * i.qty)}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="text-right space-y-1">
        <div className="text-sm text-gray-700">
          Subtotal: <span className="font-medium">{money(order.subtotalCents)}</span>
        </div>
        <div className="text-sm text-gray-700">
          Tax: <span className="font-medium">{money(order.taxCents)}</span>
        </div>
        {order.deliveryMethod === "DELIVERY" && (
          <div className="text-sm text-gray-700">
            Delivery: <span className="font-medium">{money(order.deliveryFeeCents || 0)}</span>
          </div>
        )}
        <div className="text-lg">
          Total: <span className="font-semibold">{money(order.totalCents)}</span>
        </div>
      </div>
    </main>
  );
}