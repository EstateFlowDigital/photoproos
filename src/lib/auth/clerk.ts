import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export interface AuthContext {
  userId: string;
  clerkUserId: string;
  organizationId: string;
  organizationSlug: string;
  role: "owner" | "admin" | "member";
}

/**
 * Get the current authenticated user and organization context.
 * Returns null if not authenticated or no organization selected.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId: clerkUserId, orgId: clerkOrgId, orgRole } = await auth();

  if (!clerkUserId) {
    return null;
  }

  // Get user from database
  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      memberships: {
        include: {
          organization: true,
        },
      },
    },
  });

  // If user not found by Clerk ID, try to find and link by email
  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser?.emailAddresses?.[0]?.emailAddress) {
      const email = clerkUser.emailAddresses[0].emailAddress;

      // Find user by email and update their Clerk ID
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link the existing user to this Clerk account
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            clerkUserId,
            fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || existingUser.fullName,
            avatarUrl: clerkUser.imageUrl || existingUser.avatarUrl,
          },
          include: {
            memberships: {
              include: {
                organization: true,
              },
            },
          },
        });
      } else {
        // Create a new user with default organization
        user = await prisma.user.create({
          data: {
            clerkUserId,
            email,
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
      }
    }
  }

  if (!user) {
    return null;
  }

  // If organization is selected in Clerk, use that
  if (clerkOrgId) {
    const organization = await prisma.organization.findUnique({
      where: { clerkOrganizationId: clerkOrgId },
    });

    if (organization) {
      const membership = user.memberships.find(
        (m) => m.organizationId === organization.id
      );

      return {
        userId: user.id,
        clerkUserId: user.clerkUserId,
        organizationId: organization.id,
        organizationSlug: organization.slug,
        role: membership?.role || "member",
      };
    }
  }

  // Otherwise, use the first organization the user belongs to
  const firstMembership = user.memberships[0];
  if (!firstMembership) {
    return null;
  }

  return {
    userId: user.id,
    clerkUserId: user.clerkUserId,
    organizationId: firstMembership.organizationId,
    organizationSlug: firstMembership.organization.slug,
    role: firstMembership.role,
  };
}

/**
 * Get the current user's full profile from Clerk
 */
export async function getCurrentUser() {
  return await currentUser();
}

/**
 * Ensure the user exists in our database (create if needed)
 */
export async function ensureUserExists(clerkUserId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

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
  });

  return user;
}
