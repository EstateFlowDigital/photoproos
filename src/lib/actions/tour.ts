"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Mark a tour as completed for an organization
 */
export async function markTourCompleted(
  organizationId: string,
  tourId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get current tour progress
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { tourProgress: true },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
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
    return { success: true };
  } catch (error) {
    console.error("Error marking tour as completed:", error);
    return { success: false, error: "Failed to save tour progress" };
  }
}

/**
 * Mark a specific module tour as completed for a user
 */
export async function markModuleTourCompleted(
  moduleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { tourCompletedModules: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
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
    return { success: true };
  } catch (error) {
    console.error("Error marking module tour as completed:", error);
    return { success: false, error: "Failed to save tour progress" };
  }
}

/**
 * Get tour progress for an organization
 */
export async function getTourProgress(organizationId: string): Promise<{
  completedTours: string[];
  lastCompletedAt?: string;
}> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { tourProgress: true },
    });

    if (!organization) {
      return { completedTours: [] };
    }

    const progress = (organization.tourProgress as Record<string, unknown>) || {};
    return {
      completedTours: (progress.completedTours as string[]) || [],
      lastCompletedAt: progress.lastCompletedAt as string | undefined,
    };
  } catch (error) {
    console.error("Error getting tour progress:", error);
    return { completedTours: [] };
  }
}

/**
 * Reset tour progress for an organization
 */
export async function resetTourProgress(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        tourProgress: {},
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error resetting tour progress:", error);
    return { success: false, error: "Failed to reset tour progress" };
  }
}
