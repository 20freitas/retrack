"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Package,
  DollarSign,
  Users,
  Search,
  Filter,
  X,
  Plus,
  Edit2,
  Trash2,
  ShoppingBag,
  Calendar,
  Tag,
  Image as ImageIcon,
} from "lucide-react";

type Product = {
  id?: string;
  title: string;
  description?: string;
  images?: string[];
  purchase_price?: number;
  date?: string;
  condition?: string;
  supplier?: string;
  status?: string;
  tags?: string[];
  created_at?: string;
};

const DEFAULT_CONDITIONS = ["new", "used", "refurbished"];
const STATUSES = ["active", "reserved", "paused"]; // 'sold' is handled via the Mark sold action

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

async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<Blob> {
  return await new Promise((resolve) => {
    const img = document.createElement("img");
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          "image/jpeg",
          quality
        );
      };
    };
    reader.readAsDataURL(file);
  });
}

export default function StockPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [currency, setCurrency] = useState<string>("USD");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "">("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // modal & form state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<string>("");
  const [formDate, setFormDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [formCondition, setFormCondition] = useState<string>(
    DEFAULT_CONDITIONS[0]
  );
  const [formSupplier, setFormSupplier] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>(STATUSES[0]);
  const [formTags, setFormTags] = useState<string>("");
  const [formImages, setFormImages] = useState<File[]>([]);
  const [imagePreviews, setFormImagePreviews] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    product: Product | null;
  }>({ show: false, product: null });
  const [soldConfirm, setSoldConfirm] = useState<{
    show: boolean;
    product: Product | null;
  }>({ show: false, product: null });
  const [soldPrice, setSoldPrice] = useState<string>("");
  const [soldDate, setSoldDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    // load current user id and currency before fetching products
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user ?? null;
        if (user) {
          setCurrentUserId(user.id);
          setCurrency(user.user_metadata?.currency ?? "USD");
          // pass userId directly since state update is async
          fetchProducts(user.id);
        } else {
          setCurrentUserId(null);
          fetchProducts(null);
        }
      } catch (e) {
        setCurrentUserId(null);
        fetchProducts(null);
      }
    })();

    const onUserUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      const u = custom.detail ?? null;
      if (u?.user_metadata?.currency) setCurrency(u.user_metadata.currency);
      // refresh products when user metadata changes
      fetchProducts(u?.id ?? null);
    };
    window.addEventListener("userUpdated", onUserUpdated);
    return () => window.removeEventListener("userUpdated", onUserUpdated);
  }, []);

  useEffect(() => {
    const urls = formImages.map((f) => URL.createObjectURL(f));
    setFormImagePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [formImages]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => p.status !== "sold")
      .filter((p) => (statusFilter ? p.status === statusFilter : true))
      .filter((p) =>
        query
          ? (p.title || "").toLowerCase().includes(query.toLowerCase()) ||
            (p.tags || []).join(" ").toLowerCase().includes(query.toLowerCase())
          : true
      )
      .filter((p) =>
        minPrice ? (p.purchase_price ?? 0) >= parseFloat(minPrice) : true
      )
      .filter((p) =>
        maxPrice ? (p.purchase_price ?? 0) <= parseFloat(maxPrice) : true
      );
  }, [products, query, statusFilter, minPrice, maxPrice]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, minPrice, maxPrice]);

  const metrics = useMemo(() => {
    const inStock = products.filter((p) => p.status !== "sold");
    const itemsCount = inStock.length;
    const totalSpent = inStock.reduce(
      (acc, p) => acc + (Number(p.purchase_price) || 0),
      0
    );
    const suppliers = Array.from(
      new Set(inStock.map((p) => (p.supplier || "").trim()).filter(Boolean))
    );
    const avgPrice = itemsCount ? totalSpent / itemsCount : 0;
    return {
      itemsCount,
      totalSpent,
      suppliersCount: suppliers.length,
      avgPrice,
    };
  }, [products]);

  async function fetchProducts(userId?: string | null) {
    setLoading(true);
    try {
      const uid = userId ?? currentUserId;
      const query = uid ? `?userId=${encodeURIComponent(uid)}` : "";
      const res = await fetch(`/api/products/list${query}`);
      const json = await res.json().catch(() => ({}));
      if (!json?.ok) {
        // If the server indicates missing userId or returns empty object, treat as empty list
        const errMsg = json?.error ?? null;
        if (
          !errMsg ||
          errMsg.toString().toLowerCase().includes("missing userid")
        ) {
          console.log("fetchProducts: no user or no products (empty)");
          setFetchError(null);
          setProducts([]);
        } else {
          console.error("fetchProducts server error:", json);
          setFetchError(errMsg ?? "Server error");
          setProducts([]);
        }
      } else {
        console.log(
          "fetchProducts: received",
          Array.isArray(json.data) ? json.data.length : 0,
          "items",
          json.data
        );
        setFetchError(null);
        setProducts(json.data ?? []);
      }
    } catch (e: any) {
      console.error("fetchProducts exception:", e);
      setFetchError(e?.message ?? String(e));
      setProducts([]);
    }
    setLoading(false);
  }

  async function handleImageFiles(files: FileList | null) {
    if (!files) return;
    setFormImages(Array.from(files));
  }

  async function uploadImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const f of files) {
      const compressed = await compressImage(f);
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(compressed as Blob);
      });

      const fileName = `images/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${f.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      try {
        const res = await fetch("/api/product-images/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, fileName, ownerId: currentUserId }),
        });
        const json = await res.json();
        if (json?.ok && json.publicUrl) urls.push(json.publicUrl);
        else console.error("server upload failed", json);
      } catch (e) {
        console.error("uploadImages server error", e);
      }
    }
    return urls;
  }

  function openNew() {
    setEditing(null);
    resetForm();
    setShowModal(true);
  }

  function startEdit(p: Product) {
    setEditing(p);
    setFormTitle(p.title || "");
    setFormDescription(p.description || "");
    setFormPrice(p.purchase_price?.toString() ?? "");
    setFormDate(
      p.date ? p.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
    );
    setFormCondition(p.condition || DEFAULT_CONDITIONS[0]);
    setFormSupplier(p.supplier || "");
    setFormStatus(p.status || STATUSES[0]);
    setFormTags((p.tags || []).join(", "));
    setFormImages([]);
    setShowModal(true);
  }

  function resetForm() {
    setFormTitle("");
    setFormDescription("");
    setFormPrice("");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormCondition(DEFAULT_CONDITIONS[0]);
    setFormSupplier("");
    setFormStatus(STATUSES[0]);
    setFormTags("");
    setFormImages([]);
  }

  async function handleSubmit(e?: any) {
    e?.preventDefault?.();
    const isEdit = !!editing?.id;
    // ensure we have a current user id before creating/updating products
    if (!currentUserId) {
      setMessage({
        type: "error",
        text: "No authenticated user detected. Please sign in before saving products.",
      });
      return;
    }

    try {
      let imageUrls: string[] = editing?.images ?? [];
      if (formImages.length) {
        const uploaded = await uploadImages(formImages);
        imageUrls = [...(imageUrls ?? []), ...uploaded];
      }

      const payload: Product = {
        title: formTitle,
        description: formDescription,
        images: imageUrls,
        purchase_price: formPrice ? parseFloat(formPrice) : undefined,
        date: formDate || undefined,
        condition: formCondition,
        supplier: formSupplier,
        status: formStatus,
        tags: formTags
          ? formTags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      // Send payload to server-side upsert endpoint which uses the service role key
      try {
        const upsertRes = await fetch("/api/products/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing?.id,
            ownerId: currentUserId,
            ...payload,
          }),
        });
        const json = await upsertRes.json();
        if (!json?.ok) {
          console.error("server upsert failed", json);
          alert(`Save failed: ${json?.error ?? "unknown"}`);
          return;
        }
        console.log("upserted product", json.data);
      } catch (e: any) {
        console.error("upsert request failed", e);
        alert(`Save failed: ${e?.message ?? String(e)}`);
        return;
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error("save error", err);
      alert("Error saving product (see console)");
    }
  }

  async function confirmDelete() {
    const id = deleteConfirm.product?.id;
    if (!id) return;

    setDeleteConfirm({ show: false, product: null });

    try {
      const res = await fetch("/api/products/delete", {
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
        fetchProducts();
        setMessage({ type: "success", text: "Product deleted successfully" });
      }
    } catch (e) {
      console.error("delete exception", e);
      setMessage({ type: "error", text: "Delete failed" });
    }
  }

  async function confirmMarkSold() {
    const p = soldConfirm.product;
    if (!p) return;

    // Validate sold price
    const salePrice = soldPrice ? parseFloat(soldPrice) : undefined;
    if (!salePrice || salePrice <= 0) {
      setMessage({ type: "error", text: "Please enter a valid sale price" });
      return;
    }

    setSoldConfirm({ show: false, product: null });
    setSoldPrice("");
    setSoldDate(new Date().toISOString().slice(0, 10));

    try {
      const newTags = Array.from(new Set([...(p.tags || []), "sold"]));

      // Calculate profit metrics
      const purchasePrice = p.purchase_price || 0;
      const profit = salePrice - purchasePrice;
      const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
      const roi = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;

      // Update product status to sold
      const res = await fetch("/api/products/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          ownerId: currentUserId,
          status: "sold",
          tags: newTags,
          description: p.description
            ? `${p.description}\n\n[SOLD INFO] Sale Price: ${formatCurrency(
                salePrice,
                currency
              )} | Sale Date: ${soldDate} | Profit: ${formatCurrency(
                profit,
                currency
              )}`
            : `[SOLD INFO] Sale Price: ${formatCurrency(
                salePrice,
                currency
              )} | Sale Date: ${soldDate} | Profit: ${formatCurrency(
                profit,
                currency
              )}`,
        }),
      });
      const json = await res.json();
      if (!json?.ok) {
        console.error("markAsSold failed", json);
        setMessage({
          type: "error",
          text: "Could not mark as sold: " + (json?.error ?? "unknown"),
        });
        return;
      }

      // Automatically create a sale record in the sales table
      try {
        const salePayload = {
          product_id: p.id,
          product_title: p.title,
          product_image: p.images?.[0], // Add product image
          sale_price: salePrice,
          sale_date: soldDate,
          purchase_price: purchasePrice,
          profit,
          margin,
          roi,
          platform: "Stock", // Default platform when sold from stock
          shipping_cost: 0,
          platform_fee: 0,
        };

        const saleRes = await fetch("/api/sales/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerId: currentUserId, ...salePayload }),
        });

        const saleJson = await saleRes.json();
        if (!saleJson?.ok) {
          console.error("Failed to create sale record:", saleJson);
          // Don't fail the whole operation, just log it
        } else {
          console.log("Sale record created automatically");
        }
      } catch (saleErr) {
        console.error("Exception creating sale record:", saleErr);
        // Don't fail the whole operation
      }

      fetchProducts();
      setMessage({
        type: "success",
        text: `Product sold for ${formatCurrency(
          salePrice,
          currency
        )}! Profit: ${formatCurrency(profit, currency)}`,
      });
    } catch (e) {
      console.error("markAsSold exception", e);
      setMessage({ type: "error", text: "Mark sold failed" });
    }
  }

  function openSoldModal(product: Product) {
    setSoldConfirm({ show: true, product });
    // Pre-fill with suggested price (e.g., 20% markup)
    const suggestedPrice = product.purchase_price
      ? (product.purchase_price * 1.2).toFixed(2)
      : "";
    setSoldPrice(suggestedPrice);
    setSoldDate(new Date().toISOString().slice(0, 10));
  }

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
          <h1 className="text-3xl font-bold text-white">Stock Manager</h1>
          <p className="text-gray-400 mt-1">Manage your inventory and track products</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-medium transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>
      {/* Metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <div className="text-xs text-gray-400">Items in Stock</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.itemsCount}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <div className="text-xs text-gray-400">Total Investment</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(metrics.totalSpent, currency)}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div className="text-xs text-gray-400">Suppliers</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.suppliersCount}
          </div>
        </div>
      </div>
      {/* Search and Filters */}
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
                placeholder="Search by title or tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                className="w-32 pl-9 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-400 text-sm"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                className="w-32 pl-9 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-400 text-sm"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="" className="bg-[#0b0f13] text-white">
                All Status
              </option>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#0b0f13] text-white">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>{" "}
      {/* Products List */}
      <div className="space-y-4">
        {fetchError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="text-red-400" size={20} />
                </div>
                <div>
                  <div className="font-medium text-white">
                    Error loading products
                  </div>
                  <div className="text-sm text-red-300">{fetchError}</div>
                </div>
              </div>
              <button
                onClick={() => fetchProducts()}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-white text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <div className="text-gray-400">Loading products...</div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <Package className="text-gray-600 mb-4" size={64} />
            <div className="text-xl font-semibold text-gray-300 mb-2">
              No products found
            </div>
            <div className="text-gray-400 mb-6">
              Start by adding your first product to inventory
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition-colors"
            >
              <Plus size={20} />
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {paginatedProducts.map((p) => (
              <div
                key={p.id}
                className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
              >
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex-shrink-0 border border-white/10">
                    {p.images && p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="text-gray-600" size={40} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-white mb-1 truncate">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          {p.supplier && (
                            <div className="flex items-center gap-1">
                              <Users size={14} />
                              <span>{p.supplier}</span>
                            </div>
                          )}
                          {p.condition && (
                            <div className="flex items-center gap-1">
                              <Tag size={14} />
                              <span className="capitalize">{p.condition}</span>
                            </div>
                          )}
                          {p.date && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>
                                {new Date(p.date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(p.purchase_price, currency)}
                        </div>
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                        {p.description}
                      </p>
                    )}

                    {/* Tags and Actions */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                            p.status === "active"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : p.status === "reserved"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : p.status === "paused"
                              ? "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {p.status?.toUpperCase()}
                        </div>

                        {p.tags && p.tags.length > 0 && (
                          <div className="flex gap-1.5">
                            {p.tags.slice(0, 3).map((tag, i) => (
                              <div
                                key={i}
                                className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20"
                              >
                                {tag}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium border border-white/10 hover:border-white/20"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => openSoldModal(p)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg transition-colors text-sm font-medium text-emerald-300 border border-emerald-500/30"
                        >
                          <ShoppingBag size={14} />
                          Sold
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ show: true, product: p })
                          }
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-sm font-medium text-red-300 border border-red-500/30"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                <option value={5} className="bg-gray-900">5</option>
                <option value={10} className="bg-gray-900">10</option>
                <option value={25} className="bg-gray-900">25</option>
                <option value={50} className="bg-gray-900">50</option>
                <option value={100} className="bg-gray-900">100</option>
              </select>
              <span className="text-sm text-gray-400">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)} - {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
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
      {/* Modal */}
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#0a0e14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    {editing ? (
                      <Edit2 size={24} className="text-white" />
                    ) : (
                      <Plus size={24} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {editing ? "Edit Product" : "Add New Product"}
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Fill in the details below
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

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Title <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
                  placeholder="e.g. iPhone 14 Pro Max"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-500 min-h-[100px] resize-none"
                  placeholder="Detailed product description..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Supplier and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Users size={14} className="inline mr-1" />
                    Supplier
                  </label>
                  <input
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
                    placeholder="Supplier name"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign size={14} className="inline mr-1" />
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
                    placeholder="0.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Date, Condition, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar size={14} className="inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Condition
                  </label>
                  <select
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white cursor-pointer appearance-none"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      paddingRight: "40px",
                    }}
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                  >
                    {DEFAULT_CONDITIONS.map((c) => (
                      <option
                        key={c}
                        value={c}
                        className="bg-[#0b0f13] text-white capitalize"
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white cursor-pointer appearance-none"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      paddingRight: "40px",
                    }}
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option
                        key={s}
                        value={s}
                        className="bg-[#0b0f13] text-white capitalize"
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <ImageIcon size={14} className="inline mr-1" />
                  Product Images
                </label>
                <div className="relative">
                  <input
                    id="image-upload"
                    className="hidden"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageFiles(e.target.files)}
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-3 w-full px-4 py-8 rounded-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-blue-500/50 transition-colors cursor-pointer group"
                  >
                    <ImageIcon
                      size={24}
                      className="text-gray-400 group-hover:text-blue-400 transition-colors"
                    />
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-300 group-hover:text-blue-300 transition-colors">
                        Click to upload images
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB
                      </div>
                    </div>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {imagePreviews.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          className="w-24 h-24 object-cover rounded-xl border border-white/10"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <ImageIcon size={20} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag size={14} className="inline mr-1" />
                  Tags
                </label>
                <input
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
                  placeholder="vintage, rare, limited-edition (comma separated)"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white font-medium border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  {editing ? (
                    <>
                      <Edit2 size={18} /> Update Product
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
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
                  <h3 className="text-xl font-bold text-white">
                    Delete Product
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-300 mb-2">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  "{deleteConfirm.product?.title}"
                </span>
                ?
              </p>
              <p className="text-sm text-gray-400">
                This will permanently remove the product from your inventory.
              </p>
            </div>

            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteConfirm({ show: false, product: null })}
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
      {/* Mark as Sold Confirmation Modal */}
      {soldConfirm.show && soldConfirm.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0a0e14] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <ShoppingBag size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Record Sale</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Enter sale details
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Product Info */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-4">
                  {soldConfirm.product.images &&
                  soldConfirm.product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={soldConfirm.product.images[0]}
                      alt={soldConfirm.product.title}
                      className="w-16 h-16 rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <ImageIcon className="text-gray-600" size={24} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">
                      {soldConfirm.product.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Purchase Price:{" "}
                      <span className="text-emerald-400 font-medium">
                        {formatCurrency(
                          soldConfirm.product.purchase_price,
                          currency
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Sale Price Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <DollarSign size={14} className="inline mr-1" />
                  Sale Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white placeholder-gray-500 text-lg font-semibold"
                    placeholder="0.00"
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                  />
                </div>
                {soldPrice && soldConfirm.product.purchase_price && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Estimated Profit:</span>
                    <span
                      className={`font-semibold ${
                        parseFloat(soldPrice) >
                        soldConfirm.product.purchase_price
                          ? "text-emerald-400"
                          : parseFloat(soldPrice) <
                            soldConfirm.product.purchase_price
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      {formatCurrency(
                        parseFloat(soldPrice) -
                          soldConfirm.product.purchase_price,
                        currency
                      )}
                      {parseFloat(soldPrice) >
                        soldConfirm.product.purchase_price && (
                        <span className="text-xs ml-1">
                          (+
                          {Math.round(
                            ((parseFloat(soldPrice) -
                              soldConfirm.product.purchase_price) /
                              soldConfirm.product.purchase_price) *
                              100
                          )}
                          %)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Sale Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  Sale Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors text-white"
                  value={soldDate}
                  onChange={(e) => setSoldDate(e.target.value)}
                />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-xs text-emerald-300">
                  💡 This information will be stored for future analytics and
                  profit tracking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setSoldConfirm({ show: false, product: null });
                  setSoldPrice("");
                  setSoldDate(new Date().toISOString().slice(0, 10));
                }}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white font-medium border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkSold}
                disabled={!soldPrice || parseFloat(soldPrice) <= 0}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
