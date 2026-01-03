import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function ReferralRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Verify the referral code exists
  const referrer = await prisma.platformReferrer.findUnique({
    where: { referralCode: code },
    select: { isActive: true },
  });

  if (referrer?.isActive) {
    // Redirect to sign-up with the referral code
    redirect(`/sign-up?ref=${code}`);
  } else {
    // Invalid or inactive code, redirect to regular sign-up
    redirect("/sign-up");
  }
}
