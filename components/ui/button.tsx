"use client";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50";
  const vclass =
    variant === "ghost"
      ? "bg-transparent text-foreground/90 border border-white/6 hover:bg-white/2"
      : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md hover:opacity-95";
  return (
    <button {...props} className={`${base} ${vclass} ${className}`.trim()}>
      {children}
    </button>
  );
}
