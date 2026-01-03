import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { ToastProvider } from "@/components/ui/toast";
import { TourProvider } from "@/components/tour";
import { CommandPaletteProvider } from "@/components/command-palette-provider";
import { ReferralProcessor } from "@/components/dashboard/referral-processor";
import { prisma } from "@/lib/db";
import { getDefaultModulesForIndustries } from "@/lib/constants/industries";
import { getUnreadNotificationCount } from "@/lib/actions/notifications";
import { getModulesForIndustries } from "@/lib/constants/industries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId } = await auth();

  // Not authenticated - redirect to sign-in
  if (!clerkUserId) {
    redirect("/sign-in");
  }

  // Ensure user exists in database
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Sync user to database (create or update)
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

  // Check if user has an organization
  let organization;
  if (user.memberships.length === 0) {
    // Create a default organization for new users
    const defaultModules = getDefaultModulesForIndustries(["real_estate"]);
    organization = await prisma.organization.create({
      data: {
        name: clerkUser.firstName ? `${clerkUser.firstName}'s Studio` : "My Studio",
        slug: `studio-${user.id.slice(0, 8)}`,
        industries: ["real_estate"],
        primaryIndustry: "real_estate",
        enabledModules: defaultModules,
      },
      include: {
        onboardingProgress: true,
      },
    });

    // Create membership linking user to organization
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: "owner",
      },
    });

    // Initialize onboarding progress for the new organization
    await prisma.onboardingProgress.create({
      data: {
        organizationId: organization.id,
        currentStep: 1,
      },
    });
  } else {
    // Get the first organization for the user
    organization = user.memberships[0].organization;
  }

  // Ensure onboarding progress record exists
  if (!organization.onboardingProgress) {
    organization = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        onboardingProgress: {
          create: { currentStep: 1 },
        },
      },
      include: {
        onboardingProgress: true,
      },
    });
  }

  // Redirect users with incomplete onboarding to the onboarding flow
  if (!organization.onboardingCompleted) {
    redirect("/onboarding");
  }

  // Get enabled modules (default to all if not set)
  const organizationIndustries = organization.industries as string[] || ["real_estate"];
  const enabledModulesRaw = (organization.enabledModules as string[]) ||
    getDefaultModulesForIndustries(organizationIndustries);
  const availableModules = getModulesForIndustries(organizationIndustries);
  const enabledModules = enabledModulesRaw.filter((m) => availableModules.includes(m));

  // Get unread notification count for badge
  const notificationCountResult = await getUnreadNotificationCount();
  const unreadNotificationCount = notificationCountResult.success ? notificationCountResult.data : 0;

  return (
    <ToastProvider>
      <TourProvider organizationId={organization.id}>
        <CommandPaletteProvider>
          <ReferralProcessor />
          <DashboardLayoutClient
            enabledModules={enabledModules}
            industries={organizationIndustries}
            unreadNotificationCount={unreadNotificationCount}
          >
            {children}
          </DashboardLayoutClient>
        </CommandPaletteProvider>
      </TourProvider>
    </ToastProvider>
  );
}
