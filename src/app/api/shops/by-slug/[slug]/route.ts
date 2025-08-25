import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/shops/by-slug/:slug -> shop + its active products
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const shop = await db.shop.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!shop || !shop.isActive) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  return NextResponse.json(shop);
}