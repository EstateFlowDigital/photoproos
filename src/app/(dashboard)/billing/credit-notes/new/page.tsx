"use server";

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { CreditNoteForm } from "./credit-note-form";

export default async function NewCreditNotePage() {
  const organizationId = await requireOrganizationId();

  const [clients, invoices] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId },
      select: { id: true, fullName: true, company: true, email: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ["sent", "overdue"] },
      },
      select: {
        id: true,
        invoiceNumber: true,
        totalCents: true,
        paidAmountCents: true,
        clientName: true,
        client: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Issue Credit Note"
        subtitle="Create a credit note for a client refund or credit"
      />

      <div className="mx-auto w-full max-w-2xl">
        <CreditNoteForm clients={clients} invoices={invoices} />
      </div>
    </div>
  );
}
