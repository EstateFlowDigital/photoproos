import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { ToastProvider } from "@/components/ui/toast";
import { TourProvider } from "@/components/tour";
import { CommandPaletteProvider } from "@/components/command-palette-provider";
import { prisma } from "@/lib/db";
import { getDefaultModulesForIndustries } from "@/lib/constants/industries";

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
          organization: true,
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
    });

    // Create membership linking user to organization
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: "owner",
      },
    });
  } else {
    // Get the first organization for the user
    organization = user.memberships[0].organization;
  }

  // Get enabled modules (default to all if not set)
  const enabledModules = (organization.enabledModules as string[]) ||
    getDefaultModulesForIndustries(["real_estate"]);

  return (
    <ToastProvider>
      <TourProvider organizationId={organization.id}>
        <CommandPaletteProvider>
          <DashboardLayoutClient enabledModules={enabledModules}>
            {children}
          </DashboardLayoutClient>
        </CommandPaletteProvider>
      </TourProvider>
    </ToastProvider>
  );
}
