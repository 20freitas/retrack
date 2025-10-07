import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return new Response(JSON.stringify({ ok: false, error: "Missing service role key on server" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // accept either application/json or form POST with a 'payload' field (for iframe fallback)
  let body: any = {};
  let isFormFallback = false;
  try {
    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data") || contentType.includes("text/plain")) {
      // try parsing formData payload or plain text containing JSON
      try {
        const form = await req.formData();
        const payload = form.get("payload");
        if (payload) {
          isFormFallback = true;
          body = JSON.parse(String(payload));
        } else {
          const text = await req.text();
          body = text ? JSON.parse(text) : {};
        }
      } catch (e) {
        const text = await req.text();
        body = text ? JSON.parse(text) : {};
      }
    } else {
      // attempt to parse JSON as a last resort
      try {
        body = await req.json();
      } catch (e) {
        const text = await req.text();
        body = text ? JSON.parse(text) : {};
      }
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON or payload" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { userId, metadata } = body || {};
  if (!userId || !metadata) return new Response(JSON.stringify({ ok: false, error: "Missing userId or metadata" }), { status: 400, headers: { "Content-Type": "application/json" } });

  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, { user_metadata: metadata } as any);
    if (error) {
      const resp = JSON.stringify({ ok: false, error: error.message ?? error });
      if (isFormFallback) {
        // respond with a small HTML page that posts a message to the parent iframe
        return new Response(`<script>window.parent.postMessage(${JSON.stringify({ ok: false, error: error.message ?? String(error) })}, '*');</script>`, { status: 500, headers: { "Content-Type": "text/html" } });
      }
      return new Response(resp, { status: 500, headers: { "Content-Type": "application/json" } });
    }

    if (isFormFallback) {
      return new Response(`<script>window.parent.postMessage(${JSON.stringify({ ok: true })}, '*');</script>`, { status: 200, headers: { "Content-Type": "text/html" } });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    const resp = JSON.stringify({ ok: false, error: e?.message ?? String(e) });
    if (isFormFallback) {
      return new Response(`<script>window.parent.postMessage(${JSON.stringify({ ok: false, error: e?.message ?? String(e) })}, '*');</script>`, { status: 500, headers: { "Content-Type": "text/html" } });
    }
    return new Response(resp, { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
