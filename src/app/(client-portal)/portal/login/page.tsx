"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate sending magic link
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setEmailSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute left-1/2 top-0 h-[600px] w-full max-w-[1200px] -translate-x-1/2"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b82f6]">
            <CameraIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">PhotoProOS</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#262626] bg-[#141414] p-8">
          {!emailSent ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-white">Client Portal</h1>
                <p className="mt-2 text-[#a7a7a7]">
                  Access your galleries, property websites, and downloads
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="h-11 w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 text-white placeholder:text-[#7c7c7c] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="h-11 w-full rounded-lg bg-[#3b82f6] font-medium text-white transition-colors hover:bg-[#3b82f6]/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner className="h-4 w-4" />
                      Sending...
                    </span>
                  ) : (
                    "Send magic link"
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-[#7c7c7c]">
                We'll send you a secure link to access your portal
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/10">
                <MailIcon className="h-8 w-8 text-[#22c55e]" />
              </div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="mt-2 text-[#a7a7a7]">
                We've sent a magic link to <span className="font-medium text-white">{email}</span>
              </p>
              <p className="mt-4 text-sm text-[#7c7c7c]">
                Click the link in the email to access your client portal
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="mt-6 text-sm font-medium text-[#3b82f6] hover:underline"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-[#7c7c7c]">
          Powered by{" "}
          <Link href="/" className="font-medium text-[#3b82f6] hover:underline">
            PhotoProOS
          </Link>
        </p>
      </div>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
