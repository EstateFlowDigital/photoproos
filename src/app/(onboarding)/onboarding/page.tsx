import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get organization and its onboarding progress
  let organization = null;
  let onboardingProgress = null;
  let user = null;

  if (orgId) {
    organization = await prisma.organization.findFirst({
      where: { clerkOrganizationId: orgId },
      include: {
        onboardingProgress: true,
      },
    });

    if (organization) {
      onboardingProgress = organization.onboardingProgress;

      // If onboarding is already completed, redirect to dashboard
      if (organization.onboardingCompleted) {
        redirect("/");
      }
    }
  }

  // Get user info
  user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      phone: true,
    },
  });

  return (
    <OnboardingWizard
      organization={organization}
      onboardingProgress={onboardingProgress}
      user={user}
    />
  );
}
