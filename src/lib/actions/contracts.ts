"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ContractStatus } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";

// =============================================================================
// Types
// =============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateContractInput {
  name: string;
  content: string;
  clientId?: string;
  templateId?: string;
  expiresAt?: Date;
}

export interface UpdateContractInput {
  name?: string;
  content?: string;
  clientId?: string | null;
  expiresAt?: Date | null;
}

// =============================================================================
// Contract CRUD Operations
// =============================================================================

/**
 * Get a single contract by ID with all related data
 */
export async function getContract(id: string) {
  try {
    const organizationId = await requireOrganizationId();

    const contract = await prisma.contract.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            company: true,
            email: true,
            phone: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        signers: {
          select: {
            id: true,
            email: true,
            name: true,
            signedAt: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        signatures: {
          select: {
            id: true,
            signerId: true,
            signedAt: true,
            signatureType: true,
            ipAddress: true,
          },
        },
        auditLogs: {
          select: {
            id: true,
            action: true,
            actorEmail: true,
            actorIp: true,
            metadata: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    return contract;
  } catch (error) {
    console.error("[Contracts] Error fetching contract:", error);
    return null;
  }
}

/**
 * Create a new contract
 */
export async function createContract(
  input: CreateContractInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    const contract = await prisma.contract.create({
      data: {
        organizationId,
        name: input.name,
        content: input.content,
        clientId: input.clientId || null,
        templateId: input.templateId || null,
        expiresAt: input.expiresAt || null,
        status: "draft",
      },
    });

    // Create audit log
    await prisma.contractAuditLog.create({
      data: {
        contractId: contract.id,
        action: "contract_created",
        metadata: { name: input.name },
      },
    });

    revalidatePath("/contracts");

    return { success: true, data: { id: contract.id } };
  } catch (error) {
    console.error("[Contracts] Error creating contract:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create contract" };
  }
}

/**
 * Update a contract
 */
export async function updateContract(
  id: string,
  input: UpdateContractInput
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const contract = await prisma.contract.findFirst({
      where: { id, organizationId },
      select: { id: true, status: true },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    if (contract.status === "signed") {
      return { success: false, error: "Cannot edit a signed contract" };
    }

    await prisma.contract.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.clientId !== undefined && { clientId: input.clientId }),
        ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
      },
    });

    // Create audit log
    await prisma.contractAuditLog.create({
      data: {
        contractId: id,
        action: "contract_updated",
        metadata: JSON.parse(JSON.stringify(input)),
      },
    });

    revalidatePath(`/contracts/${id}`);
    revalidatePath("/contracts");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Contracts] Error updating contract:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update contract" };
  }
}

/**
 * Delete a contract
 */
export async function deleteContract(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const contract = await prisma.contract.findFirst({
      where: { id, organizationId },
      select: { id: true, status: true },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    if (contract.status === "signed") {
      return { success: false, error: "Cannot delete a signed contract" };
    }

    // Delete related records first (cascade should handle this but being explicit)
    await prisma.$transaction([
      prisma.contractSignature.deleteMany({ where: { contractId: id } }),
      prisma.contractAuditLog.deleteMany({ where: { contractId: id } }),
      prisma.contractSigner.deleteMany({ where: { contractId: id } }),
      prisma.contract.delete({ where: { id } }),
    ]);

    revalidatePath("/contracts");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Contracts] Error deleting contract:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete contract" };
  }
}

/**
 * Send a contract (changes status from draft to sent)
 */
export async function sendContract(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const contract = await prisma.contract.findFirst({
      where: { id, organizationId },
      include: {
        signers: { select: { id: true } },
      },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    if (contract.status !== "draft") {
      return { success: false, error: "Contract has already been sent" };
    }

    if (contract.signers.length === 0) {
      return { success: false, error: "Add at least one signer before sending" };
    }

    await prisma.contract.update({
      where: { id },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    // Create audit log
    await prisma.contractAuditLog.create({
      data: {
        contractId: id,
        action: "contract_sent",
      },
    });

    // TODO: Send email notifications to signers

    revalidatePath(`/contracts/${id}`);
    revalidatePath("/contracts");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Contracts] Error sending contract:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to send contract" };
  }
}

/**
 * Duplicate a contract
 */
export async function duplicateContract(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    const original = await prisma.contract.findFirst({
      where: { id, organizationId },
      select: {
        name: true,
        content: true,
        clientId: true,
        templateId: true,
      },
    });

    if (!original) {
      return { success: false, error: "Contract not found" };
    }

    const newContract = await prisma.contract.create({
      data: {
        organizationId,
        name: `${original.name} (Copy)`,
        content: original.content,
        clientId: original.clientId,
        templateId: original.templateId,
        status: "draft",
      },
    });

    // Create audit log
    await prisma.contractAuditLog.create({
      data: {
        contractId: newContract.id,
        action: "contract_created",
        metadata: { duplicatedFrom: id },
      },
    });

    revalidatePath("/contracts");

    return { success: true, data: { id: newContract.id } };
  } catch (error) {
    console.error("[Contracts] Error duplicating contract:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to duplicate contract" };
  }
}
