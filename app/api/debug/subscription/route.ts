import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

/**
 * Debug endpoint to check subscription metadata
 * Access: https://retrack-delta.vercel.app/api/debug/subscription?id=sub_xxxxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Please provide subscription ID: ?id=sub_xxxxx' },
        { status: 400 }
      );
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return NextResponse.json({
      subscription_id: subscription.id,
      status: subscription.status,
      customer: subscription.customer,
      metadata: subscription.metadata,
      created: new Date((subscription as any).created * 1000).toISOString(),
      items: subscription.items.data.map(item => ({
        price_id: item.price.id,
        amount: item.price.unit_amount,
        currency: item.price.currency,
      })),
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to retrieve subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
