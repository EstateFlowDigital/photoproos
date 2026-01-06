"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import type { InvoiceSplitType } from "@prisma/client";
import { ok, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// Types
// ============================================================================

export interface BrokerageContractWithRelations {
  id: string;
  brokerageId: string;
  name: string;
  description: string | null;
  discountPercent: number | null;
  discountFixedCents: number | null;
  servicePricing: Record<string, number> | null;
  paymentTermsDays: number;
  autoInvoice: boolean;
  invoiceSplitType: InvoiceSplitType;
  brokeragePayPercent: number | null;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  brokerage?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateContractInput {
  brokerageId: string;
  name: string;
  description?: string | null;
  discountPercent?: number | null;
  discountFixedCents?: number | null;
  servicePricing?: Record<string, number> | null;
  paymentTermsDays?: number;
  autoInvoice?: boolean;
  invoiceSplitType?: InvoiceSplitType;
  brokeragePayPercent?: number | null;
  startDate?: Date;
  endDate?: Date | null;
}

export interface UpdateContractInput extends Partial<Omit<CreateContractInput, "brokerageId">> {
  id: string;
  isActive?: boolean;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all contracts for a brokerage
 */
export async function getBrokerageContracts(
  brokerageId: string
): Promise<ActionResult<BrokerageContractWithRelations[]>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify brokerage belongs to organization
    const brokerage = await prisma.brokerage.findFirst({
      where: { id: brokerageId, organizationId },
    });

    if (!brokerage) {
      return { success: false, error: "Brokerage not found" };
    }

    const contracts = await prisma.brokerageContract.findMany({
      where: { brokerageId },
      include: {
        brokerage: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: contracts.map((c) => ({
        ...c,
        servicePricing: c.servicePricing as Record<string, number> | null,
      })),
    };
  } catch (error) {
    console.error("[BrokerageContracts] Error fetching contracts:", error);
    return { success: false, error: "Failed to fetch contracts" };
  }
}

/**
 * Get a single contract by ID
 */
export async function getBrokerageContract(
  id: string
): Promise<ActionResult<BrokerageContractWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    const contract = await prisma.brokerageContract.findFirst({
      where: { id },
      include: {
        brokerage: {
          select: {
            id: true,
            name: true,
            slug: true,
            organizationId: true,
          },
        },
      },
    });

    if (!contract || contract.brokerage.organizationId !== organizationId) {
      return { success: false, error: "Contract not found" };
    }

    return {
      success: true,
      data: {
        ...contract,
        servicePricing: contract.servicePricing as Record<string, number> | null,
        brokerage: {
          id: contract.brokerage.id,
          name: contract.brokerage.name,
          slug: contract.brokerage.slug,
        },
      },
    };
  } catch (error) {
    console.error("[BrokerageContracts] Error fetching contract:", error);
    return { success: false, error: "Failed to fetch contract" };
  }
}

/**
 * Get the active contract for a brokerage
 */
export async function getActiveBrokerageContract(
  brokerageId: string
): Promise<ActionResult<BrokerageContractWithRelations | null>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify brokerage belongs to organization
    const brokerage = await prisma.brokerage.findFirst({
      where: { id: brokerageId, organizationId },
    });

    if (!brokerage) {
      return { success: false, error: "Brokerage not found" };
    }

    const now = new Date();
    const contract = await prisma.brokerageContract.findFirst({
      where: {
        brokerageId,
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gt: now } }],
      },
      include: {
        brokerage: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    if (!contract) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        ...contract,
        servicePricing: contract.servicePricing as Record<string, number> | null,
      },
    };
  } catch (error) {
    console.error("[BrokerageContracts] Error fetching active contract:", error);
    return { success: false, error: "Failed to fetch active contract" };
  }
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create a new contract
 */
export async function createBrokerageContract(
  input: CreateContractInput
): Promise<ActionResult<BrokerageContractWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify brokerage belongs to organization
    const brokerage = await prisma.brokerage.findFirst({
      where: { id: input.brokerageId, organizationId },
    });

    if (!brokerage) {
      return { success: false, error: "Brokerage not found" };
    }

    const contract = await prisma.brokerageContract.create({
      data: {
        brokerageId: input.brokerageId,
        name: input.name,
        description: input.description || null,
        discountPercent: input.discountPercent ?? null,
        discountFixedCents: input.discountFixedCents ?? null,
        servicePricing: input.servicePricing ?? undefined,
        paymentTermsDays: input.paymentTermsDays ?? 30,
        autoInvoice: input.autoInvoice ?? false,
        invoiceSplitType: input.invoiceSplitType ?? "single",
        brokeragePayPercent: input.brokeragePayPercent ?? null,
        startDate: input.startDate ?? new Date(),
        endDate: input.endDate ?? null,
      },
      include: {
        brokerage: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    revalidatePath(`/brokerages/${input.brokerageId}`);
    return {
      success: true,
      data: {
        ...contract,
        servicePricing: contract.servicePricing as Record<string, number> | null,
      },
    };
  } catch (error) {
    console.error("[BrokerageContracts] Error creating contract:", error);
    return { success: false, error: "Failed to create contract" };
  }
}

/**
 * Update a contract
 */
export async function updateBrokerageContract(
  input: UpdateContractInput
): Promise<ActionResult<BrokerageContractWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify contract belongs to organization
    const existing = await prisma.brokerageContract.findFirst({
      where: { id: input.id },
      include: {
        brokerage: {
          select: { organizationId: true },
        },
      },
    });

    if (!existing || existing.brokerage.organizationId !== organizationId) {
      return { success: false, error: "Contract not found" };
    }

    const contract = await prisma.brokerageContract.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.discountPercent !== undefined && { discountPercent: input.discountPercent }),
        ...(input.discountFixedCents !== undefined && { discountFixedCents: input.discountFixedCents }),
        ...(input.servicePricing !== undefined && { servicePricing: input.servicePricing ?? undefined }),
        ...(input.paymentTermsDays !== undefined && { paymentTermsDays: input.paymentTermsDays }),
        ...(input.autoInvoice !== undefined && { autoInvoice: input.autoInvoice }),
        ...(input.invoiceSplitType !== undefined && { invoiceSplitType: input.invoiceSplitType }),
        ...(input.brokeragePayPercent !== undefined && { brokeragePayPercent: input.brokeragePayPercent }),
        ...(input.startDate !== undefined && { startDate: input.startDate }),
        ...(input.endDate !== undefined && { endDate: input.endDate }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        brokerage: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    revalidatePath(`/brokerages/${existing.brokerageId}`);
    return {
      success: true,
      data: {
        ...contract,
        servicePricing: contract.servicePricing as Record<string, number> | null,
      },
    };
  } catch (error) {
    console.error("[BrokerageContracts] Error updating contract:", error);
    return { success: false, error: "Failed to update contract" };
  }
}

/**
 * Delete a contract
 */
export async function deleteBrokerageContract(id: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify contract belongs to organization
    const contract = await prisma.brokerageContract.findFirst({
      where: { id },
      include: {
        brokerage: {
          select: { id: true, organizationId: true },
        },
      },
    });

    if (!contract || contract.brokerage.organizationId !== organizationId) {
      return { success: false, error: "Contract not found" };
    }

    await prisma.brokerageContract.delete({
      where: { id },
    });

    revalidatePath(`/brokerages/${contract.brokerage.id}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[BrokerageContracts] Error deleting contract:", error);
    return { success: false, error: "Failed to delete contract" };
  }
}

// ============================================================================
// Pricing Helpers
// ============================================================================

/**
 * Calculate the final price for a service based on brokerage contract
 */
export async function calculateBrokeragePrice(
  serviceId: string,
  brokerageId: string,
  basePriceCents: number
): Promise<ActionResult<{ priceCents: number; discount: number; source: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get active contract
    const contractResult = await getActiveBrokerageContract(brokerageId);
    if (!contractResult.success) {
      return { success: false, error: contractResult.error };
    }

    const contract = contractResult.data;

    // No active contract - return base price
    if (!contract) {
      return {
        success: true,
        data: {
          priceCents: basePriceCents,
          discount: 0,
          source: "base",
        },
      };
    }

    // Check for service-specific pricing
    if (contract.servicePricing && contract.servicePricing[serviceId]) {
      return {
        success: true,
        data: {
          priceCents: contract.servicePricing[serviceId],
          discount: basePriceCents - contract.servicePricing[serviceId],
          source: "service_override",
        },
      };
    }

    // Apply percentage discount
    if (contract.discountPercent && contract.discountPercent > 0) {
      const discountAmount = Math.round(basePriceCents * (contract.discountPercent / 100));
      return {
        success: true,
        data: {
          priceCents: basePriceCents - discountAmount,
          discount: discountAmount,
          source: "percentage",
        },
      };
    }

    // Apply fixed discount
    if (contract.discountFixedCents && contract.discountFixedCents > 0) {
      const discountAmount = Math.min(contract.discountFixedCents, basePriceCents);
      return {
        success: true,
        data: {
          priceCents: basePriceCents - discountAmount,
          discount: discountAmount,
          source: "fixed",
        },
      };
    }

    // No discount
    return {
      success: true,
      data: {
        priceCents: basePriceCents,
        discount: 0,
        source: "base",
      },
    };
  } catch (error) {
    console.error("[BrokerageContracts] Error calculating price:", error);
    return { success: false, error: "Failed to calculate price" };
  }
}
