/**
 * Questionnaire Types
 *
 * These types are separated from server actions to avoid "use server" export restrictions.
 * Next.js "use server" files can only export async functions.
 */

import type { Industry, FormFieldType, LegalAgreementType, ClientQuestionnaireStatus, SignatureType } from "@prisma/client";

export type QuestionnaireTemplateWithRelations = {
  id: string;
  organizationId: string | null;
  name: string;
  slug: string;
  description: string | null;
  industry: Industry;
  isSystemTemplate: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  fields: Array<{
    id: string;
    label: string;
    type: FormFieldType;
    placeholder: string | null;
    helpText: string | null;
    isRequired: boolean;
    sortOrder: number;
    section: string | null;
    sectionOrder: number;
    validation: unknown;
    conditionalOn: string | null;
    conditionalValue: string | null;
  }>;
  legalAgreements: Array<{
    id: string;
    agreementType: LegalAgreementType;
    title: string;
    content: string;
    isRequired: boolean;
    requiresSignature: boolean;
    sortOrder: number;
  }>;
  _count: {
    questionnaires: number;
  };
};

export type PortalQuestionnaireWithRelations = {
  id: string;
  templateId: string;
  isRequired: boolean;
  dueDate: Date | null;
  status: ClientQuestionnaireStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  template: {
    id: string;
    name: string;
    description: string | null;
    industry: string;
    fields: Array<{
      id: string;
      label: string;
      type: FormFieldType;
      placeholder: string | null;
      helpText: string | null;
      isRequired: boolean;
      sortOrder: number;
      section: string | null;
      sectionOrder: number;
      validation: unknown;
      conditionalOn: string | null;
      conditionalValue: string | null;
    }>;
    legalAgreements: Array<{
      id: string;
      agreementType: LegalAgreementType;
      title: string;
      content: string;
      isRequired: boolean;
      requiresSignature: boolean;
      sortOrder: number;
    }>;
  };
  booking: {
    id: string;
    title: string;
    startTime: Date;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  responses: Array<{
    id: string;
    fieldLabel: string;
    fieldType: string;
    value: unknown;
    createdAt: Date;
  }>;
  agreements: Array<{
    id: string;
    agreementType: LegalAgreementType;
    title: string;
    content: string;
    accepted: boolean;
    acceptedAt: Date | null;
    signatureData: string | null;
    signatureType: SignatureType | null;
  }>;
};
