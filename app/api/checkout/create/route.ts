import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';

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

    let transferData = undefined;
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
      metadata: {
        ref_code: ref_code || 'direct',
      },
      allow_promotion_codes: true,
    };

    // For subscriptions with affiliates, we'll handle commission via webhook
    // because subscription payments happen over time
    if (affiliateInfo) {
      sessionParams.metadata.affiliate_ref_code = ref_code;
      sessionParams.metadata.affiliate_account_id = affiliateInfo.stripe_account_id;
      sessionParams.metadata.commission_rate = affiliateInfo.commission_rate.toString();
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      affiliate: affiliateInfo ? {
        ref_code: affiliateInfo.ref_code,
        commission_rate: affiliateInfo.commission_rate,
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
