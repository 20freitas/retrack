"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { ImageCropModal } from "../../components/ui/ImageCropModal";
import { User, Upload } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setEmail(currentUser.email ?? "");
        setName(currentUser.user_metadata?.name ?? "");
        setAvatarUrl(currentUser.user_metadata?.avatar_url ?? null);
      }
    });
  }, []);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size must be less than 2MB." });
      return;
    }

    // Read file and show crop modal
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageUrl(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };

  const handleCropComplete = async (croppedImage: string) => {
    setShowCropModal(false);
    setLoading(true);
    setMessage(null);

    try {
      // Convert data URL to a Blob
      const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/png";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      const blob = dataURLtoBlob(croppedImage);

      // Ensure user is available
      const current = (await supabase.auth.getSession()).data.session?.user ?? null;
      if (!current) throw new Error("No authenticated user");

      // Build a safe path and upload to the `avatars` bucket
      const fileExt = blob.type === "image/png" ? "png" : "jpg";
  const fileName = `${current.id}/avatar-${Date.now()}.${fileExt}`;

      let uploadError: any = null;
      let uploadException: any = null;
      try {
        const res = await supabase.storage.from("avatars").upload(fileName, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: blob.type,
        });
        uploadError = (res as any).error ?? null;
      } catch (err) {
        console.error("Storage upload failed (network)", err);
        uploadException = err;
      }

      if (uploadException || uploadError) {
        // First fallback: server-side upload via hidden iframe (avoids fetch interception)
        try {
          const publicUrlFromServer = await new Promise<string>((resolve, reject) => {
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.name = `upload-iframe-${Date.now()}`;
            document.body.appendChild(iframe);

            const onMessage = (ev: MessageEvent) => {
              const d = ev.data;
              if (d?.ok) {
                window.removeEventListener("message", onMessage);
                document.body.removeChild(iframe);
                resolve(d.url);
              } else {
                window.removeEventListener("message", onMessage);
                document.body.removeChild(iframe);
                reject(new Error(d?.error || "Server upload failed"));
              }
            };

            window.addEventListener("message", onMessage);

            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/api/avatar/upload";
            form.target = iframe.name;

            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "payload";
            input.value = JSON.stringify({ dataUrl: croppedImage, fileName, userId: current.id });
            form.appendChild(input);
            document.body.appendChild(form);

            form.submit();
            setTimeout(() => form.remove(), 2000);
          });

          // server already updated user metadata; update local UI and notify components
          setAvatarUrl(publicUrlFromServer);
          setMessage({ type: "success", text: "Avatar updated successfully." });

          // Refresh client-side user info from Supabase so the updated metadata persists
          try {
            const { data: refreshed, error: refreshedError } = await supabase.auth.getUser();
            if (!refreshedError && refreshed?.user) {
              setUser(refreshed.user as any);
              window.dispatchEvent(new CustomEvent("userUpdated", { detail: refreshed.user }));
            } else {
              const updatedUser = { ...current, user_metadata: { ...(current.user_metadata ?? {}), avatar_url: publicUrlFromServer } };
              window.dispatchEvent(new CustomEvent("userUpdated", { detail: updatedUser }));
            }
          } catch (e) {
            const updatedUser = { ...current, user_metadata: { ...(current.user_metadata ?? {}), avatar_url: publicUrlFromServer } };
            window.dispatchEvent(new CustomEvent("userUpdated", { detail: updatedUser }));
          }

          setLoading(false);
          setTempImageUrl(null);
          return;
        } catch (iframeErr) {
          console.error("Server iframe upload failed", iframeErr);

          // Second fallback: try to save data URL into user metadata (only if small)
          const approxBytes = croppedImage.length * 3 / 4;
          if (approxBytes > 2 * 1024 * 1024) {
            setMessage({ type: "error", text: "Upload failed and image is too large for fallback." });
            throw uploadException ?? uploadError ?? new Error("Upload failed");
          }

          const { data: fbData, error: fbErr } = await supabase.auth.updateUser({ data: { avatar_url: croppedImage } });
          if (fbErr) {
            console.error("Fallback updateUser failed", fbErr);
            setMessage({ type: "error", text: fbErr.message || "Fallback upload failed." });
            throw fbErr;
          }

          setAvatarUrl(croppedImage);
          setMessage({ type: "success", text: "Avatar updated successfully." });
          try {
            const updatedUser = fbData?.user ?? null;
            window.dispatchEvent(new CustomEvent("userUpdated", { detail: updatedUser }));
          } catch {}

          setLoading(false);
          setTempImageUrl(null);
          return;
        }
      }

      // Get public URL for the uploaded file
  const publicRes = supabase.storage.from("avatars").getPublicUrl(fileName);
  const publicUrl = publicRes?.data?.publicUrl ?? null;
  if (!publicUrl) throw new Error("Failed to get public URL for uploaded avatar");

      // Update user metadata with the new public URL
      const { data, error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;

      // update local state
      setAvatarUrl(publicUrl);
  setMessage({ type: "success", text: "Avatar updated successfully." });

      // notify other components (Navbar) that user metadata changed
      try {
        const updatedUser = data?.user ?? null;
        window.dispatchEvent(new CustomEvent("userUpdated", { detail: updatedUser }));
      } catch (e) {
        // ignore
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to upload avatar." });
    } finally {
      setLoading(false);
      setTempImageUrl(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { name },
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully." });

      try {
        const updatedUser = data?.user ?? null;
        window.dispatchEvent(new CustomEvent("userUpdated", { detail: updatedUser }));
      } catch (e) {}
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      setMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to change password." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        {message && <Alert type={message.type}>{message.text}</Alert>}

        {/* Avatar Section */}
        <div className="bg-card/10 backdrop-blur-sm border border-white/8 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Avatar</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white">
                  <User size={40} />
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <Upload size={16} />
                  <span className="text-sm">Upload new avatar</span>
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" disabled={loading} />
              </label>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-card/10 backdrop-blur-sm border border-white/8 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
              <Input placeholder="Your name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <Input type="email" value={email} disabled className="opacity-50 cursor-not-allowed" />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-card/10 backdrop-blur-sm border border-white/8 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">New password</label>
              <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Confirm new password</label>
              <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Changing…" : "Change password"}
            </Button>
          </form>
        </div>

        {/* Sign Out */}
        <div className="border-t border-white/8 pt-6">
          <Button
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="w-full text-red-400 border-red-400/20 hover:bg-red-500/10"
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* Dev-only debug tools removed */}

      {/* Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropModal(false);
            setTempImageUrl(null);
          }}
        />
      )}
    </div>
  );
}
