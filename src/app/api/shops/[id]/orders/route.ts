import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/shops/:id/orders -> list latest orders for a shop
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const shopId = params.id;

  const orders = await db.order.findMany({
    where: { shopId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: true, variant: true } },
    },
  });

  return NextResponse.json(orders);
}