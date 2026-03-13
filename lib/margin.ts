import type { MarginData } from '@/types';

// Calculate profit margin and markup for a variant
export function calculateMargin(price: number, costPerItem: number): MarginData {
  const profit = price - costPerItem;
  const marginPercent = price > 0 ? (profit / price) * 100 : 0;
  const markup = costPerItem > 0 ? (profit / costPerItem) * 100 : 0;

  return {
    variantId: '',
    price,
    costPerItem,
    profit,
    marginPercent,
    markup,
  };
}

// Classify margin health
export function getMarginStatus(marginPercent: number): 'high' | 'medium' | 'low' | 'danger' {
  if (marginPercent >= 50) return 'high';
  if (marginPercent >= 30) return 'medium';
  if (marginPercent >= 10) return 'low';
  return 'danger';
}

// Color class for margin badge (Tailwind)
export function getMarginColor(marginPercent: number): string {
  const status = getMarginStatus(marginPercent);
  switch (status) {
    case 'high':   return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low':    return 'bg-orange-100 text-orange-800';
    case 'danger': return 'bg-red-100 text-red-800';
  }
}

// Format as percentage string
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Format as currency string
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
