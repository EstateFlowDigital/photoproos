import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PayInvoiceClient } from "@/app/pay/[id]/pay-client";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string; session_id?: string }>;
}

// Get public invoice data (no auth required)
async function getPublicInvoice(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      organization: {
        select: {
          name: true,
          logoUrl: true,
          primaryColor: true,
          stripeConnectAccountId: true,
          stripeConnectOnboarded: true,
        },
      },
      client: {
        select: {
          fullName: true,
          email: true,
          company: true,
        },
      },
      lineItems: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          description: true,
          quantity: true,
          unitCents: true,
          totalCents: true,
          itemType: true,
        },
      },
      payments: {
        where: { status: "paid" },
        orderBy: { paidAt: "desc" },
        select: {
          id: true,
          amountCents: true,
          paidAt: true,
        },
      },
    },
  });

  return invoice;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getPublicInvoice(id);

  if (!invoice) {
    return { title: "Invoice Not Found" };
  }

  return {
    title: `Pay Invoice ${invoice.invoiceNumber} | ${invoice.organization.name}`,
    description: `Pay your invoice from ${invoice.organization.name}`,
  };
}

export default async function PayInvoicePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { payment, session_id } = await searchParams;

  const invoice = await getPublicInvoice(id);

  if (!invoice) {
    notFound();
  }

  // Don't show draft invoices
  if (invoice.status === "draft") {
    notFound();
  }

  // Calculate amounts
  const totalDue = invoice.totalCents + invoice.lateFeeAppliedCents;
  const balance = totalDue - invoice.paidAmountCents;
  const isFullyPaid = balance <= 0 || invoice.status === "paid";

  // Check if payment processing is available
  const canAcceptPayment =
    invoice.organization.stripeConnectAccountId &&
    invoice.organization.stripeConnectOnboarded;

  return (
    <div data-element="payment-page">
      <PayInvoiceClient
      invoice={{
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        currency: invoice.currency,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        paidAt: invoice.paidAt?.toISOString() || null,
        subtotalCents: invoice.subtotalCents,
        taxCents: invoice.taxCents,
        discountCents: invoice.discountCents,
        totalCents: invoice.totalCents,
        lateFeeAppliedCents: invoice.lateFeeAppliedCents,
        paidAmountCents: invoice.paidAmountCents,
        notes: invoice.notes,
        clientName: invoice.clientName || invoice.client?.fullName || null,
        clientEmail: invoice.clientEmail || invoice.client?.email || null,
        clientCompany: invoice.client?.company || null,
        lineItems: invoice.lineItems,
        payments: invoice.payments.map((p) => ({
          id: p.id,
          amountCents: p.amountCents,
          paidAt: p.paidAt?.toISOString() || null,
        })),
      }}
      organization={{
        name: invoice.organization.name,
        logoUrl: invoice.organization.logoUrl,
        primaryColor: invoice.organization.primaryColor,
      }}
      balance={balance}
      isFullyPaid={isFullyPaid}
      canAcceptPayment={!!canAcceptPayment}
      paymentStatus={payment || null}
      sessionId={session_id || null}
    />
    </div>
  );
}
