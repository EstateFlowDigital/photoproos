"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { trackReferralClick } from "@/lib/actions/platform-referrals";

function SignUpContent() {
  const searchParams = useSearchParams();
  const referralCode = searchParams?.get("ref") ?? null;

  useEffect(() => {
    if (referralCode) {
      // Store referral code in localStorage for later processing
      localStorage.setItem("platformReferralCode", referralCode);

      // Track the click server-side
      trackReferralClick(referralCode).catch(console.error);
    }
  }, [referralCode]);

  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "w-full",
        },
      }}
      fallbackRedirectUrl="/dashboard"
      signInUrl="/sign-in"
    />
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
