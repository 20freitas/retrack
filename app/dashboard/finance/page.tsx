"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { supabase } from "../../../lib/supabaseClient";

type Sale = {
  id?: string;
  sale_price: number;
  sale_date: string;
  purchase_price?: number;
  shipping_cost?: number;
  platform_fee?: number;
  profit?: number;
  margin?: number;
};

type Expense = {
  id: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
};

function formatCurrency(n = 0) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function formatDateISO(d = new Date()) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

function useCurrentUserId() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setId(data.session?.user?.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setId(session?.user?.id ?? null);
    });
    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);
  return id;
}

function DonutChart({
  items,
  size = 180,
  stroke = 22,
  legendPosition = "right",
}: {
  items: { label: string; value: number; color?: string }[];
  size?: number;
  stroke?: number;
  legendPosition?: "right" | "bottom";
}) {
  const total = items.reduce((s, i) => s + Math.max(0, i.value), 0);
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;

  // build segments with cumulative offset - only include items with value > 0
  let cumulative = 0;
  const segments = items
    .filter(it => it.value > 0)
    .map((it, idx) => {
      const value = Math.max(0, it.value);
      const portion = total === 0 ? 0 : value / total;
      const dash = portion * circ;
      const offset = cumulative;
      cumulative += dash;
      return { dash, offset, color: it.color ?? ["#06b6d4", "#7c3aed", "#10b981", "#f97316", "#ef4444"][idx % 5], label: it.label, value };
    });

  const chart = (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {/* background ring */}
          <circle r={radius} fill="transparent" stroke="#0b1220" strokeWidth={stroke} />
          {total > 0 && segments.map((s, i) => (
            <circle
              key={`${s.label}-${i}`}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${circ - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              transform="rotate(-90)"
            />
          ))}
          {/* inner background */}
          <circle r={radius - stroke / 1.6} fill="#071018" stroke="transparent" />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-sm text-gray-400">Total</div>
        <div className="text-lg font-semibold text-white">{formatCurrency(total)}</div>
      </div>
    </div>
  );

  const legendRight = (
    <div className="space-y-2 ml-4">
      {items.map((it, idx) => (
        <div key={`${it.label}-${idx}`} className="flex items-center gap-3 w-64">
          <div style={{ width: 12, height: 12, background: it.color ?? "#888" }} className="rounded-sm flex-shrink-0" />
          <div className="text-sm text-gray-300 truncate">{it.label}</div>
          <div className="ml-auto font-semibold">{it.value ? `${((it.value / (total || 1)) * 100).toFixed(1)}%` : "0%"}</div>
          <div className="w-28 text-right text-sm text-gray-400">{formatCurrency(it.value)}</div>
        </div>
      ))}
    </div>
  );

  const legendBottom = (
    <div className="mt-4 w-full flex flex-col items-center gap-2">
      {items.map((it, idx) => (
        <div key={`${it.label}-${idx}`} className="flex items-center gap-3 w-full max-w-md px-2">
          <div style={{ width: 12, height: 12, background: it.color ?? "#888" }} className="rounded-sm flex-shrink-0" />
          <div className="text-sm text-gray-300 truncate">{it.label}</div>
          <div className="ml-auto font-semibold">{it.value ? `${((it.value / (total || 1)) * 100).toFixed(1)}%` : "0%"}</div>
          <div className="w-28 text-right text-sm text-gray-400">{formatCurrency(it.value)}</div>
        </div>
      ))}
    </div>
  );

  if (legendPosition === "bottom") {
    return (
      <div className="flex flex-col items-center">
        {chart}
        {legendBottom}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      {chart}
      {legendRight}
    </div>
  );
}

function AddVariableModal({ 
  open, 
  onClose, 
  onAdd,
}: { 
  open: boolean; 
  onClose: () => void; 
  onAdd: (v: { label: string; value: number; color?: string }) => void;
}) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (!open) {
      setLabel("");
      setValue("");
      setColor("");
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-md bg-[#071018] border border-white/7 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add variable</h3>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>
        <div className="space-y-3">
          <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input placeholder="Amount (0.00)" type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Color (optional)</label>
            <div className="grid grid-cols-8 gap-2">
              {[
                '#8B5CF6', '#A78BFA', '#C084FC', '#E879F9',
                '#F472B6', '#FB923C', '#FBBF24', '#34D399',
                '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
                '#3B82F6', '#6366F1', '#EC4899', '#F87171'
              ].map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-lg transition-all ${color === presetColor ? 'ring-2 ring-white ring-offset-2 ring-offset-[#071018] scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => { const v = parseFloat(value || "0") || 0; if (!label || v <= 0) return; onAdd({ label, value: v, color: color || undefined }); onClose(); }}>
            Add
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

function ManageVariablesModal({
  open,
  onClose,
  variables,
  onEdit,
  onDelete,
  title,
  fixedCount = 0,
}: {
  open: boolean;
  onClose: () => void;
  variables: { label: string; value: number; color?: string }[];
  onEdit: (index: number, updated: { label: string; value: number; color?: string }) => void;
  onDelete: (index: number) => void;
  title: string;
  fixedCount?: number;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editColor, setEditColor] = useState("");

  const startEdit = (index: number, item: { label: string; value: number; color?: string }) => {
    setEditingIndex(index);
    setEditLabel(item.label);
    setEditValue(item.value.toString());
    setEditColor(item.color || "");
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const v = parseFloat(editValue || "0") || 0;
    if (!editLabel || v <= 0) return;
    onEdit(editingIndex, { label: editLabel, value: v, color: editColor || undefined });
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditLabel("");
    setEditValue("");
    setEditColor("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-lg bg-[#071018] border border-white/7 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>
        
        {variables.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Nenhuma variável adicionada</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-auto">
            {variables.map((v, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                {editingIndex === idx ? (
                  <div className="space-y-3">
                    <Input placeholder="Label" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
                    <Input placeholder="Amount" type="number" step="0.01" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Color (optional)</label>
                      <div className="grid grid-cols-8 gap-2">
                        {[
                          '#8B5CF6', '#A78BFA', '#C084FC', '#E879F9',
                          '#F472B6', '#FB923C', '#FBBF24', '#34D399',
                          '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
                          '#3B82F6', '#6366F1', '#EC4899', '#F87171'
                        ].map((presetColor) => (
                          <button
                            key={presetColor}
                            type="button"
                            onClick={() => setEditColor(presetColor)}
                            className={`w-8 h-8 rounded-lg transition-all ${editColor === presetColor ? 'ring-2 ring-white ring-offset-2 ring-offset-[#071018] scale-110' : 'hover:scale-105'}`}
                            style={{ backgroundColor: presetColor }}
                            title={presetColor}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={saveEdit}>Save</Button>
                      <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div style={{ width: 12, height: 12, background: v.color || "#888" }} className="rounded-sm flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {v.label}
                          {idx < fixedCount && <span className="ml-2 text-xs text-gray-500">(fixed)</span>}
                        </div>
                        <div className="text-xs text-gray-400">{formatCurrency(v.value)}</div>
                      </div>
                    </div>
                    {idx >= fixedCount && (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(idx, v)} className="text-white/60 hover:text-white/90 p-2" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => onDelete(idx)} className="text-white/60 hover:text-red-400 p-2" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default function FinancePage() {
  const userId = useCurrentUserId();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // expense form
  const [cat, setCat] = useState("Packaging");
  const [amt, setAmt] = useState("");
  const [expDate, setExpDate] = useState(formatDateISO(new Date()));
  const [note, setNote] = useState("");

  // filter for exports and view
  const [filterRange, setFilterRange] = useState<"day" | "week" | "month" | "all">("month");

  // custom variables for charts (persisted)
  const [investVars, setInvestVars] = useState<{ label: string; value: number; color?: string }[]>([]);
  const [salesVars, setSalesVars] = useState<{ label: string; value: number; color?: string }[]>([]);
  const [addModalOpenFor, setAddModalOpenFor] = useState<null | "invest" | "sales">(null);
  const [manageModalOpenFor, setManageModalOpenFor] = useState<null | "invest" | "sales">(null);

  useEffect(() => {
    // load persisted expenses from localStorage
    try {
      const raw = localStorage.getItem("retrack_expenses") || "[]";
      const parsed = JSON.parse(raw);
      setExpenses(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setExpenses([]);
    }
  }, []);

  useEffect(() => {
    try {
      const rawI = localStorage.getItem("retrack_invest_vars") || "[]";
      const rawS = localStorage.getItem("retrack_sales_vars") || "[]";
      setInvestVars(JSON.parse(rawI) || []);
      setSalesVars(JSON.parse(rawS) || []);
    } catch (e) {
      setInvestVars([]);
      setSalesVars([]);
    }
  }, []);

  // Save investVars to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("retrack_invest_vars", JSON.stringify(investVars));
    } catch (e) {
      console.error("Failed to save invest vars:", e);
    }
  }, [investVars]);

  // Save salesVars to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("retrack_sales_vars", JSON.stringify(salesVars));
    } catch (e) {
      console.error("Failed to save sales vars:", e);
    }
  }, [salesVars]);

  useEffect(() => {
    async function fetchSales() {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/sales/list?userId=${encodeURIComponent(userId)}`);
        const json = await res.json().catch(() => ({}));
        if (json?.ok && Array.isArray(json.data)) {
          setSales(json.data as Sale[]);
        } else {
          setSales([]);
        }
      } catch (e) {
        setSales([]);
      }
      setLoading(false);
    }
    fetchSales();
  }, [userId]);

  useEffect(() => {
    // persist expenses
    try {
      localStorage.setItem("retrack_expenses", JSON.stringify(expenses));
    } catch (e) {}
  }, [expenses]);

  useEffect(() => {
    try { localStorage.setItem("retrack_invest_vars", JSON.stringify(investVars)); } catch (e) {}
  }, [investVars]);
  useEffect(() => {
    try { localStorage.setItem("retrack_sales_vars", JSON.stringify(salesVars)); } catch (e) {}
  }, [salesVars]);

  const addExpense = () => {
    const amount = parseFloat(amt || "0") || 0;
    if (!cat || amount <= 0) return;
    setExpenses((s) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, category: cat, amount, date: expDate, note },
      ...s,
    ]);
    setAmt("");
    setNote("");
  };

  const removeExpense = (id: string) => setExpenses((s) => s.filter((e) => e.id !== id));

  function filterByRange<T extends { date?: string; sale_date?: string }>(arr: T[]) {
    if (filterRange === "all") return arr;
    const now = new Date();
    const start = new Date();
    if (filterRange === "day") start.setDate(now.getDate() - 1);
    else if (filterRange === "week") start.setDate(now.getDate() - 7);
    else if (filterRange === "month") start.setMonth(now.getMonth() - 1);
    return arr.filter((r) => {
      const d = r.sale_date ?? r.date ?? null;
      if (!d) return false;
      return new Date(d) >= start;
    });
  }

  const filteredSales = useMemo(() => filterByRange(sales) as Sale[], [sales, filterRange]);
  const filteredExpenses = useMemo(() => filterByRange(expenses) as Expense[], [expenses, filterRange]);

  const metrics = useMemo(() => {
    const totalSales = filteredSales.reduce((s, x) => s + (x.sale_price || 0), 0);
    const totalInvested = filteredSales.reduce((s, x) => s + (x.purchase_price || 0), 0);
    const totalProfit = filteredSales.reduce((s, x) => s + (x.profit || 0), 0);
    const itemsSold = filteredSales.length;
    const avgMargin = itemsSold ? filteredSales.reduce((s, x) => s + (x.margin || 0), 0) / itemsSold : 0;
    const expensesTotal = filteredExpenses.reduce((s, x) => s + (x.amount || 0), 0);
    const netProfit = totalProfit - expensesTotal;
    return { totalSales, totalInvested, totalProfit, itemsSold, avgMargin, expensesTotal, netProfit };
  }, [filteredSales, filteredExpenses]);

  const donutItems = useMemo(() => {
    // for default invest chart show invested + expense categories and custom investVars
    const defaultInvest = [
      { label: "Invested", value: metrics.totalInvested, color: "#7c3aed" },
    ];
    const expenseCats = ["Packaging", "Transport", "External Fees"];
    const catTotals = expenseCats.map((c) => ({ label: c, value: filteredExpenses.filter((e) => e.category === c).reduce((s, x) => s + x.amount, 0), color: undefined }));

    return {
      invest: [...defaultInvest, ...catTotals, ...investVars],
      sales: [
        { label: "Sales", value: metrics.totalSales, color: "#06b6d4" },
        { label: "Profit", value: metrics.totalProfit, color: "#10b981" },
        ...salesVars,
      ],
    };
  }, [metrics, filteredExpenses]);

  function downloadCSV(filename: string, text: string) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportReportCSV(asExcel = false) {
    // Build a human readable report: sales then expenses
    const lines: string[] = [];
    lines.push("Financial report");
    lines.push(`Range: ${filterRange}`);
    lines.push("");
    lines.push("Sales:");
    lines.push(["id", "date", "sale_price", "purchase_price", "shipping_cost", "platform_fee", "profit", "margin"].join(","));
    for (const s of filteredSales) {
      lines.push([
        s.id ?? "",
        s.sale_date ?? "",
        s.sale_price ?? 0,
        s.purchase_price ?? 0,
        s.shipping_cost ?? 0,
        s.platform_fee ?? 0,
        s.profit ?? 0,
        s.margin ?? 0,
      ].join(","));
    }
    lines.push("");
    lines.push("Expenses:");
    lines.push(["id", "date", "category", "amount", "note"].join(","));
    for (const e of filteredExpenses) {
      lines.push([e.id, e.date, e.category, e.amount, (e.note || "").replace(/\n/g, " ")].join(","));
    }
    lines.push("");
    lines.push(`Total Sales,${metrics.totalSales}`);
    lines.push(`Total Invested,${metrics.totalInvested}`);
    lines.push(`Total Profit,${metrics.totalProfit}`);
    lines.push(`Expenses Total,${metrics.expensesTotal}`);
    lines.push(`Net Profit,${metrics.netProfit}`);

    const csv = lines.join("\n");
    const filename = asExcel ? `retrack-financial-${filterRange}.xls` : `retrack-financial-${filterRange}.csv`;
    downloadCSV(filename, csv);
  }

  function exportReportPDF() {
    // Create a printable window and trigger print. User can save as PDF.
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    const html = `
      <html>
      <head>
        <title>Financial report</title>
        <style>body{background:#071018;color:#fff;font-family:system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial; padding:20px} table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ccc}</style>
      </head>
      <body>
        <h1>Financial report — ${filterRange}</h1>
        <h2>Metrics</h2>
        <ul>
          <li>Total Sales: ${formatCurrency(metrics.totalSales)}</li>
          <li>Total Invested: ${formatCurrency(metrics.totalInvested)}</li>
          <li>Total Profit: ${formatCurrency(metrics.totalProfit)}</li>
          <li>Expenses Total: ${formatCurrency(metrics.expensesTotal)}</li>
          <li>Net Profit: ${formatCurrency(metrics.netProfit)}</li>
        </ul>
        <h2>Sales</h2>
        <table><thead><tr><th>date</th><th>sale</th><th>purchase</th><th>profit</th></tr></thead><tbody>
        ${filteredSales.map((s) => `<tr><td>${s.sale_date}</td><td>${s.sale_price}</td><td>${s.purchase_price ?? 0}</td><td>${s.profit ?? 0}</td></tr>`).join("")}
        </tbody></table>
        <h2>Expenses</h2>
        <table><thead><tr><th>date</th><th>category</th><th>amount</th><th>note</th></tr></thead><tbody>
        ${filteredExpenses.map((e) => `<tr><td>${e.date}</td><td>${e.category}</td><td>${e.amount}</td><td>${(e.note||"")}</td></tr>`).join("")}
        </tbody></table>
      </body>
      </html>
    `;
    w.document.open();
    w.document.write(html);
    w.document.close();
    // wait a bit for rendering then print
    setTimeout(() => {
      w.print();
    }, 500);
  }
  const handleAddVar = (v: { label: string; value: number; color?: string }) => {
    if (addModalOpenFor === "invest") {
      setInvestVars((s) => [v, ...s]);
    } else if (addModalOpenFor === "sales") {
      setSalesVars((s) => [v, ...s]);
    }
  };

  // For invest: only first is fixed (Invested), rest can be edited/deleted
  // Index 0: Invested (fixed)
  // Index 1-3: Packaging, Transport, External Fees (from expenses, stored in expenses state)
  // Index 4+: Custom variables (stored in investVars)
  const handleEditInvestVar = (index: number, updated: { label: string; value: number; color?: string }) => {
    if (index === 0) return; // Only "Invested" is fixed
    if (index >= 4) {
      // Custom variable
      const customIndex = index - 4;
      setInvestVars((s) => s.map((item, i) => i === customIndex ? updated : item));
    }
    // Indices 1-3 (Packaging, Transport, External Fees) are computed from expenses and can't be edited here
  };

  const handleDeleteInvestVar = (index: number) => {
    if (index === 0) return; // Only "Invested" is fixed
    if (index >= 4) {
      // Custom variable
      const customIndex = index - 4;
      setInvestVars((s) => s.filter((_, i) => i !== customIndex));
    }
    // Indices 1-3 (Packaging, Transport, External Fees) can't be deleted (they're computed from expenses)
  };

  // For sales: first 2 are fixed (Sales and Profit - both computed)
  // Index 0: Sales (fixed)
  // Index 1: Profit (fixed - computed automatically)
  // Index 2+: Custom variables (stored in salesVars)
  const handleEditSalesVar = (index: number, updated: { label: string; value: number; color?: string }) => {
    if (index < 2) return; // "Sales" and "Profit" are both fixed
    if (index >= 2) {
      // Custom variable
      const customIndex = index - 2;
      setSalesVars((s) => s.map((item, i) => i === customIndex ? updated : item));
    }
  };

  const handleDeleteSalesVar = (index: number) => {
    if (index < 2) return; // "Sales" and "Profit" are both fixed
    if (index >= 2) {
      // Custom variable
      const customIndex = index - 2;
      setSalesVars((s) => s.filter((_, i) => i !== customIndex));
    }
  };
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Finance</h1>
          <p className="text-gray-400 mt-1">Financial summary and reports</p>
        </div>
        <select value={filterRange} onChange={(e) => setFilterRange(e.target.value as any)} className="rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm text-white font-medium hover:bg-white/15 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500">
          <option value="day" className="bg-gray-900 text-white">Last day</option>
          <option value="week" className="bg-gray-900 text-white">Last week</option>
          <option value="month" className="bg-gray-900 text-white">Last month</option>
          <option value="all" className="bg-gray-900 text-white">All time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Total Invested</div>
          <div className="text-2xl font-bold text-white mt-2">{formatCurrency(metrics.totalInvested)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Total Sales</div>
          <div className="text-2xl font-bold text-white mt-2">{formatCurrency(metrics.totalSales)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Total Profit</div>
          <div className="text-2xl font-bold text-white mt-2">{formatCurrency(metrics.totalProfit)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Items Sold</div>
          <div className="text-2xl font-bold text-white mt-2">{metrics.itemsSold}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Invested chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Invested</h3>
            <div className="flex gap-2">
              <button onClick={() => setManageModalOpenFor("invest")} title="Manage variables" className="text-white/80 bg-white/4 hover:bg-white/6 rounded-full w-7 h-7 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button onClick={() => setAddModalOpenFor("invest")} title="Add variable" className="text-white/80 bg-white/4 hover:bg-white/6 rounded-full w-7 h-7 flex items-center justify-center">+</button>
            </div>
          </div>
          
          {/* Larger donut with legend below */}
          <div className="flex justify-center">
            <DonutChart 
              items={donutItems.invest} 
              size={240} 
              stroke={26} 
              legendPosition="bottom"
            />
          </div>
        </div>

        {/* Right: Sales chart + expenses */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sales</h3>
            <div className="flex gap-2">
              <button onClick={() => setManageModalOpenFor("sales")} title="Manage variables" className="text-white/80 bg-white/4 hover:bg-white/6 rounded-full w-7 h-7 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button onClick={() => setAddModalOpenFor("sales")} title="Add variable" className="text-white/80 bg-white/4 hover:bg-white/6 rounded-full w-7 h-7 flex items-center justify-center">+</button>
            </div>
          </div>

          {/* Larger donut with legend below */}
          <div className="flex justify-center">
            <DonutChart 
              items={donutItems.sales} 
              size={240} 
              stroke={26} 
              legendPosition="bottom"
            />
          </div>
        </div>
      </div>

      {/* Export section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Reports and Exports</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" onClick={() => exportReportCSV(false)}>Export CSV</Button>
          <Button variant="ghost" onClick={() => exportReportCSV(true)}>Export Excel</Button>
          <Button variant="primary" onClick={exportReportPDF}>Export PDF</Button>
        </div>
      </div>

      {/* modal for adding variables */}
      <AddVariableModal 
        open={addModalOpenFor !== null} 
        onClose={() => setAddModalOpenFor(null)} 
        onAdd={handleAddVar}
      />

      {/* modal for managing variables */}
      <ManageVariablesModal
        open={manageModalOpenFor === "invest"}
        onClose={() => setManageModalOpenFor(null)}
        variables={donutItems.invest}
        onEdit={handleEditInvestVar}
        onDelete={handleDeleteInvestVar}
        title="Manage Invested Variables"
        fixedCount={1}
      />
      
      <ManageVariablesModal
        open={manageModalOpenFor === "sales"}
        onClose={() => setManageModalOpenFor(null)}
        variables={donutItems.sales}
        onEdit={handleEditSalesVar}
        onDelete={handleDeleteSalesVar}
        title="Manage Sales Variables"
        fixedCount={2}
      />
    </div>
  );
}

