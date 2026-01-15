/**
 * Industry-specific sample data for mockups
 *
 * This data auto-switches when the industry is changed,
 * providing realistic sample content for each vertical.
 */

import type { IndustryId } from "@/components/mockups/types";

export interface IndustrySampleData {
  businessName: string;
  clientName: string;
  contactName: string;
  contactEmail: string;
  galleryName: string;
  galleryDescription: string;
  propertyAddress?: string;
  invoiceTitle: string;
  services: string[];
  metrics: {
    monthlyRevenue: number;
    activeGalleries: number;
    clients: number;
    pendingPayments: number;
  };
  samplePhotos: string[];
  recentActivity: {
    action: string;
    detail: string;
    time: string;
    highlight?: boolean;
  }[];
}

export const industryData: Record<IndustryId, IndustrySampleData> = {
  real_estate: {
    businessName: "Luxury Home Media",
    clientName: "Premier Realty Group",
    contactName: "Sarah Mitchell",
    contactEmail: "sarah@premierrealty.com",
    galleryName: "Modern Estate - Twilight Shoot",
    galleryDescription: "Professional twilight photography of 5-bedroom luxury home",
    propertyAddress: "1234 Ocean View Drive, Malibu CA",
    invoiceTitle: "Real Estate Photography Package",
    services: [
      "HDR Photography",
      "Drone Aerials",
      "Virtual Tour",
      "Floor Plans",
      "Twilight Photos",
    ],
    metrics: {
      monthlyRevenue: 18500,
      activeGalleries: 24,
      clients: 45,
      pendingPayments: 3200,
    },
    samplePhotos: [
      "/mockup-assets/real-estate/exterior-1.jpg",
      "/mockup-assets/real-estate/interior-1.jpg",
      "/mockup-assets/real-estate/aerial-1.jpg",
    ],
    recentActivity: [
      {
        action: "Payment received",
        detail: "Premier Realty Group paid $850",
        time: "2 min ago",
        highlight: true,
      },
      {
        action: "Gallery delivered",
        detail: "Ocean View Drive property",
        time: "1 hour ago",
      },
      {
        action: "New booking",
        detail: "Sunset Hills listing - Tomorrow",
        time: "3 hours ago",
      },
    ],
  },
  commercial: {
    businessName: "Vision Commercial Studios",
    clientName: "Tech Innovations Corp",
    contactName: "Michael Chen",
    contactEmail: "m.chen@techinnovations.com",
    galleryName: "Corporate Headshots - Q1 2026",
    galleryDescription: "Executive team headshots and office environment photos",
    invoiceTitle: "Commercial Photography Services",
    services: [
      "Team Headshots",
      "Office Interiors",
      "Product Photography",
      "Event Coverage",
      "Lifestyle Shots",
    ],
    metrics: {
      monthlyRevenue: 24000,
      activeGalleries: 18,
      clients: 32,
      pendingPayments: 4500,
    },
    samplePhotos: [
      "/mockup-assets/commercial/headshot-1.jpg",
      "/mockup-assets/commercial/office-1.jpg",
      "/mockup-assets/commercial/product-1.jpg",
    ],
    recentActivity: [
      {
        action: "Contract signed",
        detail: "Tech Innovations Corp - Annual retainer",
        time: "5 min ago",
        highlight: true,
      },
      {
        action: "Gallery approved",
        detail: "Marketing team headshots",
        time: "2 hours ago",
      },
      {
        action: "Invoice sent",
        detail: "$3,200 to Startup Labs",
        time: "4 hours ago",
      },
    ],
  },
  events: {
    businessName: "Moments Wedding Photography",
    clientName: "The Johnson Family",
    contactName: "Emily & David Johnson",
    contactEmail: "emily.johnson@email.com",
    galleryName: "Johnson Wedding - Spring 2026",
    galleryDescription: "Beautiful spring wedding at Rosewood Gardens",
    invoiceTitle: "Wedding Photography Package",
    services: [
      "Full Day Coverage",
      "Engagement Session",
      "Wedding Album",
      "Photo Booth",
      "Second Shooter",
    ],
    metrics: {
      monthlyRevenue: 12000,
      activeGalleries: 8,
      clients: 24,
      pendingPayments: 2800,
    },
    samplePhotos: [
      "/mockup-assets/events/wedding-1.jpg",
      "/mockup-assets/events/ceremony-1.jpg",
      "/mockup-assets/events/reception-1.jpg",
    ],
    recentActivity: [
      {
        action: "Final payment",
        detail: "Johnson Wedding - $2,400",
        time: "10 min ago",
        highlight: true,
      },
      {
        action: "Album approved",
        detail: "Martinez Wedding album ready to print",
        time: "1 hour ago",
      },
      {
        action: "New inquiry",
        detail: "Fall 2026 wedding consultation",
        time: "5 hours ago",
      },
    ],
  },
  portraits: {
    businessName: "Capture Portrait Studio",
    clientName: "The Anderson Family",
    contactName: "Jennifer Anderson",
    contactEmail: "jen.anderson@email.com",
    galleryName: "Anderson Family Portraits - Fall",
    galleryDescription: "Annual family portrait session at sunset park",
    invoiceTitle: "Portrait Photography Session",
    services: [
      "Family Portraits",
      "Senior Photos",
      "Headshots",
      "Mini Sessions",
      "Pet Photography",
    ],
    metrics: {
      monthlyRevenue: 8500,
      activeGalleries: 35,
      clients: 120,
      pendingPayments: 1200,
    },
    samplePhotos: [
      "/mockup-assets/portraits/family-1.jpg",
      "/mockup-assets/portraits/senior-1.jpg",
      "/mockup-assets/portraits/child-1.jpg",
    ],
    recentActivity: [
      {
        action: "Session booked",
        detail: "Mini session - Saturday 2PM",
        time: "Just now",
        highlight: true,
      },
      {
        action: "Gallery viewed",
        detail: "Thompson Senior Photos - 42 views",
        time: "30 min ago",
      },
      {
        action: "Photos favorited",
        detail: "Anderson selected 12 favorites",
        time: "2 hours ago",
      },
    ],
  },
  food: {
    businessName: "Culinary Lens Photography",
    clientName: "The Grand Kitchen",
    contactName: "Chef Marcus Williams",
    contactEmail: "marcus@thegrandkitchen.com",
    galleryName: "Spring Menu Collection",
    galleryDescription: "New seasonal menu photography for print and social",
    invoiceTitle: "Food Photography Package",
    services: [
      "Menu Photography",
      "Restaurant Interiors",
      "Chef Portraits",
      "Social Media Content",
      "Recipe Videos",
    ],
    metrics: {
      monthlyRevenue: 15000,
      activeGalleries: 12,
      clients: 28,
      pendingPayments: 2100,
    },
    samplePhotos: [
      "/mockup-assets/food/dish-1.jpg",
      "/mockup-assets/food/restaurant-1.jpg",
      "/mockup-assets/food/ingredients-1.jpg",
    ],
    recentActivity: [
      {
        action: "License purchased",
        detail: "The Grand Kitchen - 5 images extended",
        time: "15 min ago",
        highlight: true,
      },
      {
        action: "Shoot completed",
        detail: "Bistro Moderne - 85 photos delivered",
        time: "4 hours ago",
      },
      {
        action: "New client",
        detail: "Artisan Bakery added",
        time: "Yesterday",
      },
    ],
  },
  product: {
    businessName: "Studio Product Media",
    clientName: "Artisan Goods Co",
    contactName: "Lisa Park",
    contactEmail: "lisa@artisangoods.com",
    galleryName: "Holiday Collection 2026",
    galleryDescription: "Product photography for holiday catalog and e-commerce",
    invoiceTitle: "Product Photography Package",
    services: [
      "Product Photography",
      "Lifestyle Shots",
      "360° Spins",
      "E-commerce Ready",
      "Packaging Shots",
    ],
    metrics: {
      monthlyRevenue: 22000,
      activeGalleries: 15,
      clients: 18,
      pendingPayments: 5600,
    },
    samplePhotos: [
      "/mockup-assets/product/product-1.jpg",
      "/mockup-assets/product/lifestyle-1.jpg",
      "/mockup-assets/product/packaging-1.jpg",
    ],
    recentActivity: [
      {
        action: "Batch delivered",
        detail: "150 SKUs processed for Artisan Goods",
        time: "1 hour ago",
        highlight: true,
      },
      {
        action: "Revision complete",
        detail: "Color correction for jewelry line",
        time: "3 hours ago",
      },
      {
        action: "Quote accepted",
        detail: "Tech Gadgets Inc - $4,800",
        time: "Yesterday",
      },
    ],
  },
};

/**
 * Get sample data for a specific industry
 */
export function getIndustryData(industry: IndustryId): IndustrySampleData {
  return industryData[industry];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get a formatted revenue string
 */
export function getFormattedRevenue(industry: IndustryId): string {
  return formatCurrency(industryData[industry].metrics.monthlyRevenue);
}
