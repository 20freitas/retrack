import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  // We delay throwing until runtime inside the handler so build won't fail in environments
}

export async function POST(req: Request) {
  console.log("[api/avatar/upload] handler invoked");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return new Response(`<script>window.parent.postMessage({ok:false,error:"Missing service role key on server"}, '*')</script>`, { headers: { "Content-Type": "text/html" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  const text = await req.text();
  // body for application/x-www-form-urlencoded will be like 'payload=...'
  const params = new URLSearchParams(text);
  const payload = params.get("payload");
  if (!payload) {
    return new Response(`<script>window.parent.postMessage({ok:false,error:"No payload"}, '*')</script>`, { headers: { "Content-Type": "text/html" } });
  }

  let parsed: { dataUrl: string; fileName: string; userId?: string };
  try {
    parsed = JSON.parse(payload);
  } catch (e: any) {
    return new Response(`<script>window.parent.postMessage({ok:false,error:"Invalid payload JSON"}, '*')</script>`, { headers: { "Content-Type": "text/html" } });
  }

  const { dataUrl, fileName } = parsed;
  if (!dataUrl || !fileName) {
    return new Response(`<script>window.parent.postMessage({ok:false,error:"Missing dataUrl or fileName"}, '*')</script>`, { headers: { "Content-Type": "text/html" } });
  }

  try {
    console.log("[api/avatar/upload] incoming fileName:", fileName, "dataUrl length:", dataUrl.length);
  } catch {}

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    return new Response(`<script>window.parent.postMessage({ok:false,error:"Invalid data URL format"}, '*')</script>`, { headers: { "Content-Type": "text/html" } });
  }

  const contentType = matches[1];
  const base64 = matches[2];
  const buffer = Buffer.from(base64, "base64");

  try {
    // Ensure bucket exists (create if not found)
    try {
      const bucketCheck = await supabase.storage.getBucket("avatars");
      if (bucketCheck.error) {
        console.log("[api/avatar/upload] bucket check error:", bucketCheck.error.message ?? bucketCheck.error);
        // try to create bucket (public)
        const created = await supabase.storage.createBucket("avatars", { public: true });
        if (created.error) {
          console.error("[api/avatar/upload] failed to create bucket:", created.error.message ?? created.error);
          return new Response(`<script>window.parent.postMessage({ok:false,error:${JSON.stringify(created.error.message || created.error)}}, '*')</script>`, { headers: { "Content-Type": "text/html" } });
        }
        console.log("[api/avatar/upload] created bucket 'avatars'");
      }
    } catch (e: any) {
      console.warn("[api/avatar/upload] bucket ensure failed:", e?.message ?? e);
      // continue to attempt upload which will return a meaningful error
    }

    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

    if (uploadError) {
      console.error("[api/avatar/upload] upload error:", uploadError.message ?? uploadError);
      return new Response(`<script>window.parent.postMessage({ok:false,error:${JSON.stringify(uploadError.message || uploadError)}}, '*')</script>`, { headers: { "Content-Type": "text/html" } });
    }

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  const publicUrl = data?.publicUrl ?? "";
  console.log("[api/avatar/upload] publicUrl:", publicUrl);

    // If we have a userId, update the user's metadata server-side using the service role key
    try {
      if (parsed.userId) {
        const { error: updErr } = await supabase.auth.admin.updateUserById(parsed.userId, {
          user_metadata: { avatar_url: publicUrl },
        } as any);
        if (updErr) {
          console.warn("[api/avatar/upload] server could not update user metadata:", updErr);
        } else {
          console.log("[api/avatar/upload] updated user metadata for", parsed.userId);
        }
      }
    } catch (e: any) {
      console.warn("[api/avatar/upload] admin updateUserById failed:", e?.message ?? e);
    }

    return new Response(`<script>window.parent.postMessage({ok:true,url:${JSON.stringify(publicUrl)}}, '*')</script>`, { headers: { "Content-Type": "text/html" } });
  } catch (e: any) {
    return new Response(`<script>window.parent.postMessage({ok:false,error:${JSON.stringify(e?.message ?? String(e))}}, '*')</script>`, { headers: { "Content-Type": "text/html" } });
  }
}
