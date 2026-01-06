"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { ok } from "@/lib/types/action-result";

// ============================================================================
// API KEY ACTIONS
// ============================================================================

/**
 * Generate a cryptographically secure API key
 */
function generateApiKey(): string {
  // Generate 32 random bytes and encode as base64url
  const bytes = crypto.randomBytes(32);
  const key = bytes.toString("base64url");
  return `sk_live_${key}`;
}

/**
 * Hash an API key for secure storage
 */
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Extract the prefix from an API key for identification
 */
function getKeyPrefix(key: string): string {
  // Return first 12 characters plus "..." for display
  return key.substring(0, 16);
}

/**
 * Get all API keys for the current organization
 */
export async function getApiKeys() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return { success: true, apiKeys };
  } catch (error) {
    console.error("Failed to get API keys:", error);
    return { success: false, error: "Failed to fetch API keys" };
  }
}

/**
 * Generate a new API key
 */
export async function generateNewApiKey(params: {
  name: string;
  scopes?: string[];
  expiresAt?: Date;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Generate the key
    const fullKey = generateApiKey();
    const keyHash = hashApiKey(fullKey);
    const keyPrefix = getKeyPrefix(fullKey);

    // Create the key record (never store the full key, only the hash)
    const apiKey = await prisma.apiKey.create({
      data: {
        organizationId: organization.id,
        name: params.name,
        keyPrefix,
        keyHash,
        scopes: params.scopes || ["read", "write"],
        expiresAt: params.expiresAt,
      },
    });

    revalidatePath("/settings/integrations");

    // Return the full key ONLY on creation - this is the only time it's visible
    return {
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        fullKey, // Only returned once, on creation
        scopes: apiKey.scopes,
        createdAt: apiKey.createdAt,
      },
    };
  } catch (error) {
    console.error("Failed to generate API key:", error);
    return { success: false, error: "Failed to generate API key" };
  }
}

/**
 * Revoke (deactivate) an API key
 */
export async function revokeApiKey(keyId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify the key belongs to this organization
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.organizationId !== organization.id) {
      return { success: false, error: "API key not found" };
    }

    // Soft delete by setting isActive to false
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    revalidatePath("/settings/integrations");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to revoke API key:", error);
    return { success: false, error: "Failed to revoke API key" };
  }
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(keyId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify the key belongs to this organization
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.organizationId !== organization.id) {
      return { success: false, error: "API key not found" };
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    revalidatePath("/settings/integrations");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return { success: false, error: "Failed to delete API key" };
  }
}

/**
 * Validate an API key (for use in API routes)
 */
export async function validateApiKey(apiKeyValue: string) {
  try {
    const keyHash = hashApiKey(apiKeyValue);

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        keyHash,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!apiKey) {
      return { valid: false, error: "Invalid API key" };
    }

    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false, error: "API key has expired" };
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      valid: true,
      organizationId: apiKey.organizationId,
      organization: apiKey.organization,
      scopes: apiKey.scopes,
    };
  } catch (error) {
    console.error("Failed to validate API key:", error);
    return { valid: false, error: "Failed to validate API key" };
  }
}

/**
 * Update API key name or scopes
 */
export async function updateApiKey(
  keyId: string,
  params: {
    name?: string;
    scopes?: string[];
  }
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify the key belongs to this organization
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.organizationId !== organization.id) {
      return { success: false, error: "API key not found" };
    }

    const updated = await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        name: params.name,
        scopes: params.scopes,
      },
    });

    revalidatePath("/settings/integrations");
    return { success: true, apiKey: updated };
  } catch (error) {
    console.error("Failed to update API key:", error);
    return { success: false, error: "Failed to update API key" };
  }
}
