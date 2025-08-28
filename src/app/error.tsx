// src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">App Error</h1>
      <div className="text-sm text-gray-600">
        Digest: <span className="font-mono">{error?.digest ?? 'n/a'}</span>
      </div>
      <pre className="whitespace-pre-wrap text-sm bg-red-50 border border-red-200 p-3 rounded">
{String(error?.message ?? error)}
      </pre>
      <button
        onClick={() => reset()}
        className="px-3 py-2 rounded bg-black text-white text-sm"
      >
        Try again
      </button>
    </main>
  );
}