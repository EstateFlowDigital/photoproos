export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import Link from "next/link";
import { CreditNotesPageClient } from "./credit-notes-page-client";
import type { CreditNoteStatus } from "@prisma/client";

interface Props {
  searchParams: Promise<{ status?: CreditNoteStatus }>;
}

export default async function CreditNotesPage({ searchParams }: Props) {
  const organizationId = await requireOrganizationId();
  const params = await searchParams;

  const creditNotes = await prisma.creditNote.findMany({
    where: {
      organizationId,
      ...(params.status ? { status: params.status } : {}),
    },
    select: {
      id: true,
      creditNoteNumber: true,
      status: true,
      amountCents: true,
      appliedAmountCents: true,
      refundedAmountCents: true,
      currency: true,
      reason: true,
      createdAt: true,
      client: {
        select: { id: true, fullName: true, company: true, email: true },
      },
      invoice: {
        select: { id: true, invoiceNumber: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6 p-6" data-element="billing-credit-notes-page">
      <PageHeader
        title="Credit Notes"
        subtitle="Manage refunds and credits for clients"
        actions={
          <Link
            href="/billing/credit-notes/new"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            Issue Credit Note
          </Link>
        }
      />

      <CreditNotesPageClient creditNotes={creditNotes} statusFilter={params.status} />
    </div>
  );
}
