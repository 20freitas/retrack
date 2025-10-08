"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { ImageCropModal } from "../../components/ui/ImageCropModal";
import {
  User,
  Upload,
  Lock,
  Mail,
  LogOut,
  Camera,
} from "lucide-react";
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
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
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
      const current =
        (await supabase.auth.getSession()).data.session?.user ?? null;
      if (!current) throw new Error("No authenticated user");

      // Build a safe path and upload to the `avatars` bucket
      const fileExt = blob.type === "image/png" ? "png" : "jpg";
      const fileName = `${current.id}/avatar-${Date.now()}.${fileExt}`;

      let uploadError: any = null;
      let uploadException: any = null;
      try {
        const res = await supabase.storage
          .from("avatars")
          .upload(fileName, blob, {
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
          const publicUrlFromServer = await new Promise<string>(
            (resolve, reject) => {
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
              input.value = JSON.stringify({
                dataUrl: croppedImage,
                fileName,
                userId: current.id,
              });
              form.appendChild(input);
              document.body.appendChild(form);

              form.submit();
              setTimeout(() => form.remove(), 2000);
            }
          );

          // server already updated user metadata; update local UI and notify components
          setAvatarUrl(publicUrlFromServer);
          setMessage({ type: "success", text: "Avatar updated successfully." });

          // Refresh client-side user info from Supabase so the updated metadata persists
          try {
            const { data: refreshed, error: refreshedError } =
              await supabase.auth.getUser();
            if (!refreshedError && refreshed?.user) {
              setUser(refreshed.user as any);
              window.dispatchEvent(
                new CustomEvent("userUpdated", { detail: refreshed.user })
              );
            } else {
              const updatedUser = {
                ...current,
                user_metadata: {
                  ...(current.user_metadata ?? {}),
                  avatar_url: publicUrlFromServer,
                },
              };
              window.dispatchEvent(
                new CustomEvent("userUpdated", { detail: updatedUser })
              );
            }
          } catch (e) {
            const updatedUser = {
              ...current,
              user_metadata: {
                ...(current.user_metadata ?? {}),
                avatar_url: publicUrlFromServer,
              },
            };
            window.dispatchEvent(
              new CustomEvent("userUpdated", { detail: updatedUser })
            );
          }

          setLoading(false);
          setTempImageUrl(null);
          return;
        } catch (iframeErr) {
          console.error("Server iframe upload failed", iframeErr);

          // Second fallback: try to save data URL into user metadata (only if small)
          const approxBytes = (croppedImage.length * 3) / 4;
          if (approxBytes > 2 * 1024 * 1024) {
            setMessage({
              type: "error",
              text: "Upload failed and image is too large for fallback.",
            });
            throw uploadException ?? uploadError ?? new Error("Upload failed");
          }

          const { data: fbData, error: fbErr } = await supabase.auth.updateUser(
            { data: { avatar_url: croppedImage } }
          );
          if (fbErr) {
            console.error("Fallback updateUser failed", fbErr);
            setMessage({
              type: "error",
              text: fbErr.message || "Fallback upload failed.",
            });
            throw fbErr;
          }

          setAvatarUrl(croppedImage);
          setMessage({ type: "success", text: "Avatar updated successfully." });
          try {
            const updatedUser = fbData?.user ?? null;
            window.dispatchEvent(
              new CustomEvent("userUpdated", { detail: updatedUser })
            );
          } catch {}

          setLoading(false);
          setTempImageUrl(null);
          return;
        }
      }

      // Get public URL for the uploaded file
      const publicRes = supabase.storage.from("avatars").getPublicUrl(fileName);
      const publicUrl = publicRes?.data?.publicUrl ?? null;
      if (!publicUrl)
        throw new Error("Failed to get public URL for uploaded avatar");

      // Update user metadata with the new public URL
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) throw updateError;

      // update local state
      setAvatarUrl(publicUrl);
      setMessage({ type: "success", text: "Avatar updated successfully." });

      // notify other components (Navbar) that user metadata changed
      try {
        const updatedUser = data?.user ?? null;
        window.dispatchEvent(
          new CustomEvent("userUpdated", { detail: updatedUser })
        );
      } catch (e) {
        // ignore
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to upload avatar.",
      });
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
      // Use server endpoint to update user metadata to avoid client fetch interception
      const current =
        (await supabase.auth.getSession()).data.session?.user ?? null;
      if (!current) throw new Error("No authenticated user");

      // Try normal fetch first
      let ok = false;
      try {
        const res = await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: current.id,
            metadata: {
              name,
              avatar_url: current.user_metadata?.avatar_url,
            },
          }),
        });
        // If content-type is HTML (iframe fallback response) treat as failure for fetch path
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          if (!json?.ok) throw new Error(json?.error || "Update failed");
          ok = true;
        } else {
          // non-JSON response likely from interception or iframe path — fall back
          throw new Error("Non-JSON response, falling back to iframe method");
        }
      } catch (fetchErr) {
        console.warn(
          "Fetch update failed, attempting iframe fallback:",
          fetchErr
        );

        // iframe fallback: build a hidden form and listen for postMessage from the server HTML response
        ok = await new Promise<boolean>((resolve) => {
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.name = `update-iframe-${Date.now()}`;
          document.body.appendChild(iframe);

          const onMessage = (ev: MessageEvent) => {
            const d = ev.data;
            if (d && typeof d === "object") {
              window.removeEventListener("message", onMessage);
              document.body.removeChild(iframe);
              resolve(Boolean(d.ok));
            }
          };
          window.addEventListener("message", onMessage);

          const form = document.createElement("form");
          form.method = "POST";
          form.action = "/api/user/update";
          form.target = iframe.name;

          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "payload";
          input.value = JSON.stringify({
            userId: current.id,
            metadata: {
              name,
              avatar_url: current.user_metadata?.avatar_url,
            },
          });
          form.appendChild(input);
          document.body.appendChild(form);

          form.submit();
          setTimeout(() => {
            try {
              form.remove();
            } catch (e) {}
          }, 2000);
        });
      }

      if (!ok)
        throw new Error("Update failed (both fetch and iframe fallback)");

      // Notify client components and update local state
      const refreshed = await supabase.auth.getUser();
      const updatedUser = refreshed?.data?.user ?? {
        ...current,
        user_metadata: { ...(current.user_metadata ?? {}), name },
      };
      window.dispatchEvent(
        new CustomEvent("userUpdated", { detail: updatedUser })
      );
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile.",
      });
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
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to change password.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {message && (
          <Alert type={message.type === "error" ? "error" : "success"}>
            {message.text}
          </Alert>
        )}

        {/* Avatar Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Profile Picture
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Update your profile photo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative group">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-2 border-white/10"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                <Camera size={28} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>

            <div className="flex-1">
              <label className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-colors">
                  <Upload size={18} className="text-gray-300" />
                  <span className="text-sm font-medium text-white">
                    Upload new photo
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-3">
                JPG, PNG or GIF. Max 2MB.
              </p>
              <p className="text-xs text-gray-500">
                Recommended size: 400x400px
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Personal Information
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Update your personal details
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User size={14} className="inline mr-1" />
                Display Name
              </label>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                className="h-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail size={14} className="inline mr-1" />
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                disabled
                className="h-12 opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Lock size={12} />
                Email cannot be changed for security reasons
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
              >
                {loading ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Change Password
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Update your password to keep your account secure
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock size={14} className="inline mr-1" />
                New Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
                required
                className="h-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock size={14} className="inline mr-1" />
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                required
                className="h-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-xs text-gray-500 mt-2">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
              >
                {loading ? "Changing password..." : "Change password"}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
            <p className="text-sm text-gray-400 mt-1">
              Sign out of your account
            </p>
          </div>

          <button
            onClick={async () => {
              try {
                await supabase.auth.signOut();
              } catch (e) {
                console.warn("supabase.signOut failed", e);
              }

              try {
                const keys = Object.keys(localStorage || {});
                for (const k of keys) {
                  if (
                    k.toLowerCase().includes("supabase") ||
                    k.startsWith("sb-") ||
                    k.includes("auth")
                  ) {
                    try {
                      localStorage.removeItem(k);
                    } catch (e) {}
                  }
                }
              } catch (e) {}

              try {
                const cookies = document.cookie.split(";");
                for (const c of cookies) {
                  const eq = c.indexOf("=");
                  const name = eq > -1 ? c.substr(0, eq).trim() : c.trim();
                  if (!name) continue;
                  document.cookie =
                    name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;";
                }
              } catch (e) {}

              try {
                window.dispatchEvent(
                  new CustomEvent("userUpdated", { detail: null })
                );
              } catch (e) {}

              window.location.href = "/";
            }}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-medium transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </div>

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
