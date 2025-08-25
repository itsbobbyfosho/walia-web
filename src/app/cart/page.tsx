// src/app/cart/page.tsx
import CheckoutButton from "../../components/CheckoutButton";
import CartItemControls from "../../components/CartItemControls";

type CartItem = {
  id: string;
  qty: number;
  unitPriceCents: number;
  product: { name: string };
};

type CartResp = {
  id: string | null;
  items: CartItem[];
};

const CUSTOMER_ID = "f53f12f6-19a6-45a6-a71f-e35b11291ab6"; // TEMP until auth

async function getCart(): Promise<CartResp> {
  const res = await fetch(
    `http://localhost:3000/api/cart?customerId=${CUSTOMER_ID}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load cart");
  return res.json();
}

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function CartPage() {
  const cart = await getCart();
  const subtotal = cart.items.reduce(
    (sum, i) => sum + i.qty * i.unitPriceCents,
    0
  );

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Cart</h1>

      {cart.items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y rounded-xl border">
            {cart.items.map((i) => (
              <li key={i.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{i.product.name}</div>
                    <div className="text-sm text-gray-600">
                      ${(i.unitPriceCents / 100).toFixed(2)} each
                    </div>
                    <CartItemControls cartItemId={i.id} qty={i.qty} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Qty: <span className="font-medium">{i.qty}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Line:{" "}
                      <span className="font-medium">
                        {money(i.unitPriceCents * i.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="text-right">
            <div className="mt-4 text-lg">
              Subtotal: <span className="font-medium">{money(subtotal)}</span>
            </div>
            <div className="text-sm text-gray-500">
              Tax & fees shown at checkout.
            </div>
          </div>

          <CheckoutButton />
        </>
      )}
    </main>
  );
}