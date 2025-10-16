import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest) {
  try {
    // Get user_id from query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: "user_id required in query params" },
        { status: 400 }
      );
    }

    console.log('Attempting to insert test subscription for user:', userId);

    // Try to insert test subscription
    const { data, error } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        customer_id: `cus_test_${Date.now()}`,
        subscription_id: `sub_test_${Date.now()}`,
        plan_type: 'pro',
        price_id: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_test',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        amount: 1999,
        currency: 'eur',
        metadata: { test: true },
      })
      .select();

    if (error) {
      console.error('❌ Error inserting subscription:', error);
      return NextResponse.json(
        { 
          error: "Failed to create subscription",
          details: error,
        },
        { status: 500 }
      );
    }

    console.log('✅ Test subscription created:', data);

    return NextResponse.json({
      success: true,
      message: 'Test subscription created successfully!',
      data,
    });

  } catch (error) {
    console.error('❌ Error in test insert:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
