// Standard acquisition sources for client tracking
// Separated from server actions to avoid "use server" export restrictions

export const ACQUISITION_SOURCES = {
  REFERRAL: "REFERRAL",
  ORGANIC: "ORGANIC",
  GOOGLE_ADS: "GOOGLE_ADS",
  FACEBOOK_ADS: "FACEBOOK_ADS",
  INSTAGRAM_ADS: "INSTAGRAM_ADS",
  SOCIAL_ORGANIC: "SOCIAL_ORGANIC",
  DIRECTORY: "DIRECTORY",
  REPEAT: "REPEAT",
  PORTFOLIO: "PORTFOLIO",
  BOOKING_FORM: "BOOKING_FORM",
  ORDER_PAGE: "ORDER_PAGE",
  OTHER: "OTHER",
} as const;

export type AcquisitionSource = keyof typeof ACQUISITION_SOURCES;

export interface AcquisitionStats {
  source: string;
  clientCount: number;
  totalRevenue: number;
  averageRevenue: number;
  conversionRate: number;
  repeatRate: number;
}

export interface AcquisitionOverview {
  totalClients: number;
  totalRevenue: number;
  bySource: AcquisitionStats[];
  topSources: { source: string; count: number }[];
  monthlyTrend: { month: string; clients: number; revenue: number }[];
  conversionFunnel: {
    leads: number;
    contacted: number;
    booked: number;
    completed: number;
    repeat: number;
  };
}
