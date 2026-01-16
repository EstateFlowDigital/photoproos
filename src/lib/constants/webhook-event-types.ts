/**
 * Available webhook event types
 * Separated from server actions because "use server" files can only export async functions
 */
export const WEBHOOK_EVENT_TYPES = [
  // Gallery events
  { id: "gallery_created", label: "Gallery Created", category: "Gallery" },
  { id: "gallery_delivered", label: "Gallery Delivered", category: "Gallery" },
  { id: "gallery_viewed", label: "Gallery Viewed", category: "Gallery" },
  { id: "gallery_paid", label: "Gallery Paid", category: "Gallery" },
  // Booking events
  { id: "booking_created", label: "Booking Created", category: "Booking" },
  { id: "booking_confirmed", label: "Booking Confirmed", category: "Booking" },
  { id: "booking_cancelled", label: "Booking Cancelled", category: "Booking" },
  { id: "booking_completed", label: "Booking Completed", category: "Booking" },
  // Invoice events
  { id: "invoice_created", label: "Invoice Created", category: "Invoice" },
  { id: "invoice_sent", label: "Invoice Sent", category: "Invoice" },
  { id: "invoice_paid", label: "Invoice Paid", category: "Invoice" },
  { id: "invoice_overdue", label: "Invoice Overdue", category: "Invoice" },
  // Payment events
  { id: "payment_received", label: "Payment Received", category: "Payment" },
  { id: "payment_failed", label: "Payment Failed", category: "Payment" },
  { id: "payment_refunded", label: "Payment Refunded", category: "Payment" },
  // Client events
  { id: "client_created", label: "Client Created", category: "Client" },
  { id: "client_updated", label: "Client Updated", category: "Client" },
  // Contract events
  { id: "contract_sent", label: "Contract Sent", category: "Contract" },
  { id: "contract_signed", label: "Contract Signed", category: "Contract" },
  // Project events
  { id: "project_created", label: "Project Created", category: "Project" },
  { id: "project_completed", label: "Project Completed", category: "Project" },
] as const;

export type WebhookEventId = (typeof WEBHOOK_EVENT_TYPES)[number]["id"];
