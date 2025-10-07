"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard/stock", label: "Stock" },
    { href: "/dashboard/sales", label: "Sales" },
    { href: "/dashboard/finance", label: "Finance" },
    { href: "/dashboard/analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen px-6 py-8 pt-24 text-white">
      {/* Intentionally no internal dashboard tabs here; use the Navbar tabs instead */}

      <div className="w-full">{children}</div>
    </div>
  );
}
