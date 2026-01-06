import type { PropertyWebsiteTemplate, PropertySectionType } from "@prisma/client";

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

export interface PropertyTemplateColors {
  primary: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  priceBadge: string;
  priceBadgeText: string;
}

export interface PropertyTemplateConfig {
  name: string;
  description: string;
  colors: PropertyTemplateColors;
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  defaultSections: PropertySectionType[];
  isDark: boolean;
  heroStyle: "fullscreen" | "split" | "contained";
}

export const PROPERTY_TEMPLATES: Record<PropertyWebsiteTemplate, PropertyTemplateConfig> = {
  modern: {
    name: "Modern",
    description: "Clean, minimal design perfect for contemporary properties",
    colors: {
      primary: "#3b82f6",
      accent: "#0ea5e9",
      background: "#0a0a0a",
      backgroundSecondary: "#141414",
      card: "#141414",
      cardBorder: "rgba(255, 255, 255, 0.08)",
      text: "#ffffff",
      textMuted: "#a7a7a7",
      textSecondary: "#7c7c7c",
      priceBadge: "#3b82f6",
      priceBadgeText: "#ffffff",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    borderRadius: "12px",
    defaultSections: [
      "property_hero",
      "property_details",
      "property_description",
      "property_features",
      "property_gallery",
      "virtual_tour",
      "location_map",
      "agent_info",
      "inquiry_form",
    ],
    isDark: true,
    heroStyle: "fullscreen",
  },
  classic: {
    name: "Classic",
    description: "Traditional elegance for established neighborhoods",
    colors: {
      primary: "#92400e",
      accent: "#b45309",
      background: "#faf7f5",
      backgroundSecondary: "#f5f0eb",
      card: "#ffffff",
      cardBorder: "#e7e0d9",
      text: "#1c1917",
      textMuted: "#78716c",
      textSecondary: "#a8a29e",
      priceBadge: "#92400e",
      priceBadgeText: "#ffffff",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lora",
    },
    borderRadius: "4px",
    defaultSections: [
      "property_hero",
      "property_details",
      "property_description",
      "property_features",
      "property_gallery",
      "floor_plans",
      "location_map",
      "agent_info",
      "inquiry_form",
    ],
    isDark: false,
    heroStyle: "contained",
  },
  luxury: {
    name: "Luxury",
    description: "Sophisticated design for high-end properties",
    colors: {
      primary: "#d4af37",
      accent: "#b8860b",
      background: "#0f0f0f",
      backgroundSecondary: "#1a1a1a",
      card: "#1a1a1a",
      cardBorder: "rgba(212, 175, 55, 0.15)",
      text: "#f5f5f5",
      textMuted: "#9ca3af",
      textSecondary: "#6b7280",
      priceBadge: "#d4af37",
      priceBadgeText: "#0f0f0f",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lora",
    },
    borderRadius: "0px",
    defaultSections: [
      "property_hero",
      "property_details",
      "property_description",
      "property_features",
      "property_gallery",
      "virtual_tour",
      "video_tour",
      "floor_plans",
      "neighborhood",
      "agent_info",
      "inquiry_form",
    ],
    isDark: true,
    heroStyle: "fullscreen",
  },
  minimal: {
    name: "Minimal",
    description: "Clean whitespace for elegant presentation",
    colors: {
      primary: "#111111",
      accent: "#333333",
      background: "#ffffff",
      backgroundSecondary: "#f9fafb",
      card: "#ffffff",
      cardBorder: "#e5e7eb",
      text: "#111111",
      textMuted: "#6b7280",
      textSecondary: "#9ca3af",
      priceBadge: "#111111",
      priceBadgeText: "#ffffff",
    },
    fonts: {
      heading: "DM Sans",
      body: "DM Sans",
    },
    borderRadius: "8px",
    defaultSections: [
      "property_hero",
      "property_details",
      "property_description",
      "property_gallery",
      "location_map",
      "inquiry_form",
    ],
    isDark: false,
    heroStyle: "split",
  },
  commercial: {
    name: "Commercial",
    description: "Professional design for commercial and investment properties",
    colors: {
      primary: "#1e40af",
      accent: "#3b82f6",
      background: "#f8fafc",
      backgroundSecondary: "#f1f5f9",
      card: "#ffffff",
      cardBorder: "#e2e8f0",
      text: "#0f172a",
      textMuted: "#64748b",
      textSecondary: "#94a3b8",
      priceBadge: "#1e40af",
      priceBadgeText: "#ffffff",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    borderRadius: "6px",
    defaultSections: [
      "property_hero",
      "property_details",
      "property_description",
      "property_features",
      "property_gallery",
      "floor_plans",
      "location_map",
      "mortgage_calculator",
      "agent_info",
      "inquiry_form",
    ],
    isDark: false,
    heroStyle: "contained",
  },
};

// ============================================================================
// SECTION DEFINITIONS
// ============================================================================

export interface PropertySectionDefinition {
  type: PropertySectionType;
  name: string;
  description: string;
  icon: string;
  category: "property" | "location" | "contact" | "marketing" | "tools" | "freeform";
  autoFill: boolean; // Whether this section auto-fills from property data
  autoFillFields?: string[]; // Which fields it auto-fills from
  defaultConfig: Record<string, unknown>;
}

export const PROPERTY_SECTION_DEFINITIONS: PropertySectionDefinition[] = [
  // ============================================================================
  // PROPERTY SECTIONS (Auto-fill from property data)
  // ============================================================================
  {
    type: "property_hero",
    name: "Property Hero",
    description: "Full-width hero with featured images, address, and price badge",
    icon: "Home",
    category: "property",
    autoFill: true,
    autoFillFields: ["address", "city", "state", "price", "gallery images"],
    defaultConfig: {
      layout: "fullscreen", // fullscreen, split, contained
      showPrice: true,
      showBadge: true,
      badgeText: "For Sale",
      overlayOpacity: 0.4,
      ctaText: "Schedule a Tour",
      ctaLink: "#inquiry",
      showAddress: true,
      imageCount: 5, // How many images to show in hero grid
    },
  },
  {
    type: "property_details",
    name: "Property Details",
    description: "Key property stats: beds, baths, sqft, year built, lot size",
    icon: "LayoutGrid",
    category: "property",
    autoFill: true,
    autoFillFields: ["beds", "baths", "sqft", "lotSize", "yearBuilt", "propertyType"],
    defaultConfig: {
      layout: "grid", // grid, horizontal, cards
      showIcons: true,
      columns: 6,
      showLabels: true,
      items: [
        { key: "beds", label: "Bedrooms", icon: "Bed" },
        { key: "baths", label: "Bathrooms", icon: "Bath" },
        { key: "sqft", label: "Sq. Ft.", icon: "Maximize" },
        { key: "lotSize", label: "Lot Size", icon: "Trees" },
        { key: "yearBuilt", label: "Year Built", icon: "Calendar" },
        { key: "propertyType", label: "Type", icon: "Building" },
      ],
    },
  },
  {
    type: "property_features",
    name: "Property Features",
    description: "Feature highlights with icons and categories",
    icon: "ListChecks",
    category: "property",
    autoFill: true,
    autoFillFields: ["features"],
    defaultConfig: {
      layout: "grid", // grid, list, categories
      columns: 2,
      iconStyle: "circle", // circle, square, none
      showCategories: false,
      categories: [
        { name: "Interior", icon: "Sofa" },
        { name: "Exterior", icon: "Trees" },
        { name: "Utilities", icon: "Plug" },
        { name: "Community", icon: "Users" },
      ],
    },
  },
  {
    type: "property_description",
    name: "Property Description",
    description: "Full property description with rich text formatting",
    icon: "FileText",
    category: "property",
    autoFill: true,
    autoFillFields: ["description", "headline"],
    defaultConfig: {
      showTitle: true,
      title: "About This Property",
      alignment: "left",
      showReadMore: false,
      maxLength: null, // null = no limit
    },
  },
  {
    type: "property_gallery",
    name: "Photo Gallery",
    description: "Full photo gallery with lightbox and categories",
    icon: "Images",
    category: "property",
    autoFill: true,
    autoFillFields: ["gallery images"],
    defaultConfig: {
      layout: "grid", // grid, masonry, carousel
      columns: 3,
      showCaptions: false,
      enableLightbox: true,
      maxImages: null, // null = show all
      showViewAll: true,
      aspectRatio: "4:3", // 4:3, 16:9, 1:1, original
    },
  },
  {
    type: "floor_plans",
    name: "Floor Plans",
    description: "Floor plan images with labels and room dimensions",
    icon: "LayoutDashboard",
    category: "property",
    autoFill: true,
    autoFillFields: ["floorPlanUrls"],
    defaultConfig: {
      layout: "tabs", // tabs, grid, carousel
      showLabels: true,
      enableZoom: true,
      labels: ["Main Floor", "Upper Floor", "Basement"],
    },
  },
  {
    type: "virtual_tour",
    name: "Virtual Tour",
    description: "Matterport, iGuide, or other 3D tour embed",
    icon: "View",
    category: "property",
    autoFill: true,
    autoFillFields: ["virtualTourUrl"],
    defaultConfig: {
      provider: "auto", // auto, matterport, iguide, zillow, custom
      height: "600px",
      showFullscreenButton: true,
      autoStart: false,
    },
  },
  {
    type: "video_tour",
    name: "Video Tour",
    description: "Property video walkthrough",
    icon: "Video",
    category: "property",
    autoFill: true,
    autoFillFields: ["videoUrl"],
    defaultConfig: {
      autoplay: false,
      muted: true,
      loop: false,
      showControls: true,
      aspectRatio: "16:9",
    },
  },

  // ============================================================================
  // LOCATION & NEIGHBORHOOD
  // ============================================================================
  {
    type: "location_map",
    name: "Location Map",
    description: "Interactive map showing property location",
    icon: "MapPin",
    category: "location",
    autoFill: true,
    autoFillFields: ["address", "city", "state", "zipCode"],
    defaultConfig: {
      zoom: 15,
      style: "streets", // streets, satellite, hybrid
      showMarker: true,
      height: "400px",
      showDirections: true,
      showStreetView: true,
    },
  },
  {
    type: "neighborhood",
    name: "Neighborhood",
    description: "Nearby amenities, schools, and points of interest",
    icon: "Building2",
    category: "location",
    autoFill: false,
    defaultConfig: {
      categories: [
        { name: "Schools", icon: "GraduationCap", enabled: true },
        { name: "Shopping", icon: "ShoppingBag", enabled: true },
        { name: "Dining", icon: "Utensils", enabled: true },
        { name: "Parks", icon: "Trees", enabled: true },
        { name: "Transit", icon: "Bus", enabled: true },
        { name: "Healthcare", icon: "Heart", enabled: true },
      ],
      radius: 2, // miles
      showDistances: true,
      layout: "categories", // categories, map, list
    },
  },
  {
    type: "walk_score",
    name: "Walk Score",
    description: "Walk Score, Bike Score, and Transit Score display",
    icon: "Footprints",
    category: "location",
    autoFill: true,
    autoFillFields: ["address"],
    defaultConfig: {
      showWalkScore: true,
      showBikeScore: true,
      showTransitScore: true,
      layout: "horizontal", // horizontal, vertical, compact
    },
  },

  // ============================================================================
  // AGENT & CONTACT
  // ============================================================================
  {
    type: "agent_info",
    name: "Agent Info",
    description: "Agent/photographer contact card with photo and details",
    icon: "UserCircle",
    category: "contact",
    autoFill: true,
    autoFillFields: ["agentName", "agentEmail", "agentPhone", "agentPhotoUrl", "brokerageName"],
    defaultConfig: {
      layout: "card", // card, horizontal, minimal
      showPhoto: true,
      showPhone: true,
      showEmail: true,
      showSocial: true,
      showBrokerage: true,
    },
  },
  {
    type: "inquiry_form",
    name: "Inquiry Form",
    description: "Contact form for property inquiries",
    icon: "MessageSquare",
    category: "contact",
    autoFill: false,
    defaultConfig: {
      title: "Interested in This Property?",
      subtitle: "Fill out the form below and we'll be in touch",
      fields: [
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: false },
        { name: "message", label: "Message", type: "textarea", required: false },
      ],
      submitText: "Send Inquiry",
      successMessage: "Thank you! We'll be in touch soon.",
      showScheduleTour: true,
    },
  },
  {
    type: "open_house",
    name: "Open House",
    description: "Open house schedule with calendar integration",
    icon: "CalendarDays",
    category: "contact",
    autoFill: true,
    autoFillFields: ["openHouseDate", "openHouseEndDate"],
    defaultConfig: {
      showCalendarAdd: true,
      showReminder: true,
      layout: "banner", // banner, card, inline
      reminderOptions: ["1 day before", "1 hour before"],
    },
  },

  // ============================================================================
  // MARKETING & SOCIAL PROOF
  // ============================================================================
  {
    type: "testimonials",
    name: "Testimonials",
    description: "Client testimonials and reviews",
    icon: "Quote",
    category: "marketing",
    autoFill: false,
    defaultConfig: {
      title: "What Our Clients Say",
      items: [],
      layout: "cards", // cards, slider, single
      showPhotos: true,
    },
  },
  {
    type: "similar_properties",
    name: "Similar Properties",
    description: "Related property listings from the same photographer",
    icon: "Grid3x3",
    category: "marketing",
    autoFill: false,
    defaultConfig: {
      title: "Similar Properties",
      maxItems: 3,
      showPrice: true,
      showDetails: true,
      layout: "grid", // grid, carousel
    },
  },
  {
    type: "price_history",
    name: "Price History",
    description: "Property price change timeline",
    icon: "TrendingUp",
    category: "marketing",
    autoFill: false,
    defaultConfig: {
      showChart: true,
      showTable: true,
      items: [], // { date, price, event }
    },
  },

  // ============================================================================
  // FINANCIAL TOOLS
  // ============================================================================
  {
    type: "mortgage_calculator",
    name: "Mortgage Calculator",
    description: "Interactive mortgage payment calculator",
    icon: "Calculator",
    category: "tools",
    autoFill: true,
    autoFillFields: ["price"],
    defaultConfig: {
      defaultDownPayment: 20, // percent
      defaultInterestRate: 6.5, // percent
      defaultTerm: 30, // years
      showAmortization: false,
      showTaxes: true,
      showInsurance: true,
      taxRate: 1.25, // percent of home value per year
      insuranceRate: 0.5, // percent of home value per year
    },
  },

  // ============================================================================
  // FREEFORM BLOCKS
  // ============================================================================
  {
    type: "text_block",
    name: "Text Block",
    description: "Rich text content block",
    icon: "Type",
    category: "freeform",
    autoFill: false,
    defaultConfig: {
      content: "",
      alignment: "left",
      maxWidth: "prose", // prose, full, narrow
    },
  },
  {
    type: "image_block",
    name: "Image Block",
    description: "Single image with optional caption",
    icon: "Image",
    category: "freeform",
    autoFill: false,
    defaultConfig: {
      url: null,
      alt: "",
      caption: "",
      layout: "contained", // contained, full, side
      aspectRatio: "16:9",
    },
  },
  {
    type: "video_block",
    name: "Video Block",
    description: "Embedded video (YouTube, Vimeo, etc.)",
    icon: "Play",
    category: "freeform",
    autoFill: false,
    defaultConfig: {
      url: "",
      provider: "auto", // auto, youtube, vimeo, wistia
      autoplay: false,
      aspectRatio: "16:9",
    },
  },
  {
    type: "spacer",
    name: "Spacer",
    description: "Add vertical space between sections",
    icon: "Minus",
    category: "freeform",
    autoFill: false,
    defaultConfig: {
      height: 80, // pixels
      showDivider: false,
    },
  },
  {
    type: "divider",
    name: "Divider",
    description: "Horizontal divider line",
    icon: "SeparatorHorizontal",
    category: "freeform",
    autoFill: false,
    defaultConfig: {
      style: "solid", // solid, dashed, dotted, gradient
      color: null, // null = use theme color
      width: "50%", // percentage or px
    },
  },
  {
    type: "call_to_action",
    name: "Call to Action",
    description: "CTA banner with button",
    icon: "MousePointerClick",
    category: "freeform",
    autoFill: false,
    defaultConfig: {
      title: "Ready to See This Property?",
      subtitle: "Schedule a private showing today",
      buttonText: "Schedule Tour",
      buttonLink: "#inquiry",
      style: "banner", // banner, card, minimal
      backgroundStyle: "gradient", // gradient, solid, image
    },
  },
  {
    type: "custom_html",
    name: "Custom HTML",
    description: "Embed custom HTML code",
    icon: "Code",
    category: "freeform",
    autoFill: false,
    defaultConfig: {
      html: "",
      containerClass: "",
    },
  },
];

// ============================================================================
// PROPERTY TYPE LABELS
// ============================================================================

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  single_family: "Single Family",
  condo: "Condo",
  townhouse: "Townhouse",
  multi_family: "Multi-Family",
  land: "Land",
  commercial: "Commercial",
  apartment: "Apartment",
  manufactured: "Manufactured",
  other: "Other",
};

// ============================================================================
// FEATURE ICONS
// ============================================================================

export const FEATURE_ICONS: Record<string, string> = {
  // Interior
  "Air Conditioning": "Wind",
  "Central Air": "Wind",
  "Hardwood Floors": "Layers",
  "Fireplace": "Flame",
  "Walk-in Closet": "Home",
  "High Ceilings": "ArrowUpDown",
  "Open Floor Plan": "LayoutGrid",
  "Granite Counters": "Diamond",
  "Stainless Appliances": "UtensilsCrossed",
  "Washer/Dryer": "Shirt",

  // Exterior
  "Garage": "Car",
  "Pool": "Waves",
  "Deck": "Layers",
  "Patio": "Layers",
  "Fenced Yard": "Fence",
  "Sprinkler System": "Droplets",
  "Landscaped": "Trees",

  // Community
  "Gated Community": "Lock",
  "HOA": "Building2",
  "Golf Course": "Flag",
  "Tennis Court": "Circle",
  "Gym": "Dumbbell",

  // Default
  default: "Check",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPropertyTemplateConfig(template: PropertyWebsiteTemplate): PropertyTemplateConfig {
  return PROPERTY_TEMPLATES[template];
}

export function getPropertySectionDefinition(
  type: PropertySectionType
): PropertySectionDefinition | undefined {
  return PROPERTY_SECTION_DEFINITIONS.find((s) => s.type === type);
}

export function getPropertySectionsByCategory(
  category: PropertySectionDefinition["category"]
): PropertySectionDefinition[] {
  return PROPERTY_SECTION_DEFINITIONS.filter((s) => s.category === category);
}

export function getAutoFillSections(): PropertySectionDefinition[] {
  return PROPERTY_SECTION_DEFINITIONS.filter((s) => s.autoFill);
}

export function getDefaultPropertySections(template: PropertyWebsiteTemplate): PropertySectionType[] {
  return PROPERTY_TEMPLATES[template].defaultSections;
}

export function generatePropertyCSSVariables(
  template: PropertyWebsiteTemplate,
  accentOverride?: string | null,
  secondaryOverride?: string | null
): Record<string, string> {
  const config = PROPERTY_TEMPLATES[template];

  return {
    "--property-primary": accentOverride || config.colors.primary,
    "--property-accent": secondaryOverride || config.colors.accent,
    "--property-bg": config.colors.background,
    "--property-bg-secondary": config.colors.backgroundSecondary,
    "--property-card": config.colors.card,
    "--property-card-border": config.colors.cardBorder,
    "--property-text": config.colors.text,
    "--property-text-muted": config.colors.textMuted,
    "--property-text-secondary": config.colors.textSecondary,
    "--property-price-badge": config.colors.priceBadge,
    "--property-price-badge-text": config.colors.priceBadgeText,
    "--property-radius": config.borderRadius,
    "--property-font-heading": config.fonts.heading,
    "--property-font-body": config.fonts.body,
  };
}

export function getFeatureIcon(feature: string): string {
  // Check for exact match
  if (FEATURE_ICONS[feature]) {
    return FEATURE_ICONS[feature];
  }

  // Check for partial match
  const lowerFeature = feature.toLowerCase();
  for (const [key, icon] of Object.entries(FEATURE_ICONS)) {
    if (lowerFeature.includes(key.toLowerCase())) {
      return icon;
    }
  }

  return FEATURE_ICONS.default;
}

export function formatPrice(priceInCents: number | null | undefined): string {
  if (!priceInCents) return "Price on Request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCents / 100);
}

export function formatSqft(sqft: number | null | undefined): string {
  if (!sqft) return "—";
  return new Intl.NumberFormat("en-US").format(sqft);
}

export function formatBaths(baths: number | null | undefined): string {
  if (!baths) return "—";
  if (Number.isInteger(baths)) return baths.toString();
  return baths.toFixed(1);
}

// Generate section with auto-filled data from property
export function generateAutoFilledConfig(
  sectionType: PropertySectionType,
  propertyData: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    price?: number | null;
    beds?: number | null;
    baths?: number | null;
    sqft?: number | null;
    lotSize?: string | null;
    yearBuilt?: number | null;
    propertyType?: string | null;
    headline?: string | null;
    description?: string | null;
    features?: string[];
    virtualTourUrl?: string | null;
    videoUrl?: string | null;
    floorPlanUrls?: string[];
    openHouseDate?: Date | null;
    openHouseEndDate?: Date | null;
    agentName?: string | null;
    agentEmail?: string | null;
    agentPhone?: string | null;
    agentPhotoUrl?: string | null;
    brokerageName?: string | null;
    brokerageLogo?: string | null;
  }
): Record<string, unknown> {
  const definition = getPropertySectionDefinition(sectionType);
  if (!definition) return {};

  const config = { ...definition.defaultConfig };

  // Add auto-filled data based on section type
  switch (sectionType) {
    case "property_hero":
      config.address = propertyData.address;
      config.city = propertyData.city;
      config.state = propertyData.state;
      config.price = propertyData.price;
      break;

    case "property_details":
      config.beds = propertyData.beds;
      config.baths = propertyData.baths;
      config.sqft = propertyData.sqft;
      config.lotSize = propertyData.lotSize;
      config.yearBuilt = propertyData.yearBuilt;
      config.propertyType = propertyData.propertyType;
      break;

    case "property_features":
      config.features = propertyData.features || [];
      break;

    case "property_description":
      config.headline = propertyData.headline;
      config.description = propertyData.description;
      break;

    case "virtual_tour":
      config.url = propertyData.virtualTourUrl;
      break;

    case "video_tour":
      config.url = propertyData.videoUrl;
      break;

    case "floor_plans":
      config.urls = propertyData.floorPlanUrls || [];
      break;

    case "location_map":
      config.address = `${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`;
      break;

    case "open_house":
      config.startDate = propertyData.openHouseDate;
      config.endDate = propertyData.openHouseEndDate;
      break;

    case "agent_info":
      config.name = propertyData.agentName;
      config.email = propertyData.agentEmail;
      config.phone = propertyData.agentPhone;
      config.photoUrl = propertyData.agentPhotoUrl;
      config.brokerageName = propertyData.brokerageName;
      config.brokerageLogo = propertyData.brokerageLogo;
      break;

    case "mortgage_calculator":
      config.homePrice = propertyData.price;
      break;

    case "walk_score":
      config.address = `${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`;
      break;
  }

  return config;
}
