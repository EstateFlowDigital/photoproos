/**
 * Mockup Registry
 *
 * Central registry of all available mockups organized by category.
 * Each mockup is lazy-loaded for performance.
 */

import {
  LayoutDashboard,
  Images,
  Users,
  CreditCard,
  Calendar,
  UserCircle,
  FileText,
  Building2,
  BarChart3,
  MessageSquare,
  Settings,
  Monitor,
  Megaphone,
} from "lucide-react";
import type { CategoryInfo, MockupCategory, MockupDefinition, IndustryId } from "./types";

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Home dashboard views and widgets",
    icon: LayoutDashboard,
  },
  {
    id: "galleries",
    name: "Galleries",
    description: "Gallery management and photo views",
    icon: Images,
  },
  {
    id: "client-portal",
    name: "Client Portal",
    description: "Client-facing portal screens",
    icon: Users,
  },
  {
    id: "invoicing",
    name: "Invoicing",
    description: "Invoices, payments, and billing",
    icon: CreditCard,
  },
  {
    id: "scheduling",
    name: "Scheduling",
    description: "Calendar and booking views",
    icon: Calendar,
  },
  {
    id: "clients",
    name: "Clients",
    description: "Client management and leads",
    icon: UserCircle,
  },
  {
    id: "contracts",
    name: "Contracts",
    description: "Contract management and signing",
    icon: FileText,
  },
  {
    id: "real-estate",
    name: "Real Estate",
    description: "Property-specific features",
    icon: Building2,
  },
  {
    id: "reports",
    name: "Reports",
    description: "Analytics and reporting",
    icon: BarChart3,
  },
  {
    id: "messages",
    name: "Messages",
    description: "Inbox and communication",
    icon: MessageSquare,
  },
  {
    id: "settings",
    name: "Settings",
    description: "Configuration screens",
    icon: Settings,
  },
  {
    id: "devices",
    name: "Devices",
    description: "Device frame mockups",
    icon: Monitor,
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Social proof and marketing",
    icon: Megaphone,
  },
];

// ============================================================================
// MOCKUP REGISTRY
// ============================================================================

// Import all mockup components
// Note: These are imported dynamically to avoid circular dependencies
// and to enable code splitting

import { FullDashboardMockup } from "./dashboard/full-dashboard-mockup";
import { MetricsRowMockup } from "./dashboard/metrics-row-mockup";
import { ActivityFeedMockup } from "./dashboard/activity-feed-mockup";
import { GalleriesListMockup } from "./galleries/galleries-list-mockup";
import { GalleryDetailMockup } from "./galleries/gallery-detail-mockup";
import { InvoicesListMockup } from "./invoicing/invoices-list-mockup";
import { InvoiceDetailMockup } from "./invoicing/invoice-detail-mockup";
import { ClientsListMockup } from "./clients/clients-list-mockup";
import { ClientPortalHomeMockup } from "./client-portal/client-portal-home-mockup";
import { BrowserDashboardMockup } from "./devices/browser-dashboard-mockup";

// ============================================================================
// MOCKUP DEFINITIONS
// ============================================================================

export const MOCKUPS: MockupDefinition[] = [
  // Dashboard category
  {
    id: "full-dashboard",
    name: "Full Dashboard",
    category: "dashboard",
    description: "Complete dashboard with sidebar, metrics, charts, and activity feed",
    industries: "all",
    component: FullDashboardMockup,
    fields: [
      { key: "userName", label: "User Name", type: "text", placeholder: "Jessica" },
      { key: "monthlyRevenue", label: "Monthly Revenue", type: "currency" },
      { key: "activeGalleries", label: "Active Galleries", type: "number" },
      { key: "totalClients", label: "Total Clients", type: "number" },
    ],
    getDefaultData: (industry) => ({
      userName: "Jessica",
      monthlyRevenue: industry === "real_estate" ? 18500 : industry === "product" ? 22000 : 12000,
      activeGalleries: industry === "portraits" ? 35 : 18,
      totalClients: industry === "portraits" ? 120 : 47,
    }),
  },
  {
    id: "metrics-row",
    name: "Metrics Row",
    category: "dashboard",
    description: "4-column KPI stat cards with sparklines",
    industries: "all",
    component: MetricsRowMockup,
    fields: [
      { key: "metric1Value", label: "Revenue", type: "currency" },
      { key: "metric1Change", label: "Revenue Change", type: "text" },
      { key: "metric2Value", label: "Galleries", type: "number" },
      { key: "metric3Value", label: "Clients", type: "number" },
      { key: "metric4Value", label: "Pending", type: "currency" },
    ],
    getDefaultData: (industry) => ({
      metric1Value: industry === "real_estate" ? 18500 : 12450,
      metric1Change: "+23%",
      metric2Value: industry === "portraits" ? 35 : 18,
      metric3Value: industry === "portraits" ? 120 : 47,
      metric4Value: 2340,
    }),
  },
  {
    id: "activity-feed",
    name: "Activity Feed",
    category: "dashboard",
    description: "Recent activity timeline with actions",
    industries: "all",
    component: ActivityFeedMockup,
    fields: [],
    getDefaultData: () => ({}),
  },

  // Galleries category
  {
    id: "galleries-list",
    name: "Galleries List",
    category: "galleries",
    description: "Gallery list view with filters and tabs",
    industries: "all",
    component: GalleriesListMockup,
    fields: [
      { key: "galleryCount", label: "Gallery Count", type: "number" },
    ],
    getDefaultData: (industry) => ({
      galleryCount: industry === "portraits" ? 35 : 18,
    }),
  },
  {
    id: "gallery-detail",
    name: "Gallery Detail",
    category: "galleries",
    description: "Single gallery view with photos and actions",
    industries: "all",
    component: GalleryDetailMockup,
    fields: [
      { key: "galleryName", label: "Gallery Name", type: "text" },
      { key: "photoCount", label: "Photo Count", type: "number" },
      { key: "clientName", label: "Client Name", type: "text" },
    ],
    getDefaultData: (industry) => ({
      galleryName: industry === "real_estate" ? "Modern Estate - Twilight" : "Spring Collection",
      photoCount: 48,
      clientName: industry === "real_estate" ? "Premier Realty" : "Anderson Family",
    }),
  },

  // Invoicing category
  {
    id: "invoices-list",
    name: "Invoices List",
    category: "invoicing",
    description: "Invoice table with status filters",
    industries: "all",
    component: InvoicesListMockup,
    fields: [],
    getDefaultData: () => ({}),
  },
  {
    id: "invoice-detail",
    name: "Invoice Detail",
    category: "invoicing",
    description: "Single invoice view with line items",
    industries: "all",
    component: InvoiceDetailMockup,
    fields: [
      { key: "invoiceNumber", label: "Invoice #", type: "text" },
      { key: "clientName", label: "Client Name", type: "text" },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "overdue", label: "Overdue" },
      ]},
    ],
    getDefaultData: (industry) => ({
      invoiceNumber: "INV-2026-001",
      clientName: industry === "real_estate" ? "Premier Realty" : "Anderson Family",
      amount: 1250,
      status: "pending",
    }),
  },

  // Clients category
  {
    id: "clients-list",
    name: "Clients List",
    category: "clients",
    description: "Client directory with search and filters",
    industries: "all",
    component: ClientsListMockup,
    fields: [],
    getDefaultData: () => ({}),
  },

  // Client Portal category
  {
    id: "client-portal-home",
    name: "Client Portal Home",
    category: "client-portal",
    description: "Client's main portal dashboard view",
    industries: "all",
    component: ClientPortalHomeMockup,
    fields: [
      { key: "clientName", label: "Client Name", type: "text" },
      { key: "businessName", label: "Business Name", type: "text" },
    ],
    getDefaultData: (industry) => ({
      clientName: industry === "real_estate" ? "Sarah Mitchell" : "Jennifer Anderson",
      businessName: industry === "real_estate" ? "Luxury Home Media" : "Capture Portrait Studio",
    }),
  },

  // Devices category
  {
    id: "browser-dashboard",
    name: "Browser Dashboard",
    category: "devices",
    description: "Dashboard in browser frame for marketing",
    industries: "all",
    component: BrowserDashboardMockup,
    fields: [],
    getDefaultData: () => ({}),
  },
];

// ============================================================================
// REGISTRY HELPERS
// ============================================================================

/**
 * Get all mockups for a specific category
 */
export function getMockupsByCategory(category: MockupCategory): MockupDefinition[] {
  return MOCKUPS.filter((m) => m.category === category);
}

/**
 * Get all mockups available for a specific industry
 */
export function getMockupsForIndustry(industry: IndustryId): MockupDefinition[] {
  return MOCKUPS.filter(
    (m) => m.industries === "all" || m.industries.includes(industry)
  );
}

/**
 * Get mockups filtered by both category and industry
 */
export function getFilteredMockups(
  category: MockupCategory | null,
  industry: IndustryId
): MockupDefinition[] {
  return MOCKUPS.filter((m) => {
    const matchesCategory = category === null || m.category === category;
    const matchesIndustry = m.industries === "all" || m.industries.includes(industry);
    return matchesCategory && matchesIndustry;
  });
}

/**
 * Get a single mockup by ID
 */
export function getMockupById(id: string): MockupDefinition | undefined {
  return MOCKUPS.find((m) => m.id === id);
}

/**
 * Get count of mockups per category for a given industry
 */
export function getMockupCountsByCategory(
  industry: IndustryId
): Record<MockupCategory, number> {
  const counts = {} as Record<MockupCategory, number>;

  for (const category of CATEGORIES) {
    counts[category.id] = MOCKUPS.filter((m) => {
      const matchesCategory = m.category === category.id;
      const matchesIndustry = m.industries === "all" || m.industries.includes(industry);
      return matchesCategory && matchesIndustry;
    }).length;
  }

  return counts;
}
