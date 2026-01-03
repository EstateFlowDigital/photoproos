import { z } from "zod";

// ============================================================================
// ENUM VALUES (matching Prisma schema)
// ============================================================================

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

export const ClientQuestionnaireStatusValues = [
  "pending",
  "in_progress",
  "completed",
  "approved",
  "expired",
] as const;

export const LegalAgreementTypeValues = [
  "terms_of_service",
  "licensing_agreement",
  "model_release",
  "property_release",
  "liability_waiver",
  "shoot_checklist",
  "custom",
] as const;

export const SignatureTypeValues = ["drawn", "typed", "uploaded"] as const;

// ============================================================================
// FIELD VALIDATION SCHEMA (stored as JSON in database)
// ============================================================================

export const fieldValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.string()).optional(), // For select/multiselect/radio
});

// ============================================================================
// QUESTIONNAIRE FIELD SCHEMA
// ============================================================================

export const questionnaireFieldSchema = z.object({
  id: z.string().cuid().optional(), // Optional for new fields
  label: z.string().min(1, "Label is required").max(100),
  type: z.enum(FormFieldTypeValues),
  placeholder: z.string().max(200).optional().nullable(),
  helpText: z.string().max(500).optional().nullable(),
  isRequired: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
  section: z.string().max(100).optional().nullable(),
  sectionOrder: z.number().min(0).default(0),
  validation: fieldValidationSchema.optional().nullable(),
  conditionalOn: z.string().optional().nullable(),
  conditionalValue: z.string().optional().nullable(),
});

// ============================================================================
// LEGAL AGREEMENT SCHEMA
// ============================================================================

export const questionnaireAgreementSchema = z.object({
  id: z.string().cuid().optional(),
  agreementType: z.enum(LegalAgreementTypeValues),
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Agreement content is required"),
  isRequired: z.boolean().default(true),
  requiresSignature: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
});

// ============================================================================
// QUESTIONNAIRE TEMPLATE SCHEMAS
// ============================================================================

export const questionnaireTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(100, "Template name must be less than 100 characters"),
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
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  industry: z.enum(IndustryValues),
  isActive: z.boolean().optional().default(true),
});

export const createQuestionnaireTemplateSchema = questionnaireTemplateSchema;

export const updateQuestionnaireTemplateSchema = questionnaireTemplateSchema
  .partial()
  .extend({
    id: z.string().cuid(),
  });

export const deleteQuestionnaireTemplateSchema = z.object({
  id: z.string().cuid(),
  force: z.boolean().optional().default(false),
});

export const duplicateQuestionnaireTemplateSchema = z.object({
  id: z.string().cuid(),
  newName: z.string().min(1).max(100).optional(),
  newSlug: z.string().min(1).max(100).optional(),
});

// ============================================================================
// TEMPLATE FIELD MANAGEMENT SCHEMAS
// ============================================================================

export const updateQuestionnaireFieldsSchema = z.object({
  templateId: z.string().cuid(),
  fields: z.array(questionnaireFieldSchema),
});

export const addQuestionnaireFieldSchema = z.object({
  templateId: z.string().cuid(),
  field: questionnaireFieldSchema,
});

export const updateQuestionnaireFieldSchema = questionnaireFieldSchema.extend({
  id: z.string().cuid(),
  templateId: z.string().cuid(),
});

export const deleteQuestionnaireFieldSchema = z.object({
  id: z.string().cuid(),
  templateId: z.string().cuid(),
});

export const reorderQuestionnaireFieldsSchema = z.object({
  templateId: z.string().cuid(),
  fieldIds: z.array(z.string().cuid()),
});

// ============================================================================
// TEMPLATE AGREEMENT MANAGEMENT SCHEMAS
// ============================================================================

export const updateQuestionnaireAgreementsSchema = z.object({
  templateId: z.string().cuid(),
  agreements: z.array(questionnaireAgreementSchema),
});

export const addQuestionnaireAgreementSchema = z.object({
  templateId: z.string().cuid(),
  agreement: questionnaireAgreementSchema,
});

export const updateQuestionnaireAgreementSchema =
  questionnaireAgreementSchema.extend({
    id: z.string().cuid(),
    templateId: z.string().cuid(),
  });

export const deleteQuestionnaireAgreementSchema = z.object({
  id: z.string().cuid(),
  templateId: z.string().cuid(),
});

// ============================================================================
// CLIENT QUESTIONNAIRE ASSIGNMENT SCHEMAS
// ============================================================================

export const assignQuestionnaireSchema = z.object({
  clientId: z.string().cuid(),
  templateId: z.string().cuid(),
  bookingId: z.string().cuid().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  isRequired: z.boolean().optional().default(true),
  dueDate: z.string().datetime().optional().nullable(),
  sendReminders: z.boolean().optional().default(true),
  internalNotes: z.string().max(1000).optional().nullable(),
});

export const updateClientQuestionnaireSchema = z.object({
  id: z.string().cuid(),
  isRequired: z.boolean().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  sendReminders: z.boolean().optional(),
  internalNotes: z.string().max(1000).optional().nullable(),
  status: z.enum(ClientQuestionnaireStatusValues).optional(),
});

export const approveQuestionnaireSchema = z.object({
  id: z.string().cuid(),
  internalNotes: z.string().max(1000).optional().nullable(),
});

export const deleteClientQuestionnaireSchema = z.object({
  id: z.string().cuid(),
});

// ============================================================================
// CLIENT PORTAL SCHEMAS (for completing questionnaires)
// ============================================================================

export const questionnaireResponseSchema = z.object({
  fieldLabel: z.string(),
  fieldType: z.string(),
  value: z.unknown(), // Dynamic based on field type
});

export const submitQuestionnaireResponsesSchema = z.object({
  questionnaireId: z.string().cuid(),
  responses: z.array(questionnaireResponseSchema),
});

export const saveQuestionnaireProgressSchema = z.object({
  questionnaireId: z.string().cuid(),
  responses: z.array(questionnaireResponseSchema),
});

export const acceptAgreementSchema = z.object({
  questionnaireId: z.string().cuid(),
  agreementId: z.string().cuid(),
  signatureData: z.string().optional().nullable(), // Base64 signature if required
  signatureType: z.enum(SignatureTypeValues).optional().nullable(),
});

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

export const questionnaireTemplateFiltersSchema = z.object({
  industry: z.enum(IndustryValues).optional(),
  isSystemTemplate: z.boolean().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export const clientQuestionnaireFiltersSchema = z.object({
  clientId: z.string().cuid().optional(),
  templateId: z.string().cuid().optional(),
  bookingId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  status: z.enum(ClientQuestionnaireStatusValues).optional(),
  isRequired: z.boolean().optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type FormFieldType = (typeof FormFieldTypeValues)[number];
export type Industry = (typeof IndustryValues)[number];
export type ClientQuestionnaireStatus =
  (typeof ClientQuestionnaireStatusValues)[number];
export type LegalAgreementType = (typeof LegalAgreementTypeValues)[number];
export type SignatureType = (typeof SignatureTypeValues)[number];

export type FieldValidation = z.infer<typeof fieldValidationSchema>;
export type QuestionnaireField = z.infer<typeof questionnaireFieldSchema>;
export type QuestionnaireAgreement = z.infer<
  typeof questionnaireAgreementSchema
>;

export type CreateQuestionnaireTemplateInput = z.infer<
  typeof createQuestionnaireTemplateSchema
>;
export type UpdateQuestionnaireTemplateInput = z.infer<
  typeof updateQuestionnaireTemplateSchema
>;
export type DeleteQuestionnaireTemplateInput = z.infer<
  typeof deleteQuestionnaireTemplateSchema
>;
export type DuplicateQuestionnaireTemplateInput = z.infer<
  typeof duplicateQuestionnaireTemplateSchema
>;

export type UpdateQuestionnaireFieldsInput = z.infer<
  typeof updateQuestionnaireFieldsSchema
>;
export type AddQuestionnaireFieldInput = z.infer<
  typeof addQuestionnaireFieldSchema
>;
export type UpdateQuestionnaireFieldInput = z.infer<
  typeof updateQuestionnaireFieldSchema
>;
export type DeleteQuestionnaireFieldInput = z.infer<
  typeof deleteQuestionnaireFieldSchema
>;
export type ReorderQuestionnaireFieldsInput = z.infer<
  typeof reorderQuestionnaireFieldsSchema
>;

export type UpdateQuestionnaireAgreementsInput = z.infer<
  typeof updateQuestionnaireAgreementsSchema
>;
export type AddQuestionnaireAgreementInput = z.infer<
  typeof addQuestionnaireAgreementSchema
>;
export type UpdateQuestionnaireAgreementInput = z.infer<
  typeof updateQuestionnaireAgreementSchema
>;
export type DeleteQuestionnaireAgreementInput = z.infer<
  typeof deleteQuestionnaireAgreementSchema
>;

export type AssignQuestionnaireInput = z.infer<typeof assignQuestionnaireSchema>;
export type UpdateClientQuestionnaireInput = z.infer<
  typeof updateClientQuestionnaireSchema
>;
export type ApproveQuestionnaireInput = z.infer<
  typeof approveQuestionnaireSchema
>;
export type DeleteClientQuestionnaireInput = z.infer<
  typeof deleteClientQuestionnaireSchema
>;

export type QuestionnaireResponse = z.infer<typeof questionnaireResponseSchema>;
export type SubmitQuestionnaireResponsesInput = z.infer<
  typeof submitQuestionnaireResponsesSchema
>;
export type SaveQuestionnaireProgressInput = z.infer<
  typeof saveQuestionnaireProgressSchema
>;
export type AcceptAgreementInput = z.infer<typeof acceptAgreementSchema>;

export type QuestionnaireTemplateFilters = z.infer<
  typeof questionnaireTemplateFiltersSchema
>;
export type ClientQuestionnaireFilters = z.infer<
  typeof clientQuestionnaireFiltersSchema
>;
