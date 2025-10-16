"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'canceled'>('idle');

  // Get ref code from URL
  const refCode = searchParams.get("ref");
  
  // Check for success or cancel status
  useEffect(() => {
    const sessionStatus = searchParams.get("session_status");
    if (sessionStatus === "success") {
      setStatus("success");
    } else if (sessionStatus === "canceled") {
      setStatus("canceled");
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 2999, // €29.99 in cents
          currency: "eur",
          ref_code: refCode || undefined,
          success_url: `${window.location.origin}/checkout?session_status=success`,
          cancel_url: `${window.location.origin}/checkout?session_status=canceled${refCode ? `&ref=${refCode}` : ''}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-gray-600">
              O seu pagamento foi processado com sucesso.
            </p>
          </div>
          
          {refCode && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Obrigado por usar o código de referência:{" "}
                <span className="font-semibold">{refCode}</span>
              </p>
            </div>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === "canceled") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pagamento Cancelado
            </h1>
            <p className="text-gray-600">
              O seu pagamento foi cancelado. Pode tentar novamente quando quiser.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Voltar
            </button>
            <button
              onClick={() => {
                setStatus("idle");
                handleCheckout();
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Subscrição Retrack</h1>
          <p className="text-blue-100">
            Gerencie o seu negócio de resale com facilidade
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {refCode && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Código de referência ativo:</span> {refCode}
              </p>
              <p className="text-xs text-green-700 mt-1">
                O afiliado receberá automaticamente a sua comissão!
              </p>
            </div>
          )}

          {/* Pricing */}
          <div className="mb-8">
            <div className="flex items-end justify-center mb-4">
              <span className="text-5xl font-bold text-gray-900">€29</span>
              <span className="text-2xl text-gray-600 mb-2">.99</span>
              <span className="text-gray-500 ml-2 mb-2">/mês</span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8 space-y-3">
            <Feature text="Gestão completa de stock" />
            <Feature text="Rastreamento de vendas" />
            <Feature text="Dashboard financeiro" />
            <Feature text="Importação automática Vinted" />
            <Feature text="Relatórios detalhados" />
            <Feature text="Suporte prioritário" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                A processar...
              </>
            ) : (
              "Prosseguir para Pagamento"
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Pagamento seguro processado pelo Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
