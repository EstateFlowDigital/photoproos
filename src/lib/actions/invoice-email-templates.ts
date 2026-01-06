"use server";

/**
 * Invoice Email Templates - Customizable email templates for invoice communications
 * Supports templates for: invoice sent, reminders, overdue notices, payment confirmations
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { InvoiceEmailTemplate, InvoiceEmailType } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { logActivity } from "@/lib/utils/activity";

// ============================================================================
// Types
// ============================================================================

export interface CreateEmailTemplateInput {
  name: string;
  emailType: InvoiceEmailType;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  fromName?: string;
  replyTo?: string;
  sendDelayDays?: number;
  ccEmails?: string[];
  bccEmails?: string[];
  isDefault?: boolean;
}

export interface UpdateEmailTemplateInput {
  name?: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  fromName?: string;
  replyTo?: string;
  sendDelayDays?: number;
  ccEmails?: string[];
  bccEmails?: string[];
  isDefault?: boolean;
  isActive?: boolean;
}

// Available template variables for email content
export const TEMPLATE_VARIABLES = {
  common: [
    { key: "{{organizationName}}", description: "Your business name" },
    { key: "{{organizationEmail}}", description: "Your business email" },
    { key: "{{organizationPhone}}", description: "Your business phone" },
    { key: "{{currentDate}}", description: "Today's date" },
    { key: "{{currentYear}}", description: "Current year" },
  ],
  client: [
    { key: "{{clientName}}", description: "Client's full name" },
    { key: "{{clientFirstName}}", description: "Client's first name" },
    { key: "{{clientEmail}}", description: "Client's email address" },
    { key: "{{clientPhone}}", description: "Client's phone number" },
  ],
  invoice: [
    { key: "{{invoiceNumber}}", description: "Invoice number" },
    { key: "{{invoiceDate}}", description: "Invoice issue date" },
    { key: "{{dueDate}}", description: "Payment due date" },
    { key: "{{totalAmount}}", description: "Total invoice amount" },
    { key: "{{balanceDue}}", description: "Remaining balance due" },
    { key: "{{paidAmount}}", description: "Amount already paid" },
    { key: "{{invoiceLink}}", description: "Link to view/pay invoice" },
    { key: "{{daysOverdue}}", description: "Number of days overdue" },
  ],
  estimate: [
    { key: "{{estimateNumber}}", description: "Estimate/quote number" },
    { key: "{{estimateDate}}", description: "Estimate issue date" },
    { key: "{{validUntil}}", description: "Quote validity date" },
    { key: "{{estimateTotal}}", description: "Estimate total amount" },
    { key: "{{estimateLink}}", description: "Link to view/approve estimate" },
  ],
} as const;

// Default templates for each email type
const DEFAULT_TEMPLATES: Record<InvoiceEmailType, { subject: string; bodyHtml: string }> = {
  invoice_created: {
    subject: "Invoice {{invoiceNumber}} Created",
    bodyHtml: `
      <p>Hi {{clientFirstName}},</p>
      <p>A new invoice has been created for you.</p>
      <p><strong>Invoice #:</strong> {{invoiceNumber}}<br>
      <strong>Amount:</strong> {{totalAmount}}<br>
      <strong>Due Date:</strong> {{dueDate}}</p>
      <p><a href="{{invoiceLink}}">View Invoice</a></p>
      <p>Thank you for your business!</p>
      <p>{{organizationName}}</p>
    `,
  },
  invoice_sent: {
    subject: "Invoice {{invoiceNumber}} from {{organizationName}}",
    bodyHtml: `
      <p>Hi {{clientFirstName}},</p>
      <p>Please find attached your invoice from {{organizationName}}.</p>
      <p><strong>Invoice #:</strong> {{invoiceNumber}}<br>
      <strong>Amount Due:</strong> {{totalAmount}}<br>
      <strong>Due Date:</strong> {{dueDate}}</p>
      <p><a href="{{invoiceLink}}">View & Pay Invoice</a></p>
      <p>If you have any questions, please don't hesitate to reach out.</p>
      <p>Thank you for your business!</p>
      <p>Best regards,<br>{{organizationName}}</p>
    `,
  },
  invoice_reminder: {
    subject: "Friendly Reminder: Invoice {{invoiceNumber}} Due Soon",
    bodyHtml: `
      <p>Hi {{clientFirstName}},</p>
      <p>This is a friendly reminder that invoice {{invoiceNumber}} for {{balanceDue}} is due on {{dueDate}}.</p>
      <p><a href="{{invoiceLink}}">Pay Now</a></p>
      <p>If you've already sent payment, please disregard this message.</p>
      <p>Thank you,<br>{{organizationName}}</p>
    `,
  },
  invoice_overdue: {
    subject: "Overdue Notice: Invoice {{invoiceNumber}}",
    bodyHtml: `
      <p>Hi {{clientFirstName}},</p>
      <p>This is a notice that invoice {{invoiceNumber}} is now {{daysOverdue}} days past due.</p>
      <p><strong>Amount Due:</strong> {{balanceDue}}<br>
      <strong>Original Due Date:</strong> {{dueDate}}</p>
      <p>Please arrange payment at your earliest convenience.</p>
      <p><a href="{{invoiceLink}}">Pay Now</a></p>
      <p>If you have any questions or concerns, please contact us.</p>
      <p>Thank you,<br>{{organizationName}}</p>
    `,
  },
  invoice_paid: {
    subject: "Payment Received - Invoice {{invoiceNumber}}",
    bodyHtml: `
      <p>Hi {{clientFirstName}},</p>
      <p>Thank you! We've received your payment for invoice {{invoiceNumber}}.</p>
      <p><strong>Amount Paid:</strong> {{paidAmount}}</p>
      <p><a href="{{invoiceLink}}">View Receipt</a></p>
      <p>We appreciate your business!</p>
      <p>Best regards,<br>{{organizationName}}</p>
    `,
  },
  invoice_partial: {
    subject: "Partial Payment Received - Invoice {{invoiceNumber}}",
    bodyHtml: `
      <p>Hi {{clientFirstName}},</p>
      <p>We've received a partial payment on invoice {{invoiceNumber}}.</p>
      <p><strong>Payment Received:</strong> {{paidAmount}}<br>
      <strong>Remaining Balance:</strong> {{balanceDue}}</p>
      <p><a href="{{invoiceLink}}">Pay Remaining Balance</a></p>
      <p>Thank you,<br>{{organizationName}}</p>
    `,
  },
  estimate_sent: {
    subject: "Quote {{estimateNumber}} from {{organizationName}}",
    bodyHtml: `
      <p>Hi {{clientFirstName}},</p>
      <p>Thank you for your interest! Please find your quote below.</p>
      <p><strong>Quote #:</strong> {{estimateNumber}}<br>
      <strong>Total:</strong> {{estimateTotal}}<br>
      <strong>Valid Until:</strong> {{validUntil}}</p>
      <p><a href="{{estimateLink}}">View & Approve Quote</a></p>
      <p>If you have any questions, please don't hesitate to reach out.</p>
      <p>Best regards,<br>{{organizationName}}</p>
    `,
  },
  estimate_approved: {
    subject: "Quote {{estimateNumber}} Approved!",
    bodyHtml: `
      <p>Hi {{clientFirstName}},</p>
      <p>Great news! Your quote {{estimateNumber}} has been approved.</p>
      <p>We'll be in touch shortly to discuss next steps.</p>
      <p>Thank you for choosing {{organizationName}}!</p>
      <p>Best regards,<br>{{organizationName}}</p>
    `,
  },
  estimate_rejected: {
    subject: "Quote {{estimateNumber}} - Thank You",
    bodyHtml: `
      <p>Hi {{clientFirstName}},</p>
      <p>We received your response regarding quote {{estimateNumber}}.</p>
      <p>If you'd like to discuss alternative options or have any questions, please don't hesitate to reach out.</p>
      <p>We hope to work with you in the future!</p>
      <p>Best regards,<br>{{organizationName}}</p>
    `,
  },
};

// ============================================================================
// Template CRUD Operations
// ============================================================================

/**
 * Create a new email template
 */
export async function createInvoiceEmailTemplate(
  input: CreateEmailTemplateInput
): Promise<ActionResult<InvoiceEmailTemplate>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  // If setting as default, unset other defaults for this email type
  if (input.isDefault) {
    await prisma.invoiceEmailTemplate.updateMany({
      where: {
        organizationId,
        emailType: input.emailType,
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }

  const template = await prisma.invoiceEmailTemplate.create({
    data: {
      organizationId,
      name: input.name,
      emailType: input.emailType,
      subject: input.subject,
      bodyHtml: input.bodyHtml,
      bodyText: input.bodyText,
      fromName: input.fromName,
      replyTo: input.replyTo,
      sendDelayDays: input.sendDelayDays,
      ccEmails: input.ccEmails ?? [],
      bccEmails: input.bccEmails ?? [],
      isDefault: input.isDefault ?? false,
    },
  });

  await logActivity({
    organizationId,
    type: "settings_updated",
    description: `Invoice email template "${input.name}" created`,
    metadata: { templateId: template.id, name: input.name, emailType: input.emailType },
  });

  revalidatePath("/settings/email-templates");

  return success(template);
}

/**
 * Get a specific email template
 */
export async function getInvoiceEmailTemplate(
  templateId: string
): Promise<ActionResult<InvoiceEmailTemplate>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const template = await prisma.invoiceEmailTemplate.findFirst({
    where: { id: templateId, organizationId },
  });

  if (!template) {
    return fail("Template not found");
  }

  return success(template);
}

/**
 * List all email templates for the organization
 */
export async function listInvoiceEmailTemplates(options?: {
  emailType?: InvoiceEmailType;
  activeOnly?: boolean;
}): Promise<ActionResult<InvoiceEmailTemplate[]>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const templates = await prisma.invoiceEmailTemplate.findMany({
    where: {
      organizationId,
      ...(options?.emailType && { emailType: options.emailType }),
      ...(options?.activeOnly && { isActive: true }),
    },
    orderBy: [{ emailType: "asc" }, { isDefault: "desc" }, { name: "asc" }],
  });

  return success(templates);
}

/**
 * Update an email template
 */
export async function updateInvoiceEmailTemplate(
  templateId: string,
  input: UpdateEmailTemplateInput
): Promise<ActionResult<InvoiceEmailTemplate>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.invoiceEmailTemplate.findFirst({
    where: { id: templateId, organizationId },
  });

  if (!existing) {
    return fail("Template not found");
  }

  // If setting as default, unset other defaults for this email type
  if (input.isDefault && !existing.isDefault) {
    await prisma.invoiceEmailTemplate.updateMany({
      where: {
        organizationId,
        emailType: existing.emailType,
        isDefault: true,
        id: { not: templateId },
      },
      data: { isDefault: false },
    });
  }

  const template = await prisma.invoiceEmailTemplate.update({
    where: { id: templateId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.subject !== undefined && { subject: input.subject }),
      ...(input.bodyHtml !== undefined && { bodyHtml: input.bodyHtml }),
      ...(input.bodyText !== undefined && { bodyText: input.bodyText }),
      ...(input.fromName !== undefined && { fromName: input.fromName }),
      ...(input.replyTo !== undefined && { replyTo: input.replyTo }),
      ...(input.sendDelayDays !== undefined && { sendDelayDays: input.sendDelayDays }),
      ...(input.ccEmails !== undefined && { ccEmails: input.ccEmails }),
      ...(input.bccEmails !== undefined && { bccEmails: input.bccEmails }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });

  revalidatePath("/settings/email-templates");

  return success(template);
}

/**
 * Delete an email template
 */
export async function deleteInvoiceEmailTemplate(
  templateId: string
): Promise<ActionResult<void>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.invoiceEmailTemplate.findFirst({
    where: { id: templateId, organizationId },
  });

  if (!existing) {
    return fail("Template not found");
  }

  await prisma.invoiceEmailTemplate.delete({
    where: { id: templateId },
  });

  await logActivity({
    organizationId,
    type: "settings_updated",
    description: `Invoice email template "${existing.name}" deleted`,
    metadata: { templateId, name: existing.name },
  });

  revalidatePath("/settings/email-templates");

  return ok();
}

/**
 * Duplicate an email template
 */
export async function duplicateInvoiceEmailTemplate(
  templateId: string,
  newName?: string
): Promise<ActionResult<InvoiceEmailTemplate>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const original = await prisma.invoiceEmailTemplate.findFirst({
    where: { id: templateId, organizationId },
  });

  if (!original) {
    return fail("Template not found");
  }

  const template = await prisma.invoiceEmailTemplate.create({
    data: {
      organizationId,
      name: newName ?? `${original.name} (Copy)`,
      emailType: original.emailType,
      subject: original.subject,
      bodyHtml: original.bodyHtml,
      bodyText: original.bodyText,
      fromName: original.fromName,
      replyTo: original.replyTo,
      sendDelayDays: original.sendDelayDays,
      ccEmails: original.ccEmails,
      bccEmails: original.bccEmails,
      isDefault: false, // Never copy as default
    },
  });

  revalidatePath("/settings/email-templates");

  return success(template);
}

// ============================================================================
// Template Retrieval & Usage
// ============================================================================

/**
 * Get the default template for a specific email type
 * Falls back to system default if no custom template exists
 */
export async function getDefaultTemplateForType(
  emailType: InvoiceEmailType
): Promise<ActionResult<{ subject: string; bodyHtml: string; bodyText?: string; template?: InvoiceEmailTemplate }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  // Try to find custom default template
  const template = await prisma.invoiceEmailTemplate.findFirst({
    where: {
      organizationId,
      emailType,
      isDefault: true,
      isActive: true,
    },
  });

  if (template) {
    return success({
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      bodyText: template.bodyText ?? undefined,
      template,
    });
  }

  // Fall back to system default
  const systemDefault = DEFAULT_TEMPLATES[emailType];
  return success({
    subject: systemDefault.subject,
    bodyHtml: systemDefault.bodyHtml,
  });
}

/**
 * Record template usage (for analytics)
 */
export async function recordTemplateUsage(
  templateId: string
): Promise<ActionResult<void>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  await prisma.invoiceEmailTemplate.update({
    where: { id: templateId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  return ok();
}

// ============================================================================
// Template Variable Replacement
// ============================================================================

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string | number | undefined>
): string {
  let result = content;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, "g"), String(value ?? ""));
  }

  return result;
}

/**
 * Build variables object for invoice emails
 */
export async function buildInvoiceEmailVariables(
  invoiceId: string
): Promise<ActionResult<Record<string, string>>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: {
      client: true,
      organization: true,
    },
  });

  if (!invoice) {
    return fail("Invoice not found");
  }

  const balanceDue = invoice.totalCents - invoice.paidAmountCents;
  const daysOverdue = invoice.dueDate
    ? Math.max(0, Math.floor((Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString("en-US", { dateStyle: "medium" }) : "";

  const variables: Record<string, string> = {
    // Organization
    organizationName: invoice.organization.name,
    organizationEmail: "", // Organization contact email not stored on model
    organizationPhone: "", // Organization contact phone not stored on model

    // Client
    clientName: invoice.client?.fullName || "",
    clientFirstName: invoice.client?.fullName?.split(" ")[0] || "",
    clientEmail: invoice.client?.email || "",
    clientPhone: invoice.client?.phone || "",

    // Invoice
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: formatDate(invoice.issueDate),
    dueDate: formatDate(invoice.dueDate),
    totalAmount: formatCurrency(invoice.totalCents),
    balanceDue: formatCurrency(balanceDue),
    paidAmount: formatCurrency(invoice.paidAmountCents),
    invoiceLink: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`,
    daysOverdue: String(daysOverdue),

    // Common
    currentDate: formatDate(new Date()),
    currentYear: new Date().getFullYear().toString(),
  };

  return success(variables);
}

/**
 * Build variables object for estimate emails
 */
export async function buildEstimateEmailVariables(
  estimateId: string
): Promise<ActionResult<Record<string, string>>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const estimate = await prisma.estimate.findFirst({
    where: { id: estimateId, organizationId },
    include: {
      client: true,
      organization: true,
    },
  });

  if (!estimate) {
    return fail("Estimate not found");
  }

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString("en-US", { dateStyle: "medium" }) : "";

  const variables: Record<string, string> = {
    // Organization
    organizationName: estimate.organization.name,
    organizationEmail: "", // Organization contact email not stored on model
    organizationPhone: "", // Organization contact phone not stored on model

    // Client
    clientName: estimate.client?.fullName || "",
    clientFirstName: estimate.client?.fullName?.split(" ")[0] || "",
    clientEmail: estimate.client?.email || "",
    clientPhone: estimate.client?.phone || "",

    // Estimate
    estimateNumber: estimate.estimateNumber,
    estimateDate: formatDate(estimate.issueDate),
    validUntil: formatDate(estimate.validUntil),
    estimateTotal: formatCurrency(estimate.totalCents),
    estimateLink: `${process.env.NEXT_PUBLIC_APP_URL}/quote/${estimate.id}`,

    // Common
    currentDate: formatDate(new Date()),
    currentYear: new Date().getFullYear().toString(),
  };

  return success(variables);
}

// ============================================================================
// Initialize Default Templates
// ============================================================================

/**
 * Initialize default templates for a new organization
 */
export async function initializeDefaultTemplates(): Promise<ActionResult<{ created: number }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  // Check if templates already exist
  const existingCount = await prisma.invoiceEmailTemplate.count({
    where: { organizationId },
  });

  if (existingCount > 0) {
    return success({ created: 0 });
  }

  const emailTypes = Object.keys(DEFAULT_TEMPLATES) as InvoiceEmailType[];
  let created = 0;

  for (const emailType of emailTypes) {
    const defaultTemplate = DEFAULT_TEMPLATES[emailType];
    await prisma.invoiceEmailTemplate.create({
      data: {
        organizationId,
        name: getDefaultTemplateName(emailType),
        emailType,
        subject: defaultTemplate.subject,
        bodyHtml: defaultTemplate.bodyHtml,
        isDefault: true,
      },
    });
    created++;
  }

  return success({ created });
}

function getDefaultTemplateName(emailType: InvoiceEmailType): string {
  const names: Record<InvoiceEmailType, string> = {
    invoice_created: "Invoice Created",
    invoice_sent: "Invoice Sent",
    invoice_reminder: "Payment Reminder",
    invoice_overdue: "Overdue Notice",
    invoice_paid: "Payment Confirmation",
    invoice_partial: "Partial Payment Received",
    estimate_sent: "Quote Sent",
    estimate_approved: "Quote Approved",
    estimate_rejected: "Quote Declined",
  };
  return names[emailType];
}

// ============================================================================
// Template Statistics
// ============================================================================

/**
 * Get template usage statistics
 */
export async function getTemplateStats(): Promise<
  ActionResult<{
    totalTemplates: number;
    activeTemplates: number;
    byType: Record<string, number>;
    mostUsed: Array<{ id: string; name: string; emailType: string; usageCount: number }>;
  }>
> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const [total, active, byTypeRaw, mostUsed] = await Promise.all([
    prisma.invoiceEmailTemplate.count({ where: { organizationId } }),
    prisma.invoiceEmailTemplate.count({ where: { organizationId, isActive: true } }),
    prisma.invoiceEmailTemplate.groupBy({
      by: ["emailType"],
      where: { organizationId },
      _count: { id: true },
    }),
    prisma.invoiceEmailTemplate.findMany({
      where: { organizationId },
      orderBy: { usageCount: "desc" },
      take: 5,
      select: { id: true, name: true, emailType: true, usageCount: true },
    }),
  ]);

  const byType: Record<string, number> = {};
  for (const item of byTypeRaw) {
    byType[item.emailType] = item._count.id;
  }

  return success({
    totalTemplates: total,
    activeTemplates: active,
    byType,
    mostUsed,
  });
}

/**
 * Get list of available template variables for documentation
 */
export function getAvailableTemplateVariables() {
  return TEMPLATE_VARIABLES;
}
