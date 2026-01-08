/**
 * AI Tool Registry
 *
 * Defines all tools available to the AI agent for interacting with
 * the PhotoProOS platform.
 */

export type ToolCategory = "read" | "create" | "update" | "analysis";

export interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  requiresConfirmation: boolean;
  parameters: {
    type: "object";
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      required?: boolean;
    }>;
    required: string[];
  };
}

// ============================================================================
// READ TOOLS (No confirmation needed)
// ============================================================================

export const listGalleries: ToolDefinition = {
  name: "list_galleries",
  description: "List all galleries for the organization with optional filters",
  category: "read",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        description: "Filter by gallery status",
        enum: ["draft", "delivered", "archived"],
      },
      limit: {
        type: "number",
        description: "Maximum number of galleries to return (default 20)",
      },
    },
    required: [],
  },
};

export const listClients: ToolDefinition = {
  name: "list_clients",
  description: "List all clients for the organization",
  category: "read",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of clients to return (default 20)",
      },
      search: {
        type: "string",
        description: "Search term to filter clients by name or email",
      },
    },
    required: [],
  },
};

export const getRevenueSummary: ToolDefinition = {
  name: "get_revenue_summary",
  description: "Get revenue summary for the organization",
  category: "read",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      period: {
        type: "string",
        description: "Time period for the summary",
        enum: ["today", "week", "month", "year", "all"],
      },
    },
    required: [],
  },
};

export const listUpcomingBookings: ToolDefinition = {
  name: "list_upcoming_bookings",
  description: "List upcoming bookings and scheduled sessions",
  category: "read",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      days: {
        type: "number",
        description: "Number of days to look ahead (default 30)",
      },
    },
    required: [],
  },
};

export const listPendingInvoices: ToolDefinition = {
  name: "list_pending_invoices",
  description: "List unpaid invoices",
  category: "read",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of invoices to return (default 20)",
      },
    },
    required: [],
  },
};

export const getExpenseSummary: ToolDefinition = {
  name: "get_expense_summary",
  description: "Get expense summary with category breakdown",
  category: "read",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      year: {
        type: "number",
        description: "Year for the summary (default current year)",
      },
    },
    required: [],
  },
};

export const searchEverything: ToolDefinition = {
  name: "search_everything",
  description: "Search across galleries, clients, invoices, and more",
  category: "read",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query",
      },
      type: {
        type: "string",
        description: "Filter by entity type",
        enum: ["gallery", "client", "invoice", "booking", "all"],
      },
    },
    required: ["query"],
  },
};

export const getGalleryDetails: ToolDefinition = {
  name: "get_gallery_details",
  description: "Get detailed information about a specific gallery",
  category: "read",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      galleryId: {
        type: "string",
        description: "The ID of the gallery",
      },
    },
    required: ["galleryId"],
  },
};

export const getClientDetails: ToolDefinition = {
  name: "get_client_details",
  description: "Get detailed information about a specific client",
  category: "read",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        description: "The ID of the client",
      },
    },
    required: ["clientId"],
  },
};

// ============================================================================
// CREATE TOOLS (Requires confirmation)
// ============================================================================

export const createGallery: ToolDefinition = {
  name: "create_gallery",
  description: "Create a new gallery",
  category: "create",
  requiresConfirmation: true,
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Gallery name",
      },
      clientId: {
        type: "string",
        description: "ID of the client this gallery is for",
      },
      description: {
        type: "string",
        description: "Gallery description",
      },
    },
    required: ["name"],
  },
};

export const createClient: ToolDefinition = {
  name: "create_client",
  description: "Create a new client",
  category: "create",
  requiresConfirmation: true,
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Client name",
      },
      email: {
        type: "string",
        description: "Client email address",
      },
      phone: {
        type: "string",
        description: "Client phone number",
      },
      company: {
        type: "string",
        description: "Client company name",
      },
    },
    required: ["name", "email"],
  },
};

export const createBooking: ToolDefinition = {
  name: "create_booking",
  description: "Create a new booking/session",
  category: "create",
  requiresConfirmation: true,
  parameters: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        description: "ID of the client",
      },
      date: {
        type: "string",
        description: "Booking date (ISO format)",
      },
      time: {
        type: "string",
        description: "Booking time",
      },
      duration: {
        type: "number",
        description: "Duration in minutes",
      },
      type: {
        type: "string",
        description: "Type of session",
      },
      notes: {
        type: "string",
        description: "Additional notes",
      },
    },
    required: ["clientId", "date"],
  },
};

export const createInvoice: ToolDefinition = {
  name: "create_invoice",
  description: "Create a new invoice",
  category: "create",
  requiresConfirmation: true,
  parameters: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        description: "ID of the client",
      },
      items: {
        type: "string",
        description: "JSON array of line items [{description, amount}]",
      },
      dueDate: {
        type: "string",
        description: "Due date (ISO format)",
      },
      notes: {
        type: "string",
        description: "Invoice notes",
      },
    },
    required: ["clientId", "items"],
  },
};

export const deliverGallery: ToolDefinition = {
  name: "deliver_gallery",
  description: "Deliver a gallery to the client",
  category: "create",
  requiresConfirmation: true,
  parameters: {
    type: "object",
    properties: {
      galleryId: {
        type: "string",
        description: "ID of the gallery to deliver",
      },
      sendEmail: {
        type: "boolean",
        description: "Whether to send delivery email (default true)",
      },
    },
    required: ["galleryId"],
  },
};

// ============================================================================
// UPDATE TOOLS (Requires confirmation)
// ============================================================================

export const updateGallery: ToolDefinition = {
  name: "update_gallery",
  description: "Update gallery details",
  category: "update",
  requiresConfirmation: true,
  parameters: {
    type: "object",
    properties: {
      galleryId: {
        type: "string",
        description: "ID of the gallery to update",
      },
      name: {
        type: "string",
        description: "New gallery name",
      },
      description: {
        type: "string",
        description: "New gallery description",
      },
      price: {
        type: "number",
        description: "New gallery price in cents",
      },
    },
    required: ["galleryId"],
  },
};

export const updateSettings: ToolDefinition = {
  name: "update_settings",
  description: "Update organization or user settings",
  category: "update",
  requiresConfirmation: true,
  parameters: {
    type: "object",
    properties: {
      settingType: {
        type: "string",
        description: "Type of settings to update",
        enum: ["organization", "notifications", "branding"],
      },
      settings: {
        type: "string",
        description: "JSON object with settings to update",
      },
    },
    required: ["settingType", "settings"],
  },
};

// ============================================================================
// ANALYSIS TOOLS (No confirmation needed)
// ============================================================================

export const analyzeClientValue: ToolDefinition = {
  name: "analyze_client_value",
  description: "Analyze a client's value and history",
  category: "analysis",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        description: "ID of the client to analyze",
      },
    },
    required: ["clientId"],
  },
};

export const forecastRevenue: ToolDefinition = {
  name: "forecast_revenue",
  description: "Generate revenue forecast based on bookings and trends",
  category: "analysis",
  requiresConfirmation: false,
  parameters: {
    type: "object",
    properties: {
      months: {
        type: "number",
        description: "Number of months to forecast (default 3)",
      },
    },
    required: [],
  },
};

// ============================================================================
// TOOL REGISTRY
// ============================================================================

export const ALL_TOOLS: ToolDefinition[] = [
  // Read tools
  listGalleries,
  listClients,
  getRevenueSummary,
  listUpcomingBookings,
  listPendingInvoices,
  getExpenseSummary,
  searchEverything,
  getGalleryDetails,
  getClientDetails,
  // Create tools
  createGallery,
  createClient,
  createBooking,
  createInvoice,
  deliverGallery,
  // Update tools
  updateGallery,
  updateSettings,
  // Analysis tools
  analyzeClientValue,
  forecastRevenue,
];

export const READ_TOOLS = ALL_TOOLS.filter((t) => t.category === "read");
export const CREATE_TOOLS = ALL_TOOLS.filter((t) => t.category === "create");
export const UPDATE_TOOLS = ALL_TOOLS.filter((t) => t.category === "update");
export const ANALYSIS_TOOLS = ALL_TOOLS.filter((t) => t.category === "analysis");

export function getToolByName(name: string): ToolDefinition | undefined {
  return ALL_TOOLS.find((t) => t.name === name);
}

export function formatToolsForClaude() {
  return ALL_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters,
  }));
}
