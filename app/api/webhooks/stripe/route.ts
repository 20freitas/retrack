import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';
import Stripe from 'stripe';

/**
 * Stripe webhook handler
 * This endpoint receives events from Stripe about payment status
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    console.log(`🔔 Webhook received: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`✅ Checkout completed: ${session.id}`);
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`💵 Invoice payment succeeded: ${invoice.id}`);
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('📝 Subscription created:', subscription.id);
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', subscription.id);
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription cancelled:', subscription.id);
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        console.log('Transfer created:', transfer.id, 'Amount:', transfer.amount);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout completed:', session.id);
  console.log('📋 Session details:', {
    mode: session.mode,
    subscription: session.subscription,
    payment_status: session.payment_status,
    metadata: session.metadata,
    customer: session.customer,
    customer_email: session.customer_details?.email,
  });
  
  // Save subscription to database if it's a subscription mode
  if (session.mode === 'subscription' && session.subscription) {
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription.id;
    
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await saveSubscriptionToDatabase(subscription, session);
    } catch (error) {
      console.error('❌ Error saving subscription to database:', error);
    }
  }
  
  const refCode = session.metadata?.ref_code;
  
  if (refCode && refCode !== 'direct') {
    console.log(`💼 Sale via affiliate: ${refCode}`);
    
    // For subscriptions, the first payment might already be processed
    // We need to check if this is a subscription and process the initial transfer
    if (session.mode === 'subscription' && session.subscription) {
      const subscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription.id;
      
      console.log(`🔍 Fetching subscription for initial transfer: ${subscriptionId}`);
      
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log('📦 Subscription metadata:', subscription.metadata);
        
        const metadata = subscription.metadata || {};
        const affiliateAccountId = metadata.affiliate_account_id;
        const commissionRate = metadata.affiliate_commission_rate;
        
        if (affiliateAccountId && commissionRate) {
          // Get the amount from the subscription
          const amount = subscription.items.data[0]?.price.unit_amount || 0;
          const commissionAmount = Math.floor(amount * (parseFloat(commissionRate) / 100));
          
          console.log(`💰 Creating initial transfer: $${commissionAmount / 100} (${commissionRate}%)`);
          
          // In test mode, we might not have sufficient funds immediately
          // So we'll try to create the transfer, but handle the error gracefully
          try {
            const transfer = await stripe.transfers.create({
              amount: commissionAmount,
              currency: subscription.items.data[0]?.price.currency || 'usd',
              destination: affiliateAccountId,
              description: `Initial commission ${commissionRate}% for ${refCode} - Subscription ${subscriptionId}`,
              metadata: {
                ref_code: refCode,
                subscription_id: subscriptionId,
                commission_rate: commissionRate,
                payment_type: 'initial',
              },
            });
            
            console.log(`✅ Initial transfer created: ${transfer.id} - $${commissionAmount / 100} sent to ${affiliateAccountId}`);
          } catch (transferError: any) {
            console.error('❌ Error creating initial transfer:', transferError.message);
            
            // If insufficient funds in test mode, just log it
            if (transferError.code === 'insufficient_funds') {
              console.log('⚠️ Insufficient funds - this is expected in test mode');
              console.log('ℹ️ In production, funds will be available after successful payment');
              console.log(`📝 Transfer would be: ${commissionAmount} ${subscription.items.data[0]?.price.currency} to ${affiliateAccountId}`);
            }
          }
        } else {
          console.log('ℹ️ No affiliate info in checkout session');
        }
      } catch (error) {
        console.error('❌ Error processing initial transfer:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
      }
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  const refCode = paymentIntent.metadata?.ref_code;
  const commissionRate = paymentIntent.metadata?.commission_rate;
  
  if (refCode && refCode !== 'direct') {
    console.log(`Payment with affiliate ${refCode}, commission rate: ${commissionRate}%`);
    
    // The transfer is automatically created by Stripe via transfer_data
    // The affiliate will see the payment in their Stripe Express dashboard
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed:', paymentIntent.id);
  console.error('Failure reason:', paymentIntent.last_payment_error?.message);
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('💰 Invoice payment succeeded:', invoice.id);
  console.log('📋 Invoice details:', {
    amount_paid: invoice.amount_paid,
    currency: invoice.currency,
    subscription: invoice.subscription,
  });
  
  // For subscriptions, we need to get the subscription to access metadata
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) {
    console.log('⚠️ No subscription ID found in invoice - this might be a one-time payment');
    return;
  }
  
  // Skip the first invoice if billing_reason is 'subscription_create' 
  // because we already handled it in checkout.session.completed
  if (invoice.billing_reason === 'subscription_create') {
    console.log('ℹ️ Skipping initial subscription invoice (already handled in checkout.session.completed)');
    return;
  }
  
  if (typeof subscriptionId === 'string') {
    try {
      console.log(`🔍 Fetching subscription: ${subscriptionId}`);
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      console.log('📦 Subscription metadata:', subscription.metadata);
      
      const metadata = subscription.metadata || {};
      const refCode = metadata.affiliate_ref_code;
      const affiliateAccountId = metadata.affiliate_account_id;
      const commissionRate = metadata.affiliate_commission_rate;
      
      console.log('🔎 Extracted values:', {
        refCode,
        affiliateAccountId,
        commissionRate,
      });
      
      if (refCode && affiliateAccountId && commissionRate) {
        console.log(`💰 Recurring payment for affiliate ${refCode}, commission rate: ${commissionRate}%`);
        
        // Calculate commission based on the actual amount paid
        const amountPaid = invoice.amount_paid; // in cents
        const commissionAmount = Math.floor(amountPaid * (parseFloat(commissionRate) / 100));
        
        console.log(`📊 Invoice amount: ${invoice.currency} ${amountPaid / 100}, Commission: ${invoice.currency} ${commissionAmount / 100} (${commissionRate}%)`);
        
        try {
          // Create transfer to affiliate for recurring payment
          console.log(`🚀 Creating recurring transfer to ${affiliateAccountId}...`);
          const transfer = await stripe.transfers.create({
            amount: commissionAmount,
            currency: invoice.currency || 'eur',
            destination: affiliateAccountId,
            description: `Recurring commission ${commissionRate}% for ${refCode} - Invoice ${invoice.id}`,
            metadata: {
              ref_code: refCode,
              invoice_id: invoice.id,
              subscription_id: subscriptionId,
              commission_rate: commissionRate,
              payment_type: 'recurring',
            },
          });
          
          console.log(`✅ Recurring transfer created: ${transfer.id} - ${invoice.currency} ${commissionAmount / 100} sent to ${affiliateAccountId}`);
        } catch (transferError: any) {
          console.error('❌ Error creating transfer:', transferError.message);
          
          // If insufficient funds, log details
          if (transferError.code === 'insufficient_funds') {
            console.log('⚠️ Insufficient funds - waiting for balance to be available');
            console.log(`📝 Transfer pending: ${commissionAmount} ${invoice.currency} to ${affiliateAccountId}`);
          }
        }
      } else {
        console.log('ℹ️ No affiliate info found for this subscription payment');
        console.log('Missing fields:', {
          has_refCode: !!refCode,
          has_affiliateAccountId: !!affiliateAccountId,
          has_commissionRate: !!commissionRate,
        });
      }
    } catch (error) {
      console.error('❌ Error retrieving subscription:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
    }
  }
}

// Helper function to save subscription to database
async function saveSubscriptionToDatabase(subscription: Stripe.Subscription, session: Stripe.Checkout.Session) {
  console.log('💾 Saving subscription to database:', subscription.id);
  
  // Get user ID from session metadata or customer email
  const userId = session.metadata?.user_id;
  const customerEmail = session.customer_details?.email;
  
  if (!userId) {
    console.error('❌ No user_id in session metadata');
    // Try to find user by email
    if (customerEmail) {
      console.log(`🔍 Trying to find user by email: ${customerEmail}`);
      const { data: user, error } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', customerEmail)
        .single();
      
      if (error || !user) {
        console.error('❌ Could not find user by email:', error);
        return;
      }
    } else {
      return;
    }
  }
  
  // Determine plan type from price
  const priceId = subscription.items.data[0]?.price.id;
  let planType = 'basic';
  
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    planType = 'pro';
  }
  
  const customerId = typeof subscription.customer === 'string' 
    ? subscription.customer 
    : subscription.customer.id;
  
  // Insert or update subscription
  const { data, error} = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      customer_id: customerId,
      subscription_id: subscription.id,
      plan_type: planType,
      price_id: priceId,
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date((subscription.canceled_at as number) * 1000).toISOString() : null,
      amount: subscription.items.data[0]?.price.unit_amount || 0,
      currency: subscription.items.data[0]?.price.currency || 'eur',
      metadata: subscription.metadata || {},
    }, {
      onConflict: 'subscription_id'
    });
  
  if (error) {
    console.error('❌ Error saving subscription:', error);
  } else {
    console.log('✅ Subscription saved to database');
  }
}

// Handle subscription created event
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📝 Saving new subscription:', subscription.id);
  // Subscription will be saved via checkout.session.completed
  // This is just for logging
}

// Handle subscription updated event
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Updating subscription:', subscription.id);
  
  const customerId = typeof subscription.customer === 'string' 
    ? subscription.customer 
    : subscription.customer.id;
  
  // Determine plan type from price
  const priceId = subscription.items.data[0]?.price.id;
  let planType = 'basic';
  
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    planType = 'pro';
  }
  
  // Update subscription in database
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      plan_type: planType,
      price_id: priceId,
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date((subscription.canceled_at as number) * 1000).toISOString() : null,
      amount: subscription.items.data[0]?.price.unit_amount || 0,
      currency: subscription.items.data[0]?.price.currency || 'eur',
      metadata: subscription.metadata || {},
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscription.id);
  
  if (error) {
    console.error('❌ Error updating subscription:', error);
  } else {
    console.log('✅ Subscription updated in database');
  }
}

// Handle subscription deleted event
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Marking subscription as canceled:', subscription.id);
  
  // Update subscription status to canceled
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscription.id);
  
  if (error) {
    console.error('❌ Error marking subscription as canceled:', error);
  } else {
    console.log('✅ Subscription marked as canceled in database');
  }
}
