"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createBookingFormSchema,
  updateBookingFormSchema,
  deleteBookingFormSchema,
  duplicateBookingFormSchema,
  updateBookingFormFieldsSchema,
  reorderBookingFormFieldsSchema,
  bookingFormServicesSchema,
  submitBookingFormSchema,
  convertSubmissionSchema,
  rejectSubmissionSchema,
  type CreateBookingFormInput,
  type UpdateBookingFormInput,
  type UpdateBookingFormFieldsInput,
  type ReorderBookingFormFieldsInput,
  type BookingFormServicesInput,
  type SubmitBookingFormInput,
  type ConvertSubmissionInput,
  type RejectSubmissionInput,
  type BookingFormFilters,
  type SubmissionFilters,
  type BookingFormField,
} from "@/lib/validations/booking-forms";
import { requireOrganizationId } from "./auth-helper";
import type { Industry, FormFieldType } from "@prisma/client";
import { Prisma } from "@prisma/client";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

/**
 * Create a new booking form
 */
export async function createBookingForm(
  input: CreateBookingFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createBookingFormSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Check for duplicate slug within organization
    const existingSlug = await prisma.bookingForm.findFirst({
      where: {
        organizationId,
        slug: validated.slug,
      },
    });

    if (existingSlug) {
      return { success: false, error: "A booking form with this slug already exists" };
    }

    const bookingForm = await prisma.bookingForm.create({
      data: {
        organizationId,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        industry: validated.industry as Industry | null,
        isPublished: validated.isPublished,
        isDefault: validated.isDefault,
        headline: validated.headline,
        subheadline: validated.subheadline,
        heroImageUrl: validated.heroImageUrl,
        logoOverrideUrl: validated.logoOverrideUrl,
        primaryColor: validated.primaryColor,
        requireApproval: validated.requireApproval,
        confirmationEmail: validated.confirmationEmail,
      },
    });

    revalidatePath("/scheduling/booking-forms");

    return { success: true, data: { id: bookingForm.id } };
  } catch (error) {
    console.error("Error creating booking form:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create booking form" };
  }
}

/**
 * Update an existing booking form
 */
export async function updateBookingForm(
  input: UpdateBookingFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateBookingFormSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify booking form exists and belongs to organization
    const existing = await prisma.bookingForm.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Booking form not found" };
    }

    // Check for duplicate slug if slug is being changed
    if (validated.slug && validated.slug !== existing.slug) {
      const existingSlug = await prisma.bookingForm.findFirst({
        where: {
          organizationId,
          slug: validated.slug,
          id: { not: validated.id },
        },
      });

      if (existingSlug) {
        return { success: false, error: "A booking form with this slug already exists" };
      }
    }

    const { id, ...updateData } = validated;

    const bookingForm = await prisma.bookingForm.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.slug && { slug: updateData.slug }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.industry !== undefined && { industry: updateData.industry as Industry | null }),
        ...(updateData.isPublished !== undefined && { isPublished: updateData.isPublished }),
        ...(updateData.isDefault !== undefined && { isDefault: updateData.isDefault }),
        ...(updateData.headline !== undefined && { headline: updateData.headline }),
        ...(updateData.subheadline !== undefined && { subheadline: updateData.subheadline }),
        ...(updateData.heroImageUrl !== undefined && { heroImageUrl: updateData.heroImageUrl }),
        ...(updateData.logoOverrideUrl !== undefined && { logoOverrideUrl: updateData.logoOverrideUrl }),
        ...(updateData.primaryColor !== undefined && { primaryColor: updateData.primaryColor }),
        ...(updateData.requireApproval !== undefined && { requireApproval: updateData.requireApproval }),
        ...(updateData.confirmationEmail !== undefined && { confirmationEmail: updateData.confirmationEmail }),
      },
    });

    revalidatePath("/scheduling/booking-forms");
    revalidatePath(`/scheduling/booking-forms/${id}`);

    return { success: true, data: { id: bookingForm.id } };
  } catch (error) {
    console.error("Error updating booking form:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update booking form" };
  }
}

/**
 * Delete a booking form
 */
export async function deleteBookingForm(
  id: string,
  force: boolean = false
): Promise<ActionResult> {
  try {
    deleteBookingFormSchema.parse({ id, force });
    const organizationId = await getOrganizationId();

    // Verify booking form exists and belongs to organization
    const existing = await prisma.bookingForm.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Booking form not found" };
    }

    if (existing._count.submissions > 0 && !force) {
      // Archive instead of delete if has submissions
      await prisma.bookingForm.update({
        where: { id },
        data: { isPublished: false },
      });

      revalidatePath("/scheduling/booking-forms");
      return { success: true, data: undefined };
    }

    // Actually delete if no submissions or force is true
    await prisma.bookingForm.delete({
      where: { id },
    });

    revalidatePath("/scheduling/booking-forms");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting booking form:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete booking form" };
  }
}

/**
 * Duplicate a booking form
 */
export async function duplicateBookingForm(
  id: string,
  newName?: string,
  newSlug?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    duplicateBookingFormSchema.parse({ id, newName, newSlug });
    const organizationId = await getOrganizationId();

    // Get original booking form
    const original = await prisma.bookingForm.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        fields: true,
        services: true,
      },
    });

    if (!original) {
      return { success: false, error: "Booking form not found" };
    }

    // Generate unique slug
    let slug = newSlug || `${original.slug}-copy`;
    let counter = 1;
    while (true) {
      const exists = await prisma.bookingForm.findFirst({
        where: { organizationId, slug },
      });
      if (!exists) break;
      slug = `${newSlug || original.slug}-copy-${counter}`;
      counter++;
    }

    // Create duplicate
    const duplicate = await prisma.bookingForm.create({
      data: {
        organizationId,
        name: newName || `${original.name} (Copy)`,
        slug,
        description: original.description,
        industry: original.industry,
        isPublished: false, // Start as unpublished
        isDefault: false,
        headline: original.headline,
        subheadline: original.subheadline,
        heroImageUrl: original.heroImageUrl,
        logoOverrideUrl: original.logoOverrideUrl,
        primaryColor: original.primaryColor,
        requireApproval: original.requireApproval,
        confirmationEmail: original.confirmationEmail,
      },
    });

    // Duplicate field configurations
    if (original.fields.length > 0) {
      await prisma.bookingFormField.createMany({
        data: original.fields.map((f) => ({
          bookingFormId: duplicate.id,
          label: f.label,
          type: f.type,
          placeholder: f.placeholder,
          helpText: f.helpText,
          isRequired: f.isRequired,
          sortOrder: f.sortOrder,
          industries: f.industries,
          validation: f.validation === null ? Prisma.JsonNull : f.validation,
          conditionalOn: f.conditionalOn,
          conditionalValue: f.conditionalValue,
        })),
      });
    }

    // Duplicate service associations
    if (original.services.length > 0) {
      await prisma.bookingFormService.createMany({
        data: original.services.map((s) => ({
          bookingFormId: duplicate.id,
          serviceId: s.serviceId,
          sortOrder: s.sortOrder,
          isDefault: s.isDefault,
        })),
      });
    }

    revalidatePath("/scheduling/booking-forms");

    return { success: true, data: { id: duplicate.id } };
  } catch (error) {
    console.error("Error duplicating booking form:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to duplicate booking form" };
  }
}

/**
 * Toggle booking form published status
 */
export async function toggleBookingFormStatus(
  id: string
): Promise<ActionResult<{ isPublished: boolean }>> {
  try {
    const organizationId = await getOrganizationId();

    const existing = await prisma.bookingForm.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Booking form not found" };
    }

    const updated = await prisma.bookingForm.update({
      where: { id },
      data: { isPublished: !existing.isPublished },
    });

    revalidatePath("/scheduling/booking-forms");
    revalidatePath(`/scheduling/booking-forms/${id}`);

    return { success: true, data: { isPublished: updated.isPublished } };
  } catch (error) {
    console.error("Error toggling booking form status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to toggle booking form status" };
  }
}

/**
 * Update all fields for a booking form (replace all)
 */
export async function updateBookingFormFields(
  input: UpdateBookingFormFieldsInput
): Promise<ActionResult<{ count: number }>> {
  try {
    const validated = updateBookingFormFieldsSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify booking form exists and belongs to organization
    const bookingForm = await prisma.bookingForm.findFirst({
      where: {
        id: validated.bookingFormId,
        organizationId,
      },
    });

    if (!bookingForm) {
      return { success: false, error: "Booking form not found" };
    }

    // Replace all fields
    await prisma.$transaction([
      // Delete existing fields
      prisma.bookingFormField.deleteMany({
        where: { bookingFormId: validated.bookingFormId },
      }),
      // Create new fields
      prisma.bookingFormField.createMany({
        data: validated.fields.map((field: BookingFormField, index: number) => ({
          bookingFormId: validated.bookingFormId,
          label: field.label,
          type: field.type as FormFieldType,
          placeholder: field.placeholder ?? null,
          helpText: field.helpText ?? null,
          isRequired: field.isRequired ?? false,
          sortOrder: field.sortOrder ?? index,
          industries: (field.industries ?? []) as Industry[],
          validation: field.validation ? field.validation : Prisma.JsonNull,
          conditionalOn: field.conditionalOn ?? null,
          conditionalValue: field.conditionalValue ?? null,
        })),
      }),
    ]);

    revalidatePath("/scheduling/booking-forms");
    revalidatePath(`/scheduling/booking-forms/${validated.bookingFormId}`);

    return { success: true, data: { count: validated.fields.length } };
  } catch (error) {
    console.error("Error updating booking form fields:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update booking form fields" };
  }
}

/**
 * Reorder fields for a booking form
 */
export async function reorderBookingFormFields(
  input: ReorderBookingFormFieldsInput
): Promise<ActionResult> {
  try {
    const validated = reorderBookingFormFieldsSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify booking form exists and belongs to organization
    const bookingForm = await prisma.bookingForm.findFirst({
      where: {
        id: validated.bookingFormId,
        organizationId,
      },
    });

    if (!bookingForm) {
      return { success: false, error: "Booking form not found" };
    }

    // Update sort order for each field
    await Promise.all(
      validated.fieldIds.map((fieldId, index) =>
        prisma.bookingFormField.update({
          where: { id: fieldId },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/scheduling/booking-forms");
    revalidatePath(`/scheduling/booking-forms/${validated.bookingFormId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error reordering booking form fields:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reorder booking form fields" };
  }
}

/**
 * Set services for a booking form (replaces all existing)
 */
export async function setBookingFormServices(
  input: BookingFormServicesInput
): Promise<ActionResult<{ count: number }>> {
  try {
    const validated = bookingFormServicesSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify booking form exists and belongs to organization
    const bookingForm = await prisma.bookingForm.findFirst({
      where: {
        id: validated.bookingFormId,
        organizationId,
      },
    });

    if (!bookingForm) {
      return { success: false, error: "Booking form not found" };
    }

    // Verify all services exist and belong to organization
    const serviceIds = validated.services.map((s) => s.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        organizationId,
      },
    });

    if (services.length !== serviceIds.length) {
      return { success: false, error: "One or more services not found" };
    }

    // Replace all service associations
    await prisma.$transaction([
      // Delete existing
      prisma.bookingFormService.deleteMany({
        where: { bookingFormId: validated.bookingFormId },
      }),
      // Create new
      prisma.bookingFormService.createMany({
        data: validated.services.map((s, index) => ({
          bookingFormId: validated.bookingFormId,
          serviceId: s.serviceId,
          sortOrder: s.sortOrder ?? index,
          isDefault: s.isDefault ?? false,
        })),
      }),
    ]);

    revalidatePath("/scheduling/booking-forms");
    revalidatePath(`/scheduling/booking-forms/${validated.bookingFormId}`);

    return { success: true, data: { count: validated.services.length } };
  } catch (error) {
    console.error("Error setting booking form services:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to set booking form services" };
  }
}

/**
 * Get all booking forms for the organization
 */
export async function getBookingForms(filters?: BookingFormFilters) {
  try {
    const organizationId = await getOrganizationId();

    const bookingForms = await prisma.bookingForm.findMany({
      where: {
        organizationId,
        ...(filters?.isPublished !== undefined && { isPublished: filters.isPublished }),
        ...(filters?.industry && { industry: filters.industry as Industry }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { headline: { contains: filters.search, mode: "insensitive" } },
            { slug: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        fields: {
          orderBy: { sortOrder: "asc" },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                priceCents: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return bookingForms.map((form) => ({
      id: form.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      industry: form.industry,
      headline: form.headline,
      subheadline: form.subheadline,
      heroImageUrl: form.heroImageUrl,
      isPublished: form.isPublished,
      isDefault: form.isDefault,
      fieldCount: form.fields.length,
      serviceCount: form.services.length,
      submissionCount: form._count.submissions,
      viewCount: form.viewCount,
      bookingCount: form.bookingCount,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching booking forms:", error);
    return [];
  }
}

/**
 * Get a single booking form by ID
 */
export async function getBookingForm(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const bookingForm = await prisma.bookingForm.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        fields: {
          orderBy: { sortOrder: "asc" },
        },
        services: {
          include: {
            service: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!bookingForm) {
      return null;
    }

    return {
      id: bookingForm.id,
      name: bookingForm.name,
      slug: bookingForm.slug,
      description: bookingForm.description,
      industry: bookingForm.industry,
      isPublished: bookingForm.isPublished,
      isDefault: bookingForm.isDefault,
      headline: bookingForm.headline,
      subheadline: bookingForm.subheadline,
      heroImageUrl: bookingForm.heroImageUrl,
      logoOverrideUrl: bookingForm.logoOverrideUrl,
      primaryColor: bookingForm.primaryColor,
      requireApproval: bookingForm.requireApproval,
      confirmationEmail: bookingForm.confirmationEmail,
      fields: bookingForm.fields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
        helpText: f.helpText,
        isRequired: f.isRequired,
        sortOrder: f.sortOrder,
        industries: f.industries,
        validation: f.validation,
        conditionalOn: f.conditionalOn,
        conditionalValue: f.conditionalValue,
      })),
      services: bookingForm.services.map((s) => ({
        id: s.id,
        serviceId: s.serviceId,
        serviceName: s.service.name,
        servicePriceCents: s.service.priceCents,
        sortOrder: s.sortOrder,
        isDefault: s.isDefault,
        service: {
          id: s.service.id,
          name: s.service.name,
        },
      })),
      submissionCount: bookingForm._count.submissions,
      viewCount: bookingForm.viewCount,
      bookingCount: bookingForm.bookingCount,
      createdAt: bookingForm.createdAt,
      updatedAt: bookingForm.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching booking form:", error);
    return null;
  }
}

/**
 * Get a booking form by slug (for public access - no auth required)
 */
export async function getBookingFormBySlug(slug: string) {
  try {
    const bookingForm = await prisma.bookingForm.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            primaryColor: true,
            publicPhone: true,
            publicEmail: true,
            industries: true,
            primaryIndustry: true,
          },
        },
        fields: {
          orderBy: { sortOrder: "asc" },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                priceCents: true,
                duration: true,
                isActive: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!bookingForm) {
      return null;
    }

    // Increment view count
    await prisma.bookingForm.update({
      where: { id: bookingForm.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      id: bookingForm.id,
      name: bookingForm.name,
      slug: bookingForm.slug,
      organizationId: bookingForm.organization.id,
      description: bookingForm.description,
      industry: bookingForm.industry,
      headline: bookingForm.headline,
      subheadline: bookingForm.subheadline,
      heroImageUrl: bookingForm.heroImageUrl,
      logoOverrideUrl: bookingForm.logoOverrideUrl || bookingForm.organization.logoUrl,
      primaryColor: bookingForm.primaryColor || bookingForm.organization.primaryColor,
      requireApproval: bookingForm.requireApproval,
      organization: {
        id: bookingForm.organization.id,
        name: bookingForm.organization.name,
        slug: bookingForm.organization.slug,
        phone: bookingForm.organization.publicPhone,
        email: bookingForm.organization.publicEmail,
        industries: bookingForm.organization.industries,
        primaryIndustry: bookingForm.organization.primaryIndustry,
      },
      fields: bookingForm.fields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
        helpText: f.helpText,
        isRequired: f.isRequired,
        sortOrder: f.sortOrder,
        industries: f.industries,
        validation: f.validation as {
          options?: string[];
          minLength?: number;
          maxLength?: number;
          min?: number;
          max?: number;
          pattern?: string;
        } | null,
        conditionalOn: f.conditionalOn,
        conditionalValue: f.conditionalValue,
      })),
      services: bookingForm.services
        .filter((s) => s.service.isActive)
        .map((s) => ({
          serviceId: s.serviceId,
          sortOrder: s.sortOrder,
          isDefault: s.isDefault,
          service: {
            id: s.service.id,
            name: s.service.name,
            description: s.service.description,
            price: s.service.priceCents ? s.service.priceCents / 100 : null,
            duration: s.service.duration,
          },
        })),
    };
  } catch (error) {
    console.error("Error fetching booking form by slug:", error);
    return null;
  }
}

/**
 * Submit a booking form (public, no auth required)
 */
export async function submitBookingForm(
  input: SubmitBookingFormInput
): Promise<ActionResult<{ submissionId: string }>> {
  try {
    const validated = submitBookingFormSchema.parse(input);

    // Verify booking form exists and is published
    const bookingForm = await prisma.bookingForm.findFirst({
      where: {
        id: validated.bookingFormId,
        isPublished: true,
      },
    });

    if (!bookingForm) {
      return { success: false, error: "Booking form not found or not published" };
    }

    // Create submission
    const submission = await prisma.bookingFormSubmission.create({
      data: {
        bookingFormId: validated.bookingFormId,
        data: validated.data as Prisma.InputJsonValue,
        clientName: validated.clientName,
        clientEmail: validated.clientEmail,
        clientPhone: validated.clientPhone,
        preferredDate: validated.preferredDate ? new Date(validated.preferredDate) : null,
        preferredTime: validated.preferredTime,
        serviceId: validated.serviceId,
        status: "pending",
      },
    });

    // Increment booking form submission count
    await prisma.bookingForm.update({
      where: { id: validated.bookingFormId },
      data: { bookingCount: { increment: 1 } },
    });

    // Send confirmation email if enabled on the booking form
    if (bookingForm.confirmationEmail && validated.clientEmail) {
      try {
        // Get organization info for the email
        const organization = await prisma.organization.findUnique({
          where: { id: bookingForm.organizationId },
          select: {
            name: true,
            publicEmail: true,
            publicPhone: true,
          },
        });

        // Get service name if a service was selected
        let serviceName: string | undefined;
        if (validated.serviceId) {
          const service = await prisma.service.findUnique({
            where: { id: validated.serviceId },
            select: { name: true },
          });
          serviceName = service?.name;
        }

        const { sendBookingFormSubmittedEmail } = await import("@/lib/email/send");
        await sendBookingFormSubmittedEmail({
          to: validated.clientEmail,
          clientName: validated.clientName || "there",
          serviceName,
          preferredDate: validated.preferredDate ?? undefined,
          preferredTime: validated.preferredTime ?? undefined,
          photographerName: organization?.name || "Your Photographer",
          photographerEmail: organization?.publicEmail ?? undefined,
          photographerPhone: organization?.publicPhone ?? undefined,
          formName: bookingForm.name,
        });

        console.log(`[BookingForms] Confirmation email sent to ${validated.clientEmail}`);
      } catch (emailError) {
        // Log error but don't fail the submission
        console.error("[BookingForms] Failed to send confirmation email:", emailError);
      }
    }

    return { success: true, data: { submissionId: submission.id } };
  } catch (error) {
    console.error("Error submitting booking form:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to submit booking form" };
  }
}

/**
 * Convert a submission to a booking
 */
export async function convertSubmissionToBooking(
  input: ConvertSubmissionInput
): Promise<ActionResult<{ bookingId: string }>> {
  try {
    const validated = convertSubmissionSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Get submission with booking form
    const submission = await prisma.bookingFormSubmission.findFirst({
      where: {
        id: validated.submissionId,
        bookingForm: {
          organizationId,
        },
      },
      include: {
        bookingForm: true,
      },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    if (submission.status === "converted") {
      return { success: false, error: "Submission has already been converted to a booking" };
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        organizationId,
        title: `Booking from ${submission.clientName || "Website"}`,
        clientName: submission.clientName,
        clientEmail: submission.clientEmail,
        clientPhone: submission.clientPhone,
        startTime: new Date(validated.bookingData.startTime),
        endTime: new Date(validated.bookingData.endTime),
        serviceId: validated.bookingData.serviceId || submission.serviceId,
        assignedUserId: validated.bookingData.assignedUserId,
        notes: validated.bookingData.notes,
        status: "confirmed",
        industry: submission.bookingForm.industry,
      },
    });

    // Update submission status
    await prisma.bookingFormSubmission.update({
      where: { id: validated.submissionId },
      data: {
        status: "converted",
        bookingId: booking.id,
        convertedAt: new Date(),
      },
    });

    revalidatePath("/scheduling/booking-forms");
    revalidatePath("/scheduling");

    return { success: true, data: { bookingId: booking.id } };
  } catch (error) {
    console.error("Error converting submission to booking:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to convert submission to booking" };
  }
}

/**
 * Reject a submission
 */
export async function rejectSubmission(
  input: RejectSubmissionInput
): Promise<ActionResult> {
  try {
    const validated = rejectSubmissionSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify submission exists and belongs to organization
    const submission = await prisma.bookingFormSubmission.findFirst({
      where: {
        id: validated.submissionId,
        bookingForm: {
          organizationId,
        },
      },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    if (submission.status === "converted") {
      return { success: false, error: "Cannot reject a converted submission" };
    }

    // Update submission status
    await prisma.bookingFormSubmission.update({
      where: { id: validated.submissionId },
      data: {
        status: "rejected",
        rejectedAt: new Date(),
        rejectionNote: validated.rejectionNote,
      },
    });

    revalidatePath("/scheduling/booking-forms");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error rejecting submission:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reject submission" };
  }
}

/**
 * Get submissions for a booking form
 */
export async function getFormSubmissions(
  bookingFormId: string,
  filters?: SubmissionFilters
) {
  try {
    const organizationId = await getOrganizationId();

    // Verify booking form exists and belongs to organization
    const bookingForm = await prisma.bookingForm.findFirst({
      where: {
        id: bookingFormId,
        organizationId,
      },
    });

    if (!bookingForm) {
      return [];
    }

    const submissions = await prisma.bookingFormSubmission.findMany({
      where: {
        bookingFormId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          createdAt: { gte: new Date(filters.startDate) },
        }),
        ...(filters?.endDate && {
          createdAt: { lte: new Date(filters.endDate) },
        }),
      },
      include: {
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return submissions.map((s) => ({
      id: s.id,
      data: s.data,
      clientName: s.clientName,
      clientEmail: s.clientEmail,
      clientPhone: s.clientPhone,
      preferredDate: s.preferredDate,
      preferredTime: s.preferredTime,
      serviceId: s.serviceId,
      status: s.status,
      booking: s.booking,
      convertedAt: s.convertedAt,
      rejectedAt: s.rejectedAt,
      rejectionNote: s.rejectionNote,
      createdAt: s.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return [];
  }
}

/**
 * Get all submissions across all booking forms
 */
export async function getAllSubmissions(filters?: SubmissionFilters) {
  try {
    const organizationId = await getOrganizationId();

    const submissions = await prisma.bookingFormSubmission.findMany({
      where: {
        bookingForm: {
          organizationId,
        },
        ...(filters?.bookingFormId && { bookingFormId: filters.bookingFormId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          createdAt: { gte: new Date(filters.startDate) },
        }),
        ...(filters?.endDate && {
          createdAt: { lte: new Date(filters.endDate) },
        }),
      },
      include: {
        bookingForm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return submissions.map((s) => ({
      id: s.id,
      bookingForm: s.bookingForm,
      data: s.data,
      clientName: s.clientName,
      clientEmail: s.clientEmail,
      clientPhone: s.clientPhone,
      preferredDate: s.preferredDate,
      preferredTime: s.preferredTime,
      serviceId: s.serviceId,
      status: s.status,
      booking: s.booking,
      convertedAt: s.convertedAt,
      rejectedAt: s.rejectedAt,
      rejectionNote: s.rejectionNote,
      createdAt: s.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    return [];
  }
}
