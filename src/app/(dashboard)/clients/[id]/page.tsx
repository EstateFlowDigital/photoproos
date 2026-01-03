export const dynamic = "force-dynamic";
import { PageHeader, RelatedItems, Breadcrumb } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ClientActions } from "./client-actions";

const industryLabels: Record<string, { label: string; color: string }> = {
  real_estate: { label: "Real Estate", color: "bg-blue-500/10 text-blue-400" },
  commercial: { label: "Commercial", color: "bg-purple-500/10 text-purple-400" },
  wedding: { label: "Wedding", color: "bg-pink-500/10 text-pink-400" },
  food_hospitality: { label: "Food & Hospitality", color: "bg-orange-500/10 text-orange-400" },
  architecture: { label: "Architecture", color: "bg-emerald-500/10 text-emerald-400" },
  events: { label: "Events", color: "bg-yellow-500/10 text-yellow-400" },
  headshots: { label: "Headshots", color: "bg-cyan-500/10 text-cyan-400" },
  portrait: { label: "Portrait", color: "bg-rose-500/10 text-rose-400" },
  product: { label: "Product", color: "bg-indigo-500/10 text-indigo-400" },
  other: { label: "Other", color: "bg-gray-500/10 text-gray-400" },
};

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;

  // Fetch client with related data
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          _count: { select: { assets: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      bookings: {
        orderBy: { startTime: "desc" },
        take: 5,
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!client) {
    notFound();
  }

  // Fetch payments, invoices, and communications for this client
  const [payments, invoices, communications] = await Promise.all([
    prisma.payment.findMany({
      where: {
        project: {
          clientId: id,
        },
      },
      include: {
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { clientId: id },
      select: { id: true },
    }),
    prisma.clientCommunication.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const statusStyles = {
    delivered: "bg-[var(--success)]/10 text-[var(--success)]",
    pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
    draft: "bg-[var(--foreground-muted)]/10 text-foreground-muted",
    paid: "bg-[var(--success)]/10 text-[var(--success)]",
    overdue: "bg-[var(--error)]/10 text-[var(--error)]",
  };

  const industryInfo = industryLabels[client.industry] || industryLabels.other;

  // Calculate totals
  const totalGalleryRevenue = client.projects.reduce((sum, p) => sum + p.priceCents, 0);
  const paidPayments = payments.filter((p) => p.status === "paid");
  const pendingPayments = payments.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Clients", href: "/clients" },
          { label: client.fullName || client.email },
        ]}
      />
      <PageHeader
        title={client.fullName || client.email}
        subtitle={client.company || (client.fullName ? client.email : undefined)}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/clients/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Link>
            <Link
              href={`/galleries/new?client=${id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              New Gallery
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Lifetime Revenue</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(client.lifetimeRevenueCents)}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total Galleries</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{client.projects.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total Payments</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{payments.length}</p>
            </div>
          </div>

          {/* Galleries */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Galleries</h2>
              <Link
                href={`/galleries/new?client=${id}`}
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Create Gallery
              </Link>
            </div>

            {client.projects.length > 0 ? (
              <div className="space-y-3">
                {client.projects.map((gallery) => (
                  <Link
                    key={gallery.id}
                    href={`/galleries/${gallery.id}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                        <PhotoIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{gallery.name}</p>
                        <p className="text-xs text-foreground-muted">
                          {gallery._count.assets} photos • {new Date(gallery.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[gallery.status as keyof typeof statusStyles])}>
                        {gallery.status.charAt(0).toUpperCase() + gallery.status.slice(1)}
                      </span>
                      {gallery.priceCents > 0 && (
                        <span className="text-sm font-medium text-foreground">{formatCurrency(gallery.priceCents)}</span>
                      )}
                      <ChevronRightIcon className="h-4 w-4 text-foreground-muted" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
                <PhotoIcon className="mx-auto h-10 w-10 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground">No galleries yet</p>
                <Link
                  href={`/galleries/new?client=${id}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create First Gallery
                </Link>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment History</h2>

            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        payment.status === "paid" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"
                      )}>
                        {payment.status === "paid" ? <CheckIcon className="h-5 w-5" /> : <ClockIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{payment.project?.name || payment.description || "Payment"}</p>
                        <p className="text-xs text-foreground-muted">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[payment.status as keyof typeof statusStyles])}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      <span className="text-sm font-medium text-foreground">{formatCurrency(payment.amountCents)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
                <CreditCardIcon className="mx-auto h-10 w-10 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground">No payments yet</p>
                <p className="mt-1 text-xs text-foreground-muted">Payments will appear here when galleries are purchased</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-2xl font-bold">
                {(client.fullName || client.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{client.fullName || client.email}</p>
                {client.company && (
                  <p className="text-sm text-foreground-secondary">{client.company}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Industry</p>
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", industryInfo.color)}>
                  {industryInfo.label}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Email</p>
                <a href={`mailto:${client.email}`} className="text-sm text-[var(--primary)] hover:underline">
                  {client.email}
                </a>
              </div>

              {client.phone && (
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Phone</p>
                  <a href={`tel:${client.phone}`} className="text-sm text-foreground hover:text-[var(--primary)]">
                    {client.phone}
                  </a>
                </div>
              )}

              {client.address && (
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm text-foreground-secondary whitespace-pre-line">{client.address}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Client Since</p>
                <p className="text-sm text-foreground-secondary">
                  {new Date(client.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Client Tags */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tags</h2>
            {client.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {client.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted italic">No tags assigned</p>
            )}
            <Link href={`/clients/${id}/edit`} className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline">
              Manage Tags
            </Link>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notes</h2>
            {client.notes ? (
              <p className="text-sm text-foreground-secondary">{client.notes}</p>
            ) : (
              <p className="text-sm text-foreground-muted italic">No notes added yet</p>
            )}
            <Link href={`/clients/${id}/edit`} className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline">
              {client.notes ? "Edit Notes" : "Add Notes"}
            </Link>
          </div>

          {/* Communication Timeline */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            {communications.length > 0 ? (
              <div className="space-y-3">
                {communications.slice(0, 5).map((comm) => (
                  <div key={comm.id} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      comm.type === "email" ? "bg-blue-500/10 text-blue-400" :
                      comm.type === "call" ? "bg-green-500/10 text-green-400" :
                      comm.type === "meeting" ? "bg-purple-500/10 text-purple-400" :
                      "bg-gray-500/10 text-gray-400"
                    )}>
                      {comm.type === "email" ? <EmailIcon className="h-4 w-4" /> :
                       comm.type === "call" ? <PhoneIcon className="h-4 w-4" /> :
                       comm.type === "meeting" ? <CalendarIcon className="h-4 w-4" /> :
                       <NoteIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {comm.subject || (comm.type === "note" ? "Note" : comm.type.charAt(0).toUpperCase() + comm.type.slice(1))}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {new Date(comm.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {comm.direction && comm.direction !== "internal" && (
                          <span className="ml-1">• {comm.direction === "inbound" ? "Received" : "Sent"}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {communications.length > 5 && (
                  <p className="text-xs text-foreground-muted text-center">
                    +{communications.length - 5} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted italic">No communication history yet</p>
            )}
          </div>

          {/* Related Items */}
          <RelatedItems
            items={[
              {
                label: "Galleries",
                count: client.projects.length,
                href: `/galleries?clientId=${id}`,
                icon: <GalleryLinkIcon className="h-4 w-4" />,
              },
              {
                label: "Invoices",
                count: invoices.length,
                href: `/invoices?clientId=${id}`,
                icon: <InvoiceLinkIcon className="h-4 w-4" />,
              },
              {
                label: "Bookings",
                count: client.bookings.length,
                href: `/scheduling?clientId=${id}`,
                icon: <BookingLinkIcon className="h-4 w-4" />,
              },
            ]}
          />

          {/* Quick Actions */}
          <ClientActions
            clientId={id}
            clientName={client.fullName || client.company || client.email}
            clientEmail={client.email}
          />
        </div>
      </div>
    </div>
  );
}

// Icon Components
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.505 2.365A41.369 41.369 0 0 1 9 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 0 0-.577-.069 43.141 43.141 0 0 0-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 0 1 5 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914Z" />
      <path d="M14 6c.762 0 1.52.02 2.272.06 1.207.065 2.228.97 2.228 2.281v2.377c0 1.312-1.021 2.216-2.228 2.281a39.42 39.42 0 0 1-1.772.05v2.199a.75.75 0 0 1-1.278.529L11.5 13.53l-.53.53a.75.75 0 0 1-1.065-.003L8.138 12.26a.75.75 0 0 1 .25-1.205A2.992 2.992 0 0 0 9.5 8.998v-.69A2.497 2.497 0 0 1 12 5.809c.662-.006 1.328-.004 1.998.002L14 6Z" />
    </svg>
  );
}

function GalleryLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function InvoiceLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function BookingLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}
