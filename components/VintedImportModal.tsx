"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Toast from "./Toast";
import { X } from "lucide-react";

export default function VintedImportModal({
  open,
  onClose,
  onImported,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  onImported?: () => void;
  userId: string | null;
}) {
  const [url, setUrl] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  if (!open) return null;

  const handleImport = async () => {
    setError(null);
    
    if (!url) {
      setError("Please enter the Vinted listing URL.");
      return;
    }

    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      setError("Please enter the purchase price.");
      return;
    }

    if (!userId) {
      setError("User not logged in.");
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Scrape Vinted listing
      const importRes = await fetch("/api/import/vinted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const importJson = await importRes.json();
      
      if (!importJson?.ok) {
        throw new Error(importJson?.error || "Failed to import from Vinted");
      }

      const parsed = importJson.data;

      // Get only the first image
      const firstImage = parsed.images && parsed.images.length > 0 
        ? parsed.images[0] 
        : (parsed.image || "");

      // Step 2: Create product with scraped data
      const productPayload = {
        title: parsed.title || "Imported from Vinted",
        description: parsed.description || parsed.size || "",
        purchase_price: parseFloat(purchasePrice),
        images: firstImage ? [firstImage] : [],
        date: parsed.date || new Date().toISOString().slice(0, 10),
        condition: parsed.condition || "used",
        status: "active",
        supplier: supplier || undefined, // Optional supplier
        tags: ["vinted", "imported"],
        ownerId: userId, // Associate with current user
      };

      const createRes = await fetch("/api/products/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const createJson = await createRes.json();

      if (!createJson?.ok) {
        throw new Error(createJson?.error || "Failed to create product");
      }

      // Success!
      setUrl("");
      setPurchasePrice("");
      setSupplier("");
      setToast({ message: "Produto importado com sucesso!", type: "success" });
      
      // Call the callback to refresh
      onImported?.();
      
      // Close modal after a short delay to show the toast
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (e: any) {
      console.error("Import error:", e);
      setError(e.message || "Error importing from Vinted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-md bg-[#071018] border border-white/7 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#09B1BA]/20 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Import from Vinted</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Vinted Listing URL
            </label>
            <Input
              placeholder="https://www.vinted.pt/items/..."
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Purchase Price
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={purchasePrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPurchasePrice(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Supplier (Optional)
            </label>
            <Input
              placeholder="e.g. Vinted User, Store Name..."
              value={supplier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupplier(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-white/5 rounded-lg p-3">
            <p className="mb-1">ℹ️ The product will be imported with:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Title and first image from Vinted</li>
              <li>Size as description</li>
              <li>Status: Active</li>
              <li>Condition from listing</li>
              <li>Purchase price you enter</li>
              <li>Optional supplier name</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleImport}
            disabled={loading || !url || !purchasePrice}
            className="flex-1"
          >
            {loading ? "Importing..." : "Import Product"}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
