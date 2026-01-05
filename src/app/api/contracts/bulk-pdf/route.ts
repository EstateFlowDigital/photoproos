import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/clerk";
import { prisma } from "@/lib/db";
import { ContractStatus, Prisma } from "@prisma/client";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContractPdf } from "@/lib/pdf/templates/contract-pdf";
import React from "react";
import JSZip from "jszip";
import { format } from "date-fns";
import { createPdfElement, getOrganizationLogoUrl } from "@/lib/pdf/utils";

/**
 * POST /api/contracts/bulk-pdf
 * Generate a ZIP file containing PDFs for multiple contracts
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contractIds, status: statusFilter } = body as {
      contractIds?: string[];
      status?: string;
    };

    // Build query - either specific IDs or filter by status
    const whereClause: Prisma.ContractWhereInput = {
      organizationId: auth.organizationId,
    };

    if (contractIds && contractIds.length > 0) {
      whereClause.id = { in: contractIds };
    } else if (statusFilter) {
      const statusValue = Object.values(ContractStatus).find((s) => s === statusFilter);
      if (statusValue) {
        whereClause.status = statusValue;
      }
    }

    // Fetch contracts
    const contracts = await prisma.contract.findMany({
      where: whereClause,
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
            primaryColor: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to prevent timeout (contracts have more content)
    });

    if (contracts.length === 0) {
      return NextResponse.json({ error: "No contracts found" }, { status: 404 });
    }

    // Create ZIP file
    const zip = new JSZip();

    // Generate PDFs for each contract
    for (const contract of contracts) {
      try {
        // Format dates
        const createdAt = format(contract.createdAt, "MMMM d, yyyy");
        const sentAt = contract.sentAt ? format(contract.sentAt, "MMMM d, yyyy") : null;
        const signedAt = contract.signedAt ? format(contract.signedAt, "MMMM d, yyyy") : null;

        // Determine logo URL using shared utility
        const logoUrl = getOrganizationLogoUrl(contract.organization);

        // Generate PDF
        const pdfBuffer = await renderToBuffer(
          createPdfElement(
            React.createElement(ContractPdf, {
              contractName: contract.name,
              status: contract.status,
              createdAt,
              sentAt,
              signedAt,
              businessName: contract.organization?.publicName || contract.organization?.name || "Business",
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

        // Create safe filename
        const safeName = contract.name.replace(/[^a-zA-Z0-9-]/g, "-").substring(0, 50);
        const filename = `${safeName}-${contract.id.substring(0, 8)}.pdf`;
        zip.file(filename, Buffer.from(pdfBuffer));
      } catch (pdfError) {
        console.error(`Failed to generate PDF for contract ${contract.id}:`, pdfError);
        // Continue with other contracts
      }
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Create filename based on date
    const dateStr = new Date().toISOString().split("T")[0];
    const zipFilename = statusFilter
      ? `contracts-${statusFilter}-${dateStr}.zip`
      : `contracts-${dateStr}.zip`;

    // Return ZIP file
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating bulk contract PDFs:", error);
    return NextResponse.json(
      { error: "Failed to generate contract PDFs" },
      { status: 500 }
    );
  }
}
