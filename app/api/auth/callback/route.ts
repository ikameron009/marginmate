import { NextRequest, NextResponse } from 'next/server';
import { validateHmac, exchangeToken } from '@/lib/shopify';
import { createServiceClient } from '@/lib/supabase';

// GET /api/auth/callback?shop=...&code=...&hmac=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query: Record<string, string> = {};
  searchParams.forEach((value, key) => { query[key] = value; });

  const shop = query.shop;
  const code = query.code;

  if (!shop || !code) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  if (!validateHmac(query)) {
    return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
  }

  try {
    const accessToken = await exchangeToken(shop, code);

    const db = createServiceClient();
    const { error } = await db.from('sessions').upsert(
      { shop, access_token: accessToken },
      { onConflict: 'shop' }
    );

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const host = process.env.HOST || '';
    return NextResponse.redirect(`${host}/dashboard?shop=${shop}`);
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
