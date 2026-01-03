"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";
import {
  DropboxClient,
  testDropboxConnection,
  type DropboxAccountInfo,
  type DropboxEntry,
} from "@/lib/integrations/dropbox";

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type DropboxConfig = {
  id: string;
  organizationId: string;
  accountId: string;
  email: string;
  displayName: string;
  syncEnabled: boolean;
  syncFolder: string;
  autoSync: boolean;
  lastSyncAt: Date | null;
  lastSyncError: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getDropboxConfig(): Promise<ActionResult<DropboxConfig | null>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        organizationId: true,
        accountId: true,
        email: true,
        displayName: true,
        syncEnabled: true,
        syncFolder: true,
        autoSync: true,
        lastSyncAt: true,
        lastSyncError: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: config };
  } catch (error) {
    console.error("Error getting Dropbox config:", error);
    return { success: false, error: "Failed to get Dropbox configuration" };
  }
}

export async function getDropboxConnectionStatus(): Promise<
  ActionResult<{ connected: boolean; account?: DropboxAccountInfo }>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { accessToken: true, isActive: true },
    });

    if (!config || !config.isActive) {
      return { success: true, data: { connected: false } };
    }

    const result = await testDropboxConnection(config.accessToken);
    if (!result.success) {
      return { success: true, data: { connected: false } };
    }

    return {
      success: true,
      data: { connected: true, account: result.account },
    };
  } catch (error) {
    console.error("Error checking Dropbox connection:", error);
    return { success: false, error: "Failed to check connection status" };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function saveDropboxConfig(data: {
  accessToken: string;
  syncFolder?: string;
  autoSync?: boolean;
}): Promise<ActionResult<DropboxConfig>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate the access token by getting account info
    const result = await testDropboxConnection(data.accessToken);
    if (!result.success || !result.account) {
      return { success: false, error: result.error || "Invalid access token" };
    }

    const account = result.account;

    const existing = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    let config;
    if (existing) {
      config = await prisma.dropboxIntegration.update({
        where: { id: existing.id },
        data: {
          accessToken: data.accessToken,
          accountId: account.account_id,
          email: account.email,
          displayName: account.name.display_name,
          syncFolder: data.syncFolder ?? existing.syncFolder,
          autoSync: data.autoSync ?? existing.autoSync,
          isActive: true,
        },
      });
    } else {
      config = await prisma.dropboxIntegration.create({
        data: {
          organizationId: auth.organizationId,
          accessToken: data.accessToken,
          accountId: account.account_id,
          email: account.email,
          displayName: account.name.display_name,
          syncFolder: data.syncFolder ?? "/PhotoProOS",
          autoSync: data.autoSync ?? true,
          isActive: true,
        },
      });
    }

    const configResult: DropboxConfig = {
      id: config.id,
      organizationId: config.organizationId,
      accountId: config.accountId,
      email: config.email,
      displayName: config.displayName,
      syncEnabled: config.syncEnabled,
      syncFolder: config.syncFolder,
      autoSync: config.autoSync,
      lastSyncAt: config.lastSyncAt,
      lastSyncError: config.lastSyncError,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };

    revalidatePath("/settings/dropbox");
    return { success: true, data: configResult };
  } catch (error) {
    console.error("Error saving Dropbox config:", error);
    return { success: false, error: "Failed to save Dropbox configuration" };
  }
}

export async function updateDropboxSettings(data: {
  syncEnabled?: boolean;
  syncFolder?: string;
  autoSync?: boolean;
}): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    await prisma.dropboxIntegration.update({
      where: { id: config.id },
      data: {
        syncEnabled: data.syncEnabled,
        syncFolder: data.syncFolder,
        autoSync: data.autoSync,
      },
    });

    revalidatePath("/settings/dropbox");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating Dropbox settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function toggleDropboxIntegration(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    await prisma.dropboxIntegration.update({
      where: { id: config.id },
      data: { isActive: !config.isActive },
    });

    revalidatePath("/settings/dropbox");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error toggling Dropbox integration:", error);
    return { success: false, error: "Failed to toggle integration" };
  }
}

export async function testDropboxIntegration(): Promise<ActionResult<{ account: DropboxAccountInfo }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { accessToken: true },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    const result = await testDropboxConnection(config.accessToken);
    if (!result.success || !result.account) {
      return { success: false, error: result.error || "Connection failed" };
    }

    return { success: true, data: { account: result.account } };
  } catch (error) {
    console.error("Error testing Dropbox connection:", error);
    return { success: false, error: "Failed to test connection" };
  }
}

export async function deleteDropboxIntegration(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.dropboxIntegration.delete({
      where: { organizationId: auth.organizationId },
    });

    revalidatePath("/settings/dropbox");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting Dropbox integration:", error);
    return { success: false, error: "Failed to delete integration" };
  }
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

export async function listDropboxFolder(
  path: string = ""
): Promise<ActionResult<DropboxEntry[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { accessToken: true, syncFolder: true },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    const client = new DropboxClient(config.accessToken);
    const fullPath = path || config.syncFolder;
    const entries = await client.listAllFiles(fullPath);

    return { success: true, data: entries };
  } catch (error) {
    console.error("Error listing Dropbox folder:", error);
    return { success: false, error: "Failed to list folder" };
  }
}

export async function createDropboxFolder(
  folderName: string,
  parentPath?: string
): Promise<ActionResult<{ path: string }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { accessToken: true, syncFolder: true },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    const client = new DropboxClient(config.accessToken);
    const basePath = parentPath || config.syncFolder;
    const fullPath = `${basePath}/${folderName}`;

    const folder = await client.createFolder(fullPath);

    return { success: true, data: { path: folder?.path_display || fullPath } };
  } catch (error) {
    console.error("Error creating Dropbox folder:", error);
    return { success: false, error: "Failed to create folder" };
  }
}

export async function getDropboxDownloadLink(
  path: string
): Promise<ActionResult<{ link: string }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { accessToken: true },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    const client = new DropboxClient(config.accessToken);
    const link = await client.getTemporaryLink(path);

    return { success: true, data: { link } };
  } catch (error) {
    console.error("Error getting download link:", error);
    return { success: false, error: "Failed to get download link" };
  }
}

export async function ensureDropboxRootFolder(): Promise<ActionResult<{ path: string }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.dropboxIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { accessToken: true, syncFolder: true },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    const client = new DropboxClient(config.accessToken);

    // Create root folder and subfolders
    await client.ensureFolder(config.syncFolder);
    await client.ensureFolder(`${config.syncFolder}/Galleries`);
    await client.ensureFolder(`${config.syncFolder}/Clients`);
    await client.ensureFolder(`${config.syncFolder}/Exports`);

    return { success: true, data: { path: config.syncFolder } };
  } catch (error) {
    console.error("Error ensuring root folder:", error);
    return { success: false, error: "Failed to create folder structure" };
  }
}

// ============================================================================
// SYNC OPERATIONS
// ============================================================================

export async function updateSyncCursor(cursor: string): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.dropboxIntegration.update({
      where: { organizationId: auth.organizationId },
      data: {
        cursor,
        lastSyncAt: new Date(),
        lastSyncError: null,
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating sync cursor:", error);
    return { success: false, error: "Failed to update sync cursor" };
  }
}

export async function recordSyncError(errorMessage: string): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.dropboxIntegration.update({
      where: { organizationId: auth.organizationId },
      data: {
        lastSyncError: errorMessage,
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error recording sync error:", error);
    return { success: false, error: "Failed to record error" };
  }
}
