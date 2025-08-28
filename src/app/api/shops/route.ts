// src/app/api/shops/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs'; // ensure Prisma runs on Node, not Edge

export async function GET(_req: NextRequest) {
  try {
    const shops = await db.shop.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ownerId: true,
        name: true,
        slug: true,
        description: true,
        phone: true,
        address1: true,
        address2: true,
        city: true,
        postalCode: true,
        isActive: true,
        deliveryMethod: true,
        deliveryFeeCents: true,
        commissionBps: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(shops, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}