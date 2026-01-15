/**
 * Mockup Library Exports
 *
 * Central export point for all mockup-related types, components, and utilities.
 */

// Types
export * from "./types";

// Registry
export {
  CATEGORIES,
  MOCKUPS,
  getMockupsByCategory,
  getMockupsForIndustry,
  getFilteredMockups,
  getMockupById,
  getMockupCountsByCategory,
} from "./mockup-registry";

// Core components
export { MockupCanvas } from "./core/mockup-canvas";

// Dashboard mockups
export { FullDashboardMockup } from "./dashboard/full-dashboard-mockup";
export { MetricsRowMockup } from "./dashboard/metrics-row-mockup";
export { ActivityFeedMockup } from "./dashboard/activity-feed-mockup";

// Gallery mockups
export { GalleriesListMockup } from "./galleries/galleries-list-mockup";
export { GalleryDetailMockup } from "./galleries/gallery-detail-mockup";

// Invoicing mockups
export { InvoicesListMockup } from "./invoicing/invoices-list-mockup";
export { InvoiceDetailMockup } from "./invoicing/invoice-detail-mockup";

// Client mockups
export { ClientsListMockup } from "./clients/clients-list-mockup";

// Client Portal mockups
export { ClientPortalHomeMockup } from "./client-portal/client-portal-home-mockup";

// Device mockups
export { BrowserDashboardMockup } from "./devices/browser-dashboard-mockup";
