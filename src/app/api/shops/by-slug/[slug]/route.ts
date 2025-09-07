// src/app/api/shops/by-slug/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: any) {
  try {
    // Be extra defensive about how we read params in prod
    const p: any = ctx?.params;
    const raw = (p && (p.slug ?? p['slug'])) as unknown;
    const slug =
      typeof raw === 'string' ? raw :
      Array.isArray(raw) && raw.length ? String(raw[0]) :
      '';

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug param' }, { status: 400 });
    }

    // 1) Fetch shop core fields
    const shop = await db.shop.findFirst({
      where: { slug, isActive: true },
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

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // 2) Fetch products separately
    const products = await db.product.findMany({
      where: { shopId: shop.id, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        priceCents: true,
        currency: true,
        stockQty: true,
        imageUrls: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ...shop, products }, { status: 200 });
  } catch (e: any) {
    console.error('by-slug error:', e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}