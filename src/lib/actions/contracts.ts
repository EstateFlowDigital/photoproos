"use server";

/**
 * Contract Management Actions
 *
 * This file handles all contract CRUD operations for organizations.
 * For signing-related actions, see: contract-signing.ts
 *
 * Email Integration:
 * - When a contract is sent via sendContract(), emails are dispatched to all signers
 * - Uses sendContractSigningEmail() from @/lib/email/send
 *
 * Related Files:
 * - src/lib/actions/contract-signing.ts - Signing flow and token management
 * - src/lib/actions/contract-templates.ts - Template management
 * - src/emails/contract-signing.tsx - Email template
 * - src/app/sign/[token]/page.tsx - Public signing page
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ContractStatus } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { sendContractSigningEmail } from "@/lib/email/send";
import type { ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

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
 *
 * This action:
 * 1. Validates the contract is in draft status and has signers
 * 2. Updates the contract status to "sent"
 * 3. Creates an audit log entry
 * 4. Sends email notifications to all signers with their unique signing links
 *
 * Email delivery is non-blocking - the contract is still marked as sent even
 * if some emails fail to deliver. Email failures are logged but don't prevent
 * the action from succeeding.
 */
export async function sendContract(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Fetch contract with full signer data needed for emails
    const contract = await prisma.contract.findFirst({
      where: { id, organizationId },
      include: {
        signers: {
          select: {
            id: true,
            email: true,
            name: true,
            signingToken: true,
            tokenExpiresAt: true,
          },
        },
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

    // Get organization name for email
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, publicEmail: true },
    });

    await prisma.contract.update({
      where: { id },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    // Create audit log entry
    await prisma.contractAuditLog.create({
      data: {
        contractId: id,
        action: "contract_sent",
        metadata: {
          signerCount: contract.signers.length,
          signerEmails: contract.signers.map((s) => s.email),
        },
      },
    });

    // Send email notifications to all signers
    // This is non-blocking - we don't fail the action if emails fail
    const emailPromises = contract.signers.map(async (signer) => {
      try {
        const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${signer.signingToken}`;

        await sendContractSigningEmail({
          to: signer.email,
          signerName: signer.name || "there",
          contractName: contract.name,
          signingUrl,
          photographerName: organization?.name || "Your Photographer",
          photographerEmail: organization?.publicEmail || undefined,
          expiresAt: signer.tokenExpiresAt || undefined,
          isReminder: false,
        });

        console.log(`[Contracts] Signing invitation sent to ${signer.email}`);
      } catch (emailError) {
        // Log email failure but don't fail the overall action
        console.error(
          `[Contracts] Failed to send signing invitation to ${signer.email}:`,
          emailError
        );
      }
    });

    // Fire all emails concurrently (non-blocking for the response)
    Promise.all(emailPromises).catch((error) => {
      console.error("[Contracts] Error sending signing invitation emails:", error);
    });

    // Log activity for the organization
    await prisma.activityLog.create({
      data: {
        organizationId,
        type: "contract_sent",
        description: `Contract "${contract.name}" sent to ${contract.signers.length} signer(s)`,
        contractId: id,
        metadata: {
          signerCount: contract.signers.length,
          signerEmails: contract.signers.map((s) => s.email),
        },
      },
    });

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
