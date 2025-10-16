import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Create a Stripe Checkout session with affiliate commission transfer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { price_id, ref_code, success_url, cancel_url } = body;

    // Validate required fields
    if (!price_id) {
      return NextResponse.json(
        { error: 'price_id is required' },
        { status: 400 }
      );
    }

    if (!success_url || !cancel_url) {
      return NextResponse.json(
        { error: 'success_url and cancel_url are required' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to subscribe' },
        { status: 401 }
      );
    }

    // Check if user already has an active subscription
    const { data: existingSubscription, error: subError } = await supabaseAuth
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single();

    if (existingSubscription && !subError) {
      return NextResponse.json(
        {
          error: 'You already have an active subscription',
          hasSubscription: true,
          subscription: {
            plan_type: existingSubscription.plan_type,
            status: existingSubscription.status,
          },
        },
        { status: 400 }
      );
    }

    let affiliateInfo = null;

    // If ref_code is provided, get affiliate info
    if (ref_code) {
      const { data: affiliate, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('ref_code', ref_code)
        .eq('active', true)
        .single();

      if (error || !affiliate) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        );
      }

      affiliateInfo = affiliate;
    }

    // Get price details from Stripe to know the amount
    const priceDetails = await stripe.prices.retrieve(price_id);
    const amount = priceDetails.unit_amount || 0; // in cents
    
    // Calculate commission (70% goes to affiliate)
    const commissionRate = affiliateInfo ? (affiliateInfo.commission_rate / 100) : 0;
    const affiliateAmount = Math.floor(amount * commissionRate); // 70% in cents

    // Create Stripe Checkout session
    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
      customer_email: user.email,
      metadata: {
        ref_code: ref_code || 'direct',
        user_id: user.id, // Save user ID for webhook
      },
      allow_promotion_codes: true,
    };

    // For subscriptions with affiliates, we save metadata and process via webhook
    // because subscription payments happen over time
    if (affiliateInfo) {
      sessionParams.subscription_data = {
        metadata: {
          affiliate_ref_code: ref_code,
          affiliate_account_id: affiliateInfo.stripe_account_id,
          affiliate_commission_rate: affiliateInfo.commission_rate.toString(),
          affiliate_amount: affiliateAmount.toString(), // Pre-calculated amount
        },
      };
    } else {
      // Even without affiliate, save user_id in subscription metadata
      sessionParams.subscription_data = {
        metadata: {
          user_id: user.id,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      affiliate: affiliateInfo ? {
        ref_code: affiliateInfo.ref_code,
        commission_rate: affiliateInfo.commission_rate,
        affiliate_amount_cents: affiliateAmount,
      } : null,
    }, { status: 200 });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}