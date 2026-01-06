"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { revalidatePath } from "next/cache";
import { Prisma, type CustomFormFieldType } from "@prisma/client";
import { sendFormSubmissionNotificationEmail } from "@/lib/email/send";
import { ok } from "@/lib/types/action-result";

// ============================================================================
// TYPES
// ============================================================================

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldInput {
  name: string;
  label: string;
  type: CustomFormFieldType;
  placeholder?: string;
  helpText?: string;
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
  options?: FormFieldOption[];
  position?: number;
  width?: "full" | "half" | "third";
  conditionalLogic?: {
    showWhen: {
      field: string;
      operator: "equals" | "not_equals" | "contains" | "not_empty";
      value?: string;
    };
  };
}

export interface CreateFormInput {
  name: string;
  description?: string;
  slug?: string;
  portfolioWebsiteId?: string;
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string;
  sendEmailOnSubmission?: boolean;
  notificationEmails?: string;
  fields?: FormFieldInput[];
}

export interface UpdateFormInput {
  name?: string;
  description?: string;
  slug?: string;
  portfolioWebsiteId?: string | null;
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string | null;
  isActive?: boolean;
  sendEmailOnSubmission?: boolean;
  notificationEmails?: string | null;
  maxSubmissions?: number | null;
  submissionsPerUser?: number | null;
}

// ============================================================================
// FORM CRUD
// ============================================================================

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const toInputJsonValue = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

function formatFieldValue(value: unknown, fieldType: string): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  // Handle arrays (multiselect, checkbox)
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  // Handle booleans
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  // Handle dates
  if (fieldType === "date" && typeof value === "string") {
    try {
      return new Date(value).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return String(value);
    }
  }

  // Handle datetime
  if (fieldType === "datetime" && typeof value === "string") {
    try {
      return new Date(value).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(value);
    }
  }

  return String(value);
}

async function getUniqueSlug(base: string, excludeId?: string) {
  let slug = base || "form";
  let counter = 1;

  const where: { slug: string; id?: { not: string } } = { slug };
  if (excludeId) where.id = { not: excludeId };

  while (await prisma.customForm.findFirst({ where })) {
    slug = `${base}-${counter}`;
    where.slug = slug;
    counter += 1;
  }

  return slug;
}

export async function getForms(portfolioId?: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const where: { organizationId: string; portfolioWebsiteId?: string } = { organizationId };
    if (portfolioId) {
      where.portfolioWebsiteId = portfolioId;
    }

    const forms = await prisma.customForm.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        portfolioWebsite: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { fields: true, submissions: true },
        },
      },
    });

    return { success: true, forms };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return { success: false, error: "Failed to fetch forms" };
  }
}

export async function getForm(formId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const form = await prisma.customForm.findFirst({
      where: { id: formId, organizationId },
      include: {
        portfolioWebsite: {
          select: { id: true, name: true, slug: true },
        },
        fields: {
          orderBy: { position: "asc" },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!form) {
      return { success: false, error: "Form not found" };
    }

    return { success: true, form };
  } catch (error) {
    console.error("Error fetching form:", error);
    return { success: false, error: "Failed to fetch form" };
  }
}

export async function createForm(input: CreateFormInput) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const baseSlug = slugify(input.slug || input.name);
    const slug = await getUniqueSlug(baseSlug);

    const form = await prisma.customForm.create({
      data: {
        organizationId,
        name: input.name,
        slug,
        description: input.description,
        portfolioWebsiteId: input.portfolioWebsiteId,
        submitButtonText: input.submitButtonText || "Submit",
        successMessage: input.successMessage || "Thank you for your submission!",
        redirectUrl: input.redirectUrl,
        sendEmailOnSubmission: input.sendEmailOnSubmission ?? true,
        notificationEmails: input.notificationEmails,
        fields: input.fields ? {
          create: input.fields.map((field, index) => ({
            name: field.name,
            label: field.label,
            type: field.type,
            placeholder: field.placeholder,
            helpText: field.helpText,
            isRequired: field.isRequired ?? false,
            minLength: field.minLength,
            maxLength: field.maxLength,
            pattern: field.pattern,
            patternError: field.patternError,
            options: field.options !== undefined ? toInputJsonValue(field.options) : undefined,
            position: field.position ?? index,
            width: field.width || "full",
            conditionalLogic: field.conditionalLogic !== undefined
              ? toInputJsonValue(field.conditionalLogic)
              : undefined,
          })),
        } : undefined,
      },
      include: {
        fields: { orderBy: { position: "asc" } },
      },
    });

    revalidatePath("/forms");
    return { success: true, form };
  } catch (error) {
    console.error("Error creating form:", error);
    return { success: false, error: "Failed to create form" };
  }
}

export async function updateForm(formId: string, input: UpdateFormInput) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const existing = await prisma.customForm.findFirst({
      where: { id: formId, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Form not found" };
    }

    // Handle slug update
    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      const baseSlug = slugify(input.slug);
      slug = await getUniqueSlug(baseSlug, formId);
    }

    const form = await prisma.customForm.update({
      where: { id: formId },
      data: {
        ...input,
        slug,
      },
    });

    revalidatePath("/forms");
    revalidatePath(`/forms/${formId}`);
    return { success: true, form };
  } catch (error) {
    console.error("Error updating form:", error);
    return { success: false, error: "Failed to update form" };
  }
}

export async function deleteForm(formId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const form = await prisma.customForm.findFirst({
      where: { id: formId, organizationId },
    });

    if (!form) {
      return { success: false, error: "Form not found" };
    }

    await prisma.customForm.delete({
      where: { id: formId },
    });

    revalidatePath("/forms");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting form:", error);
    return { success: false, error: "Failed to delete form" };
  }
}

export async function duplicateForm(formId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const form = await prisma.customForm.findFirst({
      where: { id: formId, organizationId },
      include: { fields: { orderBy: { position: "asc" } } },
    });

    if (!form) {
      return { success: false, error: "Form not found" };
    }

    const newSlug = await getUniqueSlug(`${form.slug}-copy`);

    const newForm = await prisma.customForm.create({
      data: {
        organizationId,
        name: `${form.name} (Copy)`,
        slug: newSlug,
        description: form.description,
        submitButtonText: form.submitButtonText,
        successMessage: form.successMessage,
        redirectUrl: form.redirectUrl,
        sendEmailOnSubmission: form.sendEmailOnSubmission,
        notificationEmails: form.notificationEmails,
        fields: {
          create: form.fields.map((field) => ({
            name: field.name,
            label: field.label,
            type: field.type,
            placeholder: field.placeholder,
            helpText: field.helpText,
            isRequired: field.isRequired,
            minLength: field.minLength,
            maxLength: field.maxLength,
            pattern: field.pattern,
            patternError: field.patternError,
            options: field.options !== null && field.options !== undefined
              ? toInputJsonValue(field.options)
              : undefined,
            position: field.position,
            width: field.width,
            conditionalLogic: field.conditionalLogic !== null && field.conditionalLogic !== undefined
              ? toInputJsonValue(field.conditionalLogic)
              : undefined,
          })),
        },
      },
    });

    revalidatePath("/forms");
    return { success: true, form: newForm };
  } catch (error) {
    console.error("Error duplicating form:", error);
    return { success: false, error: "Failed to duplicate form" };
  }
}

// ============================================================================
// FIELD MANAGEMENT
// ============================================================================

export async function addFormField(formId: string, field: FormFieldInput) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const form = await prisma.customForm.findFirst({
      where: { id: formId, organizationId },
      include: { fields: { orderBy: { position: "desc" }, take: 1 } },
    });

    if (!form) {
      return { success: false, error: "Form not found" };
    }

    const lastPosition = form.fields[0]?.position ?? -1;

    const newField = await prisma.customFormField.create({
      data: {
        formId,
        name: field.name,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        helpText: field.helpText,
        isRequired: field.isRequired ?? false,
        minLength: field.minLength,
        maxLength: field.maxLength,
        pattern: field.pattern,
        patternError: field.patternError,
        options: field.options !== undefined ? toInputJsonValue(field.options) : undefined,
        position: field.position ?? lastPosition + 1,
        width: field.width || "full",
        conditionalLogic: field.conditionalLogic !== undefined
          ? toInputJsonValue(field.conditionalLogic)
          : undefined,
      },
    });

    revalidatePath(`/forms/${formId}`);
    return { success: true, field: newField };
  } catch (error) {
    console.error("Error adding field:", error);
    return { success: false, error: "Failed to add field" };
  }
}

export async function updateFormField(fieldId: string, updates: Partial<FormFieldInput>) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const field = await prisma.customFormField.findFirst({
      where: { id: fieldId },
      include: { form: { select: { organizationId: true, id: true } } },
    });

    if (!field || field.form.organizationId !== organizationId) {
      return { success: false, error: "Field not found" };
    }

    // Transform updates to handle JSON fields properly
    const data: Prisma.CustomFormFieldUpdateInput = {
      ...updates,
      options: updates.options !== undefined ? toInputJsonValue(updates.options) : undefined,
      conditionalLogic: updates.conditionalLogic !== undefined
        ? toInputJsonValue(updates.conditionalLogic)
        : undefined,
    };

    const updatedField = await prisma.customFormField.update({
      where: { id: fieldId },
      data,
    });

    revalidatePath(`/forms/${field.form.id}`);
    return { success: true, field: updatedField };
  } catch (error) {
    console.error("Error updating field:", error);
    return { success: false, error: "Failed to update field" };
  }
}

export async function deleteFormField(fieldId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const field = await prisma.customFormField.findFirst({
      where: { id: fieldId },
      include: { form: { select: { organizationId: true, id: true } } },
    });

    if (!field || field.form.organizationId !== organizationId) {
      return { success: false, error: "Field not found" };
    }

    await prisma.customFormField.delete({
      where: { id: fieldId },
    });

    revalidatePath(`/forms/${field.form.id}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting field:", error);
    return { success: false, error: "Failed to delete field" };
  }
}

export async function reorderFormFields(formId: string, fieldIds: string[]) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const form = await prisma.customForm.findFirst({
      where: { id: formId, organizationId },
    });

    if (!form) {
      return { success: false, error: "Form not found" };
    }

    // Update positions
    await Promise.all(
      fieldIds.map((id, index) =>
        prisma.customFormField.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    revalidatePath(`/forms/${formId}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error reordering fields:", error);
    return { success: false, error: "Failed to reorder fields" };
  }
}

// ============================================================================
// PUBLIC FORM ACCESS
// ============================================================================

export async function getFormBySlug(slug: string) {
  try {
    const form = await prisma.customForm.findUnique({
      where: { slug },
      include: {
        fields: {
          orderBy: { position: "asc" },
        },
        organization: {
          select: { name: true, logoUrl: true, primaryColor: true },
        },
      },
    });

    if (!form || !form.isActive) {
      return { success: false, error: "Form not found" };
    }

    // Check max submissions
    if (form.maxSubmissions) {
      const count = await prisma.formSubmission.count({
        where: { formId: form.id },
      });
      if (count >= form.maxSubmissions) {
        return { success: false, error: "This form is no longer accepting submissions" };
      }
    }

    return { success: true, form };
  } catch (error) {
    console.error("Error fetching form:", error);
    return { success: false, error: "Failed to fetch form" };
  }
}

// ============================================================================
// SUBMISSIONS
// ============================================================================

export async function submitForm(
  slug: string,
  data: Record<string, unknown>,
  metadata?: {
    visitorId?: string;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
  }
) {
  try {
    const form = await prisma.customForm.findUnique({
      where: { slug },
      include: { fields: true },
    });

    if (!form || !form.isActive) {
      return { success: false, error: "Form not found" };
    }

    // Check max submissions
    if (form.maxSubmissions) {
      const count = await prisma.formSubmission.count({
        where: { formId: form.id },
      });
      if (count >= form.maxSubmissions) {
        return { success: false, error: "This form is no longer accepting submissions" };
      }
    }

    // Check per-user limit
    if (form.submissionsPerUser && metadata?.visitorId) {
      const userCount = await prisma.formSubmission.count({
        where: {
          formId: form.id,
          visitorId: metadata.visitorId,
        },
      });
      if (userCount >= form.submissionsPerUser) {
        return { success: false, error: "You have reached the submission limit for this form" };
      }
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.isRequired) {
        const value = data[field.name];
        if (value === undefined || value === null || value === "") {
          return { success: false, error: `${field.label} is required` };
        }
      }
    }

    // Create submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: toInputJsonValue(data),
        visitorId: metadata?.visitorId,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        country: metadata?.country,
        city: metadata?.city,
      },
    });

    // Send notification email if enabled
    if (form.sendEmailOnSubmission) {
      try {
        // Get notification recipients
        const notificationEmails = form.notificationEmails
          ? form.notificationEmails.split(",").map((e) => e.trim()).filter(Boolean)
          : [];

        // If no notification emails configured, try to get organization's public email
        if (notificationEmails.length === 0) {
          const org = await prisma.organization.findUnique({
            where: { id: form.organizationId },
            select: { publicEmail: true },
          });
          if (org?.publicEmail) {
            notificationEmails.push(org.publicEmail);
          }
        }

        if (notificationEmails.length > 0) {
          // Format fields for the email
          const emailFields = form.fields
            .filter((field) => !["heading", "paragraph", "divider", "hidden"].includes(field.type))
            .map((field) => ({
              label: field.label,
              value: formatFieldValue(data[field.name], field.type),
            }));

          await sendFormSubmissionNotificationEmail({
            to: notificationEmails,
            formName: form.name,
            formUrl: `${process.env.NEXT_PUBLIC_APP_URL}/forms/${form.slug}`,
            fields: emailFields,
            submitterInfo: {
              ipAddress: metadata?.ipAddress,
              country: metadata?.country,
              city: metadata?.city,
            },
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/forms/${form.id}/submissions`,
          });
        }
      } catch (emailError) {
        // Log email error but don't fail the submission
        console.error("Error sending form submission notification email:", emailError);
      }
    }

    return {
      success: true,
      submissionId: submission.id,
      successMessage: form.successMessage,
      redirectUrl: form.redirectUrl,
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    return { success: false, error: "Failed to submit form" };
  }
}

export async function getFormSubmissions(
  formId: string,
  options?: {
    status?: "all" | "unread" | "read" | "archived";
    limit?: number;
    offset?: number;
  }
) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const form = await prisma.customForm.findFirst({
      where: { id: formId, organizationId },
    });

    if (!form) {
      return { success: false, error: "Form not found" };
    }

    const where: { formId: string; isRead?: boolean; isArchived?: boolean } = { formId };

    if (options?.status === "unread") {
      where.isRead = false;
      where.isArchived = false;
    } else if (options?.status === "read") {
      where.isRead = true;
      where.isArchived = false;
    } else if (options?.status === "archived") {
      where.isArchived = true;
    }

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.formSubmission.count({ where }),
    ]);

    return { success: true, submissions, total };
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return { success: false, error: "Failed to fetch submissions" };
  }
}

export async function markSubmissionRead(submissionId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const submission = await prisma.formSubmission.findFirst({
      where: { id: submissionId },
      include: { form: { select: { organizationId: true } } },
    });

    if (!submission || submission.form.organizationId !== organizationId) {
      return { success: false, error: "Submission not found" };
    }

    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error marking submission read:", error);
    return { success: false, error: "Failed to mark submission read" };
  }
}

export async function archiveSubmission(submissionId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const submission = await prisma.formSubmission.findFirst({
      where: { id: submissionId },
      include: { form: { select: { organizationId: true } } },
    });

    if (!submission || submission.form.organizationId !== organizationId) {
      return { success: false, error: "Submission not found" };
    }

    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: { isArchived: true },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error archiving submission:", error);
    return { success: false, error: "Failed to archive submission" };
  }
}

export async function deleteSubmission(submissionId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const submission = await prisma.formSubmission.findFirst({
      where: { id: submissionId },
      include: { form: { select: { organizationId: true } } },
    });

    if (!submission || submission.form.organizationId !== organizationId) {
      return { success: false, error: "Submission not found" };
    }

    await prisma.formSubmission.delete({
      where: { id: submissionId },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting submission:", error);
    return { success: false, error: "Failed to delete submission" };
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getFormStats(formId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const form = await prisma.customForm.findFirst({
      where: { id: formId, organizationId },
    });

    if (!form) {
      return { success: false, error: "Form not found" };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, unread, today_count, week_count, month_count] = await Promise.all([
      prisma.formSubmission.count({ where: { formId } }),
      prisma.formSubmission.count({ where: { formId, isRead: false, isArchived: false } }),
      prisma.formSubmission.count({ where: { formId, createdAt: { gte: today } } }),
      prisma.formSubmission.count({ where: { formId, createdAt: { gte: weekStart } } }),
      prisma.formSubmission.count({ where: { formId, createdAt: { gte: monthStart } } }),
    ]);

    return {
      success: true,
      stats: {
        total,
        unread,
        today: today_count,
        thisWeek: week_count,
        thisMonth: month_count,
      },
    };
  } catch (error) {
    console.error("Error fetching form stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
