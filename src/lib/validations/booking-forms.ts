import { z } from "zod";

// Enum values matching Prisma schema
export const FormFieldTypeValues = [
  "text",
  "textarea",
  "email",
  "phone",
  "number",
  "date",
  "time",
  "datetime",
  "select",
  "multiselect",
  "checkbox",
  "radio",
  "file",
  "address",
  "url",
] as const;

export const IndustryValues = [
  "real_estate",
  "commercial",
  "events",
  "portraits",
  "food",
  "product",
] as const;

export const SubmissionStatusValues = [
  "pending",
  "approved",
  "rejected",
  "converted",
  "expired",
] as const;

// Field validation schema (stored as JSON in database)
export const fieldValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.string()).optional(), // For select/multiselect/radio
});

// Booking form field schema
export const bookingFormFieldSchema = z.object({
  id: z.string().cuid().optional(), // Optional for new fields
  label: z.string().min(1, "Label is required").max(100),
  type: z.enum(FormFieldTypeValues),
  placeholder: z.string().max(200).optional().nullable(),
  helpText: z.string().max(500).optional().nullable(),
  isRequired: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
  industries: z.array(z.enum(IndustryValues)).default([]),
  validation: fieldValidationSchema.optional().nullable(),
  conditionalOn: z.string().optional().nullable(),
  conditionalValue: z.string().optional().nullable(),
});

// Base booking form schema
export const bookingFormSchema = z.object({
  name: z
    .string()
    .min(1, "Form name is required")
    .max(100, "Form name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  industry: z
    .enum(IndustryValues)
    .optional()
    .nullable()
    .transform((val) => val || null),
  isPublished: z.boolean().optional().default(false),
  isDefault: z.boolean().optional().default(false),
  headline: z
    .string()
    .max(200, "Headline must be less than 200 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  subheadline: z
    .string()
    .max(500, "Subheadline must be less than 500 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  heroImageUrl: z.string().url().optional().nullable(),
  logoOverrideUrl: z.string().url().optional().nullable(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid hex color")
    .optional()
    .nullable()
    .transform((val) => val || null),
  requireApproval: z.boolean().optional().default(true),
  confirmationEmail: z.boolean().optional().default(true),
});

// Schema for creating a new booking form
export const createBookingFormSchema = bookingFormSchema;

// Schema for updating an existing booking form
export const updateBookingFormSchema = bookingFormSchema.partial().extend({
  id: z.string().cuid(),
});

// Schema for deleting a booking form
export const deleteBookingFormSchema = z.object({
  id: z.string().cuid(),
  force: z.boolean().optional().default(false),
});

// Schema for duplicating a booking form
export const duplicateBookingFormSchema = z.object({
  id: z.string().cuid(),
  newName: z.string().min(1).max(100).optional(),
  newSlug: z.string().min(1).max(100).optional(),
});

// Schema for managing form fields
export const updateBookingFormFieldsSchema = z.object({
  bookingFormId: z.string().cuid(),
  fields: z.array(bookingFormFieldSchema),
});

// Schema for adding a single field
export const addBookingFormFieldSchema = z.object({
  bookingFormId: z.string().cuid(),
  field: bookingFormFieldSchema,
});

// Schema for updating a single field
export const updateBookingFormFieldSchema = bookingFormFieldSchema.extend({
  id: z.string().cuid(),
  bookingFormId: z.string().cuid(),
});

// Schema for deleting a field
export const deleteBookingFormFieldSchema = z.object({
  id: z.string().cuid(),
  bookingFormId: z.string().cuid(),
});

// Schema for reordering fields
export const reorderBookingFormFieldsSchema = z.object({
  bookingFormId: z.string().cuid(),
  fieldIds: z.array(z.string().cuid()), // Ordered list of field IDs
});

// Schema for managing services on a form
export const bookingFormServicesSchema = z.object({
  bookingFormId: z.string().cuid(),
  services: z.array(
    z.object({
      serviceId: z.string().cuid(),
      sortOrder: z.number().min(0).default(0),
      isDefault: z.boolean().default(false),
    })
  ),
});

// Schema for public form submission
export const submitBookingFormSchema = z.object({
  bookingFormId: z.string().cuid(),
  data: z.record(z.string(), z.unknown()), // Dynamic field data
  clientName: z.string().min(1, "Name is required").max(100).optional(),
  clientEmail: z.string().email("Valid email is required").optional(),
  clientPhone: z.string().max(20).optional().nullable(),
  preferredDate: z.string().datetime().optional().nullable(),
  preferredTime: z.string().max(50).optional().nullable(),
  serviceId: z.string().cuid().optional().nullable(),
});

// Schema for converting submission to booking
export const convertSubmissionSchema = z.object({
  submissionId: z.string().cuid(),
  bookingData: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    serviceId: z.string().cuid().optional(),
    assignedUserId: z.string().cuid().optional(),
    timezone: z.string().optional(),
    allowConflicts: z.boolean().optional(),
    notes: z.string().optional(),
  }),
});

// Schema for rejecting a submission
export const rejectSubmissionSchema = z.object({
  submissionId: z.string().cuid(),
  rejectionNote: z.string().max(500).optional(),
});

// Booking form filters for querying
export const bookingFormFiltersSchema = z.object({
  isPublished: z.boolean().optional(),
  industry: z.enum(IndustryValues).optional(),
  search: z.string().optional(),
});

// Submission filters for querying
export const submissionFiltersSchema = z.object({
  bookingFormId: z.string().cuid().optional(),
  status: z.enum(SubmissionStatusValues).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Type exports
export type FormFieldType = (typeof FormFieldTypeValues)[number];
export type Industry = (typeof IndustryValues)[number];
export type SubmissionStatus = (typeof SubmissionStatusValues)[number];
export type FieldValidation = z.infer<typeof fieldValidationSchema>;
export type BookingFormField = z.infer<typeof bookingFormFieldSchema>;
export type CreateBookingFormInput = z.infer<typeof createBookingFormSchema>;
export type UpdateBookingFormInput = z.infer<typeof updateBookingFormSchema>;
export type DeleteBookingFormInput = z.infer<typeof deleteBookingFormSchema>;
export type DuplicateBookingFormInput = z.infer<typeof duplicateBookingFormSchema>;
export type UpdateBookingFormFieldsInput = z.infer<typeof updateBookingFormFieldsSchema>;
export type AddBookingFormFieldInput = z.infer<typeof addBookingFormFieldSchema>;
export type UpdateBookingFormFieldInput = z.infer<typeof updateBookingFormFieldSchema>;
export type DeleteBookingFormFieldInput = z.infer<typeof deleteBookingFormFieldSchema>;
export type ReorderBookingFormFieldsInput = z.infer<typeof reorderBookingFormFieldsSchema>;
export type BookingFormServicesInput = z.infer<typeof bookingFormServicesSchema>;
export type SubmitBookingFormInput = z.infer<typeof submitBookingFormSchema>;
export type ConvertSubmissionInput = z.infer<typeof convertSubmissionSchema>;
export type RejectSubmissionInput = z.infer<typeof rejectSubmissionSchema>;
export type BookingFormFilters = z.infer<typeof bookingFormFiltersSchema>;
export type SubmissionFilters = z.infer<typeof submissionFiltersSchema>;
