import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  console.log('🧪 Testing supabaseAdmin...');
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('1️⃣ Got supabaseAdmin instance');
    
    // Test 1: Check if we can query the table
    console.log('2️⃣ Testing SELECT from user_subscriptions...');
    const { data: existingData, error: selectError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .limit(5);
    
    if (selectError) {
      console.error('❌ SELECT error:', selectError);
      return NextResponse.json({
        success: false,
        error: 'SELECT failed',
        details: selectError,
      });
    }
    
    console.log('✅ SELECT successful! Found', existingData?.length, 'rows');
    
    // Test 2: Try to insert a test row
    console.log('3️⃣ Testing INSERT...');
    
    const testData = {
      user_id: null, // NULL instead of fake UUID
      customer_id: `cus_test_${Date.now()}`,
      subscription_id: `sub_test_${Date.now()}`,
      plan_type: 'pro',
      price_id: 'price_test',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      amount: 1999,
      currency: 'eur',
      metadata: { test: true },
    };
    
    console.log('Attempting to insert:', testData);
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ INSERT error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'INSERT failed',
        details: insertError,
        hint: insertError.message,
        code: insertError.code,
      }, { status: 500 });
    }
    
    console.log('✅ INSERT successful!', insertData);
    
    // Clean up - delete test row
    if (insertData && insertData[0]) {
      await supabaseAdmin
        .from('user_subscriptions')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Cleaned up test row');
    }
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed!',
      tests: {
        select: {
          passed: true,
          rowsFound: existingData?.length || 0,
        },
        insert: {
          passed: true,
          data: insertData,
        },
      },
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
    }, { status: 500 });
  }
}
