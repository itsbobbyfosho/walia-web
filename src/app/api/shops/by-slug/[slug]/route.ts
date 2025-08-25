import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, ctx: any) {
  try {
    const { slug } = ctx.params as { slug: string };

    const shop = await db.shop.findFirst({
      where: { slug, isActive: true },
      include: {
        products: { where: { isActive: true } },
      },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json(shop, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}