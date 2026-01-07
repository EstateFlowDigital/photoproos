"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getGalleryThemeColors, type ResolvedTheme } from "@/lib/theme";

interface PasswordGateProps {
  galleryId: string;
  galleryName: string;
  photographerName: string;
  logoUrl?: string | null;
  primaryColor: string;
  theme: ResolvedTheme;
}

export function PasswordGate({
  galleryId,
  galleryName,
  photographerName,
  logoUrl,
  primaryColor,
  theme,
}: PasswordGateProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const colors = getGalleryThemeColors(theme);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gallery/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId,
          password: password.trim(),
        }),
      });

      if (response.ok) {
        // Password verified, refresh the page to show the gallery
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Incorrect password");
      }
    } catch (err) {
      setError("Failed to verify password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: colors.bgColor, color: colors.textColor }}
    >
      <div className="w-full max-w-md">
        {/* Logo/Photographer */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt={photographerName} className="h-12 mx-auto mb-4" />
          ) : (
            <h2 className="text-xl font-semibold mb-2">{photographerName}</h2>
          )}
        </div>

        {/* Password Form */}
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.borderColor}` }}
        >
          <div className="text-center mb-6">
            <div
              className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <LockIcon style={{ color: primaryColor }} className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold mb-1">{galleryName}</h1>
            <p className="text-sm" style={{ color: colors.mutedColor }}>
              This gallery is password protected
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter gallery password"
                className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.bgColor,
                  borderColor: error ? "var(--error)" : colors.borderColor,
                  color: colors.textColor,
                  ["--tw-ring-color" as string]: primaryColor,
                }}
                disabled={isLoading}
              />
              {error && (
                <p className="mt-2 text-sm" style={{ color: "var(--error)" }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg py-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner className="h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                "View Gallery"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: colors.mutedColor }}>
            Contact your photographer if you don't have the password
          </p>
        </div>
      </div>
    </div>
  );
}

function LockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} style={style}>
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
