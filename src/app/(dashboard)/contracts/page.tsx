export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import type { ContractStatus } from "@prisma/client";
import { ContractsPageClient } from "./contracts-page-client";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

interface PageProps {
  searchParams: Promise<{ status?: ContractStatus }>;
}

export default async function ContractsPage({ searchParams }: PageProps) {
  const { status: statusFilter } = await searchParams;

  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
      </div>
    );
  }

  // Fetch contracts with optional status filter
  const contracts = await prisma.contract.findMany({
    where: {
      organizationId: organization.id,
      ...(statusFilter && { status: statusFilter }),
    },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          company: true,
          email: true,
        },
      },
      signers: {
        select: {
          id: true,
          email: true,
          name: true,
          signedAt: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch templates for quick reference
  const templates = await prisma.contractTemplate.findMany({
    where: { organizationId: organization.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Calculate summary metrics
  const allContracts = await prisma.contract.findMany({
    where: { organizationId: organization.id },
    select: { status: true },
  });

  const statusCounts = {
    all: allContracts.length,
    draft: allContracts.filter((c) => c.status === "draft").length,
    sent: allContracts.filter((c) => c.status === "sent").length,
    signed: allContracts.filter((c) => c.status === "signed").length,
    expired: allContracts.filter((c) => c.status === "expired").length,
  };

  // Fetch walkthrough preference
  const walkthroughPreferenceResult = await getWalkthroughPreference("contracts");
  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div data-element="contracts-page">
      {/* Page Walkthrough */}
      <WalkthroughWrapper
        pageId="contracts"
        initialState={walkthroughState}
      />

      <ContractsPageClient
        contracts={contracts}
        templates={templates}
        statusCounts={statusCounts}
        statusFilter={statusFilter}
      />
    </div>
  );
}
