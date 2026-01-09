export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { ClientNewForm } from "./client-new-form";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function NewClientPage() {
  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organizationId = auth.organizationId;

  // Get client stats
  const [totalClients, industryStats, totalRevenue] = await Promise.all([
    organizationId
      ? prisma.client.count({ where: { organizationId } })
      : 0,
    organizationId
      ? prisma.client.groupBy({
          by: ["industry"],
          where: { organizationId },
          _count: { industry: true },
          orderBy: { _count: { industry: "desc" } },
          take: 5,
        })
      : [],
    organizationId
      ? prisma.client.aggregate({
          where: { organizationId },
          _sum: { lifetimeRevenueCents: true },
        })
      : { _sum: { lifetimeRevenueCents: 0 } },
  ]);

  // Get clients active this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const activeThisMonth = organizationId
    ? await prisma.client.count({
        where: {
          organizationId,
          OR: [
            { projects: { some: { createdAt: { gte: startOfMonth } } } },
            { bookings: { some: { startTime: { gte: startOfMonth } } } },
          ],
        },
      })
    : 0;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const industryLabels: Record<string, string> = {
    real_estate: "Real Estate",
    commercial: "Commercial",
    architecture: "Architecture",
    wedding: "Wedding",
    events: "Events",
    headshots: "Headshots",
    portrait: "Portrait",
    product: "Product",
    food_hospitality: "Food & Hospitality",
    other: "Other",
  };

  return (
    <div className="space-y-6" data-element="clients-new-page">
      <PageHeader
        title="Add New Client"
        subtitle="Create a new client profile"
        actions={
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Clients
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <ClientNewForm />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Add a company name to organize galleries by business.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Select the right industry to help with analytics and reporting.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Use notes to track important details about the relationship.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Total Clients</span>
                <span className="text-sm font-medium text-foreground">{totalClients}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Active This Month</span>
                <span className="text-sm font-medium text-foreground">{activeThisMonth}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Total Revenue</span>
                <span className="text-sm font-medium text-[var(--success)]">
                  {formatCurrency(totalRevenue._sum.lifetimeRevenueCents || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Industry Breakdown */}
          {industryStats.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Client Industries</h2>
              <div className="space-y-3">
                {industryStats.map((stat) => (
                  <div key={stat.industry} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-foreground">
                      {industryLabels[stat.industry] || stat.industry}
                    </span>
                    <span className="text-xs text-foreground-muted">
                      {stat._count.industry} {stat._count.industry === 1 ? "client" : "clients"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}
