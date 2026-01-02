/**
 * Tour definitions for Dovetail
 *
 * Each tour guides users through a specific feature or workflow.
 */

import type { Tour } from "./tour-provider";

/**
 * Welcome tour for new users after onboarding
 */
export const welcomeTour: Tour = {
  id: "welcome",
  name: "Welcome Tour",
  steps: [
    {
      id: "dashboard",
      target: "[data-tour='dashboard-metrics']",
      title: "Your Dashboard",
      content:
        "This is your command center. View key metrics, upcoming shoots, and recent activity at a glance.",
      placement: "bottom",
      route: "/dashboard",
    },
    {
      id: "sidebar",
      target: "[data-tour='sidebar-nav']",
      title: "Navigation",
      content:
        "Access all your tools from the sidebar. The available options are customized based on your selected industries.",
      placement: "right",
    },
    {
      id: "galleries",
      target: "[data-tour='nav-galleries']",
      title: "Photo Galleries",
      content:
        "Create beautiful galleries to deliver photos to your clients. Set up pay-to-download or free downloads.",
      placement: "right",
    },
    {
      id: "scheduling",
      target: "[data-tour='nav-scheduling']",
      title: "Scheduling",
      content:
        "Manage your bookings and appointments. View your calendar and upcoming shoots.",
      placement: "right",
    },
    {
      id: "quick-actions",
      target: "[data-tour='quick-actions']",
      title: "Quick Actions",
      content:
        "Create new galleries, clients, or invoices quickly from anywhere in the app.",
      placement: "bottom",
    },
  ],
};

/**
 * Gallery creation tour
 */
export const galleryTour: Tour = {
  id: "galleries",
  name: "Gallery Tour",
  steps: [
    {
      id: "galleries-list",
      target: "[data-tour='galleries-list']",
      title: "Your Galleries",
      content:
        "View all your photo galleries here. You can filter by status, search, and sort.",
      placement: "bottom",
      route: "/galleries",
    },
    {
      id: "new-gallery",
      target: "[data-tour='new-gallery-btn']",
      title: "Create a Gallery",
      content:
        "Click here to create a new gallery. You can upload photos, set pricing, and customize the gallery settings.",
      placement: "left",
    },
    {
      id: "gallery-status",
      target: "[data-tour='gallery-filters']",
      title: "Filter by Status",
      content:
        "Filter galleries by their status: Draft, Published, or Archived. Quickly find what you need.",
      placement: "bottom",
    },
  ],
};

/**
 * Clients management tour
 */
export const clientsTour: Tour = {
  id: "clients",
  name: "Clients Tour",
  steps: [
    {
      id: "clients-list",
      target: "[data-tour='clients-list']",
      title: "Your Clients",
      content:
        "Manage all your client relationships here. Track contact info, projects, and payment history.",
      placement: "bottom",
      route: "/clients",
    },
    {
      id: "new-client",
      target: "[data-tour='new-client-btn']",
      title: "Add a Client",
      content:
        "Click here to add a new client. You can import contacts or add them manually.",
      placement: "left",
    },
    {
      id: "client-search",
      target: "[data-tour='client-search']",
      title: "Search Clients",
      content:
        "Quickly find clients by name, email, or company. The search is instant.",
      placement: "bottom",
    },
  ],
};

/**
 * Invoicing tour
 */
export const invoicesTour: Tour = {
  id: "invoices",
  name: "Invoices Tour",
  steps: [
    {
      id: "invoices-list",
      target: "[data-tour='invoices-list']",
      title: "Your Invoices",
      content:
        "Track all your invoices here. See pending, paid, and overdue invoices at a glance.",
      placement: "bottom",
      route: "/invoices",
    },
    {
      id: "new-invoice",
      target: "[data-tour='new-invoice-btn']",
      title: "Create an Invoice",
      content:
        "Create professional invoices quickly. Add line items, apply discounts, and send to clients.",
      placement: "left",
    },
    {
      id: "invoice-status",
      target: "[data-tour='invoice-filters']",
      title: "Invoice Status",
      content:
        "Filter invoices by status. Track which invoices need attention.",
      placement: "bottom",
    },
  ],
};

/**
 * Scheduling tour
 */
export const schedulingTour: Tour = {
  id: "scheduling",
  name: "Scheduling Tour",
  steps: [
    {
      id: "calendar",
      target: "[data-tour='scheduling-calendar']",
      title: "Your Calendar",
      content:
        "View all your bookings in calendar format. Switch between day, week, and month views.",
      placement: "bottom",
      route: "/scheduling",
    },
    {
      id: "new-booking",
      target: "[data-tour='new-booking-btn']",
      title: "Schedule a Shoot",
      content:
        "Create a new booking. Add client details, location, services, and notes.",
      placement: "left",
    },
    {
      id: "booking-details",
      target: "[data-tour='booking-list']",
      title: "Booking Details",
      content:
        "Click any booking to see details, add notes, or make changes.",
      placement: "bottom",
    },
  ],
};

/**
 * Get all available tours
 */
export const allTours: Tour[] = [
  welcomeTour,
  galleryTour,
  clientsTour,
  invoicesTour,
  schedulingTour,
];

/**
 * Get a tour by ID
 */
export function getTourById(id: string): Tour | undefined {
  return allTours.find((tour) => tour.id === id);
}
