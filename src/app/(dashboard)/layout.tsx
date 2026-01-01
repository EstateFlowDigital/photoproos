import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { ToastProvider } from "@/components/ui/toast";
import { prisma } from "@/lib/db";

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
      memberships: true,
    },
  });

  // Check if user has an organization
  if (user.memberships.length === 0) {
    // Create a default organization for new users
    const org = await prisma.organization.create({
      data: {
        name: clerkUser.firstName ? `${clerkUser.firstName}'s Studio` : "My Studio",
        slug: `studio-${user.id.slice(0, 8)}`,
      },
    });

    // Create membership linking user to organization
    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: "owner",
      },
    });
  }

  return (
    <ToastProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </ToastProvider>
  );
}
