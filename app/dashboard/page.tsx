'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Variant {
  id: string;
  title: string;
  sku: string;
  price: number;
  costPerItem: number;
}

interface Product {
  id: string;
  title: string;
  variants: Variant[];
}

function getMarginColor(margin: number): string {
  if (margin >= 30) return 'bg-green-100 text-green-700';
  if (margin >= 10) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function getStatus(margin: number): 'Good' | 'Low' | 'Loss' {
  if (margin >= 30) return 'Good';
  if (margin >= 10) return 'Low';
  return 'Loss';
}

function calcMargin(price: number, cost: number) {
  const profit = price - cost;
  const marginPercent = price > 0 ? (profit / price) * 100 : 0;
  return { profit, marginPercent };
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editCosts, setEditCosts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!shop) return;
    fetchProducts();
  }, [shop]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?shop=${shop}`);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data.products);
      const costs: Record<string, string> = {};
      data.products.forEach((p: Product) => {
        p.variants.forEach((v: Variant) => {
          costs[v.id] = v.costPerItem > 0 ? String(v.costPerItem) : '';
        });
      });
      setEditCosts(costs);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveCost(product: Product, variant: Variant) {
    const cost = parseFloat(editCosts[variant.id]);
    if (isNaN(cost) || cost < 0) return;
    setSavingId(variant.id);
    try {
      await fetch('/api/costs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop,
          variantId: variant.id,
          productId: product.id,
          productTitle: product.title,
          variantTitle: variant.title,
          sellingPrice: variant.price,
          costPerItem: cost,
        }),
      });
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          variants: p.variants.map((v) =>
            v.id === variant.id ? { ...v, costPerItem: cost } : v
          ),
        }))
      );
    } finally {
      setSavingId(null);
    }
  }

  // Metrics
  const allVariants = products.flatMap((p) => p.variants);
  const withCost = allVariants.filter((v) => v.costPerItem > 0);
  const avgMargin =
    withCost.length > 0
      ? withCost.reduce((sum, v) => sum + calcMargin(v.price, v.costPerItem).marginPercent, 0) / withCost.length
      : 0;
  const lowAlerts = withCost.filter((v) => calcMargin(v.price, v.costPerItem).marginPercent < 10).length;

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No shop specified. <a href="/" className="text-emerald-600 underline">Go back</a></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-600">M</span>
          <span className="text-xl font-bold text-gray-900">MarginMate</span>
        </div>
        <span className="text-sm text-gray-500">{shop}</span>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Products" value={String(products.length)} />
          <StatCard label="Avg Margin %" value={`${avgMargin.toFixed(1)}%`} highlight />
          <StatCard label="Cost Entered" value={`${withCost.length} / ${allVariants.length}`} />
          <StatCard label="Low Margin Alerts" value={String(lowAlerts)} danger={lowAlerts > 0} />
        </div>

        {/* Product Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading products...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No products found.</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Product / Variant</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Gross Profit</th>
                  <th className="px-4 py-3 text-right">Margin %</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) =>
                  product.variants.map((variant, vIdx) => {
                    const hasCost = variant.costPerItem > 0;
                    const { profit, marginPercent } = calcMargin(variant.price, variant.costPerItem);
                    const status = getStatus(marginPercent);
                    const badgeColor = getMarginColor(marginPercent);

                    return (
                      <tr key={variant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {vIdx === 0 && (
                            <p className="font-medium text-gray-900">{product.title}</p>
                          )}
                          <p className="text-gray-400 text-xs">
                            {variant.title !== 'Default Title' ? variant.title : ''}
                            {variant.sku ? ` · ${variant.sku}` : ''}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          ${variant.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-400">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editCosts[variant.id] ?? ''}
                              onChange={(e) =>
                                setEditCosts((prev) => ({ ...prev, [variant.id]: e.target.value }))
                              }
                              onBlur={() => saveCost(product, variant)}
                              onKeyDown={(e) => e.key === 'Enter' && saveCost(product, variant)}
                              className="w-20 text-right border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {hasCost ? `$${profit.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {hasCost ? `${marginPercent.toFixed(1)}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasCost ? (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                              {status}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => saveCost(product, variant)}
                            disabled={savingId === variant.id}
                            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium disabled:opacity-50"
                          >
                            {savingId === variant.id ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${danger ? 'text-red-500' : highlight ? 'text-emerald-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}
