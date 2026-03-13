import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// PUT /api/costs
// Body: { shop, variantId, productId, productTitle, variantTitle, sellingPrice, costPerItem }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { shop, variantId, productId, productTitle, variantTitle, sellingPrice, costPerItem } = body;

    if (!shop || !variantId || costPerItem === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof costPerItem !== 'number' || costPerItem < 0) {
      return NextResponse.json({ error: 'Invalid costPerItem value' }, { status: 400 });
    }

    const db = createServiceClient();

    const { error } = await db.from('product_costs').upsert(
      {
        shop,
        product_id: String(productId),
        variant_id: String(variantId),
        product_title: productTitle || null,
        variant_title: variantTitle || null,
        selling_price: sellingPrice ?? 0,
        cost: costPerItem,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'shop,variant_id' }
    );

    if (error) {
      console.error('Cost update error:', error);
      return NextResponse.json({ error: 'Failed to update cost' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT /api/costs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/costs (bulk update)
// Body: { shop, updates: [{ variantId, productId, productTitle, variantTitle, sellingPrice, costPerItem }] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shop, updates } = body;

    if (!shop || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = createServiceClient();

    const rows = updates.map((u: any) => ({
      shop,
      product_id: String(u.productId),
      variant_id: String(u.variantId),
      product_title: u.productTitle || null,
      variant_title: u.variantTitle || null,
      selling_price: u.sellingPrice ?? 0,
      cost: u.costPerItem,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await db
      .from('product_costs')
      .upsert(rows, { onConflict: 'shop,variant_id' });

    if (error) {
      console.error('Bulk cost update error:', error);
      return NextResponse.json({ error: 'Failed to update costs' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: rows.length });
  } catch (err) {
    console.error('POST /api/costs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
