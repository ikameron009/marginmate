import { NextRequest, NextResponse } from 'next/server';
import { getInstallUrl, validateHmac } from '@/lib/shopify';

// GET /api/auth?shop=myshop.myshopify.com
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  // Validate shop domain format
  if (!/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(shop)) {
    return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 });
  }

  const installUrl = getInstallUrl(shop);
  return NextResponse.redirect(installUrl);
}
