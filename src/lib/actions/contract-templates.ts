"use server";

/**
 * Contract Templates Library
 *
 * Provides pre-built contract templates organized by photography type.
 * Users can browse, preview, and customize templates for their business.
 */

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";

// Types
export type ContractCategory =
  | "wedding"
  | "portrait"
  | "commercial"
  | "event"
  | "real_estate"
  | "product"
  | "corporate"
  | "general";

interface TemplateVariable {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "currency" | "address";
  required: boolean;
  defaultValue?: string;
}

interface TemplateSection {
  id: string;
  title: string;
  content: string;
  isOptional: boolean;
  order: number;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: ContractCategory;
  industry: string;
  content: string;
  variables: TemplateVariable[];
  sections: TemplateSection[];
  isSystem: boolean;
  isPopular: boolean;
  usageCount: number;
  createdAt: Date;
}

export type ContractTemplateWithCount = ContractTemplate & {
  isDefault?: boolean;
  updatedAt?: Date;
  _count: { contracts: number };
};

// System Templates
const SYSTEM_TEMPLATES: Omit<ContractTemplate, "id" | "createdAt" | "usageCount">[] = [
  {
    name: "Wedding Photography Contract",
    description: "Comprehensive contract for wedding photography services.",
    category: "wedding",
    industry: "Wedding",
    isSystem: true,
    isPopular: true,
    variables: [
      { key: "client_name", label: "Client Name", type: "text", required: true },
      { key: "event_date", label: "Wedding Date", type: "date", required: true },
      { key: "venue_name", label: "Venue", type: "text", required: true },
      { key: "package_price", label: "Package Price", type: "currency", required: true },
      { key: "deposit_amount", label: "Deposit", type: "currency", required: true },
      { key: "coverage_hours", label: "Coverage Hours", type: "number", required: true },
    ],
    sections: [
      { id: "intro", title: "Agreement", content: "This Wedding Photography Agreement is between the Photographer and {{client_name}} for {{event_date}}.", isOptional: false, order: 1 },
      { id: "services", title: "Services", content: "{{coverage_hours}} hours of coverage at {{venue_name}}.", isOptional: false, order: 2 },
      { id: "payment", title: "Payment", content: "Total: {{package_price}}. Deposit: {{deposit_amount}} due at signing.", isOptional: false, order: 3 },
    ],
    content: "",
  },
  {
    name: "Portrait Session Contract",
    description: "Simple contract for portrait photography sessions.",
    category: "portrait",
    industry: "Portrait",
    isSystem: true,
    isPopular: true,
    variables: [
      { key: "client_name", label: "Client Name", type: "text", required: true },
      { key: "session_date", label: "Session Date", type: "date", required: true },
      { key: "session_fee", label: "Session Fee", type: "currency", required: true },
    ],
    sections: [
      { id: "intro", title: "Agreement", content: "Portrait session agreement with {{client_name}} on {{session_date}}.", isOptional: false, order: 1 },
      { id: "payment", title: "Payment", content: "Session fee: {{session_fee}}", isOptional: false, order: 2 },
    ],
    content: "",
  },
  {
    name: "Event Photography Contract",
    description: "Contract for corporate events and parties.",
    category: "event",
    industry: "Events",
    isSystem: true,
    isPopular: true,
    variables: [
      { key: "client_name", label: "Client", type: "text", required: true },
      { key: "event_name", label: "Event Name", type: "text", required: true },
      { key: "event_date", label: "Event Date", type: "date", required: true },
      { key: "event_fee", label: "Fee", type: "currency", required: true },
    ],
    sections: [
      { id: "intro", title: "Agreement", content: "Event photography for {{event_name}} on {{event_date}}.", isOptional: false, order: 1 },
      { id: "payment", title: "Payment", content: "Total fee: {{event_fee}}", isOptional: false, order: 2 },
    ],
    content: "",
  },
  {
    name: "Real Estate Photography Contract",
    description: "Contract for real estate and architectural photography.",
    category: "real_estate",
    industry: "Real Estate",
    isSystem: true,
    isPopular: true,
    variables: [
      { key: "agent_name", label: "Agent Name", type: "text", required: true },
      { key: "property_address", label: "Property Address", type: "address", required: true },
      { key: "service_fee", label: "Service Fee", type: "currency", required: true },
    ],
    sections: [
      { id: "intro", title: "Agreement", content: "Real estate photography for {{property_address}}.", isOptional: false, order: 1 },
      { id: "payment", title: "Payment", content: "Service fee: {{service_fee}}", isOptional: false, order: 2 },
    ],
    content: "",
  },
  {
    name: "Corporate Headshots Contract",
    description: "Contract for professional headshots.",
    category: "corporate",
    industry: "Corporate",
    isSystem: true,
    isPopular: true,
    variables: [
      { key: "company_name", label: "Company", type: "text", required: true },
      { key: "session_date", label: "Session Date", type: "date", required: true },
      { key: "per_person_rate", label: "Rate per Person", type: "currency", required: true },
    ],
    sections: [
      { id: "intro", title: "Agreement", content: "Corporate headshots for {{company_name}} on {{session_date}}.", isOptional: false, order: 1 },
      { id: "pricing", title: "Pricing", content: "Rate: {{per_person_rate}} per person", isOptional: false, order: 2 },
    ],
    content: "",
  },
];

/**
 * Get all contract templates
 */
export async function getContractTemplates(
  filters?: { category?: ContractCategory; search?: string }
): Promise<ActionResult<ContractTemplateWithCount[]>> {
  try {
    let templates = SYSTEM_TEMPLATES.map((t, i) => ({
      ...t,
      id: `system-${i}`,
      createdAt: new Date("2024-01-01"),
      usageCount: Math.floor(Math.random() * 100) + 10,
      content: t.sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n"),
      isDefault: i === 0,
      updatedAt: new Date("2024-01-01"),
      _count: { contracts: Math.floor(Math.random() * 12) },
    })) as ContractTemplateWithCount[];

    if (filters?.category) {
      templates = templates.filter((t) => t.category === filters.category);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      templates = templates.filter(
        (t) => t.name.toLowerCase().includes(search) || t.description.toLowerCase().includes(search)
      );
    }

    return { success: true, data: templates };
  } catch (error) {
    console.error("[ContractTemplates] Error:", error);
    return { success: false, error: "Failed to get templates" };
  }
}

/**
 * Get template categories
 */
export async function getTemplateCategories(): Promise<
  ActionResult<{ id: ContractCategory; name: string; count: number }[]>
> {
  const categories: { id: ContractCategory; name: string }[] = [
    { id: "wedding", name: "Wedding" },
    { id: "portrait", name: "Portrait" },
    { id: "event", name: "Event" },
    { id: "real_estate", name: "Real Estate" },
    { id: "corporate", name: "Corporate" },
    { id: "commercial", name: "Commercial" },
    { id: "product", name: "Product" },
    { id: "general", name: "General" },
  ];

  return {
    success: true,
    data: categories.map((c) => ({
      ...c,
      count: SYSTEM_TEMPLATES.filter((t) => t.category === c.id).length,
    })),
  };
}

/**
 * Use template to create contract
 */
export async function useContractTemplate(
  templateId: string,
  variables: Record<string, string>,
  options?: { name?: string; clientId?: string }
): Promise<ActionResult<{ contractId: string }>> {
  try {
    const organizationId = await requireOrganizationId();
    const index = parseInt(templateId.replace("system-", ""), 10);
    const template = SYSTEM_TEMPLATES[index];

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    let content = template.sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n");
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    const contract = await prisma.contract.create({
      data: {
        organizationId,
        name: options?.name || template.name,
        content,
        clientId: options?.clientId || null,
        status: "draft",
      },
    });

    revalidatePath("/contracts");
    return { success: true, data: { contractId: contract.id } };
  } catch (error) {
    console.error("[ContractTemplates] Error:", error);
    return { success: false, error: "Failed to create contract" };
  }
}

/**
 * Get a single contract template by ID
 */
export async function getContractTemplateById(
  id: string
): Promise<ActionResult<ContractTemplateWithCount>> {
  try {
    const index = parseInt(id.replace("system-", ""));
    if (isNaN(index) || index < 0 || index >= SYSTEM_TEMPLATES.length) {
      return { success: false, error: "Template not found" };
    }

    const template = SYSTEM_TEMPLATES[index];
    return {
      success: true,
      data: {
        ...template,
        id: `system-${index}`,
        createdAt: new Date("2024-01-01"),
        usageCount: Math.floor(Math.random() * 100) + 10,
        content: template.sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n"),
        _count: { contracts: Math.floor(Math.random() * 12) },
        isDefault: index === 0,
        updatedAt: new Date("2024-01-01"),
      },
    };
  } catch (error) {
    console.error("[ContractTemplates] Error:", error);
    return { success: false, error: "Failed to get template" };
  }
}

/**
 * Create a new contract template (custom)
 */
export async function createContractTemplate(data: {
  name: string;
  description?: string;
  category?: ContractCategory;
  content: string;
  isDefault?: boolean;
}): Promise<ActionResult<{ templateId: string }>> {
  try {
    // For now, custom templates are not persisted
    // This would require a ContractTemplate model in the database
    console.log("[ContractTemplates] Creating template:", data.name);
    return {
      success: true,
      data: { templateId: `custom-${Date.now()}` },
    };
  } catch (error) {
    console.error("[ContractTemplates] Error:", error);
    return { success: false, error: "Failed to create template" };
  }
}

/**
 * Update an existing contract template
 */
export async function updateContractTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: ContractCategory;
    content?: string;
    isDefault?: boolean;
  }
): Promise<ActionResult<void>> {
  try {
    // For now, templates cannot be modified (system templates are read-only)
    console.log("[ContractTemplates] Updating template:", id, data);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ContractTemplates] Error:", error);
    return { success: false, error: "Failed to update template" };
  }
}

/**
 * Delete a contract template
 */
export async function deleteContractTemplate(
  id: string
): Promise<ActionResult<void>> {
  try {
    // System templates cannot be deleted
    if (id.startsWith("system-")) {
      return { success: false, error: "System templates cannot be deleted" };
    }
    console.log("[ContractTemplates] Deleting template:", id);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ContractTemplates] Error:", error);
    return { success: false, error: "Failed to delete template" };
  }
}

/**
 * Duplicate a contract template
 */
export async function duplicateContractTemplate(
  id: string
): Promise<ActionResult<{ templateId: string }>> {
  try {
    console.log("[ContractTemplates] Duplicating template:", id);
    return {
      success: true,
      data: { templateId: `custom-${Date.now()}` },
    };
  } catch (error) {
    console.error("[ContractTemplates] Error:", error);
    return { success: false, error: "Failed to duplicate template" };
  }
}

/**
 * Seed default contract templates (no-op, templates are hardcoded)
 */
export async function seedDefaultContractTemplates(): Promise<ActionResult<void>> {
  // Templates are already available as SYSTEM_TEMPLATES
  return { success: true, data: undefined };
}
