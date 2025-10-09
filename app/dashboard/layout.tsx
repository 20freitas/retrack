"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserFooter from "@/components/UserFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard/stock", label: "Stock" },
    { href: "/dashboard/sales", label: "Sales" },
    { href: "/dashboard/finance", label: "Finance" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-6 py-8 pt-24 text-white">
        {/* Intentionally no internal dashboard tabs here; use the Navbar tabs instead */}
        <div className="w-full">{children}</div>
      </div>

      <UserFooter />
    </div>
  );
}
