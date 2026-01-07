"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ok, fail, success } from "@/lib/types/action-result";
import { generatePresignedUploadUrl, generateFileKey } from "@/lib/storage";
import type { ExpenseCategory, ExpenseApprovalStatus, RecurrenceFrequency, PaymentMethod } from "@prisma/client";

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
  // Enhanced tracking fields
  isBillable?: boolean;
  paymentMethod?: PaymentMethod;
  taxCents?: number;
  mileageDistance?: number;
  mileageRateCents?: number;
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
  // Enhanced tracking fields
  isBillable?: boolean;
  paymentMethod?: PaymentMethod;
  taxCents?: number;
  mileageDistance?: number;
  mileageRateCents?: number;
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
        // Enhanced tracking fields
        isBillable: input.isBillable ?? false,
        paymentMethod: input.paymentMethod || null,
        taxCents: input.taxCents || null,
        mileageDistance: input.mileageDistance || null,
        mileageRateCents: input.mileageRateCents || null,
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
        // Enhanced tracking fields
        isBillable: input.isBillable,
        paymentMethod: input.paymentMethod,
        taxCents: input.taxCents,
        mileageDistance: input.mileageDistance,
        mileageRateCents: input.mileageRateCents,
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

// Note: getExpenseCategoryInfo and getExpenseCategories moved to @/lib/utils/expenses.ts

// ============================================================================
// TEAM MEMBERS
// ============================================================================

/**
 * Get team members for expense assignment
 */
export async function getTeamMembers() {
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

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: org.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { user: { firstName: "asc" } },
    });

    const formattedMembers = members.map((m) => ({
      id: m.userId,
      name: m.user.firstName && m.user.lastName
        ? `${m.user.firstName} ${m.user.lastName}`
        : m.user.email,
      email: m.user.email,
      role: m.role,
    }));

    return success(formattedMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return fail("Failed to fetch team members");
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk mark expenses as paid/unpaid
 */
export async function bulkUpdateExpenseStatus(
  expenseIds: string[],
  isPaid: boolean
) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  if (!expenseIds.length) {
    return fail("No expenses selected");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify all expenses belong to this organization
    const expenses = await prisma.projectExpense.findMany({
      where: {
        id: { in: expenseIds },
        organizationId: org.id,
      },
      select: { id: true, projectId: true },
    });

    if (expenses.length !== expenseIds.length) {
      return fail("Some expenses not found or unauthorized");
    }

    // Get unique project IDs for cache invalidation
    const projectIds = [...new Set(expenses.map((e) => e.projectId))];

    await prisma.projectExpense.updateMany({
      where: {
        id: { in: expenseIds },
        organizationId: org.id,
      },
      data: {
        isPaid,
        paidDate: isPaid ? new Date() : null,
      },
    });

    // Invalidate caches
    for (const projectId of projectIds) {
      revalidatePath(`/galleries/${projectId}`);
    }

    return success({ count: expenses.length });
  } catch (error) {
    console.error("Error bulk updating expenses:", error);
    return fail("Failed to update expenses");
  }
}

/**
 * Bulk delete expenses
 */
export async function bulkDeleteExpenses(expenseIds: string[]) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  if (!expenseIds.length) {
    return fail("No expenses selected");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify all expenses belong to this organization
    const expenses = await prisma.projectExpense.findMany({
      where: {
        id: { in: expenseIds },
        organizationId: org.id,
      },
      select: { id: true, projectId: true },
    });

    if (expenses.length !== expenseIds.length) {
      return fail("Some expenses not found or unauthorized");
    }

    // Get unique project IDs for cache invalidation
    const projectIds = [...new Set(expenses.map((e) => e.projectId))];

    await prisma.projectExpense.deleteMany({
      where: {
        id: { in: expenseIds },
        organizationId: org.id,
      },
    });

    // Invalidate caches
    for (const projectId of projectIds) {
      revalidatePath(`/galleries/${projectId}`);
    }

    return success({ count: expenses.length });
  } catch (error) {
    console.error("Error bulk deleting expenses:", error);
    return fail("Failed to delete expenses");
  }
}

/**
 * Bulk create expenses from CSV import
 */
export async function bulkCreateExpenses(
  projectId: string,
  expenses: CreateExpenseInput[]
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

    // Create all expenses in a transaction
    const createdExpenses = await prisma.$transaction(
      expenses.map((input) =>
        prisma.projectExpense.create({
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
            isBillable: input.isBillable ?? false,
            paymentMethod: input.paymentMethod || null,
            taxCents: input.taxCents || null,
            mileageDistance: input.mileageDistance || null,
            mileageRateCents: input.mileageRateCents || null,
          },
        })
      )
    );

    revalidatePath(`/galleries/${projectId}`);

    return success({ count: createdExpenses.length, expenses: createdExpenses });
  } catch (error) {
    console.error("Error bulk creating expenses:", error);
    return fail("Failed to import expenses");
  }
}

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Export expenses to CSV format
 */
export async function exportExpensesToCSV(projectId: string) {
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
      select: { id: true, name: true },
    });

    if (!project) {
      return fail("Project not found");
    }

    const expenses = await prisma.projectExpense.findMany({
      where: { projectId, organizationId: org.id },
      orderBy: { expenseDate: "desc" },
    });

    // Build CSV
    const headers = [
      "Date",
      "Description",
      "Category",
      "Vendor",
      "Amount",
      "Status",
      "Paid Date",
      "Notes",
    ];

    const rows = expenses.map((e) => [
      new Date(e.expenseDate).toISOString().split("T")[0],
      `"${e.description.replace(/"/g, '""')}"`,
      e.category,
      e.vendor ? `"${e.vendor.replace(/"/g, '""')}"` : "",
      (e.amountCents / 100).toFixed(2),
      e.isPaid ? "Paid" : "Unpaid",
      e.paidDate ? new Date(e.paidDate).toISOString().split("T")[0] : "",
      e.notes ? `"${e.notes.replace(/"/g, '""')}"` : "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return success({
      csv,
      filename: `${project.name.replace(/[^a-zA-Z0-9]/g, "-")}-expenses.csv`,
    });
  } catch (error) {
    console.error("Error exporting expenses:", error);
    return fail("Failed to export expenses");
  }
}

// ============================================================================
// RECEIPT UPLOAD
// ============================================================================

/**
 * Generate a presigned URL for receipt upload
 */
export async function getReceiptUploadUrl(
  projectId: string,
  filename: string,
  contentType: string
) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  // Validate content type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "application/pdf",
  ];
  if (!allowedTypes.includes(contentType)) {
    return fail("Invalid file type. Allowed: JPEG, PNG, WebP, HEIC, PDF");
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
      select: { id: true },
    });

    if (!project) {
      return fail("Project not found");
    }

    // Generate file key for receipt storage
    const extension = filename.split(".").pop() || "bin";
    const key = generateFileKey(org.id, `receipts/${projectId}`, extension);

    // Generate presigned upload URL (5 minute expiry)
    const result = await generatePresignedUploadUrl({
      key,
      contentType,
      expiresIn: 300,
    });

    return success({
      uploadUrl: result.uploadUrl,
      key,
      publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
    });
  } catch (error) {
    console.error("Error generating receipt upload URL:", error);
    return fail("Failed to generate upload URL");
  }
}

// ============================================================================
// RECURRING EXPENSE TEMPLATES
// ============================================================================

export interface CreateRecurringTemplateInput {
  name: string;
  description: string;
  category: ExpenseCategory;
  amountCents: number;
  currency?: string;
  vendor?: string;
  frequency: RecurrenceFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
}

export interface UpdateRecurringTemplateInput {
  name?: string;
  description?: string;
  category?: ExpenseCategory;
  amountCents?: number;
  currency?: string;
  vendor?: string;
  frequency?: RecurrenceFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
  isActive?: boolean;
}

/**
 * Get all recurring expense templates for the organization
 */
export async function getRecurringTemplates() {
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

    const templates = await prisma.recurringExpenseTemplate.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: "desc" },
    });

    return success(templates);
  } catch (error) {
    console.error("Error fetching recurring templates:", error);
    return fail("Failed to fetch recurring templates");
  }
}

/**
 * Create a new recurring expense template
 */
export async function createRecurringTemplate(input: CreateRecurringTemplateInput) {
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

    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(
      input.frequency,
      input.dayOfWeek,
      input.dayOfMonth,
      input.monthOfYear
    );

    const template = await prisma.recurringExpenseTemplate.create({
      data: {
        organizationId: org.id,
        name: input.name,
        description: input.description,
        category: input.category,
        amountCents: input.amountCents,
        currency: input.currency || "USD",
        vendor: input.vendor || null,
        frequency: input.frequency,
        dayOfWeek: input.dayOfWeek,
        dayOfMonth: input.dayOfMonth,
        monthOfYear: input.monthOfYear,
        nextDueDate,
        createdBy: userId,
      },
    });

    return success(template);
  } catch (error) {
    console.error("Error creating recurring template:", error);
    return fail("Failed to create recurring template");
  }
}

/**
 * Update a recurring expense template
 */
export async function updateRecurringTemplate(
  templateId: string,
  input: UpdateRecurringTemplateInput
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

    const existing = await prisma.recurringExpenseTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Template not found");
    }

    // Recalculate next due date if frequency settings changed
    const frequency = input.frequency || existing.frequency;
    const dayOfWeek = input.dayOfWeek ?? existing.dayOfWeek;
    const dayOfMonth = input.dayOfMonth ?? existing.dayOfMonth;
    const monthOfYear = input.monthOfYear ?? existing.monthOfYear;

    let nextDueDate = existing.nextDueDate;
    if (input.frequency !== undefined || input.dayOfWeek !== undefined ||
        input.dayOfMonth !== undefined || input.monthOfYear !== undefined) {
      nextDueDate = calculateNextDueDate(frequency, dayOfWeek, dayOfMonth, monthOfYear);
    }

    const template = await prisma.recurringExpenseTemplate.update({
      where: { id: templateId },
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        amountCents: input.amountCents,
        currency: input.currency,
        vendor: input.vendor,
        frequency: input.frequency,
        dayOfWeek: input.dayOfWeek,
        dayOfMonth: input.dayOfMonth,
        monthOfYear: input.monthOfYear,
        isActive: input.isActive,
        nextDueDate,
      },
    });

    return success(template);
  } catch (error) {
    console.error("Error updating recurring template:", error);
    return fail("Failed to update recurring template");
  }
}

/**
 * Delete a recurring expense template
 */
export async function deleteRecurringTemplate(templateId: string) {
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

    const existing = await prisma.recurringExpenseTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Template not found");
    }

    await prisma.recurringExpenseTemplate.delete({
      where: { id: templateId },
    });

    return ok();
  } catch (error) {
    console.error("Error deleting recurring template:", error);
    return fail("Failed to delete recurring template");
  }
}

/**
 * Generate expense from a template for a specific project
 */
export async function generateExpenseFromTemplate(
  templateId: string,
  projectId: string
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

    const template = await prisma.recurringExpenseTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || template.organizationId !== org.id) {
      return fail("Template not found");
    }

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!project) {
      return fail("Project not found");
    }

    // Create the expense from template
    const expense = await prisma.projectExpense.create({
      data: {
        organizationId: org.id,
        projectId,
        description: template.description,
        category: template.category,
        amountCents: template.amountCents,
        currency: template.currency,
        vendor: template.vendor,
        expenseDate: new Date(),
        isPaid: false,
        recurringTemplateId: template.id,
        createdBy: userId,
      },
    });

    // Update template's last generated date and next due date
    const nextDueDate = calculateNextDueDate(
      template.frequency,
      template.dayOfWeek,
      template.dayOfMonth,
      template.monthOfYear
    );

    await prisma.recurringExpenseTemplate.update({
      where: { id: templateId },
      data: {
        lastGeneratedAt: new Date(),
        nextDueDate,
      },
    });

    revalidatePath(`/galleries/${projectId}`);

    return success(expense);
  } catch (error) {
    console.error("Error generating expense from template:", error);
    return fail("Failed to generate expense");
  }
}

/**
 * Calculate the next due date based on frequency settings
 */
function calculateNextDueDate(
  frequency: RecurrenceFrequency,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
  monthOfYear?: number | null
): Date {
  const now = new Date();
  const result = new Date(now);

  switch (frequency) {
    case "weekly":
      // Next occurrence of the specified day of week
      const targetDay = dayOfWeek ?? 1; // Default to Monday
      const currentDay = result.getDay();
      const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;
      result.setDate(result.getDate() + daysUntilNext);
      break;

    case "biweekly":
      // Two weeks from now, on the specified day
      const biweeklyTarget = dayOfWeek ?? 1;
      const biweeklyCurrentDay = result.getDay();
      const daysUntilBiweekly = (biweeklyTarget - biweeklyCurrentDay + 7) % 7 || 7;
      result.setDate(result.getDate() + daysUntilBiweekly + 7);
      break;

    case "monthly":
      // Next month on the specified day
      const targetDayOfMonth = dayOfMonth ?? 1;
      result.setMonth(result.getMonth() + 1);
      result.setDate(Math.min(targetDayOfMonth, getDaysInMonth(result)));
      break;

    case "quarterly":
      // Next quarter on the specified day
      const quarterlyDay = dayOfMonth ?? 1;
      const currentQuarter = Math.floor(result.getMonth() / 3);
      const nextQuarterMonth = (currentQuarter + 1) * 3;
      result.setMonth(nextQuarterMonth);
      result.setDate(Math.min(quarterlyDay, getDaysInMonth(result)));
      break;

    case "yearly":
      // Next year on the specified month and day
      const yearlyMonth = (monthOfYear ?? 1) - 1;
      const yearlyDay = dayOfMonth ?? 1;
      result.setFullYear(result.getFullYear() + 1);
      result.setMonth(yearlyMonth);
      result.setDate(Math.min(yearlyDay, getDaysInMonth(result)));
      break;
  }

  // Reset time to midnight
  result.setHours(0, 0, 0, 0);
  return result;
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// ============================================================================
// EXPENSE APPROVAL WORKFLOW
// ============================================================================

/**
 * Submit an expense for approval
 */
export async function submitExpenseForApproval(expenseId: string) {
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

    const expense = await prisma.projectExpense.findUnique({
      where: { id: expenseId },
    });

    if (!expense || expense.organizationId !== org.id) {
      return fail("Expense not found");
    }

    if (expense.approvalStatus !== "none") {
      return fail("Expense has already been submitted for approval");
    }

    const updated = await prisma.projectExpense.update({
      where: { id: expenseId },
      data: {
        approvalStatus: "pending",
      },
    });

    revalidatePath(`/galleries/${expense.projectId}`);

    return success(updated);
  } catch (error) {
    console.error("Error submitting expense for approval:", error);
    return fail("Failed to submit expense for approval");
  }
}

/**
 * Approve an expense
 */
export async function approveExpense(expenseId: string) {
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

    const expense = await prisma.projectExpense.findUnique({
      where: { id: expenseId },
    });

    if (!expense || expense.organizationId !== org.id) {
      return fail("Expense not found");
    }

    if (expense.approvalStatus !== "pending") {
      return fail("Expense is not pending approval");
    }

    const updated = await prisma.projectExpense.update({
      where: { id: expenseId },
      data: {
        approvalStatus: "approved",
        approvedBy: userId,
        approvedAt: new Date(),
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    revalidatePath(`/galleries/${expense.projectId}`);

    return success(updated);
  } catch (error) {
    console.error("Error approving expense:", error);
    return fail("Failed to approve expense");
  }
}

/**
 * Reject an expense
 */
export async function rejectExpense(expenseId: string, reason: string) {
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

    const expense = await prisma.projectExpense.findUnique({
      where: { id: expenseId },
    });

    if (!expense || expense.organizationId !== org.id) {
      return fail("Expense not found");
    }

    if (expense.approvalStatus !== "pending") {
      return fail("Expense is not pending approval");
    }

    const updated = await prisma.projectExpense.update({
      where: { id: expenseId },
      data: {
        approvalStatus: "rejected",
        rejectedBy: userId,
        rejectedAt: new Date(),
        rejectionReason: reason,
        approvedBy: null,
        approvedAt: null,
      },
    });

    revalidatePath(`/galleries/${expense.projectId}`);

    return success(updated);
  } catch (error) {
    console.error("Error rejecting expense:", error);
    return fail("Failed to reject expense");
  }
}

/**
 * Get pending expenses for approval
 */
export async function getPendingApprovals() {
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

    const expenses = await prisma.projectExpense.findMany({
      where: {
        organizationId: org.id,
        approvalStatus: "pending",
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(expenses);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return fail("Failed to fetch pending approvals");
  }
}

// ============================================================================
// BUDGET TRACKING
// ============================================================================

export interface CreateBudgetInput {
  totalBudgetCents?: number;
  laborBudgetCents?: number;
  travelBudgetCents?: number;
  equipmentBudgetCents?: number;
  softwareBudgetCents?: number;
  materialsBudgetCents?: number;
  marketingBudgetCents?: number;
  feesBudgetCents?: number;
  insuranceBudgetCents?: number;
  otherBudgetCents?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  notifyOnWarning?: boolean;
  notifyOnCritical?: boolean;
  notifyOnOverBudget?: boolean;
}

export interface BudgetStatus {
  budget: {
    totalBudgetCents: number | null;
    byCategory: {
      category: ExpenseCategory;
      budgetCents: number | null;
      spentCents: number;
      remainingCents: number | null;
      percentUsed: number | null;
    }[];
  };
  totalSpent: number;
  totalRemaining: number | null;
  percentUsed: number | null;
  status: "ok" | "warning" | "critical" | "over";
  alerts: {
    type: "warning" | "critical" | "over";
    category: ExpenseCategory | "total";
    percentUsed: number;
    budgetCents: number;
    spentCents: number;
  }[];
}

/**
 * Get or create budget for a project
 */
export async function getProjectBudget(projectId: string) {
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

    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!project) {
      return fail("Project not found");
    }

    const budget = await prisma.projectBudget.findUnique({
      where: { projectId },
    });

    return success(budget);
  } catch (error) {
    console.error("Error fetching project budget:", error);
    return fail("Failed to fetch project budget");
  }
}

/**
 * Create or update budget for a project
 */
export async function upsertProjectBudget(projectId: string, input: CreateBudgetInput) {
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

    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!project) {
      return fail("Project not found");
    }

    const budget = await prisma.projectBudget.upsert({
      where: { projectId },
      create: {
        organizationId: org.id,
        projectId,
        ...input,
      },
      update: input,
    });

    revalidatePath(`/galleries/${projectId}`);

    return success(budget);
  } catch (error) {
    console.error("Error upserting project budget:", error);
    return fail("Failed to save project budget");
  }
}

/**
 * Get budget status with spending analysis
 */
export async function getProjectBudgetStatus(projectId: string) {
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

    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!project) {
      return fail("Project not found");
    }

    const budget = await prisma.projectBudget.findUnique({
      where: { projectId },
    });

    // Get expense totals by category
    const expenses = await prisma.projectExpense.findMany({
      where: { projectId, organizationId: org.id },
      select: { category: true, amountCents: true },
    });

    const categoryTotals = new Map<ExpenseCategory, number>();
    let totalSpent = 0;

    expenses.forEach((e) => {
      const current = categoryTotals.get(e.category) || 0;
      categoryTotals.set(e.category, current + e.amountCents);
      totalSpent += e.amountCents;
    });

    const categories: ExpenseCategory[] = [
      "labor", "travel", "equipment", "software",
      "materials", "marketing", "fees", "insurance", "other"
    ];

    const categoryBudgetFields: Record<ExpenseCategory, string> = {
      labor: "laborBudgetCents",
      travel: "travelBudgetCents",
      equipment: "equipmentBudgetCents",
      software: "softwareBudgetCents",
      materials: "materialsBudgetCents",
      marketing: "marketingBudgetCents",
      fees: "feesBudgetCents",
      insurance: "insuranceBudgetCents",
      other: "otherBudgetCents",
    };

    const alerts: BudgetStatus["alerts"] = [];
    const warningThreshold = budget?.warningThreshold ?? 80;
    const criticalThreshold = budget?.criticalThreshold ?? 95;

    const byCategory = categories.map((category) => {
      const budgetField = categoryBudgetFields[category] as keyof typeof budget;
      const budgetCents = budget ? (budget[budgetField] as number | null) : null;
      const spentCents = categoryTotals.get(category) || 0;
      const remainingCents = budgetCents !== null ? budgetCents - spentCents : null;
      const percentUsed = budgetCents !== null && budgetCents > 0
        ? Math.round((spentCents / budgetCents) * 100)
        : null;

      // Check for alerts
      if (percentUsed !== null) {
        if (percentUsed > 100) {
          alerts.push({
            type: "over",
            category,
            percentUsed,
            budgetCents: budgetCents!,
            spentCents,
          });
        } else if (percentUsed >= criticalThreshold) {
          alerts.push({
            type: "critical",
            category,
            percentUsed,
            budgetCents: budgetCents!,
            spentCents,
          });
        } else if (percentUsed >= warningThreshold) {
          alerts.push({
            type: "warning",
            category,
            percentUsed,
            budgetCents: budgetCents!,
            spentCents,
          });
        }
      }

      return {
        category,
        budgetCents,
        spentCents,
        remainingCents,
        percentUsed,
      };
    });

    const totalBudget = budget?.totalBudgetCents ?? null;
    const totalRemaining = totalBudget !== null ? totalBudget - totalSpent : null;
    const totalPercentUsed = totalBudget !== null && totalBudget > 0
      ? Math.round((totalSpent / totalBudget) * 100)
      : null;

    // Check total budget alerts
    if (totalPercentUsed !== null) {
      if (totalPercentUsed > 100) {
        alerts.push({
          type: "over",
          category: "total",
          percentUsed: totalPercentUsed,
          budgetCents: totalBudget!,
          spentCents: totalSpent,
        });
      } else if (totalPercentUsed >= criticalThreshold) {
        alerts.push({
          type: "critical",
          category: "total",
          percentUsed: totalPercentUsed,
          budgetCents: totalBudget!,
          spentCents: totalSpent,
        });
      } else if (totalPercentUsed >= warningThreshold) {
        alerts.push({
          type: "warning",
          category: "total",
          percentUsed: totalPercentUsed,
          budgetCents: totalBudget!,
          spentCents: totalSpent,
        });
      }
    }

    // Determine overall status
    let status: BudgetStatus["status"] = "ok";
    if (alerts.some((a) => a.type === "over")) {
      status = "over";
    } else if (alerts.some((a) => a.type === "critical")) {
      status = "critical";
    } else if (alerts.some((a) => a.type === "warning")) {
      status = "warning";
    }

    const result: BudgetStatus = {
      budget: {
        totalBudgetCents: totalBudget,
        byCategory,
      },
      totalSpent,
      totalRemaining,
      percentUsed: totalPercentUsed,
      status,
      alerts,
    };

    return success(result);
  } catch (error) {
    console.error("Error getting budget status:", error);
    return fail("Failed to get budget status");
  }
}

/**
 * Delete project budget
 */
export async function deleteProjectBudget(projectId: string) {
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

    const budget = await prisma.projectBudget.findUnique({
      where: { projectId },
    });

    if (!budget || budget.organizationId !== org.id) {
      return fail("Budget not found");
    }

    await prisma.projectBudget.delete({
      where: { projectId },
    });

    revalidatePath(`/galleries/${projectId}`);

    return ok();
  } catch (error) {
    console.error("Error deleting project budget:", error);
    return fail("Failed to delete budget");
  }
}

// ============================================================================
// PDF EXPENSE REPORTS
// ============================================================================

export interface ExpenseReportData {
  projectName: string;
  projectId: string;
  generatedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
  summary: {
    totalExpenses: number;
    totalPaid: number;
    totalUnpaid: number;
    expenseCount: number;
    byCategory: {
      category: ExpenseCategory;
      amount: number;
      count: number;
      percentage: number;
    }[];
  };
  expenses: {
    id: string;
    date: string;
    description: string;
    category: ExpenseCategory;
    vendor: string | null;
    amount: number;
    isPaid: boolean;
    approvalStatus: ExpenseApprovalStatus;
    notes: string | null;
  }[];
  budget?: {
    totalBudget: number | null;
    totalSpent: number;
    percentUsed: number | null;
    remaining: number | null;
    status: "ok" | "warning" | "critical" | "over";
  };
}

/**
 * Generate expense report data for PDF generation
 */
export async function generateExpenseReport(
  projectId: string,
  dateFrom?: Date,
  dateTo?: Date
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

    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
      select: { id: true, name: true },
    });

    if (!project) {
      return fail("Project not found");
    }

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) dateFilter.gte = dateFrom;
    if (dateTo) dateFilter.lte = dateTo;

    const expenses = await prisma.projectExpense.findMany({
      where: {
        projectId,
        organizationId: org.id,
        ...(Object.keys(dateFilter).length > 0 ? { expenseDate: dateFilter } : {}),
      },
      orderBy: { expenseDate: "desc" },
    });

    // Calculate summary
    let totalExpenses = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;
    const categoryTotals = new Map<ExpenseCategory, { amount: number; count: number }>();

    expenses.forEach((e) => {
      totalExpenses += e.amountCents;
      if (e.isPaid) {
        totalPaid += e.amountCents;
      } else {
        totalUnpaid += e.amountCents;
      }

      const current = categoryTotals.get(e.category) || { amount: 0, count: 0 };
      categoryTotals.set(e.category, {
        amount: current.amount + e.amountCents,
        count: current.count + 1,
      });
    });

    const byCategory = Array.from(categoryTotals.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0
          ? Math.round((data.amount / totalExpenses) * 100)
          : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Get budget info if available
    const budget = await prisma.projectBudget.findUnique({
      where: { projectId },
    });

    let budgetInfo: ExpenseReportData["budget"];
    if (budget?.totalBudgetCents) {
      const percentUsed = Math.round((totalExpenses / budget.totalBudgetCents) * 100);
      let status: "ok" | "warning" | "critical" | "over" = "ok";
      if (percentUsed > 100) status = "over";
      else if (percentUsed >= (budget.criticalThreshold ?? 95)) status = "critical";
      else if (percentUsed >= (budget.warningThreshold ?? 80)) status = "warning";

      budgetInfo = {
        totalBudget: budget.totalBudgetCents,
        totalSpent: totalExpenses,
        percentUsed,
        remaining: budget.totalBudgetCents - totalExpenses,
        status,
      };
    }

    // Format report data
    const reportData: ExpenseReportData = {
      projectName: project.name,
      projectId: project.id,
      generatedAt: new Date().toISOString(),
      dateRange: {
        from: dateFrom?.toISOString() || expenses[expenses.length - 1]?.expenseDate.toISOString() || new Date().toISOString(),
        to: dateTo?.toISOString() || expenses[0]?.expenseDate.toISOString() || new Date().toISOString(),
      },
      summary: {
        totalExpenses,
        totalPaid,
        totalUnpaid,
        expenseCount: expenses.length,
        byCategory,
      },
      expenses: expenses.map((e) => ({
        id: e.id,
        date: e.expenseDate.toISOString(),
        description: e.description,
        category: e.category,
        vendor: e.vendor,
        amount: e.amountCents,
        isPaid: e.isPaid,
        approvalStatus: e.approvalStatus,
        notes: e.notes,
      })),
      budget: budgetInfo,
    };

    return success(reportData);
  } catch (error) {
    console.error("Error generating expense report:", error);
    return fail("Failed to generate expense report");
  }
}

// ============================================================================
// EXPENSE DUPLICATION
// ============================================================================

/**
 * Duplicate an existing expense
 */
export async function duplicateExpense(expenseId: string, projectId?: string) {
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

    const existing = await prisma.projectExpense.findUnique({
      where: { id: expenseId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Expense not found");
    }

    // If a different project is specified, verify it belongs to the org
    const targetProjectId = projectId || existing.projectId;
    if (projectId && projectId !== existing.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, organizationId: org.id },
      });
      if (!project) {
        return fail("Target project not found");
      }
    }

    const duplicate = await prisma.projectExpense.create({
      data: {
        organizationId: org.id,
        projectId: targetProjectId,
        description: existing.description,
        category: existing.category,
        amountCents: existing.amountCents,
        currency: existing.currency,
        vendor: existing.vendor,
        teamMemberId: existing.teamMemberId,
        expenseDate: new Date(), // Set to today
        isPaid: false, // Default to unpaid for duplicates
        receiptUrl: null, // Don't copy receipt
        notes: existing.notes ? `(Duplicated) ${existing.notes}` : "(Duplicated)",
        createdBy: userId,
        // Enhanced tracking fields
        isBillable: existing.isBillable,
        paymentMethod: existing.paymentMethod,
        taxCents: existing.taxCents,
        mileageDistance: existing.mileageDistance,
        mileageRateCents: existing.mileageRateCents,
      },
    });

    revalidatePath(`/galleries/${targetProjectId}`);

    return success(duplicate);
  } catch (error) {
    console.error("Error duplicating expense:", error);
    return fail("Failed to duplicate expense");
  }
}

// ============================================================================
// MILEAGE CALCULATOR
// ============================================================================

/**
 * Get organization's default mileage rate
 */
export async function getOrganizationMileageRate() {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { expenseMileageRateCents: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    return success({ rateCents: org.expenseMileageRateCents });
  } catch (error) {
    console.error("Error fetching mileage rate:", error);
    return fail("Failed to fetch mileage rate");
  }
}

/**
 * Update organization's default mileage rate
 */
export async function updateOrganizationMileageRate(rateCents: number) {
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

    await prisma.organization.update({
      where: { id: org.id },
      data: { expenseMileageRateCents: rateCents },
    });

    return ok();
  } catch (error) {
    console.error("Error updating mileage rate:", error);
    return fail("Failed to update mileage rate");
  }
}

/**
 * Calculate mileage expense amount
 * Note: This is a pure utility function, not a server action
 */
export async function calculateMileageAmount(distance: number, rateCents: number): Promise<number> {
  return Math.round(distance * rateCents);
}

// ============================================================================
// EXPENSE FORECASTING
// ============================================================================

export interface ExpenseForecast {
  templateId: string;
  templateName: string;
  category: ExpenseCategory;
  amountCents: number;
  frequency: RecurrenceFrequency;
  nextDueDate: Date | null;
  projectedExpenses: {
    date: Date;
    amountCents: number;
  }[];
  totalProjected: number;
}

/**
 * Get expense forecast based on recurring templates
 */
export async function getExpenseForecast(
  projectId: string,
  months: number = 3
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

    // Get active recurring templates
    const templates = await prisma.recurringExpenseTemplate.findMany({
      where: {
        organizationId: org.id,
        isActive: true,
      },
    });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const forecasts: ExpenseForecast[] = templates.map((template) => {
      const projectedExpenses: { date: Date; amountCents: number }[] = [];
      const currentDate = template.nextDueDate ? new Date(template.nextDueDate) : new Date();

      // Generate projected expenses until end date
      while (currentDate <= endDate) {
        projectedExpenses.push({
          date: new Date(currentDate),
          amountCents: template.amountCents,
        });

        // Calculate next occurrence
        switch (template.frequency) {
          case "weekly":
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case "biweekly":
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          case "quarterly":
            currentDate.setMonth(currentDate.getMonth() + 3);
            break;
          case "yearly":
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
        }
      }

      return {
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        amountCents: template.amountCents,
        frequency: template.frequency,
        nextDueDate: template.nextDueDate,
        projectedExpenses,
        totalProjected: projectedExpenses.reduce((sum, e) => sum + e.amountCents, 0),
      };
    });

    // Calculate totals
    const totalByMonth = new Map<string, number>();
    const totalByCategory = new Map<ExpenseCategory, number>();

    forecasts.forEach((f) => {
      f.projectedExpenses.forEach((e) => {
        const monthKey = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`;
        totalByMonth.set(monthKey, (totalByMonth.get(monthKey) || 0) + e.amountCents);
        totalByCategory.set(f.category, (totalByCategory.get(f.category) || 0) + e.amountCents);
      });
    });

    return success({
      forecasts,
      summary: {
        totalProjected: forecasts.reduce((sum, f) => sum + f.totalProjected, 0),
        byMonth: Array.from(totalByMonth.entries()).map(([month, amount]) => ({
          month,
          amountCents: amount,
        })),
        byCategory: Array.from(totalByCategory.entries()).map(([category, amount]) => ({
          category,
          amountCents: amount,
        })),
      },
      periodMonths: months,
    });
  } catch (error) {
    console.error("Error generating expense forecast:", error);
    return fail("Failed to generate forecast");
  }
}

// ============================================================================
// VENDOR MANAGEMENT
// ============================================================================

export interface CreateVendorInput {
  name: string;
  description?: string;
  category?: ExpenseCategory;
  email?: string;
  phone?: string;
  website?: string;
  contactName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  defaultPaymentMethod?: PaymentMethod;
  taxId?: string;
  notes?: string;
}

export interface UpdateVendorInput {
  name?: string;
  description?: string;
  category?: ExpenseCategory;
  email?: string;
  phone?: string;
  website?: string;
  contactName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  defaultPaymentMethod?: PaymentMethod;
  taxId?: string;
  notes?: string;
  isActive?: boolean;
}

/**
 * Get all vendors for the organization
 */
export async function getVendors(includeInactive: boolean = false) {
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

    const vendors = await prisma.vendor.findMany({
      where: {
        organizationId: org.id,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { name: "asc" },
    });

    return success(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return fail("Failed to fetch vendors");
  }
}

/**
 * Get a single vendor
 */
export async function getVendor(vendorId: string) {
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

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || vendor.organizationId !== org.id) {
      return fail("Vendor not found");
    }

    return success(vendor);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return fail("Failed to fetch vendor");
  }
}

/**
 * Create a new vendor
 */
export async function createVendor(input: CreateVendorInput) {
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

    // Check for duplicate vendor name
    const existing = await prisma.vendor.findUnique({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: input.name,
        },
      },
    });

    if (existing) {
      return fail("A vendor with this name already exists");
    }

    const vendor = await prisma.vendor.create({
      data: {
        organizationId: org.id,
        name: input.name,
        description: input.description || null,
        category: input.category || "other",
        email: input.email || null,
        phone: input.phone || null,
        website: input.website || null,
        contactName: input.contactName || null,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        postalCode: input.postalCode || null,
        country: input.country || "US",
        defaultPaymentMethod: input.defaultPaymentMethod || null,
        taxId: input.taxId || null,
        notes: input.notes || null,
      },
    });

    return success(vendor);
  } catch (error) {
    console.error("Error creating vendor:", error);
    return fail("Failed to create vendor");
  }
}

/**
 * Update a vendor
 */
export async function updateVendor(vendorId: string, input: UpdateVendorInput) {
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

    const existing = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Vendor not found");
    }

    // If name is being updated, check for duplicates
    if (input.name && input.name !== existing.name) {
      const duplicate = await prisma.vendor.findUnique({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: input.name,
          },
        },
      });
      if (duplicate) {
        return fail("A vendor with this name already exists");
      }
    }

    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        email: input.email,
        phone: input.phone,
        website: input.website,
        contactName: input.contactName,
        address: input.address,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        defaultPaymentMethod: input.defaultPaymentMethod,
        taxId: input.taxId,
        notes: input.notes,
        isActive: input.isActive,
      },
    });

    return success(vendor);
  } catch (error) {
    console.error("Error updating vendor:", error);
    return fail("Failed to update vendor");
  }
}

/**
 * Delete a vendor
 */
export async function deleteVendor(vendorId: string) {
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

    const existing = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Vendor not found");
    }

    await prisma.vendor.delete({
      where: { id: vendorId },
    });

    return ok();
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return fail("Failed to delete vendor");
  }
}

/**
 * Search vendors by name
 */
export async function searchVendors(query: string) {
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

    const vendors = await prisma.vendor.findMany({
      where: {
        organizationId: org.id,
        isActive: true,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      orderBy: { name: "asc" },
      take: 10,
    });

    return success(vendors);
  } catch (error) {
    console.error("Error searching vendors:", error);
    return fail("Failed to search vendors");
  }
}

// ============================================================================
// BILLABLE EXPENSES SUMMARY
// ============================================================================

/**
 * Get billable expenses summary for a project
 */
export async function getBillableExpensesSummary(projectId: string) {
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

    const expenses = await prisma.projectExpense.findMany({
      where: {
        projectId,
        organizationId: org.id,
        isBillable: true,
      },
      select: {
        id: true,
        description: true,
        category: true,
        amountCents: true,
        taxCents: true,
        expenseDate: true,
        isPaid: true,
      },
      orderBy: { expenseDate: "desc" },
    });

    const totalBillable = expenses.reduce((sum, e) => sum + e.amountCents, 0);
    const totalTax = expenses.reduce((sum, e) => sum + (e.taxCents || 0), 0);

    return success({
      expenses,
      summary: {
        totalBillable,
        totalTax,
        totalWithTax: totalBillable + totalTax,
        count: expenses.length,
      },
    });
  } catch (error) {
    console.error("Error fetching billable expenses:", error);
    return fail("Failed to fetch billable expenses");
  }
}
