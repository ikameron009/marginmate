import { ApiVersion } from '@shopify/shopify-api';
import crypto from 'crypto';

// Current Shopify API version
export const SHOPIFY_API_VERSION = ApiVersion.January26;

// Build install URL for OAuth
export function getInstallUrl(shop: string): string {
  const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const redirectUri = `${process.env.HOST}/api/auth/callback`;
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products';
  return (
    `https://${cleanShop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  );
}

// Validate HMAC from Shopify
export function validateHmac(query: Record<string, string>): boolean {
  const { hmac, ...rest } = query;
  if (!hmac) return false;
  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join('&');
  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
    .update(message)
    .digest('hex');
  return digest === hmac;
}

// Exchange auth code for access token
export async function exchangeToken(
  shop: string,
  code: string
): Promise<string> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

// Fetch products from Shopify REST API
export async function fetchShopifyProducts(
  shop: string,
  accessToken: string,
  limit = 250
) {
  const res = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=${limit}`,
    { headers: { 'X-Shopify-Access-Token': accessToken } }
  );
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const data = await res.json();
  return data.products;
}

// Fetch shop info
export async function fetchShopInfo(shop: string, accessToken: string) {
  const res = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
    { headers: { 'X-Shopify-Access-Token': accessToken } }
  );
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const data = await res.json();
  return data.shop;
}
