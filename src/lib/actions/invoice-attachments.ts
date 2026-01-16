"use server";

/**
 * Invoice Attachments - Manage files attached to invoices
 * Allows attaching contracts, proposals, receipts, or other supporting documents
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { InvoiceAttachment } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { logActivity } from "@/lib/utils/activity";
import { deleteFile, extractKeyFromUrl } from "@/lib/storage/r2";

// ============================================================================
// Types
// ============================================================================

interface AddAttachmentInput {
  invoiceId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeMb?: number;
  description?: string;
}

interface UpdateAttachmentInput {
  fileName?: string;
  description?: string;
}

// ============================================================================
// Attachment Operations
// ============================================================================

/**
 * Add an attachment to an invoice
 */
export async function addInvoiceAttachment(
  input: AddAttachmentInput
): Promise<ActionResult<InvoiceAttachment>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  // Verify the invoice belongs to this organization
  const invoice = await prisma.invoice.findFirst({
    where: { id: input.invoiceId, organizationId },
    select: { id: true, invoiceNumber: true },
  });

  if (!invoice) {
    return fail("Invoice not found");
  }

  const attachment = await prisma.invoiceAttachment.create({
    data: {
      invoiceId: input.invoiceId,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSizeMb: input.fileSizeMb ?? 0,
      description: input.description,
    },
  });

  await logActivity({
    organizationId,
    type: "file_uploaded",
    description: `Attachment "${input.fileName}" added to invoice`,
    invoiceId: input.invoiceId,
    metadata: { fileName: input.fileName },
  });

  revalidatePath("/invoices/" + input.invoiceId);

  return success(attachment);
}

/**
 * Get all attachments for an invoice
 */
export async function getInvoiceAttachments(
  invoiceId: string
): Promise<ActionResult<InvoiceAttachment[]>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  // Verify the invoice belongs to this organization
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    select: { id: true },
  });

  if (!invoice) {
    return fail("Invoice not found");
  }

  const attachments = await prisma.invoiceAttachment.findMany({
    where: { invoiceId },
    orderBy: { createdAt: "desc" },
  });

  return success(attachments);
}

/**
 * Get a single attachment by ID
 */
export async function getInvoiceAttachment(
  attachmentId: string
): Promise<ActionResult<InvoiceAttachment>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const attachment = await prisma.invoiceAttachment.findUnique({
    where: { id: attachmentId },
    include: {
      invoice: {
        select: { organizationId: true },
      },
    },
  });

  if (!attachment || attachment.invoice.organizationId !== organizationId) {
    return fail("Attachment not found");
  }

  return success(attachment);
}

/**
 * Update attachment details (filename, description)
 */
export async function updateInvoiceAttachment(
  attachmentId: string,
  input: UpdateAttachmentInput
): Promise<ActionResult<InvoiceAttachment>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.invoiceAttachment.findUnique({
    where: { id: attachmentId },
    include: {
      invoice: {
        select: { organizationId: true, id: true },
      },
    },
  });

  if (!existing || existing.invoice.organizationId !== organizationId) {
    return fail("Attachment not found");
  }

  const attachment = await prisma.invoiceAttachment.update({
    where: { id: attachmentId },
    data: {
      ...(input.fileName !== undefined && { fileName: input.fileName }),
      ...(input.description !== undefined && { description: input.description }),
    },
  });

  revalidatePath("/invoices/" + existing.invoice.id);

  return success(attachment);
}

/**
 * Delete an attachment
 */
export async function deleteInvoiceAttachment(
  attachmentId: string
): Promise<ActionResult<void>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.invoiceAttachment.findUnique({
    where: { id: attachmentId },
    include: {
      invoice: {
        select: { organizationId: true, id: true, invoiceNumber: true },
      },
    },
  });

  if (!existing || existing.invoice.organizationId !== organizationId) {
    return fail("Attachment not found");
  }

  await prisma.invoiceAttachment.delete({
    where: { id: attachmentId },
  });

  await logActivity({
    organizationId,
    type: "file_downloaded", // Using file_downloaded for deletion as closest match
    description: `Attachment "${existing.fileName}" removed from invoice ${existing.invoice.invoiceNumber}`,
    invoiceId: existing.invoice.id,
    metadata: { fileName: existing.fileName },
  });

  revalidatePath("/invoices/" + existing.invoice.id);

  // Delete the actual file from R2 storage
  const fileKey = extractKeyFromUrl(existing.fileUrl);
  if (fileKey) {
    try {
      await deleteFile(fileKey);
    } catch (error) {
      // Log but don't fail - the database record is already deleted
      console.error("Failed to delete attachment file from storage:", error);
    }
  }

  return ok();
}

/**
 * Bulk delete attachments
 */
export async function bulkDeleteInvoiceAttachments(
  attachmentIds: string[]
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  let deleted = 0;
  let failed = 0;
  const invoiceIdsToRevalidate = new Set<string>();
  const fileUrlsToDelete: string[] = [];

  for (const attachmentId of attachmentIds) {
    const existing = await prisma.invoiceAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        invoice: {
          select: { organizationId: true, id: true },
        },
      },
    });

    if (!existing || existing.invoice.organizationId !== organizationId) {
      failed++;
      continue;
    }

    await prisma.invoiceAttachment.delete({
      where: { id: attachmentId },
    });

    // Track file URL for storage cleanup
    fileUrlsToDelete.push(existing.fileUrl);
    invoiceIdsToRevalidate.add(existing.invoice.id);
    deleted++;
  }

  for (const invoiceId of invoiceIdsToRevalidate) {
    revalidatePath("/invoices/" + invoiceId);
  }

  // Delete actual files from R2 storage
  for (const fileUrl of fileUrlsToDelete) {
    const fileKey = extractKeyFromUrl(fileUrl);
    if (fileKey) {
      try {
        await deleteFile(fileKey);
      } catch (error) {
        // Log but don't fail - the database records are already deleted
        console.error("Failed to delete attachment file from storage:", error);
      }
    }
  }

  return success({ deleted, failed });
}

/**
 * Get total attachment count and size for an invoice
 */
export async function getInvoiceAttachmentStats(
  invoiceId: string
): Promise<ActionResult<{ count: number; totalSizeMb: number }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    select: { id: true },
  });

  if (!invoice) {
    return fail("Invoice not found");
  }

  const stats = await prisma.invoiceAttachment.aggregate({
    where: { invoiceId },
    _count: { id: true },
    _sum: { fileSizeMb: true },
  });

  return success({
    count: stats._count.id,
    totalSizeMb: stats._sum.fileSizeMb ?? 0,
  });
}
