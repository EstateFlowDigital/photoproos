/**
 * Integration Registry
 * Defines all available integrations with their metadata, auth types, and features.
 */

// ============================================================================
// Types
// ============================================================================

export type IntegrationCategory =
  | "scheduling"
  | "storage"
  | "accounting"
  | "marketing"
  | "communication"
  | "automation"
  | "productivity"
  | "payments";

export type AuthType = "oauth2" | "api_key" | "webhook" | "credentials";

export type IntegrationStatus = "connected" | "disconnected" | "error" | "pending";

export interface IntegrationFeature {
  id: string;
  label: string;
  description: string;
}

export interface IntegrationSettingField {
  id: string;
  label: string;
  type: "text" | "toggle" | "select" | "multiselect";
  description?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: string; // Icon name from settings-icons
  category: IntegrationCategory;
  authType: AuthType;
  features: IntegrationFeature[];
  settingsFields?: IntegrationSettingField[];
  requiredEnvVars?: string[];
  docsUrl?: string;
  settingsHref?: string;
  isBuiltIn?: boolean; // Whether this is a core integration
  isPremium?: boolean; // Whether this requires a paid plan
  comingSoon?: boolean; // Not yet available
}

// ============================================================================
// Integration Definitions
// ============================================================================

export const INTEGRATIONS: Integration[] = [
  // ============================================================================
  // SCHEDULING
  // ============================================================================
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Sync bookings with your Google Calendar",
    longDescription:
      "Automatically sync your bookings to Google Calendar. When a booking is created, confirmed, or cancelled, your calendar is updated in real-time. Avoid double-bookings and keep your schedule in sync across devices.",
    icon: "calendar",
    category: "scheduling",
    authType: "oauth2",
    isBuiltIn: true,
    settingsHref: "/settings/calendar",
    docsUrl: "https://developers.google.com/calendar",
    features: [
      {
        id: "two_way_sync",
        label: "Two-Way Sync",
        description: "Changes in Google Calendar reflect in PhotoProOS and vice versa",
      },
      {
        id: "auto_block",
        label: "Auto-Block Times",
        description: "Automatically block times in your availability when calendar events exist",
      },
      {
        id: "event_details",
        label: "Rich Event Details",
        description: "Include client info, location, and notes in calendar events",
      },
    ],
    settingsFields: [
      {
        id: "calendar_id",
        label: "Calendar",
        type: "select",
        description: "Which calendar to sync bookings with",
        required: true,
      },
      {
        id: "sync_direction",
        label: "Sync Direction",
        type: "select",
        options: [
          { value: "both", label: "Two-way sync" },
          { value: "to_calendar", label: "PhotoProOS → Calendar only" },
          { value: "from_calendar", label: "Calendar → PhotoProOS only" },
        ],
      },
      {
        id: "include_client_info",
        label: "Include Client Info",
        type: "toggle",
        description: "Add client name and contact info to calendar events",
      },
    ],
    requiredEnvVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Import bookings from Calendly",
    longDescription:
      "Connect Calendly to automatically import bookings made through your Calendly scheduling pages. Keep all your bookings in one place regardless of how clients schedule.",
    icon: "calendar",
    category: "scheduling",
    authType: "oauth2",
    settingsHref: "/settings/calendly",
    docsUrl: "https://developer.calendly.com",
    features: [
      {
        id: "auto_import",
        label: "Auto Import",
        description: "Automatically create bookings when Calendly events are scheduled",
      },
      {
        id: "client_matching",
        label: "Client Matching",
        description: "Match Calendly invitees to existing clients or create new ones",
      },
    ],
    requiredEnvVars: ["CALENDLY_CLIENT_ID", "CALENDLY_CLIENT_SECRET"],
  },

  // ============================================================================
  // STORAGE
  // ============================================================================
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Sync photos and deliverables to Dropbox",
    longDescription:
      "Automatically sync your gallery photos and deliverables to Dropbox. Set up folder structures for each client and project, and keep your files backed up in the cloud.",
    icon: "dropbox",
    category: "storage",
    authType: "oauth2",
    isBuiltIn: true,
    settingsHref: "/settings/dropbox",
    docsUrl: "https://www.dropbox.com/developers",
    features: [
      {
        id: "auto_backup",
        label: "Auto Backup",
        description: "Automatically backup gallery photos to Dropbox",
      },
      {
        id: "folder_structure",
        label: "Custom Folders",
        description: "Organize files by client, project, or date",
      },
      {
        id: "selective_sync",
        label: "Selective Sync",
        description: "Choose which galleries to sync",
      },
    ],
    settingsFields: [
      {
        id: "root_folder",
        label: "Root Folder",
        type: "text",
        description: "Base folder path in Dropbox (e.g., /PhotoProOS)",
        required: true,
      },
      {
        id: "folder_pattern",
        label: "Folder Pattern",
        type: "select",
        options: [
          { value: "client/project", label: "Client Name / Project Name" },
          { value: "date/client", label: "YYYY-MM / Client Name" },
          { value: "project", label: "Project Name only" },
        ],
      },
      {
        id: "auto_sync",
        label: "Auto Sync",
        type: "toggle",
        description: "Automatically sync when galleries are delivered",
      },
    ],
    requiredEnvVars: ["DROPBOX_APP_KEY", "DROPBOX_APP_SECRET"],
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Store and share files via Google Drive",
    longDescription:
      "Connect Google Drive to store gallery photos, contracts, and other files. Share folders with clients and team members with granular permissions.",
    icon: "layers",
    category: "storage",
    authType: "oauth2",
    settingsHref: "/settings/google-drive",
    docsUrl: "https://developers.google.com/drive",
    features: [
      {
        id: "file_storage",
        label: "File Storage",
        description: "Store galleries and documents in Google Drive",
      },
      {
        id: "sharing",
        label: "Easy Sharing",
        description: "Share folders with clients via Drive sharing links",
      },
    ],
    requiredEnvVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    comingSoon: true,
  },

  // ============================================================================
  // PAYMENTS
  // ============================================================================
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept payments from clients",
    longDescription:
      "Connect your Stripe account to accept credit card payments directly through invoices and galleries. Payments are deposited directly to your bank account.",
    icon: "stripe",
    category: "payments",
    authType: "oauth2",
    isBuiltIn: true,
    settingsHref: "/settings/payments",
    docsUrl: "https://stripe.com/docs",
    features: [
      {
        id: "invoice_payments",
        label: "Invoice Payments",
        description: "Accept payments on invoices via credit card",
      },
      {
        id: "gallery_unlock",
        label: "Gallery Unlock",
        description: "Clients pay to unlock and download gallery photos",
      },
      {
        id: "instant_payouts",
        label: "Instant Payouts",
        description: "Get paid quickly with Stripe's instant payout feature",
      },
    ],
    requiredEnvVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  },

  // ============================================================================
  // COMMUNICATION
  // ============================================================================
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications in Slack",
    longDescription:
      "Receive real-time notifications in Slack when important events happen - new bookings, payments received, contracts signed, and more. Keep your team informed without checking the dashboard.",
    icon: "message",
    category: "communication",
    authType: "oauth2",
    isBuiltIn: true,
    settingsHref: "/settings/slack",
    docsUrl: "https://api.slack.com",
    features: [
      {
        id: "real_time_notifications",
        label: "Real-Time Notifications",
        description: "Get instant notifications for bookings, payments, and more",
      },
      {
        id: "channel_routing",
        label: "Channel Routing",
        description: "Route different notification types to different channels",
      },
      {
        id: "customizable",
        label: "Customizable",
        description: "Choose which events trigger notifications",
      },
    ],
    settingsFields: [
      {
        id: "default_channel",
        label: "Default Channel",
        type: "text",
        description: "Channel for notifications (e.g., #photography)",
        required: true,
      },
      {
        id: "notify_events",
        label: "Notification Events",
        type: "multiselect",
        options: [
          { value: "booking_created", label: "New Booking" },
          { value: "payment_received", label: "Payment Received" },
          { value: "contract_signed", label: "Contract Signed" },
          { value: "gallery_delivered", label: "Gallery Delivered" },
        ],
      },
    ],
    requiredEnvVars: ["SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET"],
  },

  // ============================================================================
  // ACCOUNTING
  // ============================================================================
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Sync invoices and payments to QuickBooks",
    longDescription:
      "Automatically sync your invoices and payments to QuickBooks Online. Keep your books up to date without manual data entry. Track income, expenses, and tax information in one place.",
    icon: "bank",
    category: "accounting",
    authType: "oauth2",
    settingsHref: "/settings/quickbooks",
    docsUrl: "https://developer.intuit.com",
    isPremium: true,
    features: [
      {
        id: "invoice_sync",
        label: "Invoice Sync",
        description: "Automatically create invoices in QuickBooks",
      },
      {
        id: "payment_sync",
        label: "Payment Sync",
        description: "Record payments when received",
      },
      {
        id: "client_sync",
        label: "Client Sync",
        description: "Keep client records in sync between systems",
      },
    ],
    settingsFields: [
      {
        id: "company_id",
        label: "QuickBooks Company",
        type: "select",
        description: "Select your QuickBooks company",
        required: true,
      },
      {
        id: "income_account",
        label: "Income Account",
        type: "select",
        description: "Account to record photography income",
      },
      {
        id: "auto_sync",
        label: "Auto Sync",
        type: "toggle",
        description: "Automatically sync new invoices and payments",
      },
    ],
    requiredEnvVars: ["QUICKBOOKS_CLIENT_ID", "QUICKBOOKS_CLIENT_SECRET"],
  },

  // ============================================================================
  // MARKETING
  // ============================================================================
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sync contacts for email marketing",
    longDescription:
      "Automatically add clients to your Mailchimp audience. Segment contacts based on services booked, location, and more. Send targeted email campaigns to grow your business.",
    icon: "mail",
    category: "marketing",
    authType: "oauth2",
    settingsHref: "/settings/mailchimp",
    docsUrl: "https://mailchimp.com/developer",
    isPremium: true,
    features: [
      {
        id: "contact_sync",
        label: "Contact Sync",
        description: "Automatically add clients to Mailchimp",
      },
      {
        id: "segmentation",
        label: "Smart Segments",
        description: "Create segments based on booking history",
      },
      {
        id: "tags",
        label: "Auto Tagging",
        description: "Tag contacts based on services booked",
      },
    ],
    settingsFields: [
      {
        id: "audience_id",
        label: "Audience",
        type: "select",
        description: "Mailchimp audience to sync contacts to",
        required: true,
      },
      {
        id: "sync_on_booking",
        label: "Sync on Booking",
        type: "toggle",
        description: "Add contacts when a booking is confirmed",
      },
      {
        id: "include_tags",
        label: "Include Tags",
        type: "toggle",
        description: "Add service and industry tags to contacts",
      },
    ],
    requiredEnvVars: ["MAILCHIMP_CLIENT_ID", "MAILCHIMP_CLIENT_SECRET"],
  },

  // ============================================================================
  // PRODUCTIVITY
  // ============================================================================
  {
    id: "notion",
    name: "Notion",
    description: "Sync projects to Notion databases",
    longDescription:
      "Connect Notion to sync your projects, clients, and bookings to Notion databases. Build custom workflows, dashboards, and documentation around your photography business.",
    icon: "layers",
    category: "productivity",
    authType: "oauth2",
    settingsHref: "/settings/notion",
    docsUrl: "https://developers.notion.com",
    isPremium: true,
    features: [
      {
        id: "project_sync",
        label: "Project Sync",
        description: "Sync projects to a Notion database",
      },
      {
        id: "client_database",
        label: "Client Database",
        description: "Keep client records in Notion",
      },
      {
        id: "custom_properties",
        label: "Custom Properties",
        description: "Map fields to Notion properties",
      },
    ],
    requiredEnvVars: ["NOTION_CLIENT_ID", "NOTION_CLIENT_SECRET"],
    comingSoon: true,
  },

  // ============================================================================
  // AUTOMATION
  // ============================================================================
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect with 5000+ apps via Zapier",
    longDescription:
      "Use Zapier to connect PhotoProOS with thousands of other apps. Create automated workflows (Zaps) triggered by bookings, payments, and other events. No coding required.",
    icon: "plug",
    category: "automation",
    authType: "api_key",
    settingsHref: "/settings/zapier",
    docsUrl: "https://zapier.com/developer",
    features: [
      {
        id: "triggers",
        label: "Event Triggers",
        description: "Trigger Zaps when events happen in PhotoProOS",
      },
      {
        id: "actions",
        label: "Actions",
        description: "Create bookings, clients, and more via Zapier",
      },
      {
        id: "webhooks",
        label: "Webhooks",
        description: "Send custom webhooks to any Zapier workflow",
      },
    ],
    requiredEnvVars: [],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all integrations
 */
export function getAllIntegrations(): Integration[] {
  return INTEGRATIONS;
}

/**
 * Get available integrations (excluding coming soon)
 */
export function getAvailableIntegrations(): Integration[] {
  return INTEGRATIONS.filter((i) => !i.comingSoon);
}

/**
 * Get integrations by category
 */
export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return INTEGRATIONS.filter((i) => i.category === category);
}

/**
 * Get a single integration by ID
 */
export function getIntegration(id: string): Integration | undefined {
  return INTEGRATIONS.find((i) => i.id === id);
}

/**
 * Get built-in integrations
 */
export function getBuiltInIntegrations(): Integration[] {
  return INTEGRATIONS.filter((i) => i.isBuiltIn);
}

/**
 * Get premium integrations
 */
export function getPremiumIntegrations(): Integration[] {
  return INTEGRATIONS.filter((i) => i.isPremium);
}

/**
 * Get coming soon integrations
 */
export function getComingSoonIntegrations(): Integration[] {
  return INTEGRATIONS.filter((i) => i.comingSoon);
}

/**
 * Get all unique categories
 */
export function getIntegrationCategories(): IntegrationCategory[] {
  const categories = new Set(INTEGRATIONS.map((i) => i.category));
  return Array.from(categories);
}

/**
 * Get category label
 */
export function getCategoryLabel(category: IntegrationCategory): string {
  const labels: Record<IntegrationCategory, string> = {
    scheduling: "Scheduling",
    storage: "Storage",
    accounting: "Accounting",
    marketing: "Marketing",
    communication: "Communication",
    automation: "Automation",
    productivity: "Productivity",
    payments: "Payments",
  };
  return labels[category];
}
