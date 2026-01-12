export { StatCard } from "./stat-card";
export { ActivityItem } from "./activity-item";
export { GalleryCard } from "./gallery-card";
export { PropertyCard, type PropertyWebsite, type PropertyCardProps } from "./property-card";
export { PageHeader } from "./page-header";
export {
  PageContextNav,
  GoogleIcon,
  StripeIcon,
  QuickBooksIcon,
  DropboxIcon,
  DocuSignIcon,
  CalendarIcon as ContextCalendarIcon,
  ClockIcon as ContextClockIcon,
  TagIcon,
  ChatIcon,
  UsersIcon,
  DocumentIcon,
  CurrencyIcon,
  PhotoIcon,
  HomeIcon,
  ChartIcon,
  TaskIcon,
} from "./page-context-nav";
export { QuickActions } from "./quick-actions";
export { UpcomingBookings } from "./upcoming-bookings";
export { RevenueChart, RevenueSparkline } from "./revenue-chart";
export {
  Skeleton,
  StatCardSkeleton,
  QuickActionsSkeleton,
  RevenueChartSkeleton,
  GalleryCardSkeleton,
  UpcomingBookingsSkeleton,
  ActivityItemSkeleton,
  RecentActivitySkeleton,
  DashboardSkeleton,
  PageHeaderSkeleton,
  FilterTabsSkeleton,
  ClientCardSkeleton,
  PropertyCardSkeleton,
  CalendarDaySkeleton,
  BookingItemSkeleton,
  SettingsCardSkeleton,
  GalleriesPageSkeleton,
  ClientsPageSkeleton,
  PropertiesPageSkeleton,
  SchedulingPageSkeleton,
  SettingsPageSkeleton,
  GalleryDetailSkeleton,
  ClientDetailSkeleton,
  PropertyDetailSkeleton,
  BookingDetailSkeleton,
} from "./skeleton";
export {
  EmptyState,
  EmptyGalleries,
  EmptyBookings,
  EmptyActivity,
  EmptyClients,
  EmptyPayments,
  EmptyLeads,
  EmptyInvoices,
  EmptyProjects,
  EmptyOrders,
  EmptyServices,
} from "./empty-state";
// InvoiceBuilder is a complex client component - import directly from "./invoice-builder"
// ServiceSelector is a complex client component - import directly from "./service-selector"
// ServiceForm is a complex client component - import directly from "./service-form"
export { OnboardingChecklist } from "./onboarding-checklist";
export { RelatedItems } from "./related-items";
export { Breadcrumb } from "./breadcrumb";
export { getChecklistItems } from "@/lib/utils/checklist-items";
export { CollapsibleSection } from "./collapsible-section";
export { ComingSoonPage, type ComingSoonPageProps } from "./coming-soon-page";

// NOTE: The following components are complex client components with hooks.
// They should be imported directly to avoid barrel export issues with server components:
// - WidgetDashboard, DashboardData from "./widget-dashboard"
// - AddWidgetModal from "./add-widget-modal"
// - DashboardCustomizePanel from "./dashboard-customize-panel"
// - OverdueInvoicesWidget from "./overdue-invoices-widget"
// - ReferralWidget from "./referral-widget"
