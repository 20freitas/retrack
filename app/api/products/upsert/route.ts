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

  const { id, ...payload } = body || {};
  const ownerId = body?.ownerId ?? null;
  try {
    console.log('[products/upsert] body=', JSON.stringify(body));
    console.log('[products/upsert] ownerId=', ownerId);
    console.log('[products/upsert] payloadKeys=', Object.keys(payload || {}));
  } catch (e) {}
  // prevent accidental camelCase column from being used directly
  if ((payload as any).ownerId) delete (payload as any).ownerId;

  try {
    if (id) {
      // ensure owner match if provided
      if (ownerId) {
        const { data: existing, error: existsErr } = await supabase.from("products").select("owner_id").eq("id", id).single();
        if (existsErr) return new Response(JSON.stringify({ ok: false, error: existsErr.message ?? existsErr }), { status: 500, headers: { "Content-Type": "application/json" } });
        if (!existing || existing.owner_id !== ownerId) return new Response(JSON.stringify({ ok: false, error: "Not authorized to update this product" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      const { data, error } = await supabase.from("products").update(payload).eq("id", id).select();
      try { console.log('[products/upsert] update payload keys=', Object.keys(payload || {})); } catch (e) {}
      if (error) return new Response(JSON.stringify({ ok: false, error: error.message ?? error }), { status: 500, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { "Content-Type": "application/json" } });
    } else {
  // set owner_id when inserting (snake_case column)
  if (ownerId) (payload as any).owner_id = ownerId;
  try { console.log('[products/upsert] insert payload keys=', Object.keys(payload || {})); } catch (e) {}
  const { data, error } = await supabase.from("products").insert(payload).select();
      if (error) return new Response(JSON.stringify({ ok: false, error: error.message ?? error }), { status: 500, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
