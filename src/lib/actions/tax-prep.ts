"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { requireOrganizationId, requireAuth } from "./auth-helper";
import type {
  TaxEntityType,
  TaxPrepStatus,
  TaxDocumentType,
  ExpenseCategory,
} from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface TaxPrepSessionSummary {
  id: string;
  taxYear: number;
  status: TaxPrepStatus;
  entityType: TaxEntityType | null;
  expensesReviewed: boolean;
  documentsUploaded: boolean;
  summaryGenerated: boolean;
  documentsCount: number;
  disclaimerAcceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TaxExpenseSummary {
  totalExpenses: number;
  totalMileage: number;
  expensesByCategory: {
    category: ExpenseCategory;
    amount: number;
    count: number;
  }[];
  monthlyBreakdown: {
    month: string;
    amount: number;
  }[];
}

interface TaxDocumentWithExtraction {
  id: string;
  type: TaxDocumentType;
  filename: string;
  fileUrl: string;
  extractedData: {
    vendor?: string;
    amount?: number;
    date?: string;
    category?: ExpenseCategory;
    description?: string;
    taxDeductible?: boolean;
  } | null;
  extractionStatus: string;
  extractionError: string | null;
  confirmed: boolean;
  confirmedData: Record<string, unknown> | null;
  createdAt: Date;
}

// ============================================================================
// TAX PREP SESSION OPERATIONS
// ============================================================================

/**
 * Get or create a tax prep session for a given year
 */
export async function getOrCreateTaxPrepSession(
  taxYear: number
): Promise<ActionResult<TaxPrepSessionSummary>> {
  try {
    const organizationId = await requireOrganizationId();

    // Try to find existing session
    let session = await prisma.taxPrepSession.findUnique({
      where: {
        organizationId_taxYear: {
          organizationId,
          taxYear,
        },
      },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    // Create if doesn't exist
    if (!session) {
      session = await prisma.taxPrepSession.create({
        data: {
          organizationId,
          taxYear,
          status: "not_started",
        },
        include: {
          _count: {
            select: { documents: true },
          },
        },
      });
    }

    return success({
      id: session.id,
      taxYear: session.taxYear,
      status: session.status,
      entityType: session.entityType,
      expensesReviewed: session.expensesReviewed,
      documentsUploaded: session.documentsUploaded,
      summaryGenerated: session.summaryGenerated,
      documentsCount: session._count.documents,
      disclaimerAcceptedAt: session.disclaimerAcceptedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error) {
    console.error("Error getting/creating tax prep session:", error);
    return fail("Failed to get or create tax prep session");
  }
}

/**
 * Get all tax prep sessions for the organization
 */
export async function getTaxPrepSessions(): Promise<
  ActionResult<TaxPrepSessionSummary[]>
> {
  try {
    const organizationId = await requireOrganizationId();

    const sessions = await prisma.taxPrepSession.findMany({
      where: { organizationId },
      orderBy: { taxYear: "desc" },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return success(
      sessions.map((session) => ({
        id: session.id,
        taxYear: session.taxYear,
        status: session.status,
        entityType: session.entityType,
        expensesReviewed: session.expensesReviewed,
        documentsUploaded: session.documentsUploaded,
        summaryGenerated: session.summaryGenerated,
        documentsCount: session._count.documents,
        disclaimerAcceptedAt: session.disclaimerAcceptedAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Error getting tax prep sessions:", error);
    return fail("Failed to get tax prep sessions");
  }
}

/**
 * Update tax prep session entity type
 */
export async function updateTaxEntityType(
  sessionId: string,
  entityType: TaxEntityType
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.taxPrepSession.update({
      where: {
        id: sessionId,
        organizationId, // Security check
      },
      data: {
        entityType,
        status: "in_progress",
      },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error updating entity type:", error);
    return fail("Failed to update entity type");
  }
}

/**
 * Update tax prep session status
 */
export async function updateTaxPrepStatus(
  sessionId: string,
  status: TaxPrepStatus
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.taxPrepSession.update({
      where: {
        id: sessionId,
        organizationId,
      },
      data: { status },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error updating tax prep status:", error);
    return fail("Failed to update status");
  }
}

/**
 * Mark expenses as reviewed for a tax prep session
 */
export async function markExpensesReviewed(
  sessionId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.taxPrepSession.update({
      where: {
        id: sessionId,
        organizationId,
      },
      data: {
        expensesReviewed: true,
        status: "in_progress",
      },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error marking expenses reviewed:", error);
    return fail("Failed to mark expenses as reviewed");
  }
}

/**
 * Accept the tax disclaimer
 */
export async function acceptTaxDisclaimer(
  sessionId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.taxPrepSession.update({
      where: {
        id: sessionId,
        organizationId,
      },
      data: {
        disclaimerAcceptedAt: new Date(),
      },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error accepting disclaimer:", error);
    return fail("Failed to accept disclaimer");
  }
}

/**
 * Submit feedback and rating for a completed tax prep session
 */
export async function submitTaxPrepFeedback(
  sessionId: string,
  rating: number,
  feedback?: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.taxPrepSession.update({
      where: {
        id: sessionId,
        organizationId,
      },
      data: {
        rating,
        feedback,
        status: "completed",
      },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return fail("Failed to submit feedback");
  }
}

// ============================================================================
// EXPENSE AGGREGATION FOR TAX
// ============================================================================

/**
 * Get expense summary for tax year
 */
export async function getTaxYearExpenseSummary(
  taxYear: number
): Promise<ActionResult<TaxExpenseSummary>> {
  try {
    const organizationId = await requireOrganizationId();

    const startDate = new Date(taxYear, 0, 1);
    const endDate = new Date(taxYear, 11, 31, 23, 59, 59);

    // Get all expenses for the year
    const expenses = await prisma.projectExpense.findMany({
      where: {
        organizationId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amountCents: true,
        category: true,
        mileageDistance: true,
        mileageRateCents: true,
        expenseDate: true,
      },
    });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amountCents, 0);
    const totalMileage = expenses.reduce(
      (sum, e) => sum + (e.mileageDistance || 0),
      0
    );

    // Group by category
    const categoryMap = new Map<
      ExpenseCategory,
      { amount: number; count: number }
    >();
    expenses.forEach((e) => {
      const current = categoryMap.get(e.category) || { amount: 0, count: 0 };
      categoryMap.set(e.category, {
        amount: current.amount + e.amountCents,
        count: current.count + 1,
      });
    });

    const expensesByCategory = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
      })
    );

    // Monthly breakdown
    const monthlyMap = new Map<string, number>();
    expenses.forEach((e) => {
      if (e.expenseDate) {
        const monthKey = `${e.expenseDate.getFullYear()}-${String(
          e.expenseDate.getMonth() + 1
        ).padStart(2, "0")}`;
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + e.amountCents);
      }
    });

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return success({
      totalExpenses,
      totalMileage,
      expensesByCategory,
      monthlyBreakdown,
    });
  } catch (error) {
    console.error("Error getting expense summary:", error);
    return fail("Failed to get expense summary");
  }
}

/**
 * Get revenue summary for tax year
 */
export async function getTaxYearRevenueSummary(taxYear: number): Promise<
  ActionResult<{
    totalRevenue: number;
    paidRevenue: number;
    monthlyBreakdown: { month: string; amount: number }[];
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const startDate = new Date(taxYear, 0, 1);
    const endDate = new Date(taxYear, 11, 31, 23, 59, 59);

    // Get all payments for the year
    const payments = await prisma.galleryPayment.findMany({
      where: {
        gallery: {
          organizationId,
        },
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amountCents: true,
        paidAt: true,
      },
    });

    // Get invoice payments
    const invoicePayments = await prisma.invoicePayment.findMany({
      where: {
        invoice: {
          organizationId,
        },
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amountCents: true,
        paidAt: true,
      },
    });

    const allPayments = [...payments, ...invoicePayments];
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amountCents, 0);

    // Monthly breakdown
    const monthlyMap = new Map<string, number>();
    allPayments.forEach((p) => {
      if (p.paidAt) {
        const monthKey = `${p.paidAt.getFullYear()}-${String(
          p.paidAt.getMonth() + 1
        ).padStart(2, "0")}`;
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + p.amountCents);
      }
    });

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return success({
      totalRevenue,
      paidRevenue: totalRevenue, // All payments are paid
      monthlyBreakdown,
    });
  } catch (error) {
    console.error("Error getting revenue summary:", error);
    return fail("Failed to get revenue summary");
  }
}

// ============================================================================
// TAX DOCUMENT OPERATIONS
// ============================================================================

/**
 * Get all documents for a tax prep session
 */
export async function getTaxDocuments(
  sessionId: string
): Promise<ActionResult<TaxDocumentWithExtraction[]>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify session belongs to organization
    const session = await prisma.taxPrepSession.findFirst({
      where: {
        id: sessionId,
        organizationId,
      },
    });

    if (!session) {
      return fail("Tax prep session not found");
    }

    const documents = await prisma.taxDocument.findMany({
      where: { taxPrepSessionId: sessionId },
      orderBy: { createdAt: "desc" },
    });

    return success(
      documents.map((doc) => ({
        id: doc.id,
        type: doc.type,
        filename: doc.filename,
        fileUrl: doc.fileUrl,
        extractedData: doc.extractedData as TaxDocumentWithExtraction["extractedData"],
        extractionStatus: doc.extractionStatus,
        extractionError: doc.extractionError,
        confirmed: doc.confirmed,
        confirmedData: doc.confirmedData as Record<string, unknown> | null,
        createdAt: doc.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error getting tax documents:", error);
    return fail("Failed to get tax documents");
  }
}

/**
 * Create a tax document record (after upload)
 */
export async function createTaxDocument(
  sessionId: string,
  data: {
    type: TaxDocumentType;
    filename: string;
    fileUrl: string;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify session belongs to organization
    const session = await prisma.taxPrepSession.findFirst({
      where: {
        id: sessionId,
        organizationId,
      },
    });

    if (!session) {
      return fail("Tax prep session not found");
    }

    const document = await prisma.taxDocument.create({
      data: {
        taxPrepSessionId: sessionId,
        type: data.type,
        filename: data.filename,
        fileUrl: data.fileUrl,
        extractionStatus: "pending",
      },
    });

    // Mark session as having documents
    await prisma.taxPrepSession.update({
      where: { id: sessionId },
      data: { documentsUploaded: true },
    });

    revalidatePath("/settings/tax-prep");
    return success({ id: document.id });
  } catch (error) {
    console.error("Error creating tax document:", error);
    return fail("Failed to create tax document");
  }
}

/**
 * Update extraction status and data for a document
 */
export async function updateTaxDocumentExtraction(
  documentId: string,
  data: {
    extractionStatus: "processing" | "completed" | "failed";
    extractedData?: Record<string, unknown>;
    extractionError?: string;
  }
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify document belongs to organization's session
    const document = await prisma.taxDocument.findFirst({
      where: { id: documentId },
      include: {
        taxPrepSession: {
          select: { organizationId: true },
        },
      },
    });

    if (!document || document.taxPrepSession.organizationId !== organizationId) {
      return fail("Document not found");
    }

    await prisma.taxDocument.update({
      where: { id: documentId },
      data: {
        extractionStatus: data.extractionStatus,
        extractedData: data.extractedData,
        extractionError: data.extractionError,
      },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error updating document extraction:", error);
    return fail("Failed to update document extraction");
  }
}

/**
 * Confirm extracted data (user approved)
 */
export async function confirmTaxDocumentData(
  documentId: string,
  confirmedData: Record<string, unknown>
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify document belongs to organization's session
    const document = await prisma.taxDocument.findFirst({
      where: { id: documentId },
      include: {
        taxPrepSession: {
          select: { organizationId: true },
        },
      },
    });

    if (!document || document.taxPrepSession.organizationId !== organizationId) {
      return fail("Document not found");
    }

    await prisma.taxDocument.update({
      where: { id: documentId },
      data: {
        confirmed: true,
        confirmedData,
      },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error confirming document data:", error);
    return fail("Failed to confirm document data");
  }
}

/**
 * Delete a tax document
 */
export async function deleteTaxDocument(
  documentId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify document belongs to organization's session
    const document = await prisma.taxDocument.findFirst({
      where: { id: documentId },
      include: {
        taxPrepSession: {
          select: { organizationId: true },
        },
      },
    });

    if (!document || document.taxPrepSession.organizationId !== organizationId) {
      return fail("Document not found");
    }

    await prisma.taxDocument.delete({
      where: { id: documentId },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error deleting document:", error);
    return fail("Failed to delete document");
  }
}

// ============================================================================
// TAX SUMMARY GENERATION
// ============================================================================

interface TaxSummaryData {
  taxYear: number;
  entityType: TaxEntityType | null;
  revenue: {
    total: number;
    byMonth: { month: string; amount: number }[];
  };
  expenses: {
    total: number;
    byCategory: { category: ExpenseCategory; amount: number; count: number }[];
    byMonth: { month: string; amount: number }[];
  };
  mileage: {
    totalMiles: number;
    deductibleAmount: number; // Using IRS standard rate
  };
  documents: {
    total: number;
    confirmed: number;
    byType: { type: TaxDocumentType; count: number }[];
  };
  netIncome: number;
  estimatedSelfEmploymentTax: number;
}

/**
 * Generate complete tax summary for a year
 */
export async function generateTaxSummary(
  sessionId: string
): Promise<ActionResult<TaxSummaryData>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get session
    const session = await prisma.taxPrepSession.findFirst({
      where: {
        id: sessionId,
        organizationId,
      },
      include: {
        documents: true,
      },
    });

    if (!session) {
      return fail("Tax prep session not found");
    }

    const taxYear = session.taxYear;

    // Get expense summary
    const expenseResult = await getTaxYearExpenseSummary(taxYear);
    if (!expenseResult.success) {
      return fail("Failed to get expense summary");
    }

    // Get revenue summary
    const revenueResult = await getTaxYearRevenueSummary(taxYear);
    if (!revenueResult.success) {
      return fail("Failed to get revenue summary");
    }

    const expenses = expenseResult.data;
    const revenue = revenueResult.data;

    // Calculate mileage deduction (2024 IRS rate: 67 cents/mile)
    const mileageRate = 67; // cents per mile
    const mileageDeduction = expenses.totalMileage * mileageRate;

    // Document stats
    const documentsByType = new Map<TaxDocumentType, number>();
    let confirmedCount = 0;
    session.documents.forEach((doc) => {
      documentsByType.set(doc.type, (documentsByType.get(doc.type) || 0) + 1);
      if (doc.confirmed) confirmedCount++;
    });

    // Calculate net income
    const totalExpensesWithMileage =
      expenses.totalExpenses / 100 + mileageDeduction / 100;
    const netIncome = revenue.totalRevenue / 100 - totalExpensesWithMileage;

    // Estimate self-employment tax (15.3% of 92.35% of net income)
    const selfEmploymentTax =
      netIncome > 0 ? netIncome * 0.9235 * 0.153 : 0;

    // Mark summary as generated
    await prisma.taxPrepSession.update({
      where: { id: sessionId },
      data: {
        summaryGenerated: true,
        status: "review_pending",
      },
    });

    revalidatePath("/settings/tax-prep");

    return success({
      taxYear,
      entityType: session.entityType,
      revenue: {
        total: revenue.totalRevenue / 100,
        byMonth: revenue.monthlyBreakdown.map((m) => ({
          ...m,
          amount: m.amount / 100,
        })),
      },
      expenses: {
        total: expenses.totalExpenses / 100,
        byCategory: expenses.expensesByCategory.map((c) => ({
          ...c,
          amount: c.amount / 100,
        })),
        byMonth: expenses.monthlyBreakdown.map((m) => ({
          ...m,
          amount: m.amount / 100,
        })),
      },
      mileage: {
        totalMiles: expenses.totalMileage,
        deductibleAmount: mileageDeduction / 100,
      },
      documents: {
        total: session.documents.length,
        confirmed: confirmedCount,
        byType: Array.from(documentsByType.entries()).map(([type, count]) => ({
          type,
          count,
        })),
      },
      netIncome,
      estimatedSelfEmploymentTax: selfEmploymentTax,
    });
  } catch (error) {
    console.error("Error generating tax summary:", error);
    return fail("Failed to generate tax summary");
  }
}

// ============================================================================
// REMINDER MANAGEMENT
// ============================================================================

/**
 * Set a reminder for tax prep
 */
export async function setTaxPrepReminder(
  sessionId: string,
  reminderDate: Date
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.taxPrepSession.update({
      where: {
        id: sessionId,
        organizationId,
      },
      data: {
        reminderDate,
        reminderDismissed: false,
      },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error setting reminder:", error);
    return fail("Failed to set reminder");
  }
}

/**
 * Dismiss the tax prep reminder
 */
export async function dismissTaxPrepReminder(
  sessionId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.taxPrepSession.update({
      where: {
        id: sessionId,
        organizationId,
      },
      data: {
        reminderDismissed: true,
      },
    });

    revalidatePath("/settings/tax-prep");
    return success();
  } catch (error) {
    console.error("Error dismissing reminder:", error);
    return fail("Failed to dismiss reminder");
  }
}

/**
 * Check if tax season modal should be shown (mid-January trigger)
 */
export async function shouldShowTaxSeasonModal(): Promise<
  ActionResult<{ show: boolean; year: number }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Show modal from January 1st through April 15th for previous tax year
    const isInTaxSeason = currentMonth >= 0 && currentMonth < 4; // Jan-Apr

    if (!isInTaxSeason) {
      return success({ show: false, year: currentYear - 1 });
    }

    const taxYear = currentYear - 1;

    // Check if session exists and if reminder is dismissed
    const session = await prisma.taxPrepSession.findUnique({
      where: {
        organizationId_taxYear: {
          organizationId,
          taxYear,
        },
      },
    });

    // Show modal if:
    // - No session exists yet
    // - Session exists but not started and reminder not dismissed
    const shouldShow =
      !session ||
      (session.status === "not_started" && !session.reminderDismissed);

    return success({ show: shouldShow, year: taxYear });
  } catch (error) {
    console.error("Error checking tax season modal:", error);
    return fail("Failed to check tax season status");
  }
}

// ============================================================================
// AI DOCUMENT PROCESSING
// ============================================================================

/**
 * Process a tax document with AI extraction
 * This is called after a document is uploaded
 */
export async function processTaxDocumentWithAI(
  documentId: string
): Promise<ActionResult<TaxDocumentWithExtraction>> {
  try {
    const organizationId = await requireOrganizationId();

    // Import the extraction service
    const { extractDocumentFromUrl } = await import("@/lib/ai/document-extraction");

    // Get document and verify ownership
    const document = await prisma.taxDocument.findFirst({
      where: { id: documentId },
      include: {
        taxPrepSession: {
          select: { organizationId: true },
        },
      },
    });

    if (!document || document.taxPrepSession.organizationId !== organizationId) {
      return fail("Document not found");
    }

    // Mark as processing
    await prisma.taxDocument.update({
      where: { id: documentId },
      data: { extractionStatus: "processing" },
    });

    // Extract data using AI
    const result = await extractDocumentFromUrl(document.fileUrl, document.type);

    if (!result.success) {
      // Mark as failed
      await prisma.taxDocument.update({
        where: { id: documentId },
        data: {
          extractionStatus: "failed",
          extractionError: result.error || "Unknown error",
        },
      });

      revalidatePath("/settings/tax-prep");
      return fail(result.error || "Extraction failed");
    }

    // Update document with extracted data
    const updated = await prisma.taxDocument.update({
      where: { id: documentId },
      data: {
        extractionStatus: "completed",
        extractedData: result.data as object,
        extractionError: null,
      },
    });

    revalidatePath("/settings/tax-prep");

    return success({
      id: updated.id,
      type: updated.type,
      filename: updated.filename,
      fileUrl: updated.fileUrl,
      extractedData: result.data || null,
      extractionStatus: updated.extractionStatus,
      extractionError: updated.extractionError,
      confirmed: updated.confirmed,
      confirmedData: updated.confirmedData as Record<string, unknown> | null,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    console.error("Error processing document with AI:", error);
    return fail("Failed to process document");
  }
}

/**
 * Batch process all pending documents in a session
 */
export async function processAllPendingDocuments(
  sessionId: string
): Promise<ActionResult<{ processed: number; failed: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify session ownership
    const session = await prisma.taxPrepSession.findFirst({
      where: {
        id: sessionId,
        organizationId,
      },
    });

    if (!session) {
      return fail("Tax prep session not found");
    }

    // Get all pending documents
    const pendingDocs = await prisma.taxDocument.findMany({
      where: {
        taxPrepSessionId: sessionId,
        extractionStatus: "pending",
      },
      select: { id: true },
    });

    let processed = 0;
    let failed = 0;

    // Process each document
    for (const doc of pendingDocs) {
      const result = await processTaxDocumentWithAI(doc.id);
      if (result.success) {
        processed++;
      } else {
        failed++;
      }
    }

    revalidatePath("/settings/tax-prep");
    return success({ processed, failed });
  } catch (error) {
    console.error("Error processing pending documents:", error);
    return fail("Failed to process documents");
  }
}
