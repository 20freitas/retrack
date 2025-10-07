"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { TrendingUp, DollarSign, Package, Search, Plus, Trash2, Calendar, X } from "lucide-react";

type Sale = {
  id?: string;
  product_id?: string;
  product_title?: string;
  product_image?: string;
  sale_price: number;
  sale_date: string;
  shipping_cost?: number;
  platform_fee?: number;
  platform?: string;
  purchase_price?: number;
  profit?: number;
  margin?: number;
  roi?: number;
  owner_id?: string;
  created_at?: string;
};

type Product = {
  id?: string;
  title: string;
  images?: string[];
  purchase_price?: number;
  status?: string;
};

const PLATFORMS = ["Vinted", "OLX", "Facebook Marketplace", "eBay", "Wallapop", "Outro"];

function formatCurrency(n?: number, currency: string = "USD") {
  if (n == null || isNaN(n)) return "-";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch (e) {
    return n.toString();
  }
}

function formatPercent(n?: number) {
  if (n == null || isNaN(n)) return "-";
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

export default function SalesPage() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currency, setCurrency] = useState<string>("USD");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  
  // Stock products for selection
  const [stockProducts, setStockProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // modal & form state
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formSaleDate, setFormSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [formShippingCost, setFormShippingCost] = useState("");
  const [formPlatformFee, setFormPlatformFee] = useState("");
  const [formPlatform, setFormPlatform] = useState(PLATFORMS[0]);

  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; sale: Sale | null }>({ show: false, sale: null });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user ?? null;
        if (user) {
          setCurrentUserId(user.id);
          setCurrency(user.user_metadata?.currency ?? "USD");
          fetchSales(user.id);
        } else {
          setCurrentUserId(null);
          fetchSales(null);
        }
      } catch (e) {
        setCurrentUserId(null);
        fetchSales(null);
      }
    })();

    const onUserUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      const u = custom.detail ?? null;
      if (u?.user_metadata?.currency) setCurrency(u.user_metadata.currency);
      fetchSales(u?.id ?? null);
    };
    window.addEventListener("userUpdated", onUserUpdated);
    return () => window.removeEventListener("userUpdated", onUserUpdated);
  }, []);

  const filtered = useMemo(() => {
    return sales
      .filter((s) => (query ? (s.product_title || "").toLowerCase().includes(query.toLowerCase()) || (s.platform || "").toLowerCase().includes(query.toLowerCase()) : true))
      .filter((s) => (platformFilter ? s.platform === platformFilter : true));
  }, [sales, query, platformFilter]);

  const metrics = useMemo(() => {
    const totalSales = sales.reduce((acc, s) => acc + (s.sale_price || 0), 0);
    const totalCosts = sales.reduce((acc, s) => acc + (s.purchase_price || 0) + (s.shipping_cost || 0) + (s.platform_fee || 0), 0);
    const totalProfit = sales.reduce((acc, s) => acc + (s.profit || 0), 0);
    const avgMargin = sales.length ? sales.reduce((acc, s) => acc + (s.margin || 0), 0) / sales.length : 0;
    return { totalSales, totalCosts, totalProfit, avgMargin, salesCount: sales.length };
  }, [sales]);

  async function fetchSales(userId?: string | null) {
    setLoading(true);
    try {
      const uid = userId ?? currentUserId;
      const query = uid ? `?userId=${encodeURIComponent(uid)}` : "";
      const res = await fetch(`/api/sales/list${query}`);
      const json = await res.json().catch(() => ({}));
      if (!json?.ok) {
        console.error("fetchSales error:", json);
        setSales([]);
      } else {
        console.log("fetchSales: received", Array.isArray(json.data) ? json.data.length : 0, "sales");
        setSales(json.data ?? []);
      }
    } catch (e: any) {
      console.error("fetchSales exception:", e);
      setSales([]);
    }
    setLoading(false);
  }

  async function fetchStockProducts() {
    setLoadingProducts(true);
    try {
      const query = currentUserId ? `?userId=${encodeURIComponent(currentUserId)}` : "";
      const res = await fetch(`/api/products/list${query}`);
      const json = await res.json().catch(() => ({}));
      if (json?.ok) {
        // Filter only active products (not sold)
        const activeProducts = (json.data || []).filter((p: Product) => p.status !== 'sold');
        setStockProducts(activeProducts);
      } else {
        setStockProducts([]);
      }
    } catch (e) {
      console.error("fetchStockProducts error:", e);
      setStockProducts([]);
    }
    setLoadingProducts(false);
  }

  async function openNew() {
    setSelectedProduct(null);
    resetForm();
    await fetchStockProducts();
    setShowModal(true);
  }

  function resetForm() {
    setSelectedProduct(null);
    setFormSalePrice("");
    setFormSaleDate(new Date().toISOString().slice(0, 10));
    setFormShippingCost("");
    setFormPlatformFee("");
    setFormPlatform(PLATFORMS[0]);
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    // Pre-fill with suggested price (20% markup)
    const suggestedPrice = product.purchase_price ? (product.purchase_price * 1.2).toFixed(2) : "";
    setFormSalePrice(suggestedPrice);
  }

  async function handleSubmit(e?: any) {
    e?.preventDefault?.();
    if (!currentUserId) {
      setMessage({ type: "error", text: "No authenticated user. Please sign in." });
      return;
    }

    if (!selectedProduct) {
      setMessage({ type: "error", text: "Please select a product from stock" });
      return;
    }

    const salePrice = parseFloat(formSalePrice) || 0;
    const purchasePrice = selectedProduct.purchase_price || 0;
    const shippingCost = parseFloat(formShippingCost) || 0;
    const platformFee = parseFloat(formPlatformFee) || 0;

    const profit = salePrice - purchasePrice - shippingCost - platformFee;
    const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    const roi = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;

    const payload: Sale = {
      product_id: selectedProduct.id,
      product_title: selectedProduct.title,
      product_image: selectedProduct.images?.[0],
      sale_price: salePrice,
      sale_date: formSaleDate,
      shipping_cost: shippingCost,
      platform_fee: platformFee,
      platform: formPlatform,
      purchase_price: purchasePrice,
      profit,
      margin,
      roi,
    };

    try {
      // Create sale record
      const res = await fetch("/api/sales/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId: currentUserId, ...payload }),
      });
      const json = await res.json();
      if (!json?.ok) {
        console.error("sale upsert failed", json);
        setMessage({ type: "error", text: `Save failed: ${json?.error ?? "unknown"}` });
        return;
      }

      // Mark product as sold
      try {
        const soldRes = await fetch('/api/products/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: selectedProduct.id,
            ownerId: currentUserId,
            status: 'sold',
            tags: Array.from(new Set([...(selectedProduct as any).tags || [], 'sold']))
          }),
        });
        const soldJson = await soldRes.json();
        if (!soldJson?.ok) {
          console.error('Failed to mark product as sold:', soldJson);
        }
      } catch (soldErr) {
        console.error('Exception marking product as sold:', soldErr);
      }

      setShowModal(false);
      resetForm();
      fetchSales();
      setMessage({ type: "success", text: "Sale recorded successfully" });
    } catch (err: any) {
      console.error("save error", err);
      setMessage({ type: "error", text: `Save failed: ${err?.message ?? String(err)}` });
    }
  }

  async function confirmDelete() {
    const id = deleteConfirm.sale?.id;
    if (!id) return;

    setDeleteConfirm({ show: false, sale: null });

    try {
      const res = await fetch("/api/sales/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ownerId: currentUserId }),
      });
      const json = await res.json();
      if (!json?.ok) {
        console.error("delete error", json);
        setMessage({ type: "error", text: "Delete failed: " + (json?.error ?? "unknown") });
      } else {
        fetchSales();
        setMessage({ type: "success", text: "Sale deleted successfully" });
      }
    } catch (e) {
      console.error("delete exception", e);
      setMessage({ type: "error", text: "Delete failed" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="text-green-400" size={32} />
              Sales History
            </h1>
            <p className="text-gray-400 mt-1">Track all your sales and profits</p>
          </div>
          <button
            onClick={openNew}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
          >
            <Plus size={20} />
            Record Sale
          </button>
        </div>

        {/* Metrics Cards - Minimal Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Total Sales</div>
              <DollarSign className="text-gray-400" size={18} />
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(metrics.totalSales, currency)}</div>
            <div className="text-xs text-gray-500 mt-1">{metrics.salesCount} transactions</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Total Profit</div>
              <TrendingUp className="text-gray-400" size={18} />
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(metrics.totalProfit, currency)}</div>
            <div className="text-xs text-gray-500 mt-1">Net earnings</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Avg Margin</div>
              <div className="text-gray-400 text-xl">%</div>
            </div>
            <div className="text-2xl font-bold text-white">{formatPercent(metrics.avgMargin)}</div>
            <div className="text-xs text-gray-500 mt-1">Average profit margin</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by product or platform..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg border text-sm ${message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
            {message.text}
          </div>
        )}

        {/* Sales List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <div className="text-gray-400 text-sm">Loading sales...</div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-xl border border-white/10">
            <TrendingUp className="text-gray-600 mb-4" size={48} />
            <div className="text-lg font-semibold text-gray-300 mb-2">No sales recorded yet</div>
            <div className="text-gray-400 text-sm mb-6">Start recording your sales to track profits</div>
            <button
              onClick={openNew}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
            >
              <Plus size={18} />
              Record First Sale
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sale) => (
              <div
                key={sale.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  {sale.product_image ? (
                    <img 
                      src={sale.product_image} 
                      alt={sale.product_title} 
                      className="w-16 h-16 rounded-lg object-cover bg-white/5"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                      <Package className="text-gray-600" size={24} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-semibold text-white truncate">{sale.product_title || "Untitled Product"}</h3>
                        <span className="px-2 py-0.5 bg-white/10 text-gray-300 rounded text-xs font-medium whitespace-nowrap">
                          {sale.platform}
                        </span>
                      </div>
                      <button
                        onClick={() => setDeleteConfirm({ show: true, sale })}
                        className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <div className="text-gray-500 text-xs">Sale Price</div>
                        <div className="text-white font-medium text-sm">{formatCurrency(sale.sale_price, currency)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Profit</div>
                        <div className={`font-medium text-sm ${(sale.profit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(sale.profit, currency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Margin</div>
                        <div className={`font-medium text-sm ${(sale.margin ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercent(sale.margin)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">ROI</div>
                        <div className={`font-medium text-sm ${(sale.roi ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercent(sale.roi)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </div>
                      {sale.shipping_cost ? (
                        <div>Shipping: {formatCurrency(sale.shipping_cost, currency)}</div>
                      ) : null}
                      {sale.platform_fee ? (
                        <div>Fee: {formatCurrency(sale.platform_fee, currency)}</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Record New Sale</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {/* Product Selection */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Select Product from Stock</h3>
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                  ) : stockProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      <Package size={32} className="mx-auto mb-2 text-gray-600" />
                      No products available in stock
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {stockProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                            selectedProduct?.id === product.id
                              ? 'bg-indigo-500/20 border-indigo-500/50'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.title} className="w-12 h-12 rounded object-cover bg-white/5" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center">
                              <Package className="text-gray-600" size={20} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm truncate">{product.title}</div>
                            <div className="text-xs text-gray-400">Cost: {formatCurrency(product.purchase_price, currency)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sale Details Form */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Sale Details</h3>
                  {!selectedProduct ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      <div className="mb-2">←</div>
                      Select a product to continue
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Sale Price * ({currency})</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formSalePrice}
                          onChange={(e) => setFormSalePrice(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Platform *</label>
                        <select
                          required
                          value={formPlatform}
                          onChange={(e) => setFormPlatform(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                        >
                          {PLATFORMS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Shipping Cost ({currency})</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formShippingCost}
                            onChange={(e) => setFormShippingCost(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Platform Fee ({currency})</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formPlatformFee}
                            onChange={(e) => setFormPlatformFee(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Sale Date *</label>
                        <input
                          type="date"
                          required
                          value={formSaleDate}
                          onChange={(e) => setFormSaleDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                      </div>

                      {/* Calculated Preview */}
                      {formSalePrice && selectedProduct.purchase_price && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 space-y-2">
                          <div className="text-xs font-medium text-green-300">Calculated Metrics</div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <div className="text-gray-400">Profit</div>
                              <div className="text-white font-semibold">
                                {formatCurrency(
                                  (parseFloat(formSalePrice) || 0) -
                                  (selectedProduct.purchase_price || 0) -
                                  (parseFloat(formShippingCost) || 0) -
                                  (parseFloat(formPlatformFee) || 0),
                                  currency
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">Margin</div>
                              <div className="text-white font-semibold">
                                {formatPercent(
                                  parseFloat(formSalePrice) > 0
                                    ? ((parseFloat(formSalePrice) - (selectedProduct.purchase_price || 0) - (parseFloat(formShippingCost) || 0) - (parseFloat(formPlatformFee) || 0)) / parseFloat(formSalePrice)) * 100
                                    : 0
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">ROI</div>
                              <div className="text-white font-semibold">
                                {formatPercent(
                                  selectedProduct.purchase_price && selectedProduct.purchase_price > 0
                                    ? ((parseFloat(formSalePrice) - (selectedProduct.purchase_price || 0) - (parseFloat(formShippingCost) || 0) - (parseFloat(formPlatformFee) || 0)) / selectedProduct.purchase_price) * 100
                                    : 0
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium text-sm transition-all border border-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-all"
                        >
                          Record Sale
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl border border-white/10 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="text-red-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Sale</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to delete the sale of <span className="font-semibold text-white">"{deleteConfirm.sale?.product_title}"</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm({ show: false, sale: null })}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium text-sm transition-all border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
