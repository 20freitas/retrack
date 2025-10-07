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
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: croppedImage },
      });

      if (updateError) throw updateError;

      // update local state
      setAvatarUrl(croppedImage);
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
