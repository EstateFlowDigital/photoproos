"use client";

import { useEffect } from "react";
import { processReferralFromCode } from "@/lib/actions/platform-referrals";

/**
 * ReferralProcessor
 *
 * This component runs on the dashboard and checks for a stored referral code
 * in localStorage. If found, it processes the referral and clears the storage.
 *
 * This handles the flow:
 * 1. User visits /sign-up?ref=CODE
 * 2. Referral code is stored in localStorage
 * 3. User signs up via Clerk
 * 4. User is redirected to dashboard
 * 5. This component processes the stored referral code
 */
export function ReferralProcessor() {
  useEffect(() => {
    const processStoredReferral = async () => {
      const referralCode = localStorage.getItem("platformReferralCode");

      if (!referralCode) {
        return;
      }

      try {
        // Process the referral
        const result = await processReferralFromCode(referralCode);

        if (result.success) {
          console.log("Platform referral processed successfully");
        } else {
          // Don't log error for "already processed" cases
          if (!result.error?.includes("already processed")) {
            console.error("Failed to process referral:", result.error);
          }
        }
      } catch (error) {
        console.error("Error processing referral:", error);
      } finally {
        // Always clear the stored code to prevent repeated attempts
        localStorage.removeItem("platformReferralCode");
      }
    };

    processStoredReferral();
  }, []);

  // This component doesn't render anything
  return null;
}
