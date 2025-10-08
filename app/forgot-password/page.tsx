"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Input } from "../../components/ui/input";
import { Alert } from "../../components/ui/alert";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Password reset email sent! Check your inbox.",
        });
        setEmail("");
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to send reset email.",
      });
    } finally {
      setLoading(false);
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
                Account Recovery
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                Reset your password
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                Enter your email address and we'll send you a link to reset your
                password and regain access to your account.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Check your email
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    After submitting, check your email for a password reset
                    link. The link expires in 1 hour for security.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Reset Password
              </h1>
              <p className="text-gray-400">
                We'll send you a reset link via email
              </p>
            </div>

            {message && (
              <div className="mb-6">
                <Alert type={message.type === "error" ? "error" : "success"}>
                  {message.text}
                </Alert>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-10">
              <form onSubmit={handleResetPassword} className="space-y-6">
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
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the email associated with your account
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
                >
                  {loading ? "Sending reset link..." : "Send reset link"}
                </button>

                <div className="pt-4">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to sign in
                  </Link>
                </div>
              </form>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-white hover:underline font-medium transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
