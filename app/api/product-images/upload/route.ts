import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return new Response(JSON.stringify({ ok: false, error: "Missing service role key on server" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  let body: { dataUrl?: string; fileName?: string };
  try {
    body = await req.json();
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { dataUrl, fileName } = body || {};
  if (!dataUrl || !fileName) {
    return new Response(JSON.stringify({ ok: false, error: "Missing dataUrl or fileName" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid data URL format" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const contentType = matches[1];
  const base64 = matches[2];
  const buffer = Buffer.from(base64, "base64");

  try {
    // Ensure bucket exists (create if not found)
    try {
      const bucketCheck = await supabase.storage.getBucket("product-images");
      if (bucketCheck.error) {
        const created = await supabase.storage.createBucket("product-images", { public: true });
        if (created.error) {
          return new Response(JSON.stringify({ ok: false, error: created.error.message ?? created.error }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      }
    } catch (e: any) {
      // continue; upload will return an error if needed
    }

    const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

    if (uploadError) {
      return new Response(JSON.stringify({ ok: false, error: uploadError.message ?? uploadError }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    const publicUrl = data?.publicUrl ?? "";

    return new Response(JSON.stringify({ ok: true, publicUrl }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
