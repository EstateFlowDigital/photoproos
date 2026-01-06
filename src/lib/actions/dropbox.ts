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
import { ok, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// TYPES
// ============================================================================

interface DropboxTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

/**
 * Refresh the Dropbox access token using the refresh token
 */
async function refreshDropboxToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;

  if (!appKey || !appSecret) {
    console.error("Dropbox credentials not configured for token refresh");
    return null;
  }

  try {
    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: appKey,
        client_secret: appSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to refresh Dropbox token:", errorText);
      return null;
    }

    const tokens: DropboxTokenResponse = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token, // Dropbox may return a new refresh token
    };
  } catch (error) {
    console.error("Error refreshing Dropbox token:", error);
    return null;
  }
}

/**
 * Get a valid access token for the organization, refreshing if necessary.
 * Returns the access token and updates the database if refreshed.
 */
async function getValidAccessToken(
  organizationId: string
): Promise<string | null> {
  const config = await prisma.dropboxIntegration.findUnique({
    where: { organizationId },
    select: {
      id: true,
      accessToken: true,
      refreshToken: true,
      isActive: true,
    },
  });

  if (!config || !config.isActive) {
    return null;
  }

  // First, try using the existing access token
  const testResult = await testDropboxConnection(config.accessToken);
  if (testResult.success) {
    return config.accessToken;
  }

  // Access token is invalid/expired - try to refresh
  if (!config.refreshToken) {
    console.error("No refresh token available, user needs to reconnect");
    // Mark integration as inactive since we can't refresh
    await prisma.dropboxIntegration.update({
      where: { id: config.id },
      data: {
        isActive: false,
        lastSyncError: "Session expired. Please reconnect to Dropbox.",
      },
    });
    return null;
  }

  // Attempt to refresh the token
  const newTokens = await refreshDropboxToken(config.refreshToken);
  if (!newTokens) {
    // Refresh failed - mark as inactive
    await prisma.dropboxIntegration.update({
      where: { id: config.id },
      data: {
        isActive: false,
        lastSyncError: "Failed to refresh session. Please reconnect to Dropbox.",
      },
    });
    return null;
  }

  // Update database with new tokens
  await prisma.dropboxIntegration.update({
    where: { id: config.id },
    data: {
      accessToken: newTokens.accessToken,
      // Only update refresh token if a new one was provided
      ...(newTokens.refreshToken && { refreshToken: newTokens.refreshToken }),
      lastSyncError: null,
    },
  });

  return newTokens.accessToken;
}

/**
 * Get a DropboxClient with a valid access token for the organization.
 * Automatically handles token refresh if needed.
 */
async function getDropboxClient(
  organizationId: string
): Promise<DropboxClient | null> {
  const accessToken = await getValidAccessToken(organizationId);
  if (!accessToken) {
    return null;
  }
  return new DropboxClient(accessToken);
}

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
      select: { isActive: true },
    });

    if (!config || !config.isActive) {
      return { success: true, data: { connected: false } };
    }

    // This will automatically refresh the token if needed
    const accessToken = await getValidAccessToken(auth.organizationId);
    if (!accessToken) {
      return { success: true, data: { connected: false } };
    }

    const result = await testDropboxConnection(accessToken);
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

    // This will automatically refresh the token if needed
    const accessToken = await getValidAccessToken(auth.organizationId);
    if (!accessToken) {
      return { success: false, error: "Dropbox session expired. Please reconnect." };
    }

    const result = await testDropboxConnection(accessToken);
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
      select: { syncFolder: true },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    const client = await getDropboxClient(auth.organizationId);
    if (!client) {
      return { success: false, error: "Dropbox session expired. Please reconnect." };
    }

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
      select: { syncFolder: true },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    const client = await getDropboxClient(auth.organizationId);
    if (!client) {
      return { success: false, error: "Dropbox session expired. Please reconnect." };
    }

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

    const client = await getDropboxClient(auth.organizationId);
    if (!client) {
      return { success: false, error: "Dropbox session expired. Please reconnect." };
    }

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
      select: { syncFolder: true },
    });

    if (!config) {
      return { success: false, error: "Dropbox integration not configured" };
    }

    const client = await getDropboxClient(auth.organizationId);
    if (!client) {
      return { success: false, error: "Dropbox session expired. Please reconnect." };
    }

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

// ============================================================================
// WEBHOOK SYNC OPERATIONS (Called from webhook, no user auth required)
// ============================================================================

/**
 * Process Dropbox webhook notification for changed files.
 * Called from the webhook endpoint when Dropbox notifies of changes.
 */
export async function syncDropboxChangesForAccount(
  dropboxAccountId: string
): Promise<{ success: boolean; error?: string; synced?: number }> {
  try {
    // Look up the organization that owns this Dropbox account
    const integration = await prisma.dropboxIntegration.findFirst({
      where: {
        accountId: dropboxAccountId,
        isActive: true,
        syncEnabled: true,
        autoSync: true,
      },
      select: {
        id: true,
        organizationId: true,
        accessToken: true,
        refreshToken: true,
        syncFolder: true,
        cursor: true,
      },
    });

    if (!integration) {
      console.log(`[Dropbox Sync] No active integration found for account ${dropboxAccountId}`);
      return { success: true, synced: 0 };
    }

    console.log(`[Dropbox Sync] Processing changes for org ${integration.organizationId}`);

    // Get a valid access token (refresh if needed)
    let accessToken = integration.accessToken;
    const testResult = await testDropboxConnection(accessToken);

    if (!testResult.success && integration.refreshToken) {
      const newTokens = await refreshDropboxTokenInternal(integration.refreshToken);
      if (newTokens) {
        accessToken = newTokens.accessToken;
        await prisma.dropboxIntegration.update({
          where: { id: integration.id },
          data: {
            accessToken: newTokens.accessToken,
            ...(newTokens.refreshToken && { refreshToken: newTokens.refreshToken }),
          },
        });
      } else {
        await prisma.dropboxIntegration.update({
          where: { id: integration.id },
          data: {
            lastSyncError: "Failed to refresh token. Please reconnect Dropbox.",
          },
        });
        return { success: false, error: "Token refresh failed" };
      }
    }

    const client = new DropboxClient(accessToken);

    // Get changes using cursor (delta sync) or list folder for initial sync
    let changes: DropboxEntry[];
    let newCursor: string;

    if (integration.cursor) {
      // Use cursor to get only changes since last sync
      const result = await client.listFolderContinue(integration.cursor);
      changes = result.entries;
      newCursor = result.cursor;

      // Handle pagination
      let hasMore = result.has_more;
      while (hasMore) {
        const moreResults = await client.listFolderContinue(newCursor);
        changes.push(...moreResults.entries);
        newCursor = moreResults.cursor;
        hasMore = moreResults.has_more;
      }
    } else {
      // Initial sync - list all files in sync folder
      const result = await client.listFolder(integration.syncFolder, true);
      changes = result.entries;
      newCursor = result.cursor;

      // Handle pagination
      let hasMore = result.has_more;
      while (hasMore) {
        const moreResults = await client.listFolderContinue(newCursor);
        changes.push(...moreResults.entries);
        newCursor = moreResults.cursor;
        hasMore = moreResults.has_more;
      }
    }

    console.log(`[Dropbox Sync] Found ${changes.length} changes for org ${integration.organizationId}`);

    // Process changes
    let syncedCount = 0;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic"];

    for (const entry of changes) {
      // Skip folders and deleted items
      if (entry[".tag"] === "folder") continue;
      if (entry[".tag"] === "deleted") {
        // Handle deletion - find and mark asset as deleted
        await handleDropboxFileDeletion(integration.organizationId, entry.path_lower);
        continue;
      }

      // Only process image files
      const fileEntry = entry as DropboxEntry & { ".tag": "file" };
      const ext = fileEntry.name.toLowerCase().substring(fileEntry.name.lastIndexOf("."));
      if (!imageExtensions.includes(ext)) continue;

      // Process new/modified image file
      const processed = await processDropboxImageFile(
        client,
        integration.organizationId,
        integration.syncFolder,
        fileEntry
      );
      if (processed) syncedCount++;
    }

    // Update cursor and sync timestamp
    await prisma.dropboxIntegration.update({
      where: { id: integration.id },
      data: {
        cursor: newCursor,
        lastSyncAt: new Date(),
        lastSyncError: null,
      },
    });

    console.log(`[Dropbox Sync] Synced ${syncedCount} files for org ${integration.organizationId}`);
    return { success: true, synced: syncedCount };
  } catch (error) {
    console.error("[Dropbox Sync] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sync failed"
    };
  }
}

/**
 * Internal token refresh function (no auth context required)
 */
async function refreshDropboxTokenInternal(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;

  if (!appKey || !appSecret) {
    return null;
  }

  try {
    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: appKey,
        client_secret: appSecret,
      }),
    });

    if (!response.ok) return null;

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  } catch {
    return null;
  }
}

/**
 * Handle file deletion from Dropbox - find matching asset and soft delete
 */
async function handleDropboxFileDeletion(
  organizationId: string,
  dropboxPath: string
): Promise<void> {
  // Find asset by matching the Dropbox path stored in metadata
  const asset = await prisma.asset.findFirst({
    where: {
      project: { organizationId },
      // Store Dropbox path in exifData.dropboxPath
      exifData: {
        path: ["dropboxPath"],
        equals: dropboxPath,
      },
    },
  });

  if (asset) {
    // Soft delete by setting deletedAt (if your schema supports it)
    // Or just log for now - actual deletion requires more consideration
    console.log(`[Dropbox Sync] File deleted in Dropbox: ${dropboxPath}`);
  }
}

/**
 * Process a new/modified image file from Dropbox
 */
async function processDropboxImageFile(
  client: DropboxClient,
  organizationId: string,
  syncFolder: string,
  file: DropboxEntry & { ".tag": "file" }
): Promise<boolean> {
  try {
    // Parse the folder structure to determine which gallery this belongs to
    // Expected structure: /PhotoProOS/Galleries/GalleryName_id/photo.jpg
    const relativePath = file.path_lower.replace(syncFolder.toLowerCase(), "");
    const pathParts = relativePath.split("/").filter(Boolean);

    // Must be in Galleries folder with at least gallery folder + filename
    if (pathParts.length < 3 || pathParts[0] !== "galleries") {
      return false;
    }

    const galleryFolderName = pathParts[1];

    // Extract gallery ID from folder name (format: GalleryName_abcd1234)
    const idMatch = galleryFolderName.match(/_([a-z0-9]{8})$/);
    if (!idMatch) {
      // Try to find gallery by name match
      const gallery = await prisma.project.findFirst({
        where: {
          organizationId,
          name: { contains: galleryFolderName.replace(/_/g, " "), mode: "insensitive" },
        },
        select: { id: true },
      });
      if (!gallery) return false;

      return await downloadAndCreateAsset(client, organizationId, gallery.id, file);
    }

    // Find gallery by partial ID
    const gallery = await prisma.project.findFirst({
      where: {
        organizationId,
        id: { startsWith: idMatch[1] },
      },
      select: { id: true },
    });

    if (!gallery) return false;

    return await downloadAndCreateAsset(client, organizationId, gallery.id, file);
  } catch (error) {
    console.error(`[Dropbox Sync] Error processing file ${file.path_display}:`, error);
    return false;
  }
}

/**
 * Download file from Dropbox and create asset in R2 + database
 */
async function downloadAndCreateAsset(
  client: DropboxClient,
  organizationId: string,
  galleryId: string,
  file: DropboxEntry & { ".tag": "file" }
): Promise<boolean> {
  // Import storage functions dynamically to avoid circular deps
  const { uploadFile, generateFileKey, getPublicUrl } = await import("@/lib/storage");

  try {
    // Check if asset already exists (by Dropbox path)
    const existing = await prisma.asset.findFirst({
      where: {
        projectId: galleryId,
        exifData: {
          path: ["dropboxPath"],
          equals: file.path_lower,
        },
      },
    });

    if (existing) {
      // Check if file was modified (using content_hash)
      const existingHash = (existing.exifData as Record<string, unknown>)?.dropboxContentHash;
      if (existingHash === file.content_hash) {
        return false; // File unchanged
      }
      // File was modified - could update here, but skip for now
      return false;
    }

    // Download file from Dropbox
    const fileContent = await client.downloadFile(file.path_display);
    const buffer = Buffer.from(fileContent);

    // Determine content type from extension
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".heic": "image/heic",
    };
    const contentType = contentTypeMap[ext] || "image/jpeg";

    // Generate key and upload to R2
    const key = generateFileKey(organizationId, galleryId, file.name);
    await uploadFile(key, buffer, contentType);

    // Get current asset count for sortOrder
    const assetCount = await prisma.asset.count({
      where: { projectId: galleryId },
    });

    // Create asset record
    await prisma.asset.create({
      data: {
        projectId: galleryId,
        filename: file.name,
        originalUrl: getPublicUrl(key),
        mimeType: contentType,
        sizeBytes: file.size || buffer.byteLength,
        sortOrder: assetCount,
        exifData: {
          dropboxPath: file.path_lower,
          dropboxContentHash: file.content_hash,
          syncedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`[Dropbox Sync] Created asset: ${file.name} in gallery ${galleryId}`);
    return true;
  } catch (error) {
    console.error(`[Dropbox Sync] Failed to create asset for ${file.name}:`, error);
    return false;
  }
}
