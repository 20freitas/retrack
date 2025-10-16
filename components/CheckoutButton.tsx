"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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
