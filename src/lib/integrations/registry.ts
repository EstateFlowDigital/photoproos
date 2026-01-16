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
  | "payments"
  | "social";

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

  // ============================================================================
  // SOCIAL MEDIA (Marketing Studio)
  // ============================================================================
  {
    id: "instagram",
    name: "Instagram",
    description: "Publish content directly to Instagram",
    longDescription:
      "Connect your Instagram Business or Creator account to publish posts, stories, and reels directly from Marketing Studio. Schedule content in advance and track engagement metrics.",
    icon: "instagram",
    category: "social",
    authType: "oauth2",
    isBuiltIn: true,
    settingsHref: "/super-admin/marketing-studio/integrations",
    docsUrl: "https://developers.facebook.com/docs/instagram-api",
    features: [
      {
        id: "direct_publish",
        label: "Direct Publishing",
        description: "Post content directly to your Instagram feed",
      },
      {
        id: "story_publish",
        label: "Story Publishing",
        description: "Publish stories directly from the composer",
      },
      {
        id: "carousel_support",
        label: "Carousel Support",
        description: "Create and publish multi-image carousels",
      },
      {
        id: "engagement_metrics",
        label: "Engagement Metrics",
        description: "Track likes, comments, and reach on your posts",
      },
    ],
    settingsFields: [
      {
        id: "account_type",
        label: "Account Type",
        type: "select",
        options: [
          { value: "business", label: "Business Account" },
          { value: "creator", label: "Creator Account" },
        ],
        description: "Your Instagram account type",
        required: true,
      },
      {
        id: "auto_hashtags",
        label: "Auto-Add Hashtags",
        type: "toggle",
        description: "Automatically add default hashtags from your brand kit",
      },
    ],
    requiredEnvVars: ["INSTAGRAM_APP_ID", "INSTAGRAM_APP_SECRET"],
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Publish content to Facebook Pages",
    longDescription:
      "Connect your Facebook Page to publish posts and stories directly from Marketing Studio. Manage multiple pages and schedule content for optimal engagement times.",
    icon: "facebook",
    category: "social",
    authType: "oauth2",
    isBuiltIn: true,
    settingsHref: "/super-admin/marketing-studio/integrations",
    docsUrl: "https://developers.facebook.com/docs/pages-api",
    features: [
      {
        id: "page_publish",
        label: "Page Publishing",
        description: "Post content directly to your Facebook Page",
      },
      {
        id: "story_publish",
        label: "Story Publishing",
        description: "Publish stories to your Facebook Page",
      },
      {
        id: "multi_page",
        label: "Multi-Page Support",
        description: "Manage and post to multiple Facebook Pages",
      },
      {
        id: "insights",
        label: "Page Insights",
        description: "View post reach and engagement metrics",
      },
    ],
    settingsFields: [
      {
        id: "default_page",
        label: "Default Page",
        type: "select",
        description: "Default Facebook Page for publishing",
        required: true,
      },
      {
        id: "include_link",
        label: "Include Website Link",
        type: "toggle",
        description: "Automatically add your website link to posts",
      },
    ],
    requiredEnvVars: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    description: "Post content to X (formerly Twitter)",
    longDescription:
      "Connect your X account to publish tweets and threads directly from Marketing Studio. Share your photography work and engage with your audience on the platform.",
    icon: "twitter",
    category: "social",
    authType: "oauth2",
    isBuiltIn: true,
    settingsHref: "/super-admin/marketing-studio/integrations",
    docsUrl: "https://developer.twitter.com/en/docs",
    features: [
      {
        id: "tweet_publish",
        label: "Tweet Publishing",
        description: "Post tweets directly from the composer",
      },
      {
        id: "media_upload",
        label: "Media Upload",
        description: "Upload images and videos with your tweets",
      },
      {
        id: "thread_support",
        label: "Thread Support",
        description: "Create and publish multi-tweet threads",
      },
      {
        id: "analytics",
        label: "Tweet Analytics",
        description: "Track impressions, engagement, and profile visits",
      },
    ],
    settingsFields: [
      {
        id: "char_warning",
        label: "Character Warning",
        type: "toggle",
        description: "Show warning when approaching character limit",
      },
      {
        id: "auto_thread",
        label: "Auto-Thread Long Posts",
        type: "toggle",
        description: "Automatically split long content into threads",
      },
    ],
    requiredEnvVars: ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Share content to LinkedIn profiles and pages",
    longDescription:
      "Connect your LinkedIn account to share professional content with your network. Perfect for B2B photography services, headshots, and corporate event photography.",
    icon: "linkedin",
    category: "social",
    authType: "oauth2",
    isBuiltIn: true,
    settingsHref: "/super-admin/marketing-studio/integrations",
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/",
    features: [
      {
        id: "profile_post",
        label: "Profile Posts",
        description: "Share content to your personal LinkedIn profile",
      },
      {
        id: "page_post",
        label: "Company Page Posts",
        description: "Post to your LinkedIn Company Page",
      },
      {
        id: "article_publish",
        label: "Article Publishing",
        description: "Publish long-form articles on LinkedIn",
      },
      {
        id: "analytics",
        label: "Post Analytics",
        description: "Track views, reactions, and comments",
      },
    ],
    settingsFields: [
      {
        id: "post_target",
        label: "Default Post Target",
        type: "select",
        options: [
          { value: "profile", label: "Personal Profile" },
          { value: "page", label: "Company Page" },
        ],
        description: "Where to post by default",
        required: true,
      },
      {
        id: "company_page",
        label: "Company Page",
        type: "select",
        description: "Select your LinkedIn Company Page",
      },
    ],
    requiredEnvVars: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Share content to TikTok",
    longDescription:
      "Connect your TikTok Business account to share video content and behind-the-scenes clips. Reach a younger audience and showcase your creative process.",
    icon: "tiktok",
    category: "social",
    authType: "oauth2",
    settingsHref: "/super-admin/marketing-studio/integrations",
    docsUrl: "https://developers.tiktok.com/",
    features: [
      {
        id: "video_upload",
        label: "Video Upload",
        description: "Upload videos directly to TikTok",
      },
      {
        id: "cover_image",
        label: "Cover Image Selection",
        description: "Choose or upload a custom cover image",
      },
      {
        id: "analytics",
        label: "Video Analytics",
        description: "Track views, likes, and shares",
      },
    ],
    settingsFields: [
      {
        id: "default_privacy",
        label: "Default Privacy",
        type: "select",
        options: [
          { value: "public", label: "Public" },
          { value: "friends", label: "Friends Only" },
          { value: "private", label: "Private" },
        ],
        description: "Default privacy setting for uploads",
      },
      {
        id: "allow_comments",
        label: "Allow Comments",
        type: "toggle",
        description: "Enable comments on uploaded videos",
      },
      {
        id: "allow_duet",
        label: "Allow Duet",
        type: "toggle",
        description: "Allow others to duet with your videos",
      },
    ],
    requiredEnvVars: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    comingSoon: true,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    description: "Pin your photography to Pinterest boards",
    longDescription:
      "Connect your Pinterest Business account to create pins from your photography work. Drive traffic to your portfolio and attract clients searching for photography inspiration.",
    icon: "pinterest",
    category: "social",
    authType: "oauth2",
    settingsHref: "/super-admin/marketing-studio/integrations",
    docsUrl: "https://developers.pinterest.com/",
    features: [
      {
        id: "create_pins",
        label: "Create Pins",
        description: "Create pins directly from your compositions",
      },
      {
        id: "board_selection",
        label: "Board Selection",
        description: "Pin to any of your Pinterest boards",
      },
      {
        id: "rich_pins",
        label: "Rich Pins",
        description: "Create rich pins with enhanced metadata",
      },
      {
        id: "analytics",
        label: "Pin Analytics",
        description: "Track impressions, saves, and clicks",
      },
    ],
    settingsFields: [
      {
        id: "default_board",
        label: "Default Board",
        type: "select",
        description: "Default board for new pins",
      },
      {
        id: "link_url",
        label: "Default Link URL",
        type: "text",
        description: "Default URL for pin links (e.g., your portfolio)",
      },
    ],
    requiredEnvVars: ["PINTEREST_APP_ID", "PINTEREST_APP_SECRET"],
    comingSoon: true,
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
    social: "Social Media",
  };
  return labels[category];
}

/**
 * Get social media integrations for Marketing Studio
 */
export function getSocialMediaIntegrations(): Integration[] {
  return INTEGRATIONS.filter((i) => i.category === "social");
}

/**
 * Get available (not coming soon) social media integrations
 */
export function getAvailableSocialMediaIntegrations(): Integration[] {
  return INTEGRATIONS.filter((i) => i.category === "social" && !i.comingSoon);
}
