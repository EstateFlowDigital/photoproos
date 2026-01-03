export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { MyReferralsClient } from "./my-referrals-client";
import {
  getMyReferralProfile,
  getMyReferralStats,
  getMyReferrals,
  getMyRewards,
  getMyReferralLink,
} from "@/lib/actions/platform-referrals";

export const metadata: Metadata = {
  title: "My Referrals | Settings",
  description: "Refer photographers to ListingLens and earn rewards",
};

export default async function MyReferralsPage() {
  const [profileResult, statsResult, referralsResult, rewardsResult, linkResult] =
    await Promise.all([
      getMyReferralProfile(),
      getMyReferralStats(),
      getMyReferrals(),
      getMyRewards(),
      getMyReferralLink(),
    ]);

  const profile = profileResult.success ? profileResult.data : null;
  const stats = statsResult.success ? statsResult.data : null;
  const referrals = referralsResult.success ? referralsResult.data : [];
  const rewards = rewardsResult.success ? rewardsResult.data : [];
  const referralLink = linkResult.success ? linkResult.data : null;

  return (
    <MyReferralsClient
      profile={profile}
      stats={stats}
      referrals={referrals}
      rewards={rewards}
      referralLink={referralLink}
    />
  );
}
