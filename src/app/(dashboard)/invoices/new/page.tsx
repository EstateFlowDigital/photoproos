export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import { InvoiceForm } from "./invoice-form";

export default async function NewInvoicePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch clients for the dropdown
  const clients = await prisma.client.findMany({
    where: { organizationId: auth.organizationId },
    select: {
      id: true,
      fullName: true,
      company: true,
      email: true,
    },
    orderBy: { fullName: "asc" },
  });

  // Fetch services for line item suggestions
  const services = await prisma.service.findMany({
    where: {
      organizationId: auth.organizationId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      priceCents: true,
      description: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Invoice"
        subtitle="Generate a new invoice for your client"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/invoices" className="hover:text-foreground transition-colors">
          Invoices
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground">New Invoice</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <InvoiceForm clients={clients} services={services} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Tips</h3>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  1
                </span>
                <span>Select a client to auto-fill their contact details.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  2
                </span>
                <span>Add line items for each service or product being billed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  3
                </span>
                <span>Set a clear due date to ensure timely payment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  4
                </span>
                <span>Save as draft to review before sending to the client.</span>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-2">From a Booking?</h3>
            <p className="text-sm text-foreground-muted mb-4">
              You can generate invoices directly from completed bookings.
            </p>
            <Link
              href="/scheduling"
              className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
            >
              View Bookings
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}
