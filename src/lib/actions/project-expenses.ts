"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ok, fail, success } from "@/lib/types/action-result";
import type { ExpenseCategory } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateExpenseInput {
  description: string;
  category: ExpenseCategory;
  amountCents: number;
  currency?: string;
  vendor?: string;
  teamMemberId?: string;
  expenseDate?: Date;
  isPaid?: boolean;
  paidDate?: Date;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateExpenseInput {
  description?: string;
  category?: ExpenseCategory;
  amountCents?: number;
  currency?: string;
  vendor?: string;
  teamMemberId?: string;
  expenseDate?: Date;
  isPaid?: boolean;
  paidDate?: Date;
  receiptUrl?: string;
  notes?: string;
}

export interface ProjectPLSummary {
  revenue: {
    total: number;
    paid: number;
    pending: number;
    itemCount: number;
  };
  expenses: {
    total: number;
    paid: number;
    unpaid: number;
    itemCount: number;
    byCategory: {
      category: ExpenseCategory;
      amount: number;
      count: number;
    }[];
  };
  profit: {
    gross: number; // Revenue - Expenses
    margin: number; // (Profit / Revenue) * 100
  };
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Get P&L summary for a project
 */
export async function getProjectPL(projectId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify the project belongs to this organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
      select: { id: true, priceCents: true },
    });

    if (!project) {
      return fail("Project not found");
    }

    // Get revenue from payments
    const payments = await prisma.payment.findMany({
      where: { projectId, organizationId: org.id },
      select: { amountCents: true, tipAmountCents: true, status: true },
    });

    const paidPayments = payments.filter((p) => p.status === "paid");
    const pendingPayments = payments.filter((p) => p.status === "pending");

    const revenue = {
      total: payments.reduce((sum, p) => sum + p.amountCents + p.tipAmountCents, 0),
      paid: paidPayments.reduce((sum, p) => sum + p.amountCents + p.tipAmountCents, 0),
      pending: pendingPayments.reduce((sum, p) => sum + p.amountCents + p.tipAmountCents, 0),
      itemCount: payments.length,
    };

    // If no payments yet, use the project price as expected revenue
    if (revenue.total === 0 && project.priceCents > 0) {
      revenue.total = project.priceCents;
      revenue.pending = project.priceCents;
    }

    // Get expenses
    const expenses = await prisma.projectExpense.findMany({
      where: { projectId, organizationId: org.id },
      select: { amountCents: true, category: true, isPaid: true },
    });

    const paidExpenses = expenses.filter((e) => e.isPaid);
    const unpaidExpenses = expenses.filter((e) => !e.isPaid);

    // Group expenses by category
    const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();
    expenses.forEach((e) => {
      const existing = categoryMap.get(e.category) || { amount: 0, count: 0 };
      categoryMap.set(e.category, {
        amount: existing.amount + e.amountCents,
        count: existing.count + 1,
      });
    });

    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    }));

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amountCents, 0);
    const expenseData = {
      total: totalExpenses,
      paid: paidExpenses.reduce((sum, e) => sum + e.amountCents, 0),
      unpaid: unpaidExpenses.reduce((sum, e) => sum + e.amountCents, 0),
      itemCount: expenses.length,
      byCategory,
    };

    // Calculate profit
    const grossProfit = revenue.total - totalExpenses;
    const margin = revenue.total > 0 ? (grossProfit / revenue.total) * 100 : 0;

    const summary: ProjectPLSummary = {
      revenue,
      expenses: expenseData,
      profit: {
        gross: grossProfit,
        margin: Math.round(margin * 10) / 10, // Round to 1 decimal
      },
    };

    return success(summary);
  } catch (error) {
    console.error("Error fetching project P&L:", error);
    return fail("Failed to fetch P&L data");
  }
}

/**
 * Get all expenses for a project
 */
export async function getProjectExpenses(projectId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify the project belongs to this organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!project) {
      return fail("Project not found");
    }

    const expenses = await prisma.projectExpense.findMany({
      where: { projectId, organizationId: org.id },
      orderBy: { expenseDate: "desc" },
    });

    return success(expenses);
  } catch (error) {
    console.error("Error fetching project expenses:", error);
    return fail("Failed to fetch expenses");
  }
}

/**
 * Create a new expense for a project
 */
export async function createProjectExpense(
  projectId: string,
  input: CreateExpenseInput
) {
  const { orgId, userId } = await auth();
  if (!orgId || !userId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify the project belongs to this organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!project) {
      return fail("Project not found");
    }

    const expense = await prisma.projectExpense.create({
      data: {
        organizationId: org.id,
        projectId,
        description: input.description,
        category: input.category,
        amountCents: input.amountCents,
        currency: input.currency || "USD",
        vendor: input.vendor || null,
        teamMemberId: input.teamMemberId || null,
        expenseDate: input.expenseDate || new Date(),
        isPaid: input.isPaid ?? true,
        paidDate: input.paidDate || (input.isPaid !== false ? new Date() : null),
        receiptUrl: input.receiptUrl || null,
        notes: input.notes || null,
        createdBy: userId,
      },
    });

    revalidatePath(`/galleries/${projectId}`);

    return success(expense);
  } catch (error) {
    console.error("Error creating project expense:", error);
    return fail("Failed to create expense");
  }
}

/**
 * Update an expense
 */
export async function updateProjectExpense(
  expenseId: string,
  input: UpdateExpenseInput
) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Get expense and verify ownership
    const existing = await prisma.projectExpense.findUnique({
      where: { id: expenseId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Expense not found");
    }

    const expense = await prisma.projectExpense.update({
      where: { id: expenseId },
      data: {
        description: input.description,
        category: input.category,
        amountCents: input.amountCents,
        currency: input.currency,
        vendor: input.vendor,
        teamMemberId: input.teamMemberId,
        expenseDate: input.expenseDate,
        isPaid: input.isPaid,
        paidDate: input.paidDate,
        receiptUrl: input.receiptUrl,
        notes: input.notes,
      },
    });

    revalidatePath(`/galleries/${existing.projectId}`);

    return success(expense);
  } catch (error) {
    console.error("Error updating project expense:", error);
    return fail("Failed to update expense");
  }
}

/**
 * Delete an expense
 */
export async function deleteProjectExpense(expenseId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Get expense and verify ownership
    const existing = await prisma.projectExpense.findUnique({
      where: { id: expenseId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Expense not found");
    }

    await prisma.projectExpense.delete({
      where: { id: expenseId },
    });

    revalidatePath(`/galleries/${existing.projectId}`);

    return ok();
  } catch (error) {
    console.error("Error deleting project expense:", error);
    return fail("Failed to delete expense");
  }
}

/**
 * Mark expense as paid/unpaid
 */
export async function toggleExpensePaidStatus(expenseId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Get expense and verify ownership
    const existing = await prisma.projectExpense.findUnique({
      where: { id: expenseId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Expense not found");
    }

    const newPaidStatus = !existing.isPaid;

    const expense = await prisma.projectExpense.update({
      where: { id: expenseId },
      data: {
        isPaid: newPaidStatus,
        paidDate: newPaidStatus ? new Date() : null,
      },
    });

    revalidatePath(`/galleries/${existing.projectId}`);

    return success(expense);
  } catch (error) {
    console.error("Error toggling expense paid status:", error);
    return fail("Failed to update expense");
  }
}

/**
 * Get expense category labels and icons
 */
export function getExpenseCategoryInfo(category: ExpenseCategory) {
  const categories: Record<ExpenseCategory, { label: string; icon: string }> = {
    labor: { label: "Labor", icon: "users" },
    travel: { label: "Travel", icon: "car" },
    equipment: { label: "Equipment", icon: "camera" },
    software: { label: "Software", icon: "code" },
    materials: { label: "Materials", icon: "package" },
    marketing: { label: "Marketing", icon: "megaphone" },
    fees: { label: "Fees", icon: "receipt" },
    insurance: { label: "Insurance", icon: "shield" },
    other: { label: "Other", icon: "dots" },
  };

  return categories[category] || { label: category, icon: "dots" };
}

/**
 * Get all expense categories
 */
export function getExpenseCategories() {
  const categories: ExpenseCategory[] = [
    "labor",
    "travel",
    "equipment",
    "software",
    "materials",
    "marketing",
    "fees",
    "insurance",
    "other",
  ];

  return categories.map((cat) => ({
    value: cat,
    ...getExpenseCategoryInfo(cat),
  }));
}
