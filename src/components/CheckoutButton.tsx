// src/components/CheckoutButton.tsx
'use client';

import { useState } from 'react';

export default function CheckoutButton({ disabled = false }: { disabled?: boolean }) {
  const [busy, setBusy] = useState(false);

  function goToPay() {
    if (disabled) return;
    setBusy(true);
    window.location.href = '/pay';
  }

  return (
    <button
      onClick={goToPay}
      disabled={busy || disabled}
      className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
    >
      {busy ? 'Loading…' : 'Checkout'}
    </button>
  );
}