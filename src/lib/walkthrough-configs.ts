/**
 * Walkthrough Configurations
 *
 * Contains the step-by-step tutorial content for each page.
 */

import {
  LayoutDashboard,
  Plus,
  Images,
  Settings,
  Calendar,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Globe,
  Mail,
  Zap,
  Upload,
  Search,
  Link2,
  PenTool,
  Clock,
  Send,
  Eye,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { WalkthroughConfig, WalkthroughPageId } from "./walkthrough-types";

/**
 * Dashboard Walkthrough
 */
export const dashboardWalkthrough: WalkthroughConfig = {
  pageId: "dashboard",
  title: "Welcome to Your Dashboard",
  description:
    "Get an overview of your business and quick access to common actions.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "metrics",
      title: "Key Metrics",
      description:
        "See your monthly revenue, active galleries, total clients, and pending invoices at a glance.",
      icon: BarChart3,
      targetSelector: "[data-tour='metrics-section']",
      tooltipPosition: "bottom",
    },
    {
      id: "quick-actions",
      title: "Quick Actions",
      description:
        "Use shortcuts to create new galleries, add clients, or send invoices without navigating away.",
      icon: Zap,
      targetSelector: "[data-tour='quick-actions']",
      tooltipPosition: "left",
      actionLabel: "Create Gallery",
      actionHref: "/galleries/new",
    },
    {
      id: "calendar",
      title: "Calendar Overview",
      description:
        "View upcoming bookings, tasks, and events in your integrated calendar.",
      icon: Calendar,
      targetSelector: "[data-tour='calendar-widget']",
      tooltipPosition: "left",
      actionLabel: "View Calendar",
      actionHref: "/calendar",
    },
    {
      id: "customize",
      title: "Customize Your Dashboard",
      description:
        "Click the customize button to show, hide, or rearrange dashboard sections to fit your workflow.",
      icon: Settings,
      targetSelector: "[data-tour='customize-button']",
      tooltipPosition: "bottom",
    },
  ],
};

/**
 * Galleries Walkthrough
 */
export const galleriesWalkthrough: WalkthroughConfig = {
  pageId: "galleries",
  title: "Manage Your Galleries",
  description:
    "Create, organize, and share beautiful photo galleries with your clients.",
  videoPlaceholder: true,
  estimatedTime: "3 min read",
  steps: [
    {
      id: "create",
      title: "Create a Gallery",
      description:
        "Click 'New Gallery' to create a new photo collection. Link it to a client and set pricing.",
      icon: Plus,
      targetSelector: "[data-tour='new-gallery-button']",
      tooltipPosition: "bottom",
      actionLabel: "Create Gallery",
      actionHref: "/galleries/new",
    },
    {
      id: "upload",
      title: "Upload Photos",
      description:
        "Drag and drop photos or use the uploader. We support batch uploads and automatic optimization.",
      icon: Upload,
      targetSelector: "[data-tour='gallery-upload-zone']",
      tooltipPosition: "right",
    },
    {
      id: "organize",
      title: "Organize & Curate",
      description:
        "Reorder photos, set cover images, and organize into folders. Your clients will see exactly what you show.",
      icon: Images,
      targetSelector: "[data-tour='gallery-list']",
      tooltipPosition: "top",
    },
    {
      id: "share",
      title: "Share with Clients",
      description:
        "Generate a shareable link or send directly via email. Control access with expiration dates and download limits.",
      icon: Send,
      targetSelector: "[data-tour='share-button']",
      tooltipPosition: "left",
    },
  ],
};

/**
 * Clients Walkthrough
 */
export const clientsWalkthrough: WalkthroughConfig = {
  pageId: "clients",
  title: "Client Management",
  description:
    "Keep track of all your clients in one place. View history, send invoices, and maintain relationships.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "add",
      title: "Add Clients",
      description:
        "Click 'Add Client' to create a new client profile. Include contact info, company details, and notes.",
      icon: Plus,
      targetSelector: "[data-tour='add-client-button']",
      tooltipPosition: "bottom",
      actionLabel: "Add Client",
      actionHref: "/clients/new",
    },
    {
      id: "search",
      title: "Find Clients Quickly",
      description:
        "Use the search bar to find clients by name, email, or company. Filter by status or tags.",
      icon: Search,
      targetSelector: "[data-tour='client-search']",
      tooltipPosition: "bottom",
    },
    {
      id: "history",
      title: "View Client History",
      description:
        "Click on a client to see all their galleries, invoices, contracts, and communication history.",
      icon: Eye,
      targetSelector: "[data-tour='client-list']",
      tooltipPosition: "right",
    },
    {
      id: "communicate",
      title: "Stay in Touch",
      description:
        "Send emails directly from client profiles. Track opens and maintain professional relationships.",
      icon: Mail,
      targetSelector: "[data-tour='email-button']",
      tooltipPosition: "left",
    },
  ],
};

/**
 * Invoices Walkthrough
 */
export const invoicesWalkthrough: WalkthroughConfig = {
  pageId: "invoices",
  title: "Invoice Management",
  description:
    "Create professional invoices, accept payments, and track your revenue effortlessly.",
  videoPlaceholder: true,
  estimatedTime: "3 min read",
  steps: [
    {
      id: "create",
      title: "Create Invoices",
      description:
        "Click 'New Invoice' to create a professional invoice. Add line items, taxes, and discounts.",
      icon: Plus,
    },
    {
      id: "send",
      title: "Send & Track",
      description:
        "Send invoices via email with one click. Track when clients view and pay their invoices.",
      icon: Send,
    },
    {
      id: "payments",
      title: "Accept Payments",
      description:
        "Clients can pay online via credit card or bank transfer. Funds go directly to your account.",
      icon: CreditCard,
    },
    {
      id: "reminders",
      title: "Automatic Reminders",
      description:
        "Set up automatic payment reminders for overdue invoices. Stay professional, get paid faster.",
      icon: Clock,
    },
  ],
};

/**
 * Contracts Walkthrough
 */
export const contractsWalkthrough: WalkthroughConfig = {
  pageId: "contracts",
  title: "Contract Management",
  description:
    "Create, send, and track contracts with digital signatures. Protect your business.",
  videoPlaceholder: true,
  estimatedTime: "3 min read",
  steps: [
    {
      id: "templates",
      title: "Use Templates",
      description:
        "Start with a template or create your own. Save commonly used contracts for quick reuse.",
      icon: FileText,
    },
    {
      id: "customize",
      title: "Customize Content",
      description:
        "Add your terms, pricing, and conditions. Use merge fields to auto-fill client details.",
      icon: PenTool,
    },
    {
      id: "send",
      title: "Send for Signature",
      description:
        "Send contracts via email. Clients can sign digitally from any device.",
      icon: Send,
    },
    {
      id: "track",
      title: "Track Status",
      description:
        "See when contracts are viewed and signed. Store completed contracts securely.",
      icon: Eye,
    },
  ],
};

/**
 * Calendar Walkthrough
 */
export const calendarWalkthrough: WalkthroughConfig = {
  pageId: "calendar",
  title: "Your Schedule",
  description:
    "View and manage all your bookings, tasks, and events in one calendar.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "views",
      title: "Multiple Views",
      description:
        "Switch between day, week, month, and agenda views to see your schedule your way.",
      icon: Calendar,
    },
    {
      id: "bookings",
      title: "Manage Bookings",
      description:
        "Click on any booking to view details, reschedule, or communicate with the client.",
      icon: Clock,
    },
    {
      id: "sync",
      title: "Sync Calendars",
      description:
        "Connect Google Calendar or Outlook to see all your events in one place.",
      icon: Link2,
    },
    {
      id: "availability",
      title: "Set Availability",
      description:
        "Define your working hours and time off. Clients can only book when you're available.",
      icon: Target,
    },
  ],
};

/**
 * Settings Walkthrough
 */
export const settingsWalkthrough: WalkthroughConfig = {
  pageId: "settings",
  title: "Configure Your Account",
  description:
    "Customize your profile, branding, and preferences to match your business.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "profile",
      title: "Business Profile",
      description:
        "Add your business name, logo, and contact info. This appears on all client-facing materials.",
      icon: Users,
    },
    {
      id: "branding",
      title: "Customize Branding",
      description:
        "Upload your logo and set brand colors. Create a consistent experience for your clients.",
      icon: Settings,
    },
    {
      id: "payments",
      title: "Payment Settings",
      description:
        "Connect Stripe to accept payments. Set up your bank account for payouts.",
      icon: CreditCard,
    },
    {
      id: "notifications",
      title: "Notifications",
      description:
        "Control which emails you receive. Set up alerts for payments, bookings, and more.",
      icon: Mail,
    },
  ],
};

/**
 * Analytics Walkthrough
 */
export const analyticsWalkthrough: WalkthroughConfig = {
  pageId: "analytics",
  title: "Business Analytics",
  description:
    "Track your business performance with powerful reports and insights.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "overview",
      title: "Performance Overview",
      description:
        "See your revenue trends, client growth, and booking patterns at a glance.",
      icon: BarChart3,
    },
    {
      id: "revenue",
      title: "Revenue Reports",
      description:
        "Track income by service type, client, or time period. Identify your most profitable work.",
      icon: CreditCard,
    },
    {
      id: "clients",
      title: "Client Insights",
      description:
        "Understand client behavior, repeat business rates, and acquisition sources.",
      icon: Users,
    },
    {
      id: "export",
      title: "Export Reports",
      description:
        "Download reports as PDF or CSV for accounting, tax preparation, or presentations.",
      icon: FileText,
    },
  ],
};

/**
 * Integrations Walkthrough
 */
export const integrationsWalkthrough: WalkthroughConfig = {
  pageId: "integrations",
  title: "Connect Your Tools",
  description:
    "Integrate with popular apps to streamline your workflow and save time.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "browse",
      title: "Browse Integrations",
      description:
        "Explore available integrations for accounting, marketing, scheduling, and more.",
      icon: Search,
    },
    {
      id: "connect",
      title: "Connect Services",
      description:
        "Click 'Connect' to link your favorite apps. Follow the simple authentication steps.",
      icon: Link2,
    },
    {
      id: "configure",
      title: "Configure Settings",
      description:
        "Customize how data flows between apps. Set up automatic syncing preferences.",
      icon: Settings,
    },
    {
      id: "manage",
      title: "Manage Connections",
      description:
        "View connected apps, check sync status, and disconnect when needed.",
      icon: Zap,
    },
  ],
};

/**
 * Property Websites Walkthrough
 */
export const propertyWebsitesWalkthrough: WalkthroughConfig = {
  pageId: "property-websites",
  title: "Property Websites",
  description:
    "Create stunning single-property marketing sites for your real estate clients.",
  videoPlaceholder: true,
  estimatedTime: "3 min read",
  steps: [
    {
      id: "create",
      title: "Create a Site",
      description:
        "Click 'Create Website' and select a gallery. We'll automatically pull in photos and details.",
      icon: Plus,
    },
    {
      id: "customize",
      title: "Customize Design",
      description:
        "Choose a template, add property details, and customize colors to match the agent's brand.",
      icon: Settings,
    },
    {
      id: "publish",
      title: "Publish & Share",
      description:
        "Publish your site with one click. Share the custom URL with clients and on social media.",
      icon: Globe,
    },
    {
      id: "analytics",
      title: "Track Performance",
      description:
        "See how many people visit the site, where they come from, and what they click on.",
      icon: BarChart3,
    },
  ],
};

/**
 * All walkthrough configurations by page ID
 */
export const WALKTHROUGH_CONFIGS: Record<WalkthroughPageId, WalkthroughConfig | null> = {
  dashboard: dashboardWalkthrough,
  galleries: galleriesWalkthrough,
  "gallery-detail": null, // Will use galleries config
  clients: clientsWalkthrough,
  "client-detail": null, // Will use clients config
  invoices: invoicesWalkthrough,
  "invoice-detail": null, // Will use invoices config
  estimates: null, // Coming soon
  contracts: contractsWalkthrough,
  "contract-detail": null, // Will use contracts config
  calendar: calendarWalkthrough,
  bookings: calendarWalkthrough, // Same as calendar
  settings: settingsWalkthrough,
  integrations: integrationsWalkthrough,
  team: null, // Coming soon
  analytics: analyticsWalkthrough,
  reports: analyticsWalkthrough, // Same as analytics
  "property-websites": propertyWebsitesWalkthrough,
  "marketing-kit": null, // Coming soon
};

/**
 * Get walkthrough config for a page
 */
export function getWalkthroughConfig(pageId: WalkthroughPageId): WalkthroughConfig | null {
  return WALKTHROUGH_CONFIGS[pageId] ?? null;
}
