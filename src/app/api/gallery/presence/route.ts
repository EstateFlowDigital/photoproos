import { NextRequest, NextResponse } from "next/server";

/**
 * Gallery Presence API
 *
 * Simple in-memory presence tracking for showing "X viewing now" on galleries.
 * Uses polling instead of WebSockets for simplicity.
 *
 * Presence expires after 60 seconds of inactivity.
 */

// In-memory store for presence data
// In production, this could be replaced with Redis for multi-server support
interface PresenceEntry {
  visitorId: string;
  lastSeen: number;
}

const presenceStore = new Map<string, Map<string, PresenceEntry>>();

// Cleanup expired entries every 30 seconds
const EXPIRY_MS = 60 * 1000; // 60 seconds

function cleanupExpiredEntries() {
  const now = Date.now();

  for (const [galleryId, visitors] of presenceStore.entries()) {
    for (const [visitorId, entry] of visitors.entries()) {
      if (now - entry.lastSeen > EXPIRY_MS) {
        visitors.delete(visitorId);
      }
    }

    // Remove gallery entry if no more visitors
    if (visitors.size === 0) {
      presenceStore.delete(galleryId);
    }
  }
}

// Run cleanup periodically
setInterval(cleanupExpiredEntries, 30000);

/**
 * POST /api/gallery/presence
 * Register or update presence for a gallery
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { galleryId, visitorId } = body;

    if (!galleryId || !visitorId) {
      return NextResponse.json(
        { error: "galleryId and visitorId are required" },
        { status: 400 }
      );
    }

    // Get or create gallery presence map
    if (!presenceStore.has(galleryId)) {
      presenceStore.set(galleryId, new Map());
    }

    const galleryPresence = presenceStore.get(galleryId)!;

    // Update visitor presence
    galleryPresence.set(visitorId, {
      visitorId,
      lastSeen: Date.now(),
    });

    // Return current viewer count
    return NextResponse.json({
      success: true,
      viewerCount: galleryPresence.size,
    });
  } catch (error) {
    console.error("[Presence API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update presence" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gallery/presence?galleryId=xxx
 * Get current viewer count for a gallery
 */
export async function GET(request: NextRequest) {
  try {
    const galleryId = request.nextUrl.searchParams.get("galleryId");

    if (!galleryId) {
      return NextResponse.json(
        { error: "galleryId is required" },
        { status: 400 }
      );
    }

    // Cleanup before counting
    cleanupExpiredEntries();

    const galleryPresence = presenceStore.get(galleryId);
    const viewerCount = galleryPresence?.size || 0;

    return NextResponse.json({
      galleryId,
      viewerCount,
      isLive: viewerCount > 0,
    });
  } catch (error) {
    console.error("[Presence API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get presence" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gallery/presence
 * Remove a visitor from presence (when they leave)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { galleryId, visitorId } = body;

    if (!galleryId || !visitorId) {
      return NextResponse.json(
        { error: "galleryId and visitorId are required" },
        { status: 400 }
      );
    }

    const galleryPresence = presenceStore.get(galleryId);
    if (galleryPresence) {
      galleryPresence.delete(visitorId);

      // Remove gallery entry if no more visitors
      if (galleryPresence.size === 0) {
        presenceStore.delete(galleryId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Presence API] Error:", error);
    return NextResponse.json(
      { error: "Failed to remove presence" },
      { status: 500 }
    );
  }
}
