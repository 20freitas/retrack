import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return new Response(JSON.stringify({ ok: false, error: "Missing service role key on server" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  let body: any;
  try {
    body = await req.json();
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { id } = body || {};
  if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400, headers: { "Content-Type": "application/json" } });

  try {
    const { data, error } = await supabase.from("products").delete().eq("id", id).select();
    if (error) return new Response(JSON.stringify({ ok: false, error: error.message ?? error }), { status: 500, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
