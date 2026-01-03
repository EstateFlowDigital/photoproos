"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getDefaultModulesForIndustries, getModulesForIndustries } from "@/lib/constants/industries";

/**
 * Save progress for a specific onboarding step
 */
export async function saveOnboardingStep(
  organizationId: string,
  step: number,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { onboardingProgress: true },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Update based on step
    switch (step) {
      case 1: // Profile step
        await prisma.$transaction([
          // Update user
          prisma.user.update({
            where: { clerkUserId: userId },
            data: {
              firstName: data.firstName as string,
              lastName: data.lastName as string,
              fullName: `${data.firstName} ${data.lastName}`,
              phone: data.phone as string || null,
            },
          }),
          // Update onboarding progress
          prisma.onboardingProgress.upsert({
            where: { organizationId },
            create: {
              organizationId,
              personalComplete: true,
              currentStep: 2,
            },
            update: {
              personalComplete: true,
              currentStep: 2,
            },
          }),
        ]);
        break;

      case 2: // Business step
        await prisma.$transaction([
          prisma.organization.update({
            where: { id: organizationId },
            data: {
              name: data.companyName as string || organization.name,
              businessType: data.businessType as "solo" | "team" | "agency",
              teamSize: data.teamSize as string,
            },
          }),
          prisma.onboardingProgress.upsert({
            where: { organizationId },
            create: {
              organizationId,
              businessComplete: true,
              currentStep: 3,
            },
            update: {
              businessComplete: true,
              currentStep: 3,
            },
          }),
        ]);
        break;

      case 3: // Branding step
        await prisma.$transaction([
          prisma.organization.update({
            where: { id: organizationId },
            data: {
              displayMode: data.displayMode as "personal" | "company",
              publicName: data.publicName as string,
              publicEmail: data.publicEmail as string,
              publicPhone: data.publicPhone as string,
              website: data.website as string,
            },
          }),
          prisma.onboardingProgress.upsert({
            where: { organizationId },
            create: {
              organizationId,
              brandingStepDone: true,
              currentStep: 4,
            },
            update: {
              brandingStepDone: true,
              currentStep: 4,
            },
          }),
        ]);
        break;

      case 4: // Industries step
        const industries = data.industries as string[];
        await prisma.$transaction([
          prisma.organization.update({
            where: { id: organizationId },
            data: {
              industries: industries as any,
              primaryIndustry: data.primaryIndustry as any,
              // Set default modules based on industries
              enabledModules: getDefaultModulesForIndustries(industries),
            },
          }),
          prisma.onboardingProgress.upsert({
            where: { organizationId },
            create: {
              organizationId,
              industriesSet: true,
              currentStep: 5,
            },
            update: {
              industriesSet: true,
              currentStep: 5,
            },
          }),
        ]);
        break;

      case 5: // Features step
        await prisma.$transaction([
          prisma.organization.update({
            where: { id: organizationId },
            data: {
              enabledModules: data.enabledModules as string[],
            },
          }),
          prisma.onboardingProgress.upsert({
            where: { organizationId },
            create: {
              organizationId,
              featuresSelected: true,
              currentStep: 6,
            },
            update: {
              featuresSelected: true,
              currentStep: 6,
            },
          }),
        ]);
        break;

      case 6: // Goals step
        await prisma.onboardingProgress.upsert({
          where: { organizationId },
          create: {
            organizationId,
            goalsSet: true,
            selectedGoals: data.selectedGoals as string[],
            currentStep: 7,
          },
          update: {
            goalsSet: true,
            selectedGoals: data.selectedGoals as string[],
            currentStep: 7,
          },
        });
        break;

      case 7: // Payment step
        const skipPayment = data.skipPayment as boolean;
        const now = new Date();
        const trialDays = skipPayment ? 14 : 30; // Extra trial days for adding payment method
        const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

        await prisma.$transaction([
          prisma.organization.update({
            where: { id: organizationId },
            data: {
              trialStartedAt: now,
              trialEndsAt: trialEnd,
              paymentMethodAdded: !skipPayment,
            },
          }),
          prisma.onboardingProgress.upsert({
            where: { organizationId },
            create: {
              organizationId,
              paymentStepDone: true,
              currentStep: 8,
            },
            update: {
              paymentStepDone: true,
              currentStep: 8,
            },
          }),
        ]);
        break;
    }

    revalidatePath("/onboarding");
    return { success: true };
  } catch (error) {
    console.error("Error saving onboarding step:", error);
    return { success: false, error: "Failed to save progress" };
  }
}

/**
 * Complete the onboarding process
 */
export async function completeOnboarding(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate organizationId
    if (!organizationId || organizationId === "") {
      console.error("Error completing onboarding: organizationId is empty");
      return { success: false, error: "Organization not found" };
    }

    // Verify the organization exists first
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      console.error("Error completing onboarding: Organization not found for id:", organizationId);
      return { success: false, error: "Organization not found" };
    }

    const now = new Date();

    // Ensure onboarding progress exists before updating (use upsert)
    await prisma.onboardingProgress.upsert({
      where: { organizationId },
      create: {
        organizationId,
        completedAt: now,
      },
      update: {
        completedAt: now,
      },
    });

    await prisma.$transaction([
      prisma.organization.update({
        where: { id: organizationId },
        data: {
          onboardingCompleted: true,
          onboardingCompletedAt: now,
        },
      }),
      prisma.user.update({
        where: { clerkUserId: userId },
        data: {
          hasSeenWelcome: true,
        },
      }),
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return { success: false, error: "Failed to complete onboarding" };
  }
}

/**
 * Update selected industries (can be called from settings later)
 */
export async function updateIndustries(
  organizationId: string,
  industries: string[],
  primaryIndustry: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { enabledModules: true },
    });

    if (!existing) {
      return { success: false, error: "Organization not found" };
    }

    const availableModules = getModulesForIndustries(industries);
    const filteredModules = (existing.enabledModules as string[] | null || [])
      .filter((m) => availableModules.includes(m));

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        industries: industries as any,
        primaryIndustry: primaryIndustry as any,
        enabledModules: filteredModules,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating industries:", error);
    return { success: false, error: "Failed to update industries" };
  }
}

/**
 * Update enabled modules (can be called from settings later)
 */
export async function updateModules(
  organizationId: string,
  modules: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { industries: true },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    const availableModules = getModulesForIndustries(organization.industries as string[]);
    const filteredModules = modules.filter((m) => availableModules.includes(m));

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        enabledModules: filteredModules,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating modules:", error);
    return { success: false, error: "Failed to update modules" };
  }
}

/**
 * Reset onboarding to allow viewing it again
 */
export async function resetOnboarding(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Reset the organization's onboarding status
    await prisma.$transaction([
      prisma.organization.update({
        where: { id: organizationId },
        data: {
          onboardingCompleted: false,
          onboardingCompletedAt: null,
        },
      }),
      // Reset the onboarding progress to start from beginning
      prisma.onboardingProgress.upsert({
        where: { organizationId },
        create: {
          organizationId,
          currentStep: 0,
          personalComplete: false,
          businessComplete: false,
          brandingStepDone: false,
          industriesSet: false,
          featuresSelected: false,
          goalsSet: false,
          paymentStepDone: false,
          completedAt: null,
        },
        update: {
          currentStep: 0,
          personalComplete: false,
          businessComplete: false,
          brandingStepDone: false,
          industriesSet: false,
          featuresSelected: false,
          goalsSet: false,
          paymentStepDone: false,
          completedAt: null,
        },
      }),
    ]);

    revalidatePath("/onboarding");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error resetting onboarding:", error);
    return { success: false, error: "Failed to reset onboarding" };
  }
}
