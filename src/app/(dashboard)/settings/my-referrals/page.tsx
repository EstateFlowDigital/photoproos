export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { MyReferralsClient } from "./my-referrals-client";
import {
  getMyReferralProfile,
  getMyReferralStats,
  getMyReferrals,
  getMyRewards,
  getMyReferralLink,
  getReferralLeaderboard,
} from "@/lib/actions/platform-referrals";

export const metadata: Metadata = {
  title: "My Referrals | Settings",
  description: "Refer photographers to PhotoProOS and earn rewards",
};

export default async function MyReferralsPage() {
  const [profileResult, statsResult, referralsResult, rewardsResult, linkResult, leaderboardResult] =
    await Promise.all([
      getMyReferralProfile(),
      getMyReferralStats(),
      getMyReferrals(),
      getMyRewards(),
      getMyReferralLink(),
      getReferralLeaderboard(10),
    ]);

  const profile = profileResult.success ? profileResult.data : null;
  const stats = statsResult.success ? statsResult.data : null;
  const referrals = referralsResult.success ? referralsResult.data : [];
  const rewards = rewardsResult.success ? rewardsResult.data : [];
  const referralLink = linkResult.success ? linkResult.data : null;
  const leaderboard = leaderboardResult.success ? leaderboardResult.data : [];

  return (
    <div data-element="settings-my-referrals-page">
      <MyReferralsClient
        profile={profile}
        stats={stats}
        referrals={referrals}
        rewards={rewards}
        referralLink={referralLink}
        leaderboard={leaderboard}
      />
    </div>
  );
}
