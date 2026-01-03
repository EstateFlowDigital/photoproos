/**
 * Dropbox Integration Module
 *
 * This module handles all Dropbox API interactions for PhotoProOS.
 * It supports file uploads, downloads, folder management, and sync operations.
 */

const DROPBOX_API_BASE = "https://api.dropboxapi.com/2";
const DROPBOX_CONTENT_BASE = "https://content.dropboxapi.com/2";

// ============================================================================
// TYPES
// ============================================================================

export interface DropboxFile {
  id: string;
  name: string;
  path_lower: string;
  path_display: string;
  size?: number;
  is_downloadable?: boolean;
  client_modified?: string;
  server_modified?: string;
  rev?: string;
  content_hash?: string;
  ".tag": "file" | "folder" | "deleted";
}

export interface DropboxFolder {
  id: string;
  name: string;
  path_lower: string;
  path_display: string;
  ".tag": "folder";
}

export type DropboxEntry = DropboxFile | DropboxFolder;

export interface DropboxListFolderResult {
  entries: DropboxEntry[];
  cursor: string;
  has_more: boolean;
}

export interface DropboxAccountInfo {
  account_id: string;
  name: {
    display_name: string;
    familiar_name: string;
    given_name: string;
    surname: string;
  };
  email: string;
  email_verified: boolean;
  profile_photo_url?: string;
  country?: string;
}

export interface DropboxSpaceUsage {
  used: number;
  allocation: {
    ".tag": "individual" | "team";
    allocated: number;
  };
}

export interface DropboxUploadResult {
  id: string;
  name: string;
  path_lower: string;
  path_display: string;
  size: number;
  content_hash: string;
}

// ============================================================================
// CLIENT CLASS
// ============================================================================

export class DropboxClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Make an API request to Dropbox
   */
  private async request<T>(
    endpoint: string,
    body?: object,
    base: string = DROPBOX_API_BASE
  ): Promise<T> {
    const response = await fetch(`${base}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dropbox API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Get current account information
   */
  async getAccountInfo(): Promise<DropboxAccountInfo> {
    return this.request<DropboxAccountInfo>("/users/get_current_account");
  }

  /**
   * Get space usage information
   */
  async getSpaceUsage(): Promise<DropboxSpaceUsage> {
    return this.request<DropboxSpaceUsage>("/users/get_space_usage");
  }

  /**
   * List files and folders in a path
   */
  async listFolder(
    path: string,
    recursive: boolean = false
  ): Promise<DropboxListFolderResult> {
    return this.request<DropboxListFolderResult>("/files/list_folder", {
      path: path === "/" ? "" : path,
      recursive,
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_mounted_folders: true,
      include_non_downloadable_files: false,
    });
  }

  /**
   * Continue listing files (pagination)
   */
  async listFolderContinue(cursor: string): Promise<DropboxListFolderResult> {
    return this.request<DropboxListFolderResult>("/files/list_folder/continue", {
      cursor,
    });
  }

  /**
   * Get all files in a folder (handles pagination)
   */
  async listAllFiles(path: string): Promise<DropboxEntry[]> {
    const entries: DropboxEntry[] = [];
    let result = await this.listFolder(path);
    entries.push(...result.entries);

    while (result.has_more) {
      result = await this.listFolderContinue(result.cursor);
      entries.push(...result.entries);
    }

    return entries;
  }

  /**
   * Create a folder
   */
  async createFolder(path: string): Promise<DropboxFolder> {
    const response = await this.request<{ metadata: DropboxFolder }>(
      "/files/create_folder_v2",
      {
        path,
        autorename: false,
      }
    );
    return response.metadata;
  }

  /**
   * Create a folder if it doesn't exist
   */
  async ensureFolder(path: string): Promise<DropboxFolder | null> {
    try {
      return await this.createFolder(path);
    } catch (error) {
      // Folder might already exist
      if (
        error instanceof Error &&
        error.message.includes("path/conflict/folder")
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Upload a file (up to 150MB)
   */
  async uploadFile(
    path: string,
    content: ArrayBuffer | Uint8Array,
    mode: "add" | "overwrite" = "overwrite"
  ): Promise<DropboxUploadResult> {
    const response = await fetch(`${DROPBOX_CONTENT_BASE}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path,
          mode,
          autorename: mode === "add",
          mute: false,
        }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: content as any,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dropbox upload error: ${error}`);
    }

    return response.json();
  }

  /**
   * Download a file
   */
  async downloadFile(path: string): Promise<ArrayBuffer> {
    const response = await fetch(`${DROPBOX_CONTENT_BASE}/files/download`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({ path }),
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dropbox download error: ${error}`);
    }

    return response.arrayBuffer();
  }

  /**
   * Get a temporary download link (valid for 4 hours)
   */
  async getTemporaryLink(path: string): Promise<string> {
    const response = await this.request<{ link: string }>(
      "/files/get_temporary_link",
      { path }
    );
    return response.link;
  }

  /**
   * Delete a file or folder
   */
  async delete(path: string): Promise<void> {
    await this.request("/files/delete_v2", { path });
  }

  /**
   * Move a file or folder
   */
  async move(
    fromPath: string,
    toPath: string,
    autorename: boolean = false
  ): Promise<DropboxEntry> {
    const response = await this.request<{ metadata: DropboxEntry }>(
      "/files/move_v2",
      {
        from_path: fromPath,
        to_path: toPath,
        autorename,
      }
    );
    return response.metadata;
  }

  /**
   * Copy a file or folder
   */
  async copy(
    fromPath: string,
    toPath: string,
    autorename: boolean = false
  ): Promise<DropboxEntry> {
    const response = await this.request<{ metadata: DropboxEntry }>(
      "/files/copy_v2",
      {
        from_path: fromPath,
        to_path: toPath,
        autorename,
      }
    );
    return response.metadata;
  }

  /**
   * Get file metadata
   */
  async getMetadata(path: string): Promise<DropboxEntry> {
    return this.request<DropboxEntry>("/files/get_metadata", {
      path,
      include_deleted: false,
      include_has_explicit_shared_members: false,
    });
  }

  /**
   * Search for files
   */
  async search(
    query: string,
    path?: string
  ): Promise<{ matches: Array<{ metadata: DropboxEntry }> }> {
    return this.request("/files/search_v2", {
      query,
      options: {
        path: path || "",
        max_results: 100,
        file_status: "active",
        filename_only: false,
      },
    });
  }

  /**
   * Get a shared link for a file/folder (creates if doesn't exist)
   */
  async getOrCreateSharedLink(path: string): Promise<string> {
    try {
      const response = await this.request<{ url: string }>(
        "/sharing/create_shared_link_with_settings",
        {
          path,
          settings: {
            requested_visibility: "public",
          },
        }
      );
      return response.url;
    } catch (error) {
      // Link might already exist
      if (
        error instanceof Error &&
        error.message.includes("shared_link_already_exists")
      ) {
        const links = await this.request<{
          links: Array<{ url: string }>;
        }>("/sharing/list_shared_links", {
          path,
          direct_only: true,
        });
        if (links.links.length > 0) {
          return links.links[0].url;
        }
      }
      throw error;
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build a gallery folder path in Dropbox
 */
export function buildGalleryPath(
  rootFolder: string,
  galleryId: string,
  galleryName: string
): string {
  // Sanitize gallery name for folder name
  const safeName = galleryName
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .substring(0, 50);

  return `${rootFolder}/Galleries/${safeName}_${galleryId.substring(0, 8)}`;
}

/**
 * Build a client folder path in Dropbox
 */
export function buildClientPath(
  rootFolder: string,
  clientId: string,
  clientName: string
): string {
  const safeName = clientName
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .substring(0, 50);

  return `${rootFolder}/Clients/${safeName}_${clientId.substring(0, 8)}`;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Test Dropbox connection
 */
export async function testDropboxConnection(
  accessToken: string
): Promise<{ success: boolean; error?: string; account?: DropboxAccountInfo }> {
  try {
    const client = new DropboxClient(accessToken);
    const account = await client.getAccountInfo();
    return { success: true, account };
  } catch (error) {
    console.error("Dropbox connection test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
