// Shopify Shop
export interface Shop {
  id: string;
  shopDomain: string;
  accessToken: string;
  email?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// Product with cost/margin data
export interface Product {
  id: string;
  shopId: string;
  shopifyProductId: string;
  title: string;
  vendor?: string;
  productType?: string;
  handle: string;
  status: 'active' | 'archived' | 'draft';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

// Product Variant with cost tracking
export interface ProductVariant {
  id: string;
  productId: string;
  shopifyVariantId: string;
  title: string;
  sku?: string;
  price: number;          // Selling price (from Shopify)
  costPerItem: number;    // Cost of goods (entered by merchant)
  compareAtPrice?: number;
  inventoryQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

// Calculated margin data
export interface MarginData {
  variantId: string;
  price: number;
  costPerItem: number;
  profit: number;
  marginPercent: number;  // (profit / price) * 100
  markup: number;         // (profit / cost) * 100
}

// Dashboard summary stats
export interface DashboardStats {
  totalProducts: number;
  avgMarginPercent: number;
  highMarginProducts: number;   // margin > 50%
  lowMarginProducts: number;    // margin < 20%
  zeroMarginProducts: number;   // no cost entered
}

// Shopify product from API
export interface ShopifyProduct {
  id: number;
  title: string;
  vendor: string;
  product_type: string;
  handle: string;
  status: string;
  images: { src: string }[];
  variants: ShopifyVariant[];
  created_at: string;
  updated_at: string;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  sku: string;
  price: string;
  compare_at_price: string | null;
  inventory_quantity: number;
}
