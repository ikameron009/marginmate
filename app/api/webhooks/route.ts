import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase';

function verifyWebhook(body: string, hmacHeader: string): boolean {
  const secret = process.env.SHOPIFY_API_SECRET!;
  const digest = crypto.createHmac('sha256', secret).update(body).digest('base64');
  return digest === hmacHeader;
}

// POST /api/webhooks
export async function POST(req: NextRequest) {
  const topic = req.headers.get('x-shopify-topic');
  const shop = req.headers.get('x-shopify-shop-domain');
  const hmac = req.headers.get('x-shopify-hmac-sha256');

  if (!topic || !shop || !hmac) {
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
  }

  const rawBody = await req.text();

  if (!verifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const db = createServiceClient();

  switch (topic) {
    case 'products/delete': {
      await db
        .from('product_costs')
        .delete()
        .eq('shop', shop)
        .eq('product_id', String(payload.id));
      break;
    }

    case 'app/uninstalled': {
      await db.from('product_costs').delete().eq('shop', shop);
      await db.from('settings').delete().eq('shop', shop);
      await db.from('sessions').delete().eq('shop', shop);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
