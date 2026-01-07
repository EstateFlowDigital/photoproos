import type { ClientPreferences } from "@/lib/types/client-preferences";

export interface ClientData {
  id: string;
  fullName: string | null;
  email: string;
  company: string | null;
  phone: string | null;
  preferences?: ClientPreferences | null;
}

export interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lotSize: string | null;
  yearBuilt: number | null;
  status: string;
  template: string;
  viewCount: number;
  leadCount: number;
  photoCount: number;
  slug: string;
  createdAt: Date;
  thumbnailUrl: string | null;
}

export interface GalleryData {
  id: string;
  name: string;
  photoCount: number;
  status: string;
  downloadable: boolean;
  deliveredAt: Date | null;
  expiresAt: Date | null;
  serviceName: string | null;
  photos: {
    id: string;
    url: string;
    thumbnailUrl: string | null;
    filename: string;
    assetId?: string;
  }[];
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface QuestionnaireData {
  id: string;
  templateId: string;
  templateName: string;
  templateDescription: string | null;
  industry: string;
  status: string;
  isRequired: boolean;
  dueDate: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  bookingTitle: string | null;
  bookingDate: Date | null;
  responseCount: number;
}

export interface PortalStatsData {
  totalProperties: number;
  totalViews: number;
  totalLeads: number;
  totalPhotos: number;
  pendingQuestionnaires: number;
  newLeads: number;
}

export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: "new" | "contacted" | "qualified" | "closed";
  temperature: "hot" | "warm" | "cold";
  score: number;
  propertyAddress: string;
  propertyId: string;
  pageViews: number;
  photoViews: number;
  tourClicks: number;
  totalTimeSeconds: number;
  createdAt: Date;
  lastActivityAt: Date | null;
}

export type PortalTab = "properties" | "galleries" | "downloads" | "invoices" | "leads" | "questionnaires" | "messages" | "settings";

export interface NotificationPreferences {
  galleryDelivered: boolean;
  invoiceSent: boolean;
  invoiceReminder: boolean;
  paymentConfirmed: boolean;
  questionnaireAssigned: boolean;
  marketingUpdates: boolean;
}
