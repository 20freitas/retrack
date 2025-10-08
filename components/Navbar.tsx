"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { User } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    const onUserUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      setUser(custom.detail ?? null);
    };

    window.addEventListener("userUpdated", onUserUpdated);

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
      window.removeEventListener("userUpdated", onUserUpdated);
    };
  }, []);

  return (
    <nav className="sticky top-4 z-50 pointer-events-auto">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative flex items-center justify-between rounded-xl bg-[#0b0f13]/85 border border-white/9 py-4 px-6 shadow-md">
          <Link href="/" className="flex items-center">
            <Image
              src="/retrack (3).png"
              alt="retrack"
              width={96}
              height={96}
              className="rounded-md"
            />
            <span className="sr-only">retrack</span>
          </Link>

          {/* Center section: Dashboard tabs when in dashboard, Dashboard button when logged in and outside dashboard */}
          <div className="hidden md:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
            {pathname?.startsWith("/dashboard") ? (
              // Show dashboard tabs when inside dashboard
              <>
                {[
                  { href: "/dashboard/stock", label: "Stock" },
                  { href: "/dashboard/sales", label: "Sales" },
                  { href: "/dashboard/finance", label: "Finance" },
                  { href: "/dashboard/settings", label: "Settings" },
                ].map((t) => {
                  const active =
                    pathname === t.href || pathname?.startsWith(t.href + "/");
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      className={`px-3 py-1 rounded-full text-sm transition-colors duration-150 ${
                        active
                          ? "bg-white/8 text-white font-semibold"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </Link>
                  );
                })}
              </>
            ) : user ? (
              // Show Dashboard button larger and centered when logged in and outside dashboard
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full text-base text-white/70 hover:text-white transition-colors duration-150"
              >
                Dashboard
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              // Not logged in: show Register and Login
              <>
                <Link
                  href="/register"
                  className="text-base opacity-95 hover:opacity-100"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="text-base opacity-95 hover:opacity-100"
                >
                  Login
                </Link>
              </>
            ) : (
              // Logged in: only show profile avatar (Dashboard button is in center)
              <Link href="/profile" className="block">
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/15 transition-colors">
                    <User size={18} />
                  </div>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
