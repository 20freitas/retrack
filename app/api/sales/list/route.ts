import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function GET(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return new Response(JSON.stringify({ ok: false, error: "Missing service role key on server" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      // return empty list if no userId provided
      return new Response(JSON.stringify({ ok: true, data: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("owner_id", userId)
      .order("sale_date", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message ?? error }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    try {
      console.log(`[sales/list] userId=${userId} returned=${Array.isArray(data) ? data.length : 0}`);
    } catch (e) {}

    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
