"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage({ type: "error", text: error.message });
    else {
      setMessage({ type: "success", text: "Signed in successfully." });
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-16 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-8 lg:pr-12">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium">
                Welcome Back
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-br from-white via-white to-gray-400 bg-clip-text text-transparent">
                Sign in to continue
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                Access your account to pick up where you left off. Track your progress and manage your tasks efficiently.
              </p>
            </div>
            {message && (
              <Alert type={message.type === "error" ? "error" : "success"}>{message.text}</Alert>
            )}
          </div>

          {/* Right: Form */}
          <div className="bg-card/10 backdrop-blur-sm border border-white/8 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email address</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                <Input type={show ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={show} onChange={() => setShow((s) => !s)} className="rounded" />
                Show password
              </label>

              <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold">
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <a href="/register" className="text-violet-400 hover:text-violet-300 font-medium">
                  Create one
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
