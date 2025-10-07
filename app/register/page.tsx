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
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (password !== confirm) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setLoading(true);

    // create user without email confirmation. We request auto login by signing in after signup.
  const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setLoading(false);
      setMessage({ type: "error", text: error.message });
      return;
    }

    // If signUp returned a session, the user is already logged in. If not,
    // many Supabase projects require email confirmation — in that case we
    // should NOT try to sign in and instead instruct the user to confirm
    // their email or disable confirmations in project settings.
    setLoading(false);
    if (data?.session) {
      setMessage({ type: "success", text: "Account created and signed in." });
      router.push("/");
      return;
    }

    // No session: likely email confirmation is required. Show an instructive message.
    setMessage({ type: "success", text: "Account created. Email confirmation is required by your project settings; check your email." });
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-16 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-8 lg:pr-12">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                Get Started
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-br from-white via-white to-gray-400 bg-clip-text text-transparent">
                Create your account
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                Join Retrack to start logging and tracking tasks efficiently. Set up your account with a secure password — it only takes a minute.
              </p>
            </div>
            {message && (
              <Alert type={message.type === "error" ? "error" : "success"}>{message.text}</Alert>
            )}
          </div>

          {/* Right: Form */}
          <div className="bg-card/10 backdrop-blur-sm border border-white/8 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">First name</label>
                  <Input placeholder="John" value={firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Last name</label>
                  <Input placeholder="Doe" value={lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email address</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                  <Input type={show ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Confirm password</label>
                  <Input type={show ? "text" : "password"} placeholder="••••••••" value={confirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Password strength</span>
                  <span className="font-medium">
                    {password.length === 0 ? "" : strength <= 1 ? "Weak" : strength === 2 ? "Fair" : strength === 3 ? "Good" : "Strong"}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      password.length === 0 ? "w-0" : strength <= 1 ? "bg-red-500 w-1/4" : strength === 2 ? "bg-yellow-400 w-2/4" : strength === 3 ? "bg-lime-400 w-3/4" : "bg-green-400 w-full"
                    }`}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={show} onChange={() => setShow((s) => !s)} className="rounded" />
                Show passwords
              </label>

              <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold">
                {loading ? "Creating account…" : "Create account"}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
