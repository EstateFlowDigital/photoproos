"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { PaymentStatus } from "@prisma/client";

// Helper to get organization ID (simplified for now - will integrate with auth later)
async function getOrganizationId(): Promise<string> {
  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!org) {
    throw new Error("No organization found");
  }

  return org.id;
}

/**
 * Get a single payment by ID with full details
 */
export async function getPayment(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                company: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return null;
    }

    return payment;
  } catch (error) {
    console.error("Error fetching payment:", error);
    return null;
  }
}

/**
 * Get all payments for the organization
 */
export async function getPayments(filters?: {
  status?: PaymentStatus;
  clientId?: string;
  fromDate?: Date;
  toDate?: Date;
}) {
  try {
    const organizationId = await getOrganizationId();

    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.fromDate && { createdAt: { gte: filters.fromDate } }),
        ...(filters?.toDate && { createdAt: { lte: filters.toDate } }),
        ...(filters?.clientId && {
          project: {
            clientId: filters.clientId,
          },
        }),
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                company: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return payments;
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  }
}

/**
 * Get payment stats
 */
export async function getPaymentStats() {
  try {
    const organizationId = await getOrganizationId();

    const [totalPaid, totalPending, totalOverdue] = await Promise.all([
      prisma.payment.aggregate({
        where: { organizationId, status: "paid" },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { organizationId, status: "pending" },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { organizationId, status: "overdue" },
        _sum: { amountCents: true },
        _count: true,
      }),
    ]);

    return {
      paid: {
        count: totalPaid._count || 0,
        amountCents: totalPaid._sum.amountCents || 0,
      },
      pending: {
        count: totalPending._count || 0,
        amountCents: totalPending._sum.amountCents || 0,
      },
      overdue: {
        count: totalOverdue._count || 0,
        amountCents: totalOverdue._sum.amountCents || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return {
      paid: { count: 0, amountCents: 0 },
      pending: { count: 0, amountCents: 0 },
      overdue: { count: 0, amountCents: 0 },
    };
  }
}

/**
 * Mark payment as paid (for testing - in production this would come from Stripe webhook)
 */
export async function markPaymentAsPaid(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const existing = await prisma.payment.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Payment not found" };
    }

    await prisma.payment.update({
      where: { id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });

    revalidatePath("/payments");
    revalidatePath(`/payments/${id}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error marking payment as paid:", error);
    return { success: false, error: "Failed to update payment" };
  }
}
