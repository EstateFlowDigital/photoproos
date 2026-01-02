"use server";

import { getAuthContext, type AuthContext } from "@/lib/auth/clerk";

/**
 * Require authentication for server actions.
 * Throws an error if the user is not authenticated.
 */
export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuthContext();

  if (!auth) {
    throw new Error("Unauthorized: You must be signed in to perform this action.");
  }

  return auth;
}

/**
 * Require authentication and return just the organization ID.
 * Throws an error if the user is not authenticated or has no organization.
 */
export async function requireOrganizationId(): Promise<string> {
  const auth = await requireAuth();
  return auth.organizationId;
}

/**
 * Require authentication and return just the user ID.
 * Throws an error if the user is not authenticated.
 */
export async function requireUserId(): Promise<string> {
  const auth = await requireAuth();
  return auth.userId;
}

/**
 * Require admin or owner role.
 * Throws an error if the user doesn't have sufficient permissions.
 */
export async function requireAdmin(): Promise<AuthContext> {
  const auth = await requireAuth();

  if (auth.role !== "owner" && auth.role !== "admin") {
    throw new Error("Forbidden: You don't have permission to perform this action.");
  }

  return auth;
}

/**
 * Require owner role only.
 * Throws an error if the user is not the owner.
 */
export async function requireOwner(): Promise<AuthContext> {
  const auth = await requireAuth();

  if (auth.role !== "owner") {
    throw new Error("Forbidden: Only the owner can perform this action.");
  }

  return auth;
}
