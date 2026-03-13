// Shopifyプラン別トランザクション手数料率
const SHOPIFY_FEES: Record<string, number> = {
  basic: 0.02,      // 2%
  shopify: 0.01,    // 1%
  advanced: 0.005,  // 0.5%
  plus: 0.002,      // 0.2%
};

// 粗利計算（手数料なし）
export function calculateGrossProfit(sellingPrice: number, cost: number): number {
  return sellingPrice - cost;
}

// 粗利率計算
export function calculateMarginPercent(sellingPrice: number, cost: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - cost) / sellingPrice) * 100;
}

// Shopify手数料込みの純利益
export function calculateNetProfit(sellingPrice: number, cost: number, plan: string): number {
  const fee = SHOPIFY_FEES[plan] ?? SHOPIFY_FEES.basic;
  const transactionFee = sellingPrice * fee;
  return sellingPrice - cost - transactionFee;
}

// ステータス判定
export function getProfitStatus(marginPercent: number, threshold: number): 'good' | 'low' | 'loss' {
  if (marginPercent < 0) return 'loss';
  if (marginPercent < threshold) return 'low';
  return 'good';
}
