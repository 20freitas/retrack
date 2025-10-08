"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { useRouter } from "next/navigation";

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..4
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (password !== confirm) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setLoading(false);
      setMessage({ type: "error", text: error.message });
      return;
    }

    setLoading(false);
    if (data?.session) {
      setMessage({ type: "success", text: "Account created and signed in." });
      router.push("/");
      return;
    }

    setMessage({
      type: "success",
      text: "Account created. Email confirmation is required by your project settings; check your email.",
    });
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-center">
          {/* Left: Info Section */}
          <div className="hidden lg:block space-y-6 pr-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Join Retrack
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                Create your account and start tracking your progress
                efficiently. Join thousands of users managing their tasks
                seamlessly.
              </p>
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Track Everything</h3>
                  <p className="text-sm text-gray-400">
                    Manage all your tasks in one place
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Stay Organized</h3>
                  <p className="text-sm text-gray-400">
                    Never miss a deadline again
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Boost Productivity</h3>
                  <p className="text-sm text-gray-400">
                    Achieve more with less effort
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
                Create account
              </h1>
              <p className="text-gray-400">Get started with Retrack today</p>
            </div>

            {message && (
              <div className="mb-6">
                <Alert type={message.type === "error" ? "error" : "success"}>
                  {message.text}
                </Alert>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-10">
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      First name
                    </label>
                    <Input
                      placeholder="John"
                      value={firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFirstName(e.target.value)
                      }
                      required
                      className="h-12 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Last name
                    </label>
                    <Input
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLastName(e.target.value)
                      }
                      required
                      className="h-12 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Password */}
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Confirm password
                  </label>
                  <Input
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirm(e.target.value)
                    }
                    required
                    className="h-12 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Password strength</span>
                      <span
                        className={`font-medium ${
                          strength <= 1
                            ? "text-red-400"
                            : strength === 2
                            ? "text-yellow-400"
                            : strength === 3
                            ? "text-lime-400"
                            : "text-green-400"
                        }`}
                      >
                        {strength <= 1
                          ? "Weak"
                          : strength === 2
                          ? "Fair"
                          : strength === 3
                          ? "Good"
                          : "Strong"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          strength <= 1
                            ? "bg-red-500 w-1/4"
                            : strength === 2
                            ? "bg-yellow-400 w-2/4"
                            : strength === 3
                            ? "bg-lime-400 w-3/4"
                            : "bg-green-500 w-full"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Show Password */}
                <label className="flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={show}
                    onChange={() => setShow((s) => !s)}
                    className="w-4 h-4 rounded border-gray-600 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0"
                  />
                  <span>Show passwords</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>

                {/* Sign In Link */}
                <p className="text-center text-sm text-gray-400 pt-2">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-white hover:underline font-medium transition-colors"
                  >
                    Sign in
                  </a>
                </p>
              </form>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By creating an account, you agree to our{" "}
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
