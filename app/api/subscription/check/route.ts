import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar se utilizador está autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated", hasSubscription: false },
        { status: 401 }
      );
    }

    // Buscar subscrição ativa do utilizador
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching subscription:", subError);
      return NextResponse.json(
        { error: "Error fetching subscription", hasSubscription: false },
        { status: 500 }
      );
    }

    // Se não tem subscrição ativa
    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
      });
    }

    // Verificar se subscrição ainda está válida
    const currentPeriodEnd = new Date(subscription.current_period_end);
    const isExpired = currentPeriodEnd < new Date();

    if (isExpired && subscription.status === "active") {
      // Atualizar status para expirado (será atualizado pelo webhook)
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
        message: "Subscription expired",
      });
    }

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.subscription_id,
        plan_type: subscription.plan_type,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        amount: subscription.amount,
        currency: subscription.currency,
      },
    });
  } catch (error) {
    console.error("Error in subscription check:", error);
    return NextResponse.json(
      { error: "Internal server error", hasSubscription: false },
      { status: 500 }
    );
  }
}
