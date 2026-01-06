"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { type ActionResult, success, ok, fail } from "@/lib/types/action-result";

/**
 * Mark a tour as completed for an organization
 */
export async function markTourCompleted(
  organizationId: string,
  tourId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Get current tour progress
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { tourProgress: true },
    });

    if (!organization) {
      return fail("Organization not found");
    }

    // Get existing completed tours
    const currentProgress = (organization.tourProgress as Record<string, unknown>) || {};
    const completedTours = (currentProgress.completedTours as string[]) || [];

    // Add the new tour if not already completed
    if (!completedTours.includes(tourId)) {
      completedTours.push(tourId);
    }

    // Update the organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        tourProgress: {
          ...currentProgress,
          completedTours,
          lastCompletedAt: new Date().toISOString(),
        },
      },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error marking tour as completed:", error);
    return fail("Failed to save tour progress");
  }
}

/**
 * Mark a specific module tour as completed for a user
 */
export async function markModuleTourCompleted(
  moduleId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { tourCompletedModules: true },
    });

    if (!user) {
      return fail("User not found");
    }

    // Get existing completed modules
    const completedModules = (user.tourCompletedModules as string[]) || [];

    // Add the new module if not already completed
    if (!completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
    }

    // Update the user
    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        tourCompletedModules: completedModules,
      },
    });

    revalidatePath("/");
    return ok();
  } catch (error) {
    console.error("Error marking module tour as completed:", error);
    return fail("Failed to save tour progress");
  }
}

interface TourProgress {
  completedTours: string[];
  lastCompletedAt?: string;
}

/**
 * Get tour progress for an organization
 */
export async function getTourProgress(
  organizationId: string
): Promise<ActionResult<TourProgress>> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { tourProgress: true },
    });

    if (!organization) {
      return success({ completedTours: [] });
    }

    const progress = (organization.tourProgress as Record<string, unknown>) || {};
    return success({
      completedTours: (progress.completedTours as string[]) || [],
      lastCompletedAt: progress.lastCompletedAt as string | undefined,
    });
  } catch (error) {
    console.error("Error getting tour progress:", error);
    return success({ completedTours: [] });
  }
}

/**
 * Reset tour progress for an organization
 */
export async function resetTourProgress(
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        tourProgress: {},
      },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error resetting tour progress:", error);
    return fail("Failed to reset tour progress");
  }
}
