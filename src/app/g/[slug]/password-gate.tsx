"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const colors = getGalleryThemeColors(theme);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

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
      <div
        className={cn(
          "w-full max-w-md transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {/* Logo/Photographer */}
        <div
          className={cn(
            "text-center mb-8 transition-all duration-500 ease-out delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={photographerName} className="h-12 mx-auto mb-4" />
          ) : (
            <h2 className="text-xl font-semibold mb-2">{photographerName}</h2>
          )}
        </div>

        {/* Password Form */}
        <div
          className={cn(
            "rounded-2xl p-8 shadow-xl transition-all duration-500 ease-out delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.borderColor}` }}
        >
          <div className="text-center mb-6">
            <div
              className="mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105"
              style={{ backgroundColor: `${primaryColor}15`, border: `1px solid ${primaryColor}30` }}
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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter gallery password"
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 pr-12 text-sm transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-offset-0",
                    error && "animate-shake"
                  )}
                  style={{
                    backgroundColor: colors.bgColor,
                    borderColor: error ? "var(--error)" : colors.borderColor,
                    color: colors.textColor,
                    ["--tw-ring-color" as string]: primaryColor,
                    ["--tw-ring-offset-color" as string]: colors.cardBg,
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:bg-black/5"
                  style={{ color: colors.mutedColor }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-out",
                  error ? "max-h-10 opacity-100 mt-2" : "max-h-0 opacity-0"
                )}
              >
                <p className="text-sm" style={{ color: "var(--error)" }}>
                  {error}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full rounded-lg py-3 text-sm font-medium text-white transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:opacity-90 active:scale-[0.98]"
              )}
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
      <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
    </svg>
  );
}
