export const dynamic = "force-dynamic";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { StatCard, ActivityItem, PageHeader, EmptyGalleries, ReferralWidget, CollapsibleSection, QuickActionsSkeleton, UpcomingBookingsSkeleton, OverdueInvoicesWidget } from "@/components/dashboard";
import { ExpiringGalleriesWidget } from "@/components/dashboard/expiring-galleries-widget";
import { getOverdueInvoicesForDashboard } from "@/lib/actions/invoices";
import { getChecklistItems } from "@/lib/utils/checklist-items";
import { GalleryCard } from "@/components/dashboard/gallery-card";
import { TourStarter } from "@/components/tour";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import type { DashboardCalendarEvent } from "@/components/dashboard/dashboard-calendar";
import { getDashboardConfig } from "@/lib/actions/dashboard";
import { getExpiringSoonGalleries } from "@/lib/actions/gallery-expiration";
import { isSectionVisible, isSectionCollapsed, type DashboardConfig } from "@/lib/dashboard-types";
import Link from "next/link";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

const OnboardingFallback = () => (
  <div className="h-[260px] rounded-xl border border-[var(--card-border)] bg-[var(--card)]" aria-hidden />
);

const CustomizeFallback = () => (
  <div className="h-[220px] rounded-xl border border-[var(--card-border)] bg-[var(--card)]" aria-hidden />
);

const QuickActions = nextDynamic(
  () => import("@/components/dashboard/quick-actions").then((m) => m.QuickActions),
  { loading: () => <QuickActionsSkeleton /> }
);

const UpcomingBookings = nextDynamic(
  () => import("@/components/dashboard/upcoming-bookings").then((m) => m.UpcomingBookings),
  { loading: () => <UpcomingBookingsSkeleton /> }
);

const DashboardCalendar = nextDynamic(
  () => import("@/components/dashboard/dashboard-calendar").then((m) => m.DashboardCalendar),
  { loading: () => <div className="h-72 rounded-xl border border-[var(--card-border)] bg-[var(--card)]" /> }
);

const OnboardingChecklist = nextDynamic(
  () => import("@/components/dashboard/onboarding-checklist").then((m) => m.OnboardingChecklist),
  { loading: () => <OnboardingFallback /> }
);

const DashboardCustomizePanel = nextDynamic(
  () => import("@/components/dashboard/dashboard-customize-panel").then((m) => m.DashboardCustomizePanel),
  { loading: () => <CustomizeFallback /> }
);

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

// Helper to calculate percentage change
function calculatePercentChange(current: number, previous: number): { change: string; positive: boolean } | null {
  if (previous === 0) {
    if (current > 0) return { change: "+100%", positive: true };
    return null;
  }
  const percentChange = ((current - previous) / previous) * 100;
  const rounded = Math.round(percentChange);
  if (rounded === 0) return null;
  return {
    change: `${rounded > 0 ? "+" : ""}${rounded}%`,
    positive: rounded > 0,
  };
}

// Helper to calculate count change
function calculateCountChange(current: number, previous: number): { change: string; positive: boolean } | null {
  const diff = current - previous;
  if (diff === 0) return null;
  return {
    change: `${diff > 0 ? "+" : ""}${diff}`,
    positive: diff > 0,
  };
}

export default async function DashboardPage() {
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

  // Calculate date ranges for comparisons
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const calendarStart = new Date(now);
  calendarStart.setDate(calendarStart.getDate() - 30);
  const calendarEnd = new Date(now);
  calendarEnd.setDate(calendarEnd.getDate() + 90);

  // Fetch dashboard data
  const [
    thisMonthRevenue,
    lastMonthRevenue,
    activeGalleries,
    lastMonthActiveGalleries,
    totalClients,
    lastMonthTotalClients,
    pendingInvoices,
    recentActivity,
    recentGalleries,
    upcomingBookings,
    servicesCount,
    propertiesCount,
    calendarTasks,
    calendarBookings,
    calendarOpenHouses,
    platformReferrer,
    dashboardConfigResult,
    expiringGalleriesResult,
    overdueInvoicesResult,
  ] = await Promise.all([
    // This month's revenue - from paid invoices
    prisma.invoice.aggregate({
      where: {
        organizationId: organization.id,
        status: "paid",
        paidAt: { gte: thisMonthStart },
      },
      _sum: { totalCents: true },
    }),

    // Last month's revenue (for comparison) - from paid invoices
    prisma.invoice.aggregate({
      where: {
        organizationId: organization.id,
        status: "paid",
        paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { totalCents: true },
    }),

    // Active galleries (delivered or pending) - current
    prisma.project.count({
      where: {
        organizationId: organization.id,
        status: { in: ["delivered", "pending"] },
      },
    }),

    // Active galleries 30 days ago (for comparison)
    prisma.project.count({
      where: {
        organizationId: organization.id,
        status: { in: ["delivered", "pending"] },
        createdAt: { lte: thirtyDaysAgo },
      },
    }),

    // Total clients - current
    prisma.client.count({
      where: { organizationId: organization.id },
    }),

    // Clients 30 days ago (for comparison)
    prisma.client.count({
      where: {
        organizationId: organization.id,
        createdAt: { lte: thirtyDaysAgo },
      },
    }),

    // Pending/Overdue invoices (unpaid invoices)
    prisma.invoice.aggregate({
      where: {
        organizationId: organization.id,
        status: { in: ["sent", "overdue"] },
      },
      _sum: { totalCents: true },
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
        _count: { select: { assets: true } },
        assets: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { thumbnailUrl: true, originalUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),

    // Upcoming bookings
    prisma.booking.findMany({
      where: {
        organizationId: organization.id,
        startTime: { gte: new Date() },
        status: { in: ["pending", "confirmed"] },
      },
      include: {
        client: { select: { fullName: true, company: true } },
        service: { select: { name: true, category: true } },
      },
      orderBy: { startTime: "asc" },
      take: 3,
    }),

    // Services count (for onboarding checklist)
    prisma.service.count({
      where: { organizationId: organization.id },
    }),

    // Properties count (for onboarding checklist)
    prisma.propertyWebsite.count({
      where: {
        project: { organizationId: organization.id },
      },
    }),

    // Calendar tasks (due dates)
    prisma.task.findMany({
      where: {
        organizationId: organization.id,
        dueDate: { gte: calendarStart, lte: calendarEnd },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    }),

    // Calendar bookings (appointments)
    prisma.booking.findMany({
      where: {
        organizationId: organization.id,
        startTime: { gte: calendarStart, lte: calendarEnd },
        status: { in: ["pending", "confirmed"] },
      },
      include: {
        client: { select: { fullName: true, company: true } },
        service: { select: { name: true, category: true } },
      },
      orderBy: { startTime: "asc" },
    }),

    // Property open houses / project events
    prisma.propertyWebsite.findMany({
      where: {
        project: { organizationId: organization.id },
        openHouseDate: { gte: calendarStart, lte: calendarEnd },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { openHouseDate: "asc" },
    }),

    // Platform referrer data for the current user
    prisma.platformReferrer.findUnique({
      where: { userId: auth.userId },
      select: {
        referralCode: true,
        successfulReferrals: true,
        totalEarnedCents: true,
        referrals: {
          where: { status: "signed_up" },
          select: { id: true },
        },
      },
    }),

    // Dashboard config
    getDashboardConfig(),

    // Expiring galleries
    getExpiringSoonGalleries(),

    // Overdue invoices for widget
    getOverdueInvoicesForDashboard(organization.id),
  ]);

  const thisMonthRevenueValue = thisMonthRevenue._sum.totalCents || 0;
  const lastMonthRevenueValue = lastMonthRevenue._sum.totalCents || 0;
  const pendingInvoicesValue = pendingInvoices._sum.totalCents || 0;
  const dashboardConfig = dashboardConfigResult.data!;
  const expiringGalleries = expiringGalleriesResult.data || [];
  const overdueInvoices = overdueInvoicesResult.success
    ? overdueInvoicesResult.data
    : { invoices: [], totalOverdueCents: 0 };

  // Calculate changes for stats
  const revenueChange = calculatePercentChange(thisMonthRevenueValue, lastMonthRevenueValue);
  const galleriesChange = calculateCountChange(activeGalleries, lastMonthActiveGalleries);
  const clientsChange = calculateCountChange(totalClients, lastMonthTotalClients);

  // Prepare onboarding checklist data
  const isRealEstate = organization.primaryIndustry === "real_estate" ||
    (organization.industries && organization.industries.includes("real_estate"));

  const checklistItems = getChecklistItems({
    hasClients: totalClients > 0,
    hasServices: servicesCount > 0,
    hasGalleries: activeGalleries > 0 || recentGalleries.length > 0,
    hasPaymentMethod: organization.paymentMethodAdded || !!organization.stripeConnectAccountId,
    hasBranding: !!organization.logoUrl,
    hasProperties: propertiesCount > 0,
    isRealEstate,
  });

  // Only show checklist if onboarding was recently completed (within 30 days)
  const showChecklist = organization.onboardingCompleted &&
    organization.onboardingCompletedAt &&
    (now.getTime() - organization.onboardingCompletedAt.getTime()) < 30 * 24 * 60 * 60 * 1000;

  // Transform bookings to match UpcomingBookings component format
  const formattedBookings = upcomingBookings.map((booking) => ({
    id: booking.id,
    title: booking.title,
    client: booking.client?.company || booking.client?.fullName || booking.clientName || "Unknown Client",
    date: booking.startTime,
    time: booking.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    location: booking.location || undefined,
    status: booking.status as "confirmed" | "pending" | "cancelled",
    serviceType: booking.service?.category || booking.service?.name || undefined,
  }));

  const calendarEvents: DashboardCalendarEvent[] = [
    ...calendarTasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      subtitle: task.project?.name || "Task",
      date: task.dueDate?.toISOString() ?? "",
      href: "/projects",
      type: "task" as const,
    })),
    ...calendarBookings.map((booking) => ({
      id: `booking-${booking.id}`,
      title: booking.title,
      subtitle: booking.client?.company || booking.client?.fullName || "Booking",
      date: booking.startTime.toISOString(),
      href: `/scheduling/${booking.id}`,
      type: "booking" as const,
    })),
    ...calendarOpenHouses.map((site) => ({
      id: `open-house-${site.id}`,
      title: `Open House · ${site.project?.name || "Property"}`,
      subtitle: site.address,
      date: site.openHouseDate!.toISOString(),
      href: `/properties/${site.projectId}`,
      type: "open_house" as const,
    })),
  ];

  return (
    <div className="flex flex-col density-gap-section">
      <Suspense fallback={null}>
        <TourStarter />
      </Suspense>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Dashboard"
          subtitle={`Welcome back! Here's what's happening with ${organization.name}.`}
        />
        <DashboardCustomizePanel config={dashboardConfig} />
      </div>

      {/* Referral Program (highlight) */}
      {isSectionVisible(dashboardConfig, "referral-widget") && (
        <ReferralWidget
          referralCode={platformReferrer?.referralCode || null}
          successfulReferrals={platformReferrer?.successfulReferrals || 0}
          totalEarnedCents={platformReferrer?.totalEarnedCents || 0}
          pendingReferrals={platformReferrer?.referrals?.length || 0}
        />
      )}

      {/* Onboarding Checklist */}
      {showChecklist && (
        <OnboardingChecklist
          items={checklistItems}
          organizationName={organization.name}
        />
      )}

      {/* Stats Grid */}
      <div className="auto-grid grid-min-220 grid-gap-4">
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(thisMonthRevenueValue)}
          change={revenueChange?.change}
          positive={revenueChange?.positive}
          href="/payments"
        />
        <StatCard
          label="Active Galleries"
          value={activeGalleries.toString()}
          change={galleriesChange?.change}
          positive={galleriesChange?.positive}
          href="/galleries"
        />
        <StatCard
          label="Total Clients"
          value={totalClients.toString()}
          change={clientsChange?.change}
          positive={clientsChange?.positive}
          href="/clients"
        />
        <StatCard
          label="Pending Invoices"
          value={formatCurrency(pendingInvoicesValue)}
          href="/invoices?status=sent"
        />
      </div>

      {/* Quick Actions */}
      {isSectionVisible(dashboardConfig, "quick-actions") && (
        <CollapsibleSection
          sectionId="quick-actions"
          title="Quick Actions"
          defaultCollapsed={isSectionCollapsed(dashboardConfig, "quick-actions")}
        >
          <QuickActions />
        </CollapsibleSection>
      )}

      {/* Unified Scheduler */}
      {isSectionVisible(dashboardConfig, "calendar") && (
        <CollapsibleSection
          sectionId="calendar"
          title="Calendar"
          defaultCollapsed={isSectionCollapsed(dashboardConfig, "calendar")}
        >
          <DashboardCalendar events={calendarEvents} />
        </CollapsibleSection>
      )}

      {/* Main Content Grid */}
      <div className="grid density-gap-section lg:grid-cols-3">
        {/* Recent Galleries */}
        {isSectionVisible(dashboardConfig, "recent-galleries") && (
          <div className="lg:col-span-2">
            <CollapsibleSection
              sectionId="recent-galleries"
              title="Recent Galleries"
              defaultCollapsed={isSectionCollapsed(dashboardConfig, "recent-galleries")}
              titleAction={
                <Link
                  href="/galleries"
                  className="text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  View all
                </Link>
              }
            >
              <div className="auto-grid grid-min-240 grid-gap-4">
                {recentGalleries.map((gallery) => (
                  <GalleryCard
                    key={gallery.id}
                    id={gallery.id}
                    title={gallery.name}
                    client={gallery.client?.company || gallery.client?.fullName || "No client"}
                    photos={gallery._count.assets}
                    status={gallery.status as "delivered" | "pending" | "draft"}
                    revenue={gallery.priceCents > 0 ? formatCurrency(gallery.priceCents) : undefined}
                    thumbnailUrl={
                      gallery.coverImageUrl ||
                      gallery.assets[0]?.thumbnailUrl ||
                      gallery.assets[0]?.originalUrl ||
                      undefined
                    }
                  />
                ))}
              </div>
              {recentGalleries.length === 0 && <EmptyGalleries />}
            </CollapsibleSection>
          </div>
        )}

        {/* Right Sidebar - Upcoming Bookings & Recent Activity */}
        <div className="flex flex-col density-gap-section">
          {/* Upcoming Bookings */}
          {isSectionVisible(dashboardConfig, "upcoming-bookings") && (
            <CollapsibleSection
              sectionId="upcoming-bookings"
              title="Upcoming Bookings"
              defaultCollapsed={isSectionCollapsed(dashboardConfig, "upcoming-bookings")}
              titleAction={
                <Link
                  href="/scheduling"
                  className="text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  View all
                </Link>
              }
            >
              <UpcomingBookings bookings={formattedBookings} />
            </CollapsibleSection>
          )}

          {/* Overdue Invoices */}
          {overdueInvoices.invoices.length > 0 && (
            <OverdueInvoicesWidget
              invoices={overdueInvoices.invoices}
              totalOverdueCents={overdueInvoices.totalOverdueCents}
            />
          )}

          {/* Expiring Galleries */}
          {expiringGalleries.length > 0 && <ExpiringGalleriesWidget galleries={expiringGalleries} />}

          {/* Recent Activity */}
          {isSectionVisible(dashboardConfig, "recent-activity") && (
            <CollapsibleSection
              sectionId="recent-activity"
              title="Recent Activity"
              defaultCollapsed={isSectionCollapsed(dashboardConfig, "recent-activity")}
            >
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
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--background-secondary)]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-foreground-muted">
                        <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">No recent activity</p>
                    <p className="mt-1 text-xs text-foreground-muted">Activity will appear here as you work</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>
    </div>
  );
}
