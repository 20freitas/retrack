import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Client for regular operations (uses anon key with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for webhooks and server operations (bypasses RLS)
// Only use this in server-side code (API routes, server components)
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  // Only create admin client on server-side
  if (typeof window === 'undefined') {
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceRoleKey) {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will fail.');
      // Return regular client as fallback
      return supabase;
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    return supabaseAdminInstance;
  }

  // Return regular client if called from browser
  console.warn('⚠️ getSupabaseAdmin() called from browser. Using regular client instead.');
  return supabase;
};

// For backwards compatibility - alias that works on server-side only
export const supabaseAdmin = getSupabaseAdmin();
