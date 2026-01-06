export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { InvoiceEditor } from "./invoice-editor";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch invoice with line items
  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      organizationId: auth.organizationId,
    },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          company: true,
        },
      },
      lineItems: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  // Only allow editing draft invoices
  if (invoice.status !== "draft") {
    redirect(`/invoices/${id}`);
  }

  // Fetch clients and services for the palette
  const [clients, services] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.service.findMany({
      where: {
        organizationId: auth.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${invoice.invoiceNumber}`}
        subtitle="Modify invoice details and line items"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/invoices" className="hover:text-foreground transition-colors">
          Invoices
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link
          href={`/invoices/${id}`}
          className="hover:text-foreground transition-colors"
        >
          {invoice.invoiceNumber}
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground">Edit</span>
      </nav>

      <InvoiceEditor
        invoice={{
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientId: invoice.clientId,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          clientAddress: invoice.clientAddress,
          dueDate: invoice.dueDate.toISOString().split("T")[0],
          notes: invoice.notes,
          terms: invoice.terms,
          currency: invoice.currency,
          subtotalCents: invoice.subtotalCents,
          discountCents: invoice.discountCents,
          taxCents: invoice.taxCents,
          totalCents: invoice.totalCents,
          lateFeeEnabled: invoice.lateFeeEnabled,
          lateFeeType: invoice.lateFeeType,
          lateFeePercent: invoice.lateFeePercent,
          lateFeeFlatCents: invoice.lateFeeFlatCents,
          lineItems: invoice.lineItems.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitCents: item.unitCents,
            totalCents: item.totalCents,
            itemType: item.itemType,
            sortOrder: item.sortOrder,
          })),
        }}
        clients={clients}
        services={services}
      />
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
