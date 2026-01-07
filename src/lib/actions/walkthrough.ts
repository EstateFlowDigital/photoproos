"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import type { WalkthroughState } from "@prisma/client";
import type { WalkthroughPageId } from "@/lib/walkthrough-types";

// =============================================================================
// Types
// =============================================================================

export interface WalkthroughPreferenceData {
  id: string;
  userId: string;
  pageId: string;
  state: WalkthroughState;
  dismissedAt: Date | null;
  hiddenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Walkthrough Preference Actions
// =============================================================================

/**
 * Get the current user's walkthrough preference for a specific page
 */
export async function getWalkthroughPreference(
  pageId: WalkthroughPageId
): Promise<ActionResult<WalkthroughPreferenceData | null>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Get the internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const preference = await prisma.userWalkthroughPreference.findUnique({
      where: {
        userId_pageId: {
          userId: user.id,
          pageId,
        },
      },
    });

    return success(preference);
  } catch (error) {
    console.error("[getWalkthroughPreference] Error:", error);
    return fail("Failed to get walkthrough preference");
  }
}

/**
 * Get all walkthrough preferences for the current user
 */
export async function getAllWalkthroughPreferences(): Promise<
  ActionResult<WalkthroughPreferenceData[]>
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Get the internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const preferences = await prisma.userWalkthroughPreference.findMany({
      where: { userId: user.id },
      orderBy: { pageId: "asc" },
    });

    return success(preferences);
  } catch (error) {
    console.error("[getAllWalkthroughPreferences] Error:", error);
    return fail("Failed to get walkthrough preferences");
  }
}

/**
 * Update the walkthrough state for a specific page
 */
export async function updateWalkthroughState(
  pageId: WalkthroughPageId,
  newState: WalkthroughState
): Promise<ActionResult<WalkthroughPreferenceData>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Get the internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return fail("User not found");
    }

    // Prepare the data based on the new state
    const now = new Date();
    const updateData: {
      state: WalkthroughState;
      dismissedAt?: Date | null;
      hiddenAt?: Date | null;
    } = {
      state: newState,
    };

    // Set timestamps based on state
    if (newState === "dismissed") {
      updateData.dismissedAt = now;
      updateData.hiddenAt = null;
    } else if (newState === "hidden") {
      updateData.hiddenAt = now;
      updateData.dismissedAt = null;
    } else {
      updateData.dismissedAt = null;
      updateData.hiddenAt = null;
    }

    // Upsert the preference
    const preference = await prisma.userWalkthroughPreference.upsert({
      where: {
        userId_pageId: {
          userId: user.id,
          pageId,
        },
      },
      update: updateData,
      create: {
        userId: user.id,
        pageId,
        ...updateData,
      },
    });

    // Revalidate the settings page
    revalidatePath("/settings/walkthroughs");

    return success(preference);
  } catch (error) {
    console.error("[updateWalkthroughState] Error:", error);
    return fail("Failed to update walkthrough state");
  }
}

/**
 * Reset all hidden walkthroughs to open state (not dismissed ones)
 */
export async function resetHiddenWalkthroughs(): Promise<
  ActionResult<{ count: number }>
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Get the internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return fail("User not found");
    }

    // Update all hidden walkthroughs to open
    const result = await prisma.userWalkthroughPreference.updateMany({
      where: {
        userId: user.id,
        state: "hidden",
      },
      data: {
        state: "open",
        hiddenAt: null,
      },
    });

    // Revalidate the settings page
    revalidatePath("/settings/walkthroughs");

    return success({ count: result.count });
  } catch (error) {
    console.error("[resetHiddenWalkthroughs] Error:", error);
    return fail("Failed to reset walkthroughs");
  }
}

/**
 * Batch update walkthrough states (useful for settings page)
 */
export async function batchUpdateWalkthroughStates(
  updates: Array<{ pageId: WalkthroughPageId; state: WalkthroughState }>
): Promise<ActionResult<{ count: number }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Get the internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const now = new Date();

    // Process each update
    await prisma.$transaction(
      updates.map((update) => {
        const updateData: {
          state: WalkthroughState;
          dismissedAt?: Date | null;
          hiddenAt?: Date | null;
        } = {
          state: update.state,
        };

        if (update.state === "dismissed") {
          updateData.dismissedAt = now;
          updateData.hiddenAt = null;
        } else if (update.state === "hidden") {
          updateData.hiddenAt = now;
          updateData.dismissedAt = null;
        } else {
          updateData.dismissedAt = null;
          updateData.hiddenAt = null;
        }

        return prisma.userWalkthroughPreference.upsert({
          where: {
            userId_pageId: {
              userId: user.id,
              pageId: update.pageId,
            },
          },
          update: updateData,
          create: {
            userId: user.id,
            pageId: update.pageId,
            ...updateData,
          },
        });
      })
    );

    // Revalidate the settings page
    revalidatePath("/settings/walkthroughs");

    return success({ count: updates.length });
  } catch (error) {
    console.error("[batchUpdateWalkthroughStates] Error:", error);
    return fail("Failed to update walkthroughs");
  }
}

/**
 * Check if a walkthrough should be shown for a page
 * (Convenience function for use in page components)
 */
export async function shouldShowWalkthrough(
  pageId: WalkthroughPageId
): Promise<boolean> {
  try {
    const result = await getWalkthroughPreference(pageId);

    if (!result.success || !result.data) {
      // No preference set, show by default
      return true;
    }

    // Show if state is "open" or "minimized"
    return result.data.state === "open" || result.data.state === "minimized";
  } catch {
    // On error, default to showing the walkthrough
    return true;
  }
}
