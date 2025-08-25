
// src/lib/env.ts
export function baseUrl() {
  // In Vercel, VERCEL_URL is like "walia-web.vercel.app"
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Fallback for local dev
  return 'http://localhost:3000';
}