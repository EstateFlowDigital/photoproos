"use server";

/**
 * Contract Signing Actions
 *
 * This file handles all contract signing operations:
 * - Adding/removing signers to contracts
 * - Generating and managing signing tokens
 * - Public signing flow for signers
 * - Resending signing invitations
 *
 * Email Integration:
 * - resendSigningInvitation(): Sends reminder emails to pending signers
 * - signContract(): Sends confirmation emails after successful signature
 *
 * Related Files:
 * - src/lib/actions/contracts.ts - Contract CRUD and initial send
 * - src/lib/email/send.ts - Email sending functions
 * - src/emails/contract-signing.tsx - Email template
 * - src/app/sign/[token]/page.tsx - Public signing page
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { SignatureType, ContractStatus } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { headers } from "next/headers";
import crypto from "crypto";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import {
  sendContractSigningEmail,
  sendContractSignedConfirmationEmail,
} from "@/lib/email/send";
import { triggerContractSigned } from "@/lib/gamification";

// =============================================================================
// Types
// =============================================================================

interface CreateSignerInput {
  contractId: string;
  email: string;
  name?: string;
  sortOrder?: number;
}

interface SignContractInput {
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
    return fail("Failed to fetch contracts");
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
      return fail("Contract not found");
    }

    if (contract.status === "signed") {
      return fail("Cannot add signers to a signed contract");
    }

    // Check if signer already exists
    const existingSigner = await prisma.contractSigner.findFirst({
      where: {
        contractId: input.contractId,
        email: input.email,
      },
    });

    if (existingSigner) {
      return fail("This email is already a signer on this contract");
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

    return success({
      id: signer.id,
      signingToken,
      signingUrl,
    });
  } catch (error) {
    console.error("[ContractSigning] Error adding signer:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to add signer");
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
      return fail("Signer not found");
    }

    if (signer.signedAt) {
      return fail("Cannot remove a signer who has already signed");
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

    return ok();
  } catch (error) {
    console.error("[ContractSigning] Error removing signer:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to remove signer");
  }
}

/**
 * Resend signing invitation to a signer
 *
 * This action:
 * 1. Validates the signer exists and hasn't already signed
 * 2. Generates a fresh signing token (extends expiry by 30 days)
 * 3. Creates an audit log entry
 * 4. Sends a reminder email with the new signing link
 *
 * Use this when:
 * - Original email was lost or expired
 * - Signer requests a new link
 * - Following up on pending signatures
 */
export async function resendSigningInvitation(
  signerId: string
): Promise<ActionResult<{ signingUrl: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get signer with contract and organization info for email
    const signer = await prisma.contractSigner.findFirst({
      where: { id: signerId },
      include: {
        contract: {
          select: { organizationId: true, id: true, name: true },
        },
      },
    });

    if (!signer || signer.contract.organizationId !== organizationId) {
      return fail("Signer not found");
    }

    if (signer.signedAt) {
      return fail("This signer has already signed the contract");
    }

    // Get organization info for email
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, publicEmail: true },
    });

    // Generate new token with fresh 30-day expiry
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

    // Send reminder email with signing link
    // This is non-blocking - we return success even if email fails
    try {
      await sendContractSigningEmail({
        to: signer.email,
        signerName: signer.name || "there",
        contractName: signer.contract.name,
        signingUrl,
        photographerName: organization?.name || "Your Photographer",
        photographerEmail: organization?.publicEmail || undefined,
        expiresAt: tokenExpiresAt,
        isReminder: true, // This triggers reminder-specific messaging
      });

      console.log(`[ContractSigning] Reminder sent to ${signer.email}`);
    } catch (emailError) {
      console.error(
        `[ContractSigning] Failed to send reminder to ${signer.email}:`,
        emailError
      );
      // Don't fail the action - the token was regenerated successfully
    }

    return success({ signingUrl });
  } catch (error) {
    console.error("[ContractSigning] Error resending invitation:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to resend invitation");
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
      return fail("Invalid or expired signing link");
    }

    // Check if token is expired
    if (signer.tokenExpiresAt && signer.tokenExpiresAt < new Date()) {
      return fail("This signing link has expired");
    }

    // Check if already signed
    if (signer.signedAt) {
      return fail("You have already signed this contract");
    }

    // Check contract status
    if (signer.contract.status === "cancelled") {
      return fail("This contract has been cancelled");
    }

    if (signer.contract.status === "expired") {
      return fail("This contract has expired");
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
    return fail("Failed to load contract");
  }
}

/**
 * Sign a contract (public endpoint for signers)
 *
 * This is the main action called when a signer submits their signature.
 * It handles the complete signing flow:
 *
 * 1. Validates the signing token and signer state
 * 2. Creates a signature record with IP/user agent tracking
 * 3. Updates the signer record with signature timestamp
 * 4. Checks if all signers have signed (to update contract status)
 * 5. Creates an audit log entry
 * 6. Logs activity for the organization
 * 7. Sends confirmation email to the signer
 *
 * Security:
 * - IP address and user agent are captured for audit purposes
 * - Consent text is recorded with the signature
 * - Signatures are stored as base64 encoded images
 */
export async function signContract(
  input: SignContractInput
): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    const { ipAddress, userAgent } = await getRequestMetadata();

    // Fetch signer with contract and organization info for email
    const signer = await prisma.contractSigner.findFirst({
      where: { signingToken: input.signingToken },
      include: {
        contract: {
          select: {
            id: true,
            name: true,
            organizationId: true,
            status: true,
          },
        },
      },
    });

    if (!signer) {
      return fail("Invalid signing link");
    }

    if (signer.tokenExpiresAt && signer.tokenExpiresAt < new Date()) {
      return fail("This signing link has expired");
    }

    if (signer.signedAt) {
      return fail("You have already signed this contract");
    }

    if (signer.contract.status === "cancelled" || signer.contract.status === "expired") {
      return fail("This contract is no longer valid");
    }

    // Validate signature data (should be base64 encoded image)
    if (!input.signatureData || !input.signatureData.startsWith("data:image/")) {
      return fail("Invalid signature format");
    }

    // Get organization info for email and activity logging
    const organization = await prisma.organization.findUnique({
      where: { id: signer.contract.organizationId },
      select: { name: true, publicEmail: true },
    });

    // Track if all signers have signed for status update
    let allSigned = false;

    // Create signature record within a transaction
    await prisma.$transaction(async (tx) => {
      // Create the signature with full audit trail
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

      // Update signer record with signature timestamp
      await tx.contractSigner.update({
        where: { id: signer.id },
        data: {
          signedAt: new Date(),
          signedIp: ipAddress,
          signedUserAgent: userAgent,
          signatureUrl: input.signatureData, // Store in signer for quick access
        },
      });

      // Check if all signers have now signed
      const allSigners = await tx.contractSigner.findMany({
        where: { contractId: signer.contract.id },
        select: { signedAt: true },
      });

      allSigned = allSigners.every((s) => s.signedAt !== null);

      if (allSigned) {
        // Update contract status to signed when all signers complete
        await tx.contract.update({
          where: { id: signer.contract.id },
          data: {
            status: "signed",
            signedAt: new Date(),
          },
        });
      }

      // Log audit event for signature
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

    // Log activity for the organization
    await prisma.activityLog.create({
      data: {
        organizationId: signer.contract.organizationId,
        type: "contract_signed",
        description: allSigned
          ? `Contract "${signer.contract.name}" fully signed by all parties`
          : `${signer.name || signer.email} signed contract "${signer.contract.name}"`,
        contractId: signer.contract.id,
        metadata: {
          signerEmail: signer.email,
          signerName: signer.name,
          allSigned,
        },
      },
    });

    // Fire gamification trigger when contract is fully signed
    if (allSigned) {
      // Get the organization owner to award XP
      const owner = await prisma.organizationMember.findFirst({
        where: {
          organizationId: signer.contract.organizationId,
          role: "owner",
        },
        select: { userId: true },
      });

      if (owner) {
        triggerContractSigned(owner.userId, signer.contract.organizationId);
      }
    }

    // Send confirmation email to the signer
    // Non-blocking - don't fail the action if email fails
    try {
      await sendContractSignedConfirmationEmail({
        to: signer.email,
        signerName: signer.name || "there",
        contractName: signer.contract.name,
        photographerName: organization?.name || "Your Photographer",
        photographerEmail: organization?.publicEmail || undefined,
      });

      console.log(`[ContractSigning] Confirmation email sent to ${signer.email}`);
    } catch (emailError) {
      console.error(
        `[ContractSigning] Failed to send confirmation to ${signer.email}:`,
        emailError
      );
      // Don't fail the action - signature was recorded successfully
    }

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${input.signingToken}/complete`;

    return success({ redirectUrl });
  } catch (error) {
    console.error("[ContractSigning] Error signing contract:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to sign contract");
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
      return fail("Signature not found");
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
    return fail("Failed to load completion status");
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
      return fail("Contract not found");
    }

    const auditLogs = await prisma.contractAuditLog.findMany({
      where: { contractId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true as const, data: auditLogs };
  } catch (error) {
    console.error("[ContractSigning] Error fetching audit log:", error);
    return fail("Failed to fetch audit log");
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
      return fail("Contract not found");
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
    return fail("Failed to fetch signatures");
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
      return fail("Contract not found");
    }

    if (contract.status === "signed") {
      return fail("Cannot cancel a signed contract");
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

    return ok();
  } catch (error) {
    console.error("[ContractSigning] Error cancelling contract:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to cancel contract");
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
      return fail("Contract not found");
    }

    if (contract.status === "signed" || contract.status === "cancelled") {
      return fail("Cannot extend this contract");
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

    return ok();
  } catch (error) {
    console.error("[ContractSigning] Error extending expiration:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to extend contract expiration");
  }
}
