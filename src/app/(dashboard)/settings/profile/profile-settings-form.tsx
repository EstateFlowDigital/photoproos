"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { updateUserProfile, updateOrganizationProfile } from "@/lib/actions/settings";
import { useToast } from "@/components/ui/toast";
import { TIMEZONE_GROUPS } from "@/lib/constants/timezones";

interface ProfileSettingsFormProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
  };
  organization: {
    id: string;
    name: string;
    timezone: string;
  };
}

export function ProfileSettingsForm({ user, organization }: ProfileSettingsFormProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [businessName, setBusinessName] = useState(organization.name);
  const [timezone, setTimezone] = useState(organization.timezone);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Please upload a JPG, PNG, or WebP image.", "error");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB.", "error");
      return;
    }

    setIsUploadingPhoto(true);
    setError(null);

    try {
      // Step 1: Get presigned URL
      const urlResponse = await fetch("/api/upload/profile-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      const urlResult = await urlResponse.json();
      if (!urlResult.success) {
        throw new Error(urlResult.error || "Failed to get upload URL");
      }

      // Step 2: Upload to R2
      const uploadResponse = await fetch(urlResult.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // Step 3: Save the public URL to user profile
      const updateResult = await updateUserProfile({
        avatarUrl: urlResult.data.publicUrl,
      });

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to save profile photo");
      }

      // Update local state
      setAvatarUrl(urlResult.data.publicUrl);
      showToast("Profile photo updated successfully!", "success");
    } catch (err) {
      console.error("Upload error:", err);
      showToast(err instanceof Error ? err.message : "Failed to upload photo", "error");
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleChangePassword = () => {
    // Redirect to Clerk's password change flow
    window.open("https://accounts.clerk.dev/user", "_blank");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const [userResult, orgResult] = await Promise.all([
        updateUserProfile({
          fullName: fullName || undefined,
          phone: phone || undefined,
        }),
        updateOrganizationProfile({
          name: businessName,
          timezone,
        }),
      ]);

      if (!userResult.success || !orgResult.success) {
        setError(userResult.error || orgResult.error || "Failed to save changes");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3">
          <p className="text-sm text-[var(--success)]">Settings saved successfully!</p>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      {/* Avatar Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Profile Photo</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {avatarUrl ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-full">
              <Image
                src={avatarUrl}
                alt="Profile photo"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-2xl font-bold">
              {(fullName || user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleUploadPhoto}
              disabled={isUploadingPhoto}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingPhoto ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Uploading...
                </>
              ) : (
                avatarUrl ? "Change Photo" : "Upload Photo"
              )}
            </button>
            <p className="text-xs text-foreground-muted">JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              disabled
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground-muted cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-foreground-muted">Email cannot be changed here. Contact support if needed.</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Business Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-foreground mb-1.5">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-foreground mb-1.5">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              {Object.entries(TIMEZONE_GROUPS).map(([region, timezones]) => (
                <optgroup key={region} label={region}>
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Password</h2>
        <p className="text-sm text-foreground-muted mb-4">
          Change your password to keep your account secure.
        </p>
        <button
          type="button"
          onClick={handleChangePassword}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          Change Password
        </button>
      </div>

      {/* Save Button */}
      <div className="flex flex-col items-stretch sm:items-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
        >
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
