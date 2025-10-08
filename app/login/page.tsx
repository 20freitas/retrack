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
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setMessage({ type: "error", text: error.message });
    else {
      setMessage({ type: "success", text: "Signed in successfully." });
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-center">
          {/* Left: Info Section */}
          <div className="hidden lg:block space-y-6 pr-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium">
                Welcome Back
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                Sign in to continue
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                Access your account to pick up where you left off. Track your
                progress and manage your tasks efficiently.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back
              </h1>
              <p className="text-gray-400">Sign in to your account</p>
            </div>

            {message && (
              <div className="mb-6">
                <Alert type={message.type === "error" ? "error" : "success"}>
                  {message.text}
                </Alert>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-10">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email address
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                    className="h-12 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Input
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    required
                    className="h-12 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={show}
                      onChange={() => setShow((s) => !s)}
                      className="w-4 h-4 rounded border-gray-600 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0"
                    />
                    Show password
                  </label>
                  <a
                    href="forgot-password"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                <p className="text-center text-sm text-gray-400 pt-2">
                  Don't have an account?{" "}
                  <a
                    href="/register"
                    className="text-white hover:underline font-medium transition-colors"
                  >
                    Create one
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
