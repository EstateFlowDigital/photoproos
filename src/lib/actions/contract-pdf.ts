"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContractPdf } from "@/lib/pdf/templates/contract-pdf";
import React from "react";
import { createPdfElement, formatPdfDate, getOrganizationLogoUrl } from "@/lib/pdf/utils";

/**
 * Generate a PDF for a contract
 */
export async function generateContractPdf(contractId: string): Promise<{
  success: boolean;
  pdfBuffer?: string; // Base64 encoded
  filename?: string;
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Fetch the contract with all required data
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        organizationId,
      },
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
            company: true,
          },
        },
        signers: {
          select: {
            name: true,
            email: true,
            signedAt: true,
            signatureUrl: true,
          },
        },
        organization: {
          select: {
            name: true,
            publicName: true,
            publicEmail: true,
            logoUrl: true,
            logoLightUrl: true,
            invoiceLogoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    // Determine logo URL using shared utility
    const logoUrl = getOrganizationLogoUrl(contract.organization);

    // Generate the PDF
    const pdfBuffer = await renderToBuffer(
      createPdfElement(
        React.createElement(ContractPdf, {
          contractName: contract.name,
          status: contract.status,
          createdAt: formatPdfDate(contract.createdAt),
          sentAt: contract.sentAt ? formatPdfDate(contract.sentAt) : null,
          signedAt: contract.signedAt ? formatPdfDate(contract.signedAt) : null,
          businessName: contract.organization?.publicName || contract.organization?.name || "Your Business",
          businessEmail: contract.organization?.publicEmail || null,
          logoUrl,
          clientName: contract.client?.fullName || null,
          clientEmail: contract.client?.email || null,
          clientCompany: contract.client?.company || null,
          content: contract.content,
          signers: contract.signers.map((signer) => ({
            name: signer.name,
            email: signer.email,
            signedAt: signer.signedAt,
            signatureUrl: signer.signatureUrl,
          })),
          accentColor: contract.organization?.primaryColor || "#3b82f6",
        })
      )
    );

    // Generate filename
    const sanitizedName = contract.name
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const filename = `contract-${sanitizedName}.pdf`;

    // Return as base64 for client-side download
    return {
      success: true,
      pdfBuffer: Buffer.from(pdfBuffer).toString("base64"),
      filename,
    };
  } catch (error) {
    console.error("Error generating contract PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate contract PDF",
    };
  }
}
