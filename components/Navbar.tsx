"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { User } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

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
  <div className="flex items-center justify-between rounded-xl bg-[#0b0f13]/85 border border-white/9 py-4 px-6 shadow-md">
          <Link href="/" className="flex items-center">
            <Image src="/retrack (3).png" alt="retrack" width={96} height={96} className="rounded-md" />
            <span className="sr-only">retrack</span>
          </Link>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link href="/register" className="text-base opacity-95 hover:opacity-100">
                  Register
                </Link>
                <Link href="/login" className="text-base opacity-95 hover:opacity-100">
                  Login
                </Link>
              </>
            ) : (
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white">
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
