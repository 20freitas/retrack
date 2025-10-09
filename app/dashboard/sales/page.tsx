"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  TrendingUp,
  DollarSign,
  Package,
  Search,
  Plus,
  Trash2,
  Calendar,
  X,
  ImageIcon,
} from "lucide-react";

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

const PLATFORMS = [
  "Vinted",
  "OLX",
  "Facebook Marketplace",
  "eBay",
  "Wallapop",
  "Outro",
];

function formatCurrency(n?: number, currency: string = "USD") {
  if (n == null || isNaN(n)) return "-";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n);
  } catch (e) {
    return n.toString();
  }
}

function formatPercent(n?: number) {
  if (n == null || isNaN(n)) return "-";
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pb-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-white/10 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-white/10 rounded-lg"></div>
        </div>
        <div className="h-12 w-40 bg-white/10 rounded-xl"></div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/10"></div>
              <div className="h-4 w-24 bg-white/10 rounded"></div>
            </div>
            <div className="h-8 w-32 bg-white/10 rounded mb-1"></div>
            <div className="h-4 w-24 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>

      {/* Search & Filters Skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
          <div className="w-40 h-12 bg-white/10 rounded-xl"></div>
        </div>
      </div>

      {/* Sales List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-white/10"></div>
              <div className="flex-1">
                <div className="h-6 w-48 bg-white/10 rounded mb-2"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-6 w-20 bg-white/10 rounded-lg"></div>
                  <div className="h-6 w-32 bg-white/10 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j}>
                      <div className="h-3 w-16 bg-white/10 rounded mb-1"></div>
                      <div className="h-5 w-20 bg-white/10 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currency, setCurrency] = useState<string>("USD");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("");

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Stock products for selection
  const [stockProducts, setStockProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // modal & form state
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formSaleDate, setFormSaleDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [formShippingCost, setFormShippingCost] = useState("");
  const [formPlatformFee, setFormPlatformFee] = useState("");
  const [formPlatform, setFormPlatform] = useState(PLATFORMS[0]);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    sale: Sale | null;
  }>({ show: false, sale: null });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
      .filter((s) =>
        query
          ? (s.product_title || "")
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            (s.platform || "").toLowerCase().includes(query.toLowerCase())
          : true
      )
      .filter((s) => (platformFilter ? s.platform === platformFilter : true));
  }, [sales, query, platformFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, platformFilter]);

  const metrics = useMemo(() => {
    const totalSales = sales.reduce((acc, s) => acc + (s.sale_price || 0), 0);
    const totalCosts = sales.reduce(
      (acc, s) =>
        acc +
        (s.purchase_price || 0) +
        (s.shipping_cost || 0) +
        (s.platform_fee || 0),
      0
    );
    const totalProfit = sales.reduce((acc, s) => acc + (s.profit || 0), 0);
    const avgMargin = sales.length
      ? sales.reduce((acc, s) => acc + (s.margin || 0), 0) / sales.length
      : 0;
    return {
      totalSales,
      totalCosts,
      totalProfit,
      avgMargin,
      salesCount: sales.length,
    };
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
        console.log(
          "fetchSales: received",
          Array.isArray(json.data) ? json.data.length : 0,
          "sales"
        );
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
      const query = currentUserId
        ? `?userId=${encodeURIComponent(currentUserId)}`
        : "";
      const res = await fetch(`/api/products/list${query}`);
      const json = await res.json().catch(() => ({}));
      if (json?.ok) {
        // Filter only active products (not sold)
        const activeProducts = (json.data || []).filter(
          (p: Product) => p.status !== "sold"
        );
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
    const suggestedPrice = product.purchase_price
      ? (product.purchase_price * 1.2).toFixed(2)
      : "";
    setFormSalePrice(suggestedPrice);
  }

  async function handleSubmit(e?: any) {
    e?.preventDefault?.();
    if (!currentUserId) {
      setMessage({
        type: "error",
        text: "No authenticated user. Please sign in.",
      });
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
        setMessage({
          type: "error",
          text: `Save failed: ${json?.error ?? "unknown"}`,
        });
        return;
      }

      // Mark product as sold
      try {
        const soldRes = await fetch("/api/products/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedProduct.id,
            ownerId: currentUserId,
            status: "sold",
            tags: Array.from(
              new Set([...((selectedProduct as any).tags || []), "sold"])
            ),
          }),
        });
        const soldJson = await soldRes.json();
        if (!soldJson?.ok) {
          console.error("Failed to mark product as sold:", soldJson);
        }
      } catch (soldErr) {
        console.error("Exception marking product as sold:", soldErr);
      }

      setShowModal(false);
      resetForm();
      fetchSales();
      setMessage({ type: "success", text: "Sale recorded successfully" });
    } catch (err: any) {
      console.error("save error", err);
      setMessage({
        type: "error",
        text: `Save failed: ${err?.message ?? String(err)}`,
      });
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
        setMessage({
          type: "error",
          text: "Delete failed: " + (json?.error ?? "unknown"),
        });
      } else {
        fetchSales();
        setMessage({ type: "success", text: "Sale deleted successfully" });
      }
    } catch (e) {
      console.error("delete exception", e);
      setMessage({ type: "error", text: "Delete failed" });
    }
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`fixed top-24 right-6 z-50 animate-in slide-in-from-top-5 duration-300 ${
            message.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              : "bg-red-500/20 border-red-500/50 text-red-300"
          } border rounded-xl px-6 py-4 shadow-xl backdrop-blur-sm`}
        >
          <div className="flex items-center gap-3">
            {message.type === "success" ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-500/30 flex items-center justify-center">
                <X size={12} />
              </div>
            )}
            <span className="font-medium">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-2 hover:opacity-70"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sales History</h1>
          <p className="text-gray-400 mt-1">Track all your sales and profits</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-medium transition-colors"
        >
          <Plus size={20} />
          Record Sale
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <div className="text-xs text-gray-400">
              {metrics.salesCount} transactions
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(metrics.totalSales, currency)}
          </div>
          <div className="text-sm text-gray-400">Total Sales</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div className="text-xs text-gray-400">Net earnings</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(metrics.totalProfit, currency)}
          </div>
          <div className="text-sm text-gray-400">Total Profit</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <div className="text-white text-xl font-bold">%</div>
            </div>
            <div className="text-xs text-gray-400">Average margin</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatPercent(metrics.avgMargin)}
          </div>
          <div className="text-sm text-gray-400">Avg Margin</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-400"
                placeholder="Search by product or platform..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <select
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white text-sm cursor-pointer appearance-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "40px",
            }}
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="" className="bg-[#0b0f13] text-white">
              All Platforms
            </option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p} className="bg-[#0b0f13] text-white">
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            <div className="text-gray-400 text-sm">Loading sales...</div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <TrendingUp className="text-gray-600 mb-4" size={48} />
          <div className="text-lg font-semibold text-gray-300 mb-2">
            No sales recorded yet
          </div>
          <div className="text-gray-400 text-sm mb-6">
            Start recording your sales to track profits
          </div>
          <button
            onClick={openNew}
            className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Record First Sale
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
            >
              <div className="flex items-start gap-4">
                {sale.product_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sale.product_image}
                    alt={sale.product_title}
                    className="w-20 h-20 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Package className="text-gray-600" size={28} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-1">
                        {sale.product_title || "Untitled Product"}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-white/10 text-gray-300 rounded-lg text-xs font-medium">
                          {sale.platform}
                        </span>
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm({ show: true, sale })}
                      className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Sale Price
                      </div>
                      <div className="text-white font-semibold">
                        {formatCurrency(sale.sale_price, currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Profit</div>
                      <div
                        className={`font-semibold ${
                          (sale.profit ?? 0) >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatCurrency(sale.profit, currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Margin</div>
                      <div
                        className={`font-semibold ${
                          (sale.margin ?? 0) >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatPercent(sale.margin)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">ROI</div>
                      <div
                        className={`font-semibold ${
                          (sale.roi ?? 0) >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatPercent(sale.roi)}
                      </div>
                    </div>
                  </div>

                  {(sale.shipping_cost || sale.platform_fee) && (
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                      {sale.shipping_cost ? (
                        <div>
                          Shipping:{" "}
                          {formatCurrency(sale.shipping_cost, currency)}
                        </div>
                      ) : null}
                      {sale.platform_fee ? (
                        <div>
                          Fee: {formatCurrency(sale.platform_fee, currency)}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {filtered.length > 0 && (
            <div className="mt-6 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value={5} className="bg-gray-900">
                    5
                  </option>
                  <option value={10} className="bg-gray-900">
                    10
                  </option>
                  <option value={25} className="bg-gray-900">
                    25
                  </option>
                  <option value={50} className="bg-gray-900">
                    50
                  </option>
                  <option value={100} className="bg-gray-900">
                    100
                  </option>
                </select>
                <span className="text-sm text-gray-400">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filtered.length
                  )}{" "}
                  - {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
                  {filtered.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#0a0e14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Plus size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Record New Sale
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Select product and enter sale details
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {/* Product Selection */}
              <div className="p-8 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Select Product from Stock
                </h3>
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                ) : stockProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    <Package size={32} className="mx-auto mb-2 text-gray-600" />
                    No products available in stock
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stockProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => selectProduct(product)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                          selectedProduct?.id === product.id
                            ? "bg-blue-500/20 border-blue-500/50"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-14 h-14 rounded-lg object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                            <Package className="text-gray-600" size={22} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm truncate">
                            {product.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            Cost:{" "}
                            {formatCurrency(product.purchase_price, currency)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sale Details Form */}
              <div className="p-8 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Sale Details
                </h3>
                {!selectedProduct ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    <div className="mb-2">←</div>
                    Select a product to continue
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sale Price <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formSalePrice}
                        onChange={(e) => setFormSalePrice(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={formPlatform}
                        onChange={(e) => setFormPlatform(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white cursor-pointer appearance-none"
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 12px center",
                          paddingRight: "40px",
                        }}
                      >
                        {PLATFORMS.map((p) => (
                          <option
                            key={p}
                            value={p}
                            className="bg-[#0b0f13] text-white"
                          >
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Shipping Cost
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formShippingCost}
                          onChange={(e) => setFormShippingCost(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Platform Fee
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formPlatformFee}
                          onChange={(e) => setFormPlatformFee(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sale Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formSaleDate}
                        onChange={(e) => setFormSaleDate(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white"
                      />
                    </div>

                    {formSalePrice && selectedProduct.purchase_price && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                        <div className="text-xs font-medium text-emerald-300 mb-3">
                          Calculated Metrics
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <div className="text-gray-400 text-xs mb-1">
                              Profit
                            </div>
                            <div className="text-white font-semibold text-sm">
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
                            <div className="text-gray-400 text-xs mb-1">
                              Margin
                            </div>
                            <div className="text-white font-semibold text-sm">
                              {formatPercent(
                                parseFloat(formSalePrice) > 0
                                  ? ((parseFloat(formSalePrice) -
                                      (selectedProduct.purchase_price || 0) -
                                      (parseFloat(formShippingCost) || 0) -
                                      (parseFloat(formPlatformFee) || 0)) /
                                      parseFloat(formSalePrice)) *
                                      100
                                  : 0
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs mb-1">
                              ROI
                            </div>
                            <div className="text-white font-semibold text-sm">
                              {formatPercent(
                                selectedProduct.purchase_price &&
                                  selectedProduct.purchase_price > 0
                                  ? ((parseFloat(formSalePrice) -
                                      (selectedProduct.purchase_price || 0) -
                                      (parseFloat(formShippingCost) || 0) -
                                      (parseFloat(formPlatformFee) || 0)) /
                                      selectedProduct.purchase_price) *
                                      100
                                  : 0
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white font-medium border border-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-medium transition-colors"
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
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0e14] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Sale</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-300 mb-2">
                Are you sure you want to delete the sale of{" "}
                <span className="font-semibold text-white">
                  "{deleteConfirm.sale?.product_title}"
                </span>
                ?
              </p>
              <p className="text-sm text-gray-400">
                This will permanently remove the sale record from your history.
              </p>
            </div>

            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteConfirm({ show: false, sale: null })}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white font-medium border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-medium transition-colors"
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
