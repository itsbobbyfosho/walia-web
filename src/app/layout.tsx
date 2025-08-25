// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Walia",
  description: "Ethiopian shops in Calgary",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <header className="border-b">
          <nav className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">Walia</Link>
            <div className="space-x-4 text-sm">
              <Link href="/">Home</Link>
              <Link href="/cart">Cart</Link>
              <Link href="/orders">Orders</Link>
              <Link href="/shop-admin">Shop Admin</Link>
            </div>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
