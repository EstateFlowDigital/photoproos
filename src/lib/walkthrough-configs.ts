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
  Download,
  Share2,
  Palette,
  History,
  DollarSign,
  Receipt,
  CheckCircle,
  FileSignature,
  MessageSquare,
  Inbox,
  KanbanSquare,
  UserPlus,
  ShoppingBag,
  ClipboardList,
  Filter,
  Tag,
  Reply,
  Archive,
  FolderKanban,
  ListTodo,
  Sparkles,
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
      targetSelector: "[data-tour='create-invoice-button']",
      tooltipPosition: "bottom",
      actionLabel: "Create Invoice",
      actionHref: "/invoices/new",
    },
    {
      id: "send",
      title: "Send & Track",
      description:
        "Send invoices via email with one click. Track when clients view and pay their invoices.",
      icon: Send,
      targetSelector: "[data-tour='invoice-list']",
      tooltipPosition: "top",
    },
    {
      id: "payments",
      title: "Accept Payments",
      description:
        "Clients can pay online via credit card or bank transfer. Funds go directly to your account.",
      icon: CreditCard,
      targetSelector: "[data-tour='invoice-stats']",
      tooltipPosition: "bottom",
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
      actionLabel: "View Templates",
      actionHref: "/contracts/templates",
    },
    {
      id: "customize",
      title: "Customize Content",
      description:
        "Add your terms, pricing, and conditions. Use merge fields to auto-fill client details.",
      icon: PenTool,
      targetSelector: "[data-tour='create-contract-button']",
      tooltipPosition: "bottom",
    },
    {
      id: "send",
      title: "Send for Signature",
      description:
        "Send contracts via email. Clients can sign digitally from any device.",
      icon: Send,
      targetSelector: "[data-tour='contract-list']",
      tooltipPosition: "top",
    },
    {
      id: "track",
      title: "Track Status",
      description:
        "See when contracts are viewed and signed. Store completed contracts securely.",
      icon: Eye,
      targetSelector: "[data-tour='contract-stats']",
      tooltipPosition: "bottom",
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
      targetSelector: "[data-tour='calendar-view']",
      tooltipPosition: "left",
    },
    {
      id: "bookings",
      title: "Manage Bookings",
      description:
        "Click on any booking to view details, reschedule, or communicate with the client.",
      icon: Clock,
      targetSelector: "[data-tour='new-booking-button']",
      tooltipPosition: "bottom",
      actionLabel: "Create Booking",
      actionHref: "/scheduling/new",
    },
    {
      id: "sync",
      title: "Sync Calendars",
      description:
        "Connect Google Calendar or Outlook to see all your events in one place.",
      icon: Link2,
      actionLabel: "Settings",
      actionHref: "/settings/integrations",
    },
    {
      id: "availability",
      title: "Set Availability",
      description:
        "Define your working hours and time off. Clients can only book when you're available.",
      icon: Target,
      actionLabel: "Availability",
      actionHref: "/scheduling/availability",
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
      targetSelector: "[data-tour='analytics-stats']",
      tooltipPosition: "bottom",
    },
    {
      id: "revenue",
      title: "Revenue Reports",
      description:
        "Track income by service type, client, or time period. Identify your most profitable work.",
      icon: CreditCard,
      targetSelector: "[data-tour='revenue-chart']",
      tooltipPosition: "right",
    },
    {
      id: "clients",
      title: "Client Insights",
      description:
        "Understand client behavior, repeat business rates, and acquisition sources.",
      icon: Users,
      targetSelector: "[data-tour='client-insights']",
      tooltipPosition: "left",
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
 * Gallery Detail Walkthrough
 */
export const galleryDetailWalkthrough: WalkthroughConfig = {
  pageId: "gallery-detail",
  title: "Gallery Details",
  description:
    "Manage photos, settings, and delivery for this gallery.",
  videoPlaceholder: true,
  estimatedTime: "3 min read",
  steps: [
    {
      id: "photos",
      title: "Manage Photos",
      description:
        "Upload, organize, and delete photos. Drag to reorder, select multiple for bulk actions.",
      icon: Images,
    },
    {
      id: "settings",
      title: "Gallery Settings",
      description:
        "Configure watermarks, download options, expiration dates, and pricing.",
      icon: Settings,
    },
    {
      id: "delivery",
      title: "Deliver to Client",
      description:
        "Generate a shareable link and send it to your client. Track when they view and download photos.",
      icon: Share2,
    },
    {
      id: "analytics",
      title: "View Analytics",
      description:
        "See gallery views, downloads, and client activity in the Activity section.",
      icon: BarChart3,
    },
  ],
};

/**
 * Client Detail Walkthrough
 */
export const clientDetailWalkthrough: WalkthroughConfig = {
  pageId: "client-detail",
  title: "Client Profile",
  description:
    "View and manage all information about this client in one place.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "overview",
      title: "Client Overview",
      description:
        "See contact info, company details, and client tags at a glance.",
      icon: Users,
    },
    {
      id: "history",
      title: "Project History",
      description:
        "View all galleries, bookings, and invoices associated with this client.",
      icon: History,
    },
    {
      id: "communications",
      title: "Communication History",
      description:
        "Track all emails sent to this client and their delivery status.",
      icon: Mail,
    },
    {
      id: "actions",
      title: "Quick Actions",
      description:
        "Create a new gallery, send an invoice, or schedule a booking directly from the client profile.",
      icon: Zap,
    },
  ],
};

/**
 * Invoice Detail Walkthrough
 */
export const invoiceDetailWalkthrough: WalkthroughConfig = {
  pageId: "invoice-detail",
  title: "Invoice Details",
  description:
    "View, edit, and manage this invoice.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "overview",
      title: "Invoice Overview",
      description:
        "See the client, status, line items, and total amount at a glance.",
      icon: Receipt,
    },
    {
      id: "send",
      title: "Send Invoice",
      description:
        "Send the invoice to your client via email. They'll receive a link to view and pay online.",
      icon: Send,
    },
    {
      id: "payments",
      title: "Track Payments",
      description:
        "See payment status, partial payments, and payment history.",
      icon: DollarSign,
    },
    {
      id: "edit",
      title: "Edit Invoice",
      description:
        "Modify line items, add discounts, or update the due date before sending.",
      icon: PenTool,
      actionLabel: "Edit Invoice",
      actionHref: "edit",
    },
  ],
};

/**
 * Contract Detail Walkthrough
 */
export const contractDetailWalkthrough: WalkthroughConfig = {
  pageId: "contract-detail",
  title: "Contract Details",
  description:
    "View, send, and track signatures for this contract.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "overview",
      title: "Contract Overview",
      description:
        "See the contract status, signers, and key dates at a glance.",
      icon: FileSignature,
    },
    {
      id: "send",
      title: "Send for Signature",
      description:
        "Send the contract to your client. They can sign digitally from any device.",
      icon: Send,
    },
    {
      id: "track",
      title: "Track Signatures",
      description:
        "Monitor when each signer views and signs the contract.",
      icon: CheckCircle,
    },
    {
      id: "download",
      title: "Download Contract",
      description:
        "Download the signed contract as a PDF for your records.",
      icon: Download,
    },
  ],
};

/**
 * Messages Walkthrough
 */
export const messagesWalkthrough: WalkthroughConfig = {
  pageId: "messages",
  title: "Messages & Communication",
  description:
    "Communicate with team members and clients in one place.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "compose",
      title: "Start a Conversation",
      description:
        "Click 'New Message' to start a direct message or group conversation with team members or clients.",
      icon: Plus,
    },
    {
      id: "conversations",
      title: "View Conversations",
      description:
        "See all your conversations in the sidebar. Unread messages are highlighted for quick access.",
      icon: MessageSquare,
    },
    {
      id: "reply",
      title: "Reply & Communicate",
      description:
        "Type your message and hit send. You can also attach files and share gallery links.",
      icon: Reply,
    },
    {
      id: "organize",
      title: "Stay Organized",
      description:
        "Archive old conversations and use search to find messages quickly.",
      icon: Archive,
    },
  ],
};

/**
 * Projects Walkthrough
 */
export const projectsWalkthrough: WalkthroughConfig = {
  pageId: "projects",
  title: "Project Management",
  description:
    "Organize your work with a visual kanban board and task management.",
  videoPlaceholder: true,
  estimatedTime: "3 min read",
  steps: [
    {
      id: "board",
      title: "Kanban Board",
      description:
        "View all your projects organized by status. Drag cards between columns to update progress.",
      icon: KanbanSquare,
    },
    {
      id: "create",
      title: "Create Tasks",
      description:
        "Click '+' in any column to add a new task. Assign to team members and set due dates.",
      icon: Plus,
    },
    {
      id: "details",
      title: "Task Details",
      description:
        "Click a card to view details, add comments, attach files, and link to galleries or clients.",
      icon: ListTodo,
    },
    {
      id: "filter",
      title: "Filter & Search",
      description:
        "Filter tasks by assignee, due date, or client. Find what you need quickly.",
      icon: Filter,
    },
  ],
};

/**
 * Questionnaires Walkthrough
 */
export const questionnairesWalkthrough: WalkthroughConfig = {
  pageId: "questionnaires",
  title: "Client Questionnaires",
  description:
    "Gather information from clients before shoots with customizable questionnaires.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "templates",
      title: "Browse Templates",
      description:
        "Start with industry-specific templates or create your own from scratch.",
      icon: ClipboardList,
    },
    {
      id: "create",
      title: "Create Questionnaire",
      description:
        "Add questions with various field types: text, multiple choice, date pickers, and more.",
      icon: Plus,
    },
    {
      id: "send",
      title: "Send to Clients",
      description:
        "Assign questionnaires to clients. They'll receive an email link to complete it.",
      icon: Send,
    },
    {
      id: "responses",
      title: "View Responses",
      description:
        "See completed questionnaires and use the responses to prepare for shoots.",
      icon: Eye,
    },
  ],
};

/**
 * Products Walkthrough
 */
export const productsWalkthrough: WalkthroughConfig = {
  pageId: "products",
  title: "Product Catalog",
  description:
    "Create and manage products and services that clients can purchase.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "catalogs",
      title: "Product Catalogs",
      description:
        "Organize products into catalogs for different service types or client segments.",
      icon: FolderKanban,
    },
    {
      id: "create",
      title: "Add Products",
      description:
        "Create products with pricing, descriptions, and images. Set up variants for different options.",
      icon: Plus,
    },
    {
      id: "pricing",
      title: "Set Pricing",
      description:
        "Configure base prices, package deals, and optional add-ons for your services.",
      icon: DollarSign,
    },
    {
      id: "attach",
      title: "Link to Galleries",
      description:
        "Attach products to galleries to let clients purchase prints or digital downloads.",
      icon: Link2,
    },
  ],
};

/**
 * Inbox Walkthrough
 */
export const inboxWalkthrough: WalkthroughConfig = {
  pageId: "inbox",
  title: "Email Inbox",
  description:
    "Manage all your business emails in one unified inbox.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "connect",
      title: "Connect Email",
      description:
        "Link your Gmail or Outlook account to see all business emails here.",
      icon: Link2,
    },
    {
      id: "threads",
      title: "View Threads",
      description:
        "Emails are grouped into conversations. Click a thread to see the full history.",
      icon: Inbox,
    },
    {
      id: "reply",
      title: "Reply Inline",
      description:
        "Respond to emails directly without leaving the app. Use templates for common responses.",
      icon: Reply,
    },
    {
      id: "organize",
      title: "Stay Organized",
      description:
        "Star important emails, archive old ones, and filter by client or status.",
      icon: Archive,
    },
  ],
};

/**
 * Leads Walkthrough
 */
export const leadsWalkthrough: WalkthroughConfig = {
  pageId: "leads",
  title: "Lead Management",
  description:
    "Track inquiries from your website and convert them into clients.",
  videoPlaceholder: true,
  estimatedTime: "2 min read",
  steps: [
    {
      id: "sources",
      title: "Lead Sources",
      description:
        "See leads from your portfolio website, chat widget, and booking forms all in one place.",
      icon: UserPlus,
    },
    {
      id: "review",
      title: "Review Inquiries",
      description:
        "Click on a lead to see their inquiry details, contact info, and message.",
      icon: Eye,
    },
    {
      id: "respond",
      title: "Quick Response",
      description:
        "Reply directly or convert the lead to a client with one click.",
      icon: Reply,
    },
    {
      id: "analytics",
      title: "Track Performance",
      description:
        "View lead analytics to see which sources bring the most inquiries.",
      icon: BarChart3,
      actionLabel: "View Analytics",
      actionHref: "/leads/analytics",
    },
  ],
};

/**
 * All walkthrough configurations by page ID
 */
export const WALKTHROUGH_CONFIGS: Record<WalkthroughPageId, WalkthroughConfig | null> = {
  dashboard: dashboardWalkthrough,
  galleries: galleriesWalkthrough,
  "gallery-detail": galleryDetailWalkthrough,
  clients: clientsWalkthrough,
  "client-detail": clientDetailWalkthrough,
  invoices: invoicesWalkthrough,
  "invoice-detail": invoiceDetailWalkthrough,
  estimates: null, // Coming soon
  contracts: contractsWalkthrough,
  "contract-detail": contractDetailWalkthrough,
  calendar: calendarWalkthrough,
  bookings: calendarWalkthrough, // Same as calendar
  settings: settingsWalkthrough,
  integrations: integrationsWalkthrough,
  team: null, // Coming soon
  analytics: analyticsWalkthrough,
  reports: analyticsWalkthrough, // Same as analytics
  "property-websites": propertyWebsitesWalkthrough,
  "marketing-kit": null, // Coming soon
  messages: messagesWalkthrough,
  projects: projectsWalkthrough,
  questionnaires: questionnairesWalkthrough,
  products: productsWalkthrough,
  inbox: inboxWalkthrough,
  leads: leadsWalkthrough,
};

/**
 * Get walkthrough config for a page
 */
export function getWalkthroughConfig(pageId: WalkthroughPageId): WalkthroughConfig | null {
  return WALKTHROUGH_CONFIGS[pageId] ?? null;
}
