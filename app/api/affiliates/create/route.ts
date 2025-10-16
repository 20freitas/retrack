import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * API endpoint to create or update an affiliate
 * This is a simple endpoint for manual affiliate management
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ref_code, stripe_account_id, commission_rate, name, email } = body;

    // Validate required fields
    if (!ref_code || !stripe_account_id) {
      return NextResponse.json(
        { error: 'ref_code and stripe_account_id are required' },
        { status: 400 }
      );
    }

    // Validate ref_code format (alphanumeric only)
    if (!/^[a-zA-Z0-9_-]+$/.test(ref_code)) {
      return NextResponse.json(
        { error: 'ref_code must contain only letters, numbers, hyphens, and underscores' },
        { status: 400 }
      );
    }

    // Validate commission_rate if provided
    if (commission_rate !== undefined) {
      const rate = parseFloat(commission_rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return NextResponse.json(
          { error: 'commission_rate must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Check if affiliate with this ref_code already exists
    const { data: existing } = await supabase
      .from('affiliates')
      .select('*')
      .eq('ref_code', ref_code)
      .single();

    let result;

    if (existing) {
      // Update existing affiliate
      const { data, error } = await supabase
        .from('affiliates')
        .update({
          stripe_account_id,
          commission_rate: commission_rate || existing.commission_rate,
          name: name || existing.name,
          email: email || existing.email,
          updated_at: new Date().toISOString(),
        })
        .eq('ref_code', ref_code)
        .select()
        .single();

      if (error) throw error;
      result = { affiliate: data, message: 'Affiliate updated successfully' };
    } else {
      // Create new affiliate
      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          ref_code,
          stripe_account_id,
          commission_rate: commission_rate || 10.00,
          name,
          email,
        })
        .select()
        .single();

      if (error) {
        // Check for unique constraint violations
        if (error.code === '23505') {
          return NextResponse.json(
            { error: 'An affiliate with this ref_code or stripe_account_id already exists' },
            { status: 409 }
          );
        }
        throw error;
      }
      result = { affiliate: data, message: 'Affiliate created successfully' };
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error creating/updating affiliate:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get affiliate by ref_code
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ref_code = searchParams.get('ref_code');

    if (!ref_code) {
      return NextResponse.json(
        { error: 'ref_code parameter is required' },
        { status: 400 }
      );
    }

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('ref_code', ref_code)
      .eq('active', true)
      .single();

    if (error || !affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ affiliate }, { status: 200 });

  } catch (error) {
    console.error('Error fetching affiliate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
