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
import { FONT_OPTIONS, DENSITY_OPTIONS, FONT_SIZE_OPTIONS } from "@/lib/appearance-types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId, orgId } = await auth();

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

  // Get user's appearance preferences
  const fontOption = FONT_OPTIONS.find((f) => f.id === user.fontFamily) || FONT_OPTIONS[0];
  const densityOption = DENSITY_OPTIONS.find((d) => d.id === user.density) || DENSITY_OPTIONS[1];
  const fontSizeOption = FONT_SIZE_OPTIONS.find((f) => f.id === user.fontSize) || FONT_SIZE_OPTIONS[1];
  const userAppearance = {
    dashboardAccent: user.dashboardAccent || "#3b82f6",
    sidebarCompact: user.sidebarCompact || false,
    fontFamily: fontOption.fontFamily,
    densityScale: densityOption.scale,
    fontSizeScale: fontSizeOption.scale,
    highContrast: user.highContrast || false,
  };

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
        clerkOrganizationId: orgId || null,
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
      include: {
        onboardingProgress: true,
      },
    });
    if (refreshedOrganization) {
      organization = refreshedOrganization;
    }
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
          {/* Apply user's appearance preferences */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                :root, [data-theme="dark"], [data-theme="light"] {
                  --primary: ${userAppearance.dashboardAccent};
                  --primary-hover: ${userAppearance.dashboardAccent}e6;
                  --font-family: ${userAppearance.fontFamily};
                  --density-scale: ${userAppearance.densityScale};
                  --font-size-scale: ${userAppearance.fontSizeScale};
                  --card-padding: calc(24px * ${userAppearance.densityScale});
                  --section-gap: calc(24px * ${userAppearance.densityScale});
                  --item-gap: calc(16px * ${userAppearance.densityScale});
                }
                body {
                  font-family: var(--font-family);
                  font-size: calc(16px * ${userAppearance.fontSizeScale});
                }
                ${userAppearance.highContrast ? `
                /* High Contrast Mode */
                :root, [data-theme="dark"] {
                  --foreground: #ffffff;
                  --foreground-secondary: #e5e5e5;
                  --foreground-muted: #d4d4d4;
                  --muted-foreground: #d4d4d4;
                  --card-border: rgba(255, 255, 255, 0.25);
                  --border: rgba(255, 255, 255, 0.25);
                  --border-emphasis: rgba(255, 255, 255, 0.4);
                }
                [data-theme="light"] {
                  --foreground: #000000;
                  --foreground-secondary: #1a1a1a;
                  --foreground-muted: #333333;
                  --muted-foreground: #333333;
                  --card-border: rgba(0, 0, 0, 0.25);
                  --border: rgba(0, 0, 0, 0.25);
                  --border-emphasis: rgba(0, 0, 0, 0.4);
                }
                ` : ''}
              `,
            }}
          />
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
