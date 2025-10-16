import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to check webhook configuration
 * Access: https://retrack-delta.vercel.app/api/debug/webhook-test
 */
export async function GET(request: NextRequest) {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
    },
    stripe_keys_preview: {
      SECRET_KEY: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
      WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + '...',
      PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) + '...',
    },
    webhook_url: 'https://retrack-delta.vercel.app/api/webhooks/stripe',
    status: 'Configuration check completed',
  };

  return NextResponse.json(checks, { status: 200 });
}
