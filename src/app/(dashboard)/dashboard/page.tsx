import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import { StatCard, ActivityItem, PageHeader } from "@/components/dashboard";
import { GalleryCard } from "@/components/dashboard/gallery-card";
import Link from "next/link";

// Icons
function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
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

// Helper to format currency
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Helper to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// Activity type to icon/text mapping
function getActivityIcon(type: string) {
  switch (type) {
    case "payment_received":
      return <PaymentIcon className="h-4 w-4" />;
    case "gallery_created":
    case "gallery_delivered":
    case "gallery_viewed":
      return <GalleryIcon className="h-4 w-4" />;
    case "client_added":
      return <ClientIcon className="h-4 w-4" />;
    case "booking_created":
    case "booking_confirmed":
      return <CalendarIcon className="h-4 w-4" />;
    default:
      return <GalleryIcon className="h-4 w-4" />;
  }
}

export default async function DashboardPage() {
  // For now, get the first organization (later this will come from auth)
  const organization = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please run the seed script to populate demo data.</p>
      </div>
    );
  }

  // Fetch dashboard data
  const [
    monthlyRevenue,
    activeGalleries,
    totalClients,
    pendingPayments,
    recentActivity,
    recentGalleries,
  ] = await Promise.all([
    // Monthly revenue (this month)
    prisma.payment.aggregate({
      where: {
        organizationId: organization.id,
        status: "paid",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amountCents: true },
    }),

    // Active galleries (delivered or pending)
    prisma.project.count({
      where: {
        organizationId: organization.id,
        status: { in: ["delivered", "pending"] },
      },
    }),

    // Total clients
    prisma.client.count({
      where: { organizationId: organization.id },
    }),

    // Pending payments
    prisma.payment.aggregate({
      where: {
        organizationId: organization.id,
        status: "pending",
      },
      _sum: { amountCents: true },
    }),

    // Recent activity
    prisma.activityLog.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Recent galleries
    prisma.project.findMany({
      where: { organizationId: organization.id },
      include: {
        client: { select: { fullName: true, company: true } },
        assets: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const monthlyRevenueValue = monthlyRevenue._sum.amountCents || 0;
  const pendingPaymentsValue = pendingPayments._sum.amountCents || 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back! Here's what's happening with ${organization.name}.`}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(monthlyRevenueValue)}
          change="+23%"
          positive
        />
        <StatCard
          label="Active Galleries"
          value={activeGalleries.toString()}
          change="+5"
          positive
        />
        <StatCard
          label="Total Clients"
          value={totalClients.toString()}
          change="+12"
          positive
        />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(pendingPaymentsValue)}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Galleries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Galleries</h2>
            <Link
              href="/galleries"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentGalleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                id={gallery.id}
                title={gallery.name}
                client={gallery.client?.company || gallery.client?.fullName || "No client"}
                photos={gallery.assets.length}
                status={gallery.status as "delivered" | "pending" | "draft"}
                revenue={gallery.priceCents > 0 ? formatCurrency(gallery.priceCents) : undefined}
                thumbnailUrl={gallery.coverImageUrl || undefined}
              />
            ))}
          </div>
          {recentGalleries.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
              <GalleryIcon className="mx-auto h-10 w-10 text-foreground-muted" />
              <h3 className="mt-3 text-sm font-medium text-foreground">No galleries yet</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Create your first gallery to get started.
              </p>
              <Link
                href="/galleries/new"
                className="mt-4 inline-flex items-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
              >
                Create Gallery
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-[var(--card-border)]">
                {recentActivity.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    icon={getActivityIcon(activity.type)}
                    text={activity.description}
                    time={formatRelativeTime(activity.createdAt)}
                    highlight={activity.type === "payment_received"}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-foreground-muted">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
