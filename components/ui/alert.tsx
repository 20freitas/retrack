"use client";
import React from "react";

export function Alert({ type = "info", children }: { type?: "info" | "success" | "error"; children: React.ReactNode }) {
  const base = "p-3 rounded";
  const cls =
    type === "error" ? `${base} bg-red-600/20 text-red-300` : type === "success" ? `${base} bg-green-600/20 text-green-200` : `${base} bg-white/5 text-foreground`;
  return <div className={cls}>{children}</div>;
}
