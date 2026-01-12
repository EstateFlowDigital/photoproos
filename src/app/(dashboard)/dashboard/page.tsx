export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard";
import { getOverdueInvoicesForDashboard } from "@/lib/actions/invoices";
import { getChecklistItemsWithStatus, getOnboardingProgress } from "@/lib/actions/onboarding-checklist";
import { TourStarter } from "@/components/tour";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import type { DashboardCalendarEvent } from "@/components/dashboard/dashboard-calendar";
import { getDashboardWidgets } from "@/lib/actions/dashboard";
import { getExpiringSoonGalleries } from "@/lib/actions/gallery-expiration";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";
import { ErrorBoundary } from "@/components/debug/error-boundary";
import { triggerLoginStreak } from "@/lib/gamification/trigger";
import { getDailyBonusState, getGamificationState } from "@/lib/actions/gamification";
import { getRecentMessagesForWidget } from "@/lib/actions/messages";
import { getMyReferralStats, getMyReferralProfile } from "@/lib/actions/platform-referrals";
import { DashboardClient } from "./dashboard-client";
import type { DashboardData } from "@/components/dashboard/widget-dashboard";
import nextDynamic from "next/dynamic";

// Dynamically loaded components for onboarding
const OnboardingFallback = () => (
  <div className="h-[260px] rounded-xl border border-[var(--card-border)] bg-[var(--card)]" aria-hidden />
);

const OnboardingChecklist = nextDynamic(
  () => import("@/components/dashboard/onboarding-checklist").then((m) => m.OnboardingChecklist),
  { loading: () => <OnboardingFallback /> }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Calculate percentage change
function calculatePercentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current > 0) return 100;
    return null;
  }
  const percentChange = ((current - previous) / previous) * 100;
  const rounded = Math.round(percentChange);
  if (rounded === 0) return null;
  return rounded;
}

// Calculate count change
function calculateCountChange(current: number, previous: number): number | null {
  const diff = current - previous;
  if (diff === 0) return null;
  return diff;
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default async function DashboardPage() {
  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fire login streak trigger (non-blocking)
  triggerLoginStreak(auth.userId, auth.organizationId);

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

  // Fetch dashboard data in parallel
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
    calendarTasks,
    calendarBookings,
    calendarOpenHouses,
    widgetConfigResult,
    expiringGalleriesResult,
    overdueInvoicesResult,
    walkthroughPreferenceResult,
    checklistItemsResult,
    dailyBonusResult,
    onboardingProgressResult,
    gamificationStateResult,
    recentMessagesResult,
    referralStatsResult,
    referralProfileResult,
    yearToDateRevenue,
    newClientsThisMonth,
    newClientsLastMonth,
    recentContracts,
    upcomingDeadlines,
  ] = await Promise.all([
    // This month's revenue
    prisma.invoice.aggregate({
      where: {
        organizationId: organization.id,
        status: "paid",
        paidAt: { gte: thisMonthStart },
      },
      _sum: { totalCents: true },
    }),

    // Last month's revenue
    prisma.invoice.aggregate({
      where: {
        organizationId: organization.id,
        status: "paid",
        paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { totalCents: true },
    }),

    // Active galleries - current
    prisma.project.count({
      where: {
        organizationId: organization.id,
        status: { in: ["delivered", "pending"] },
      },
    }),

    // Active galleries 30 days ago
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

    // Clients 30 days ago
    prisma.client.count({
      where: {
        organizationId: organization.id,
        createdAt: { lte: thirtyDaysAgo },
      },
    }),

    // Pending/Overdue invoices
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
      take: 10,
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
      take: 8,
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
      take: 10,
    }),

    // Calendar tasks
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

    // Calendar bookings
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

    // Property open houses
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

    // Widget config
    getDashboardWidgets(),

    // Expiring galleries
    getExpiringSoonGalleries(),

    // Overdue invoices for widget
    getOverdueInvoicesForDashboard(organization.id),

    // Walkthrough preference
    getWalkthroughPreference("dashboard"),

    // Onboarding checklist items
    getChecklistItemsWithStatus(),

    // Daily bonus state
    getDailyBonusState(),

    // Onboarding progress
    getOnboardingProgress(),

    // Gamification state
    getGamificationState(),

    // Recent messages for widget
    getRecentMessagesForWidget(5),

    // Referral stats
    getMyReferralStats(),

    // Referral profile (for referral code)
    getMyReferralProfile(),

    // Year to date revenue
    prisma.invoice.aggregate({
      where: {
        organizationId: organization.id,
        status: "paid",
        paidAt: { gte: new Date(now.getFullYear(), 0, 1) },
      },
      _sum: { totalCents: true },
    }),

    // Clients added this month
    prisma.client.count({
      where: {
        organizationId: organization.id,
        createdAt: { gte: thisMonthStart },
      },
    }),

    // Clients added last month
    prisma.client.count({
      where: {
        organizationId: organization.id,
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),

    // Recent contracts for status widget
    prisma.contract.findMany({
      where: { organizationId: organization.id },
      include: {
        client: { select: { fullName: true, company: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Upcoming deadlines (tasks with due dates)
    prisma.task.findMany({
      where: {
        organizationId: organization.id,
        dueDate: { gte: now, lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
        status: { not: "completed" },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  // Process results
  const thisMonthRevenueValue = (thisMonthRevenue._sum.totalCents || 0) / 100;
  const lastMonthRevenueValue = lastMonthRevenue._sum.totalCents || 0;
  const pendingInvoicesValue = (pendingInvoices._sum.totalCents || 0) / 100;
  const widgetConfig = widgetConfigResult.success ? widgetConfigResult.data! : { version: 2 as const, widgets: [], gridColumns: 4 };
  const expiringGalleries = expiringGalleriesResult.success ? expiringGalleriesResult.data : [];
  const overdueInvoices = overdueInvoicesResult.success ? overdueInvoicesResult.data : { invoices: [], totalOverdueCents: 0 };
  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data ? walkthroughPreferenceResult.data.state : "open";
  const checklistItems = checklistItemsResult.success && checklistItemsResult.data ? checklistItemsResult.data : [];
  const dailyBonusState = dailyBonusResult.success ? dailyBonusResult.data : null;
  const onboardingProgress = onboardingProgressResult.success ? onboardingProgressResult.data : null;
  const gamificationState = gamificationStateResult.success ? gamificationStateResult.data : null;
  const recentMessages = recentMessagesResult.success ? recentMessagesResult.data : [];
  const referralStats = referralStatsResult.success ? referralStatsResult.data : null;
  const referralProfile = referralProfileResult.success ? referralProfileResult.data : null;
  const yearToDateRevenueValue = (yearToDateRevenue._sum.totalCents || 0) / 100;

  // Calculate changes
  const revenueChange = calculatePercentChange(thisMonthRevenueValue, lastMonthRevenueValue / 100);
  const galleriesChange = calculateCountChange(activeGalleries, lastMonthActiveGalleries);
  const clientsChange = calculateCountChange(totalClients, lastMonthTotalClients);

  // Show checklist if onboarding is NOT completed or was recently completed
  const showChecklist = !organization.onboardingCompleted ||
    (organization.onboardingCompletedAt &&
      (now.getTime() - organization.onboardingCompletedAt.getTime()) < 7 * 24 * 60 * 60 * 1000);

  // Build calendar events
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

  // Build dashboard data for widgets
  const dashboardData: DashboardData = {
    stats: {
      revenue: { value: thisMonthRevenueValue, change: revenueChange },
      galleries: { value: activeGalleries, change: galleriesChange },
      clients: { value: totalClients, change: clientsChange },
      invoices: { value: pendingInvoicesValue, change: null },
    },
    recentGalleries: recentGalleries.map((g) => ({
      id: g.id,
      name: g.name,
      thumbnailUrl: g.coverImageUrl || g.assets[0]?.thumbnailUrl || g.assets[0]?.originalUrl || null,
      createdAt: g.createdAt,
    })),
    upcomingBookings: upcomingBookings.map((b) => ({
      id: b.id,
      title: b.title,
      startTime: b.startTime,
      clientName: b.client?.company || b.client?.fullName || b.clientName || null,
    })),
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      type: a.type,
      description: a.description,
      createdAt: a.createdAt,
    })),
    overdueInvoices: overdueInvoices.invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${inv.id.slice(-6)}`,
      amount: inv.totalCents / 100,
      dueDate: inv.dueDate,
      clientName: inv.clientName || "Unknown",
    })),
    expiringGalleries: expiringGalleries.map((g) => ({
      id: g.id,
      name: g.name,
      expiresAt: g.expiresAt,
      daysUntilExpiration: g.daysUntilExpiration,
    })),
    calendarEvents: calendarEvents.map((e) => ({
      id: e.id,
      title: e.title,
      start: new Date(e.date),
      end: new Date(e.date),
      type: e.type,
    })),
    gamification: gamificationState ? {
      level: gamificationState.level,
      xp: gamificationState.totalXp,
      xpToNextLevel: gamificationState.xpProgress?.required || 1000,
      xpProgress: gamificationState.xpProgress?.percent || 0,
      streak: gamificationState.currentLoginStreak,
      deliveryStreak: gamificationState.currentDeliveryStreak || 0,
      recentAchievementsCount: gamificationState.recentAchievements?.filter((a) => a.unlockedAt).length || 0,
      activeChallengesCount: 0, // Will be populated when team challenges are active
    } : undefined,
    dailyBonus: dailyBonusState ? {
      canClaim: dailyBonusState.canClaim,
      streak: dailyBonusState.streakDays || 0,
    } : undefined,
    onboarding: onboardingProgress ? {
      completed: onboardingProgress.completedCount,
      total: onboardingProgress.totalCount,
      items: checklistItems.map((item) => ({
        id: item.id,
        label: item.label,
        completed: item.isCompleted,
      })),
    } : undefined,
    messages: recentMessages,
    // Revenue chart widget data
    revenueChart: {
      currentMonthRevenue: thisMonthRevenueValue,
      previousMonthRevenue: lastMonthRevenueValue / 100,
      yearToDateRevenue: yearToDateRevenueValue,
    },
    // Client growth widget data
    clientGrowth: {
      totalClients,
      newClientsThisMonth,
      newClientsLastMonth,
    },
    // Contract status widget data
    contracts: recentContracts.map((c) => ({
      id: c.id,
      title: c.title,
      client: c.client?.company || c.client?.fullName || "Unknown",
      status: c.status as "draft" | "sent" | "viewed" | "signed" | "expired",
      sentAt: c.sentAt || undefined,
      signedAt: c.signedAt || undefined,
      expiresAt: c.expiresAt || undefined,
    })),
    // Deadlines widget data
    deadlines: upcomingDeadlines.map((d) => ({
      id: d.id,
      title: d.title,
      dueDate: d.dueDate!,
      type: "task" as const,
      href: d.projectId ? `/projects/tasks/${d.id}` : "/projects",
      priority: d.priority as "low" | "medium" | "high" | undefined,
    })),
    // Referral widget data
    referral: referralStats ? {
      referralCode: referralProfile?.referralCode || null,
      successfulReferrals: referralStats.subscribedReferrals,
      totalEarnedCents: referralStats.totalEarnedCents,
      pendingReferrals: referralStats.pendingReferrals,
    } : undefined,
  };

  return (
    <ErrorBoundary label="dashboard-page">
      <div className="flex flex-col density-gap-section" data-element="dashboard-page">
        <Suspense fallback={null}>
          <TourStarter />
        </Suspense>

        {/* Page Walkthrough */}
        <WalkthroughWrapper pageId="dashboard" initialState={walkthroughState} />

        {/* Page Header */}
        <PageHeader
          title="Dashboard"
          subtitle={`Welcome back! Here's what's happening with ${organization.name}.`}
        />

        {/* Onboarding Checklist */}
        {showChecklist && checklistItems.length > 0 && (
          <OnboardingChecklist
            items={checklistItems}
            organizationName={organization.name}
            progress={onboardingProgress || undefined}
          />
        )}

        {/* Widget-based Dashboard */}
        <DashboardClient
          config={widgetConfig}
          dashboardData={dashboardData}
        />
      </div>
    </ErrorBoundary>
  );
}
