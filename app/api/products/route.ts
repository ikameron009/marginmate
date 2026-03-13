import { NextRequest, NextResponse } from 'next/server';
import { fetchShopifyProducts } from '@/lib/shopify';
import { createServiceClient } from '@/lib/supabase';

// GET /api/products?shop=myshop.myshopify.com
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: session, error: sessionError } = await db
    .from('sessions')
    .select('access_token')
    .eq('shop', shop)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  try {
    const shopifyProducts = await fetchShopifyProducts(shop, session.access_token);

    const { data: costs } = await db
      .from('product_costs')
      .select('variant_id, cost, selling_price')
      .eq('shop', shop);

    const costMap = new Map(
      (costs || []).map((c) => [c.variant_id, { cost: c.cost, selling_price: c.selling_price }])
    );

    const products = shopifyProducts.map((p: any) => ({
      id: String(p.id),
      title: p.title,
      vendor: p.vendor,
      handle: p.handle,
      status: p.status,
      imageUrl: p.images?.[0]?.src || null,
      variants: p.variants.map((v: any) => {
        const saved = costMap.get(String(v.id));
        return {
          id: String(v.id),
          title: v.title,
          sku: v.sku,
          price: parseFloat(v.price),
          inventoryQuantity: v.inventory_quantity,
          costPerItem: saved?.cost ?? 0,
        };
      }),
    }));

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Products fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
