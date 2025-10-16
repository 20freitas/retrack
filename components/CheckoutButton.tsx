"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface CheckoutButtonProps {
  priceId: string;
  planName: string;
  refCode?: string | null;
  className?: string;
  children: React.ReactNode;
}

export default function CheckoutButton({
  priceId,
  planName,
  refCode,
  className,
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get user ID if authenticated
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, [supabase]);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_id: priceId,
          ref_code: refCode || undefined,
          user_id: userId || undefined, // Pass user_id if available
          success_url: `${window.location.origin}/dashboard?session_status=success&plan=${planName}`,
          cancel_url: `${window.location.origin}${refCode ? `?ref=${refCode}` : ''}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}
