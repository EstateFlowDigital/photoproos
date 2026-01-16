"use server";

import { ok, fail, type VoidActionResult } from "@/lib/types/action-result";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth/clerk";
import { disconnectGmailAccount } from "@/lib/integrations/gmail";
import { disconnectOutlookAccount } from "@/lib/integrations/outlook";

interface ConnectedEmailAccount {
  id: string;
  provider: "GMAIL" | "OUTLOOK";
  email: string;
  isActive: boolean;
  lastSyncAt: Date | null;
  errorMessage: string | null;
}

/**
 * Get all connected email accounts for the current organization
 */
export async function getConnectedEmailAccounts(): Promise<{
  success: boolean;
  accounts?: ConnectedEmailAccount[];
  error?: string;
}> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return fail("Unauthorized");
    }

    const accounts = await prisma.emailAccount.findMany({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        provider: true,
        email: true,
        isActive: true,
        lastSyncAt: true,
        errorMessage: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, accounts };
  } catch (error) {
    console.error("Error fetching email accounts:", error);
    return fail("Failed to fetch email accounts");
  }
}

/**
 * Disconnect an email account
 */
export async function disconnectEmailAccount(
  accountId: string
): Promise<VoidActionResult> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return fail("Unauthorized");
    }

    // Verify the account belongs to this organization
    const account = await prisma.emailAccount.findFirst({
      where: {
        id: accountId,
        organizationId: auth.organizationId,
      },
    });

    if (!account) {
      return fail("Account not found");
    }

    // Disconnect based on provider
    if (account.provider === "GMAIL") {
      const success = await disconnectGmailAccount(accountId);
      if (!success) {
        return fail("Failed to disconnect Gmail account");
      }
    } else if (account.provider === "OUTLOOK") {
      const success = await disconnectOutlookAccount(accountId);
      if (!success) {
        return fail("Failed to disconnect Outlook account");
      }
    }

    revalidatePath("/settings/email");
    revalidatePath("/inbox");

    return ok();
  } catch (error) {
    console.error("Error disconnecting email account:", error);
    return fail("Failed to disconnect email account");
  }
}

/**
 * Toggle sync for an email account
 */
export async function toggleEmailAccountSync(
  accountId: string,
  enabled: boolean
): Promise<VoidActionResult> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return fail("Unauthorized");
    }

    // Verify the account belongs to this organization
    const account = await prisma.emailAccount.findFirst({
      where: {
        id: accountId,
        organizationId: auth.organizationId,
      },
    });

    if (!account) {
      return fail("Account not found");
    }

    await prisma.emailAccount.update({
      where: { id: accountId },
      data: { syncEnabled: enabled },
    });

    revalidatePath("/settings/email");

    return ok();
  } catch (error) {
    console.error("Error toggling email sync:", error);
    return fail("Failed to update sync setting");
  }
}

/**
 * Get email account by ID
 */
export async function getEmailAccount(
  accountId: string
): Promise<{ success: boolean; account?: ConnectedEmailAccount; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return fail("Unauthorized");
    }

    const account = await prisma.emailAccount.findFirst({
      where: {
        id: accountId,
        organizationId: auth.organizationId,
      },
      select: {
        id: true,
        provider: true,
        email: true,
        isActive: true,
        lastSyncAt: true,
        errorMessage: true,
      },
    });

    if (!account) {
      return fail("Account not found");
    }

    return { success: true, account };
  } catch (error) {
    console.error("Error fetching email account:", error);
    return fail("Failed to fetch email account");
  }
}
