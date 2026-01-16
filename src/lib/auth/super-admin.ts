import { auth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Re-export currentUser for convenience
export { clerkCurrentUser as currentUser };

/**
 * Check if the current user is a super admin
 * Uses Clerk's publicMetadata.isSuperAdmin flag
 */
export async function isSuperAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await clerkCurrentUser();
  if (!user) return false;

  return user.publicMetadata?.isSuperAdmin === true;
}

/**
 * Require super admin access - redirects if not authorized
 */
export async function requireSuperAdmin(): Promise<void> {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    redirect("/");
  }
}

/**
 * Get super admin user info if authorized
 */
export async function getSuperAdminUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await clerkCurrentUser();
  if (!user) return null;

  if (user.publicMetadata?.isSuperAdmin !== true) {
    return null;
  }

  return {
    id: userId,
    email: user.emailAddresses[0]?.emailAddress || "",
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    imageUrl: user.imageUrl,
  };
}
