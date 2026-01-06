import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getDefaultModulesForIndustries } from "@/lib/constants/industries";

export default async function OnboardingPage() {
  const { userId: clerkUserId, orgId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Ensure user exists and load memberships
  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
      avatarUrl: clerkUser.imageUrl || null,
    },
    create: {
      clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
      avatarUrl: clerkUser.imageUrl || null,
    },
    include: {
      memberships: {
        include: {
          organization: {
            include: {
              onboardingProgress: true,
            },
          },
        },
      },
    },
  });

  // Resolve organization (prefer Clerk org when present)
  type OrganizationType = Awaited<ReturnType<typeof prisma.organization.findFirst<{
    include: { onboardingProgress: true };
  }>>>;

  let organization: OrganizationType = orgId
    ? await prisma.organization.findFirst({
        where: { clerkOrganizationId: orgId },
        include: { onboardingProgress: true },
      })
    : null;

  if (!organization) {
    if (user.memberships.length === 0) {
      const defaultModules = getDefaultModulesForIndustries(["real_estate"]);
      organization = await prisma.organization.create({
        data: {
          name: clerkUser.firstName ? `${clerkUser.firstName}'s Studio` : "My Studio",
          slug: `studio-${user.id.slice(0, 8)}`,
          industries: ["real_estate"],
          primaryIndustry: "real_estate",
          enabledModules: defaultModules,
          clerkOrganizationId: orgId || null,
        },
        include: { onboardingProgress: true },
      });

      await prisma.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: "owner",
        },
      });

      await prisma.onboardingProgress.create({
        data: {
          organizationId: organization.id,
          currentStep: 1,
        },
      });
    } else {
      organization = user.memberships[0].organization;
    }
  }

  if (orgId && organization && !organization.clerkOrganizationId) {
    organization = await prisma.organization.update({
      where: { id: organization.id },
      data: { clerkOrganizationId: orgId },
      include: { onboardingProgress: true },
    });
  }

  if (organization && !organization.onboardingProgress) {
    await prisma.onboardingProgress.upsert({
      where: { organizationId: organization.id },
      update: {},
      create: {
        organizationId: organization.id,
        currentStep: 1,
      },
    });

    const refreshedOrganization = await prisma.organization.findUnique({
      where: { id: organization.id },
      include: { onboardingProgress: true },
    });

    if (refreshedOrganization) {
      organization = refreshedOrganization;
    }
  }

  // If onboarding is already completed, redirect to dashboard
  if (organization?.onboardingCompleted) {
    redirect("/dashboard");
  }

  const onboardingProgress = organization?.onboardingProgress ?? null;
  const userInfo = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
  };

  return (
    <OnboardingWizard
      organization={organization}
      onboardingProgress={onboardingProgress}
      user={userInfo}
    />
  );
}
