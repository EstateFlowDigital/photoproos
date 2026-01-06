export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import Link from "next/link";
import { EstimatesListClient } from "./estimates-list-client";

export default async function EstimatesListPage() {
  const organizationId = await requireOrganizationId();

  const estimates = await prisma.estimate.findMany({
    where: { organizationId },
    select: {
      id: true,
      estimateNumber: true,
      title: true,
      status: true,
      totalCents: true,
      validUntil: true,
      createdAt: true,
      clientName: true,
      client: {
        select: { id: true, fullName: true, company: true, email: true },
      },
      convertedToInvoice: {
        select: { id: true, invoiceNumber: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get stats for filters
  const now = new Date();
  const stats = {
    total: estimates.length,
    draft: estimates.filter((e) => e.status === "draft").length,
    sent: estimates.filter((e) => e.status === "sent").length,
    approved: estimates.filter((e) => e.status === "approved").length,
    rejected: estimates.filter((e) => e.status === "rejected").length,
    expired: estimates.filter(
      (e) => e.validUntil < now && !["approved", "rejected", "converted"].includes(e.status)
    ).length,
    converted: estimates.filter((e) => e.status === "converted").length,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Estimates"
        subtitle="Create and manage quotes and proposals"
        actions={
          <Link
            href="/billing/estimates/new"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            New Estimate
          </Link>
        }
      />

      <EstimatesListClient estimates={estimates} stats={stats} />
    </div>
  );
}
