"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth/clerk";
import { disconnectGmailAccount } from "@/lib/integrations/gmail";

export interface ConnectedEmailAccount {
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
      return { success: false, error: "Unauthorized" };
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
    return { success: false, error: "Failed to fetch email accounts" };
  }
}

/**
 * Disconnect an email account
 */
export async function disconnectEmailAccount(
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the account belongs to this organization
    const account = await prisma.emailAccount.findFirst({
      where: {
        id: accountId,
        organizationId: auth.organizationId,
      },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Disconnect based on provider
    if (account.provider === "GMAIL") {
      const success = await disconnectGmailAccount(accountId);
      if (!success) {
        return { success: false, error: "Failed to disconnect Gmail account" };
      }
    } else if (account.provider === "OUTLOOK") {
      // TODO: Implement Outlook disconnect
      await prisma.emailAccount.delete({
        where: { id: accountId },
      });
    }

    revalidatePath("/settings/email");
    revalidatePath("/inbox");

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting email account:", error);
    return { success: false, error: "Failed to disconnect email account" };
  }
}

/**
 * Toggle sync for an email account
 */
export async function toggleEmailAccountSync(
  accountId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the account belongs to this organization
    const account = await prisma.emailAccount.findFirst({
      where: {
        id: accountId,
        organizationId: auth.organizationId,
      },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    await prisma.emailAccount.update({
      where: { id: accountId },
      data: { syncEnabled: enabled },
    });

    revalidatePath("/settings/email");

    return { success: true };
  } catch (error) {
    console.error("Error toggling email sync:", error);
    return { success: false, error: "Failed to update sync setting" };
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
      return { success: false, error: "Unauthorized" };
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
      return { success: false, error: "Account not found" };
    }

    return { success: true, account };
  } catch (error) {
    console.error("Error fetching email account:", error);
    return { success: false, error: "Failed to fetch email account" };
  }
}
