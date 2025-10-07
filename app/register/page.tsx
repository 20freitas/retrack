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
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted max-w-xl">
            Join Retrack to start logging and tracking tasks efficiently. Create an account with your email and a secure
            password — it only takes a minute.
          </p>
          {message && <Alert type={message.type === "error" ? "error" : "success"}>{message.text}</Alert>}
        </div>

        <div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="First name" value={firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)} required />
              <Input placeholder="Last name" value={lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)} required />
            </div>

            <Input type="email" placeholder="Email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />

            <div className="flex gap-4">
              <Input type={show ? "text" : "password"} placeholder="Password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
              <Input type={show ? "text" : "password"} placeholder="Confirm password" value={confirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} required />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 rounded bg-white/6 overflow-hidden">
                <div className={`h-full rounded transition-all duration-200 ${strength <= 1 ? "bg-red-500 w-1/4" : strength === 2 ? "bg-yellow-400 w-2/4" : strength === 3 ? "bg-lime-400 w-3/4" : "bg-green-400 w-full"}`} style={{ minWidth: "6%" }} />
              </div>
              <label className="text-sm opacity-80 flex items-center gap-2">
                <input type="checkbox" checked={show} onChange={() => setShow((s) => !s)} /> Show
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating…" : "Create account"}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
