"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { SignatureType, ContractStatus } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { headers } from "next/headers";
import crypto from "crypto";

// =============================================================================
// Types
// =============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateSignerInput {
  contractId: string;
  email: string;
  name?: string;
  sortOrder?: number;
}

export interface SignContractInput {
  signingToken: string;
  signatureData: string; // Base64 encoded signature image
  signatureType?: SignatureType;
  consentText?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a secure signing token
 */
function generateSigningToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Get client IP and user agent from request headers
 */
async function getRequestMetadata() {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

// =============================================================================
// Contract Management (for organization)
// =============================================================================

/**
 * Get contracts with their signing status
 */
export async function getContractsWithSigningStatus(filters?: {
  clientId?: string;
  status?: ContractStatus;
}) {
  try {
    const organizationId = await requireOrganizationId();

    const contracts = await prisma.contract.findMany({
      where: {
        organizationId,
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
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
          },
        },
        _count: {
          select: {
            signers: true,
            signatures: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true as const,
      data: contracts.map((contract) => ({
        ...contract,
        signingProgress: {
          total: contract._count.signers,
          signed: contract._count.signatures,
          complete: contract._count.signers === contract._count.signatures && contract._count.signers > 0,
        },
      })),
    };
  } catch (error) {
    console.error("[ContractSigning] Error fetching contracts:", error);
    return { success: false as const, error: "Failed to fetch contracts" };
  }
}

/**
 * Add a signer to a contract
 */
export async function addContractSigner(
  input: CreateSignerInput
): Promise<ActionResult<{ id: string; signingToken: string; signingUrl: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify contract belongs to organization
    const contract = await prisma.contract.findFirst({
      where: { id: input.contractId, organizationId },
      select: { id: true, status: true },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    if (contract.status === "signed") {
      return { success: false, error: "Cannot add signers to a signed contract" };
    }

    // Check if signer already exists
    const existingSigner = await prisma.contractSigner.findFirst({
      where: {
        contractId: input.contractId,
        email: input.email,
      },
    });

    if (existingSigner) {
      return { success: false, error: "This email is already a signer on this contract" };
    }

    // Generate signing token
    const signingToken = generateSigningToken();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30); // 30 day expiry

    // Get next sort order
    const lastSigner = await prisma.contractSigner.findFirst({
      where: { contractId: input.contractId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const signer = await prisma.contractSigner.create({
      data: {
        contractId: input.contractId,
        email: input.email,
        name: input.name,
        signingToken,
        tokenExpiresAt,
        sortOrder: input.sortOrder ?? (lastSigner?.sortOrder ?? 0) + 1,
      },
    });

    // Update contract status to sent if it was draft
    if (contract.status === "draft") {
      await prisma.contract.update({
        where: { id: input.contractId },
        data: {
          status: "sent",
          sentAt: new Date(),
        },
      });
    }

    // Log audit event
    await prisma.contractAuditLog.create({
      data: {
        contractId: input.contractId,
        action: "signer_added",
        actorEmail: input.email,
        metadata: { signerName: input.name },
      },
    });

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${signingToken}`;

    revalidatePath(`/contracts/${input.contractId}`);
    revalidatePath("/contracts");

    return {
      success: true,
      data: {
        id: signer.id,
        signingToken,
        signingUrl,
      },
    };
  } catch (error) {
    console.error("[ContractSigning] Error adding signer:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to add signer" };
  }
}

/**
 * Remove a signer from a contract
 */
export async function removeContractSigner(signerId: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Get signer with contract to verify organization
    const signer = await prisma.contractSigner.findFirst({
      where: { id: signerId },
      include: {
        contract: {
          select: { organizationId: true, id: true, status: true },
        },
      },
    });

    if (!signer || signer.contract.organizationId !== organizationId) {
      return { success: false, error: "Signer not found" };
    }

    if (signer.signedAt) {
      return { success: false, error: "Cannot remove a signer who has already signed" };
    }

    await prisma.contractSigner.delete({
      where: { id: signerId },
    });

    // Log audit event
    await prisma.contractAuditLog.create({
      data: {
        contractId: signer.contract.id,
        action: "signer_removed",
        actorEmail: signer.email,
      },
    });

    revalidatePath(`/contracts/${signer.contract.id}`);
    revalidatePath("/contracts");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ContractSigning] Error removing signer:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove signer" };
  }
}

/**
 * Resend signing invitation to a signer
 */
export async function resendSigningInvitation(
  signerId: string
): Promise<ActionResult<{ signingUrl: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get signer with contract
    const signer = await prisma.contractSigner.findFirst({
      where: { id: signerId },
      include: {
        contract: {
          select: { organizationId: true, id: true, name: true },
        },
      },
    });

    if (!signer || signer.contract.organizationId !== organizationId) {
      return { success: false, error: "Signer not found" };
    }

    if (signer.signedAt) {
      return { success: false, error: "This signer has already signed the contract" };
    }

    // Generate new token
    const signingToken = generateSigningToken();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);

    await prisma.contractSigner.update({
      where: { id: signerId },
      data: {
        signingToken,
        tokenExpiresAt,
      },
    });

    // Log audit event
    await prisma.contractAuditLog.create({
      data: {
        contractId: signer.contract.id,
        action: "invitation_resent",
        actorEmail: signer.email,
      },
    });

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${signingToken}`;

    // TODO: Send email with signing link
    // await sendSigningInvitationEmail(signer.email, signer.name, signer.contract.name, signingUrl);

    return { success: true, data: { signingUrl } };
  } catch (error) {
    console.error("[ContractSigning] Error resending invitation:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to resend invitation" };
  }
}

// =============================================================================
// Public Signing Actions (for signers)
// =============================================================================

/**
 * Get contract by signing token (public endpoint for signers)
 */
export async function getContractForSigning(signingToken: string) {
  try {
    const signer = await prisma.contractSigner.findFirst({
      where: { signingToken },
      include: {
        contract: {
          include: {
            client: {
              select: {
                fullName: true,
                company: true,
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
                signerId: true,
                signedAt: true,
              },
            },
          },
        },
      },
    });

    if (!signer) {
      return { success: false as const, error: "Invalid or expired signing link" };
    }

    // Check if token is expired
    if (signer.tokenExpiresAt && signer.tokenExpiresAt < new Date()) {
      return { success: false as const, error: "This signing link has expired" };
    }

    // Check if already signed
    if (signer.signedAt) {
      return { success: false as const, error: "You have already signed this contract" };
    }

    // Check contract status
    if (signer.contract.status === "cancelled") {
      return { success: false as const, error: "This contract has been cancelled" };
    }

    if (signer.contract.status === "expired") {
      return { success: false as const, error: "This contract has expired" };
    }

    // Get organization branding
    const organization = await prisma.organization.findFirst({
      where: { id: signer.contract.organizationId },
      select: {
        name: true,
        logoUrl: true,
        primaryColor: true,
      },
    });

    return {
      success: true as const,
      data: {
        contract: {
          id: signer.contract.id,
          name: signer.contract.name,
          content: signer.contract.content,
          status: signer.contract.status,
        },
        signer: {
          id: signer.id,
          email: signer.email,
          name: signer.name,
        },
        client: signer.contract.client,
        organization,
        signers: signer.contract.signers.map((s) => ({
          ...s,
          hasSigned: signer.contract.signatures.some((sig) => sig.signerId === s.id),
        })),
      },
    };
  } catch (error) {
    console.error("[ContractSigning] Error fetching contract for signing:", error);
    return { success: false as const, error: "Failed to load contract" };
  }
}

/**
 * Sign a contract (public endpoint for signers)
 */
export async function signContract(
  input: SignContractInput
): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    const { ipAddress, userAgent } = await getRequestMetadata();

    const signer = await prisma.contractSigner.findFirst({
      where: { signingToken: input.signingToken },
      include: {
        contract: {
          select: {
            id: true,
            organizationId: true,
            status: true,
          },
        },
      },
    });

    if (!signer) {
      return { success: false, error: "Invalid signing link" };
    }

    if (signer.tokenExpiresAt && signer.tokenExpiresAt < new Date()) {
      return { success: false, error: "This signing link has expired" };
    }

    if (signer.signedAt) {
      return { success: false, error: "You have already signed this contract" };
    }

    if (signer.contract.status === "cancelled" || signer.contract.status === "expired") {
      return { success: false, error: "This contract is no longer valid" };
    }

    // Validate signature data (should be base64 encoded)
    if (!input.signatureData || !input.signatureData.startsWith("data:image/")) {
      return { success: false, error: "Invalid signature format" };
    }

    // Create signature record
    await prisma.$transaction(async (tx) => {
      // Create the signature
      await tx.contractSignature.create({
        data: {
          contractId: signer.contract.id,
          signerId: signer.id,
          signatureData: input.signatureData,
          signatureType: input.signatureType || "drawn",
          ipAddress,
          userAgent,
          consentGiven: true,
          consentText: input.consentText || "I agree to sign this document electronically",
        },
      });

      // Update signer record
      await tx.contractSigner.update({
        where: { id: signer.id },
        data: {
          signedAt: new Date(),
          signedIp: ipAddress,
          signedUserAgent: userAgent,
          signatureUrl: input.signatureData, // Store in signer for quick access
        },
      });

      // Check if all signers have signed
      const allSigners = await tx.contractSigner.findMany({
        where: { contractId: signer.contract.id },
        select: { signedAt: true },
      });

      const allSigned = allSigners.every((s) => s.signedAt !== null);

      if (allSigned) {
        // Update contract status to signed
        await tx.contract.update({
          where: { id: signer.contract.id },
          data: {
            status: "signed",
            signedAt: new Date(),
          },
        });
      }

      // Log audit event
      await tx.contractAuditLog.create({
        data: {
          contractId: signer.contract.id,
          action: "contract_signed",
          actorEmail: signer.email,
          actorIp: ipAddress,
          metadata: {
            signatureType: input.signatureType || "drawn",
            allSigned,
          },
        },
      });
    });

    // TODO: Send confirmation email
    // await sendSignatureConfirmationEmail(signer.email, signer.name);

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${input.signingToken}/complete`;

    return { success: true, data: { redirectUrl } };
  } catch (error) {
    console.error("[ContractSigning] Error signing contract:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to sign contract" };
  }
}

/**
 * Get signing completion status (for thank you page)
 */
export async function getSigningCompletion(signingToken: string) {
  try {
    const signer = await prisma.contractSigner.findFirst({
      where: { signingToken },
      include: {
        contract: {
          select: {
            id: true,
            name: true,
            status: true,
            organizationId: true,
          },
        },
      },
    });

    if (!signer || !signer.signedAt) {
      return { success: false as const, error: "Signature not found" };
    }

    const organization = await prisma.organization.findFirst({
      where: { id: signer.contract.organizationId },
      select: {
        name: true,
        logoUrl: true,
        publicEmail: true,
      },
    });

    return {
      success: true as const,
      data: {
        contractName: signer.contract.name,
        signerName: signer.name || signer.email,
        signedAt: signer.signedAt,
        contractFullySigned: signer.contract.status === "signed",
        organization,
      },
    };
  } catch (error) {
    console.error("[ContractSigning] Error fetching completion:", error);
    return { success: false as const, error: "Failed to load completion status" };
  }
}

// =============================================================================
// Audit & History
// =============================================================================

/**
 * Get contract audit log
 */
export async function getContractAuditLog(contractId: string) {
  try {
    const organizationId = await requireOrganizationId();

    // Verify contract belongs to organization
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, organizationId },
      select: { id: true },
    });

    if (!contract) {
      return { success: false as const, error: "Contract not found" };
    }

    const auditLogs = await prisma.contractAuditLog.findMany({
      where: { contractId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true as const, data: auditLogs };
  } catch (error) {
    console.error("[ContractSigning] Error fetching audit log:", error);
    return { success: false as const, error: "Failed to fetch audit log" };
  }
}

/**
 * Get all signatures for a contract
 */
export async function getContractSignatures(contractId: string) {
  try {
    const organizationId = await requireOrganizationId();

    // Verify contract belongs to organization
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, organizationId },
      select: { id: true },
    });

    if (!contract) {
      return { success: false as const, error: "Contract not found" };
    }

    const signatures = await prisma.contractSignature.findMany({
      where: { contractId },
      orderBy: { signedAt: "asc" },
    });

    // Get signer info for each signature
    const signerIds = signatures.map((s) => s.signerId);
    const signers = await prisma.contractSigner.findMany({
      where: { id: { in: signerIds } },
      select: { id: true, email: true, name: true },
    });

    const signerMap = new Map(signers.map((s) => [s.id, s]));

    return {
      success: true as const,
      data: signatures.map((sig) => ({
        ...sig,
        signer: signerMap.get(sig.signerId),
      })),
    };
  } catch (error) {
    console.error("[ContractSigning] Error fetching signatures:", error);
    return { success: false as const, error: "Failed to fetch signatures" };
  }
}

// =============================================================================
// Contract Status Management
// =============================================================================

/**
 * Cancel a contract
 */
export async function cancelContract(contractId: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const contract = await prisma.contract.findFirst({
      where: { id: contractId, organizationId },
      select: { id: true, status: true },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    if (contract.status === "signed") {
      return { success: false, error: "Cannot cancel a signed contract" };
    }

    await prisma.contract.update({
      where: { id: contractId },
      data: { status: "cancelled" },
    });

    // Log audit event
    await prisma.contractAuditLog.create({
      data: {
        contractId,
        action: "contract_cancelled",
      },
    });

    revalidatePath(`/contracts/${contractId}`);
    revalidatePath("/contracts");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ContractSigning] Error cancelling contract:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to cancel contract" };
  }
}

/**
 * Extend contract expiration
 */
export async function extendContractExpiration(
  contractId: string,
  newExpiresAt: Date
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const contract = await prisma.contract.findFirst({
      where: { id: contractId, organizationId },
      select: { id: true, status: true },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    if (contract.status === "signed" || contract.status === "cancelled") {
      return { success: false, error: "Cannot extend this contract" };
    }

    // Update contract and all signer tokens
    await prisma.$transaction([
      prisma.contract.update({
        where: { id: contractId },
        data: {
          expiresAt: newExpiresAt,
          status: "sent", // Reset from expired if needed
        },
      }),
      prisma.contractSigner.updateMany({
        where: {
          contractId,
          signedAt: null, // Only update unsigned signers
        },
        data: {
          tokenExpiresAt: newExpiresAt,
        },
      }),
    ]);

    // Log audit event
    await prisma.contractAuditLog.create({
      data: {
        contractId,
        action: "expiration_extended",
        metadata: { newExpiresAt: newExpiresAt.toISOString() },
      },
    });

    revalidatePath(`/contracts/${contractId}`);
    revalidatePath("/contracts");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ContractSigning] Error extending expiration:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to extend contract expiration" };
  }
}
