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
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription cancelled:', subscription.id);
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
  console.log('Checkout completed:', session.id);
  
  const refCode = session.metadata?.ref_code;
  
  if (refCode && refCode !== 'direct') {
    console.log(`Sale via affiliate: ${refCode}`);
    
    // You could log this to a sales/commission tracking table
    // For now, we just log it - the transfer to the affiliate
    // is automatically handled by Stripe via transfer_data
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
    console.log('⚠️ No subscription ID found in invoice');
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
        console.log(`💰 Subscription payment with affiliate ${refCode}, commission rate: ${commissionRate}%`);
        
        // Calculate commission based on the actual amount paid
        const amountPaid = invoice.amount_paid; // in cents
        const commissionAmount = Math.floor(amountPaid * (parseFloat(commissionRate) / 100));
        
        console.log(`📊 Invoice amount: $${amountPaid / 100}, Commission: $${commissionAmount / 100} (${commissionRate}%)`);
        
        try {
          // Create transfer to affiliate (70% goes to them)
          console.log(`🚀 Creating transfer to ${affiliateAccountId}...`);
          const transfer = await stripe.transfers.create({
            amount: commissionAmount,
            currency: invoice.currency || 'usd',
            destination: affiliateAccountId,
            description: `Commission ${commissionRate}% for ${refCode} - Invoice ${invoice.id}`,
            metadata: {
              ref_code: refCode,
              invoice_id: invoice.id,
              subscription_id: subscriptionId,
              commission_rate: commissionRate,
            },
          });
          
          console.log(`✅ Transfer created: ${transfer.id} - $${commissionAmount / 100} sent to ${affiliateAccountId}`);
        } catch (transferError) {
          console.error('❌ Error creating transfer:', transferError);
          // Log more error details
          if (transferError instanceof Error) {
            console.error('Error details:', transferError.message);
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
