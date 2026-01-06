"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { addMonths, addWeeks } from "date-fns";

// =============================================================================
// Types
// =============================================================================

interface CreatePaymentPlanInput {
  invoiceId?: string;
  projectId?: string;
  clientId?: string;
  totalAmount: number; // in cents
  installments: number; // number of payments (3, 6, 12)
  frequency?: "weekly" | "biweekly" | "monthly";
  startDate?: Date;
}

// =============================================================================
// Helper Functions
// =============================================================================

async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findFirst({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  return org?.id || null;
}

function calculateNextDueDate(
  currentDate: Date,
  frequency: string
): Date {
  switch (frequency) {
    case "weekly":
      return addWeeks(currentDate, 1);
    case "biweekly":
      return addWeeks(currentDate, 2);
    case "monthly":
    default:
      return addMonths(currentDate, 1);
  }
}

// =============================================================================
// Payment Plan Actions
// =============================================================================

/**
 * Create a new payment plan with scheduled installments
 */
export async function createPaymentPlan(input: CreatePaymentPlanInput) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const frequency = input.frequency || "monthly";
    const startDate = input.startDate || new Date();
    const installmentAmount = Math.ceil(input.totalAmount / input.installments);

    // Create the payment plan
    const paymentPlan = await prisma.paymentPlan.create({
      data: {
        organizationId,
        invoiceId: input.invoiceId,
        projectId: input.projectId,
        clientId: input.clientId,
        totalAmount: input.totalAmount,
        installments: input.installments,
        frequency,
        startDate,
        nextDueDate: startDate,
        status: "active",
      },
    });

    // Create scheduled installments
    const installments = [];
    let dueDate = startDate;

    for (let i = 0; i < input.installments; i++) {
      // Last installment gets any remaining cents
      const amount = i === input.installments - 1
        ? input.totalAmount - (installmentAmount * (input.installments - 1))
        : installmentAmount;

      installments.push({
        paymentPlanId: paymentPlan.id,
        amount,
        dueDate,
      });

      dueDate = calculateNextDueDate(dueDate, frequency);
    }

    await prisma.paymentPlanInstallment.createMany({
      data: installments,
    });

    revalidatePath("/payments");
    return { success: true, data: paymentPlan };
  } catch (error) {
    console.error("[Payment Plan] Error creating:", error);
    return { success: false, error: "Failed to create payment plan" };
  }
}

/**
 * Get all payment plans for the organization
 */
export async function getPaymentPlans(filters?: {
  status?: "active" | "completed" | "cancelled" | "overdue";
  clientId?: string;
}) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const plans = await prisma.paymentPlan.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        scheduledPayments: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    return { success: true, data: plans };
  } catch (error) {
    console.error("[Payment Plan] Error fetching:", error);
    return { success: false, error: "Failed to fetch payment plans" };
  }
}

/**
 * Get a specific payment plan with installments
 */
export async function getPaymentPlan(planId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const plan = await prisma.paymentPlan.findFirst({
      where: {
        id: planId,
        organizationId,
      },
      include: {
        scheduledPayments: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!plan) {
      return { success: false, error: "Payment plan not found" };
    }

    return { success: true, data: plan };
  } catch (error) {
    console.error("[Payment Plan] Error fetching:", error);
    return { success: false, error: "Failed to fetch payment plan" };
  }
}

/**
 * Mark an installment as paid
 */
export async function markInstallmentPaid(
  installmentId: string,
  stripePaymentIntentId?: string
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const installment = await prisma.paymentPlanInstallment.findFirst({
      where: { id: installmentId },
      include: { paymentPlan: true },
    });

    if (!installment || installment.paymentPlan.organizationId !== organizationId) {
      return { success: false, error: "Installment not found" };
    }

    // Update the installment
    await prisma.paymentPlanInstallment.update({
      where: { id: installmentId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        stripePaymentIntentId,
      },
    });

    // Update the payment plan's paid amount and next due date
    const allInstallments = await prisma.paymentPlanInstallment.findMany({
      where: { paymentPlanId: installment.paymentPlanId },
      orderBy: { dueDate: "asc" },
    });

    const paidAmount = allInstallments
      .filter((i) => i.isPaid)
      .reduce((sum, i) => sum + i.amount, 0) + installment.amount;

    const nextUnpaid = allInstallments.find((i) => !i.isPaid && i.id !== installmentId);
    const isCompleted = !nextUnpaid;

    await prisma.paymentPlan.update({
      where: { id: installment.paymentPlanId },
      data: {
        paidAmount,
        nextDueDate: nextUnpaid?.dueDate || null,
        status: isCompleted ? "completed" : "active",
      },
    });

    revalidatePath("/payments");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Payment Plan] Error marking paid:", error);
    return { success: false, error: "Failed to mark installment as paid" };
  }
}

/**
 * Cancel a payment plan
 */
export async function cancelPaymentPlan(planId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    await prisma.paymentPlan.update({
      where: {
        id: planId,
        organizationId,
      },
      data: {
        status: "cancelled",
      },
    });

    revalidatePath("/payments");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Payment Plan] Error cancelling:", error);
    return { success: false, error: "Failed to cancel payment plan" };
  }
}

/**
 * Check for overdue installments and update status
 */
export async function checkOverdueInstallments() {
  try {
    const now = new Date();

    // Find all active plans with overdue installments
    const overduePlans = await prisma.paymentPlan.findMany({
      where: {
        status: "active",
        scheduledPayments: {
          some: {
            dueDate: { lt: now },
            isPaid: false,
          },
        },
      },
    });

    // Update status to overdue
    if (overduePlans.length > 0) {
      await prisma.paymentPlan.updateMany({
        where: {
          id: { in: overduePlans.map((p) => p.id) },
        },
        data: {
          status: "overdue",
        },
      });
    }

    return { success: true, overdueCount: overduePlans.length };
  } catch (error) {
    console.error("[Payment Plan] Error checking overdue:", error);
    return { success: false, error: "Failed to check overdue installments" };
  }
}

/**
 * Get upcoming installments that need reminders
 */
export async function getUpcomingInstallments(daysAhead: number = 3) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const now = new Date();
    const futureDate = addMonths(now, 0);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const installments = await prisma.paymentPlanInstallment.findMany({
      where: {
        paymentPlan: {
          organizationId,
          status: "active",
        },
        dueDate: {
          gte: now,
          lte: futureDate,
        },
        isPaid: false,
        reminderSentAt: null,
      },
      include: {
        paymentPlan: true,
      },
      orderBy: { dueDate: "asc" },
    });

    return { success: true, data: installments };
  } catch (error) {
    console.error("[Payment Plan] Error fetching upcoming:", error);
    return { success: false, error: "Failed to fetch upcoming installments" };
  }
}
