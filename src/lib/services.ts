// Photography service types and pricing

export interface ServiceType {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number; // in cents
  estimatedDuration: string;
  deliverables: string[];
}

export type ServiceCategory =
  | "real_estate"
  | "portrait"
  | "event"
  | "commercial"
  | "wedding"
  | "product"
  | "other";

export const serviceCategories: Record<ServiceCategory, { label: string; color: string }> = {
  real_estate: { label: "Real Estate", color: "bg-blue-500/10 text-blue-400" },
  portrait: { label: "Portrait", color: "bg-purple-500/10 text-purple-400" },
  event: { label: "Event", color: "bg-orange-500/10 text-orange-400" },
  commercial: { label: "Commercial", color: "bg-green-500/10 text-green-400" },
  wedding: { label: "Wedding", color: "bg-pink-500/10 text-pink-400" },
  product: { label: "Product", color: "bg-cyan-500/10 text-cyan-400" },
  other: { label: "Other", color: "bg-gray-500/10 text-gray-400" },
};

export const photographyServices: ServiceType[] = [
  // Real Estate Services
  {
    id: "re-standard",
    name: "Standard Real Estate",
    category: "real_estate",
    description: "Professional interior and exterior photography for residential listings",
    basePrice: 25000, // $250
    estimatedDuration: "1-2 hours",
    deliverables: ["25-35 edited photos", "24-hour turnaround", "MLS-ready images"],
  },
  {
    id: "re-luxury",
    name: "Luxury Property",
    category: "real_estate",
    description: "Premium photography package for high-end and luxury properties",
    basePrice: 45000, // $450
    estimatedDuration: "2-3 hours",
    deliverables: ["40-60 edited photos", "Twilight shots", "Drone aerials", "Virtual tour"],
  },
  {
    id: "re-aerial",
    name: "Aerial/Drone Only",
    category: "real_estate",
    description: "Drone photography and video for property showcasing",
    basePrice: 20000, // $200
    estimatedDuration: "30-60 min",
    deliverables: ["10-15 aerial photos", "1 aerial video", "FAA compliant"],
  },
  {
    id: "re-virtual-tour",
    name: "3D Virtual Tour",
    category: "real_estate",
    description: "Interactive 3D virtual tour with Matterport or equivalent",
    basePrice: 35000, // $350
    estimatedDuration: "1-2 hours",
    deliverables: ["Full 3D walkthrough", "Dollhouse view", "Floor plan", "Shareable link"],
  },

  // Portrait Services
  {
    id: "portrait-headshot",
    name: "Professional Headshot",
    category: "portrait",
    description: "Business headshots for professionals, LinkedIn, or corporate use",
    basePrice: 15000, // $150
    estimatedDuration: "30-45 min",
    deliverables: ["3-5 retouched images", "Multiple backgrounds", "Digital delivery"],
  },
  {
    id: "portrait-team",
    name: "Team Headshots",
    category: "portrait",
    description: "Consistent headshots for corporate teams and organizations",
    basePrice: 50000, // $500 (up to 10 people)
    estimatedDuration: "2-3 hours",
    deliverables: ["1-2 images per person", "Consistent styling", "Web & print ready"],
  },
  {
    id: "portrait-personal",
    name: "Personal Branding",
    category: "portrait",
    description: "Lifestyle portraits for entrepreneurs, authors, and personal brands",
    basePrice: 35000, // $350
    estimatedDuration: "1-2 hours",
    deliverables: ["15-20 edited images", "Multiple outfits/locations", "Social media crops"],
  },
  {
    id: "portrait-family",
    name: "Family Portrait",
    category: "portrait",
    description: "Family or group portrait session at location of choice",
    basePrice: 30000, // $300
    estimatedDuration: "1 hour",
    deliverables: ["20-30 edited images", "Group & individual shots", "Online gallery"],
  },

  // Event Services
  {
    id: "event-corporate",
    name: "Corporate Event",
    category: "event",
    description: "Coverage for conferences, meetings, and corporate gatherings",
    basePrice: 75000, // $750
    estimatedDuration: "4 hours",
    deliverables: ["100+ edited images", "Same-day preview", "Candid & staged shots"],
  },
  {
    id: "event-party",
    name: "Party/Celebration",
    category: "event",
    description: "Birthday parties, anniversaries, and private celebrations",
    basePrice: 40000, // $400
    estimatedDuration: "2-3 hours",
    deliverables: ["75+ edited images", "Group photos", "Candid coverage"],
  },
  {
    id: "event-conference",
    name: "Conference Coverage",
    category: "event",
    description: "Full-day conference or seminar photography",
    basePrice: 120000, // $1,200
    estimatedDuration: "Full day (8 hours)",
    deliverables: ["200+ edited images", "Speaker photos", "Attendee coverage", "Branding shots"],
  },

  // Commercial Services
  {
    id: "commercial-architecture",
    name: "Architectural Photography",
    category: "commercial",
    description: "Professional photography for architects and designers",
    basePrice: 80000, // $800
    estimatedDuration: "3-4 hours",
    deliverables: ["30-40 edited images", "Exterior & interior", "Detail shots", "Twilight option"],
  },
  {
    id: "commercial-restaurant",
    name: "Restaurant/Hospitality",
    category: "commercial",
    description: "Interior, exterior, and food photography for restaurants",
    basePrice: 60000, // $600
    estimatedDuration: "2-3 hours",
    deliverables: ["40+ edited images", "Ambiance shots", "Menu-ready food photos"],
  },
  {
    id: "commercial-construction",
    name: "Construction Progress",
    category: "commercial",
    description: "Document construction projects with regular photo updates",
    basePrice: 30000, // $300 per visit
    estimatedDuration: "1-2 hours",
    deliverables: ["25+ photos per visit", "Before/during/after", "Aerial option"],
  },

  // Wedding Services
  {
    id: "wedding-engagement",
    name: "Engagement Session",
    category: "wedding",
    description: "Pre-wedding engagement photography session",
    basePrice: 40000, // $400
    estimatedDuration: "1-2 hours",
    deliverables: ["40-60 edited images", "Multiple locations", "Online gallery"],
  },
  {
    id: "wedding-elopement",
    name: "Elopement Package",
    category: "wedding",
    description: "Intimate elopement or small ceremony coverage",
    basePrice: 150000, // $1,500
    estimatedDuration: "4 hours",
    deliverables: ["150+ edited images", "Ceremony & portraits", "Online gallery"],
  },
  {
    id: "wedding-full",
    name: "Full Wedding Coverage",
    category: "wedding",
    description: "Complete wedding day photography coverage",
    basePrice: 350000, // $3,500
    estimatedDuration: "8-10 hours",
    deliverables: ["500+ edited images", "Getting ready to send-off", "Second shooter", "Online gallery"],
  },

  // Product Services
  {
    id: "product-ecommerce",
    name: "E-commerce Product",
    category: "product",
    description: "Clean product photography for online stores",
    basePrice: 5000, // $50 per product
    estimatedDuration: "Varies",
    deliverables: ["3-5 angles per product", "White background", "Web-optimized"],
  },
  {
    id: "product-lifestyle",
    name: "Lifestyle Product",
    category: "product",
    description: "Styled product photography with props and environments",
    basePrice: 15000, // $150 per product
    estimatedDuration: "Varies",
    deliverables: ["5-8 styled shots", "Multiple setups", "Social media ready"],
  },
  {
    id: "product-food",
    name: "Food Photography",
    category: "product",
    description: "Professional food and beverage photography",
    basePrice: 50000, // $500
    estimatedDuration: "2-3 hours",
    deliverables: ["15-20 dishes", "Styled presentation", "Menu-ready images"],
  },
];

// Get services by category
export function getServicesByCategory(category: ServiceCategory): ServiceType[] {
  return photographyServices.filter(service => service.category === category);
}

// Get service by ID
export function getServiceById(id: string): ServiceType | undefined {
  return photographyServices.find(service => service.id === id);
}

// Format price from cents to display string
export function formatServicePrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Group services by category
export function getGroupedServices(): Record<ServiceCategory, ServiceType[]> {
  return photographyServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<ServiceCategory, ServiceType[]>);
}
