import type { SMSTemplateType } from "@prisma/client";

/**
 * Template variable definitions for each SMS template type
 */
export const templateVariables: Record<SMSTemplateType, string[]> = {
  booking_confirmation: [
    "clientName",
    "bookingDate",
    "bookingTime",
    "serviceName",
    "locationAddress",
    "photographerName",
    "photographerPhone",
    "companyName",
  ],
  booking_reminder: [
    "clientName",
    "bookingDate",
    "bookingTime",
    "serviceName",
    "locationAddress",
    "photographerName",
    "photographerPhone",
    "companyName",
  ],
  photographer_en_route: [
    "clientName",
    "photographerName",
    "etaMinutes",
    "trackingLink",
    "companyName",
  ],
  photographer_arrived: [
    "clientName",
    "photographerName",
    "locationAddress",
    "companyName",
  ],
  gallery_ready: [
    "clientName",
    "galleryName",
    "galleryLink",
    "photoCount",
    "companyName",
  ],
  invoice_sent: [
    "clientName",
    "invoiceNumber",
    "invoiceAmount",
    "dueDate",
    "paymentLink",
    "companyName",
  ],
  payment_received: [
    "clientName",
    "invoiceNumber",
    "paymentAmount",
    "receiptLink",
    "companyName",
  ],
  custom: [], // Custom templates can use any variables
};

/**
 * Default SMS templates for each type
 */
export const defaultTemplates: Record<SMSTemplateType, { name: string; content: string }> = {
  booking_confirmation: {
    name: "Booking Confirmation",
    content: `Hi {{clientName}}! Your session is confirmed for {{bookingDate}} at {{bookingTime}}. Address: {{locationAddress}}. Reply with questions. - {{companyName}}`,
  },
  booking_reminder: {
    name: "Booking Reminder",
    content: `Reminder: Your photo session is tomorrow at {{bookingTime}}! Address: {{locationAddress}}. See you soon! - {{companyName}}`,
  },
  photographer_en_route: {
    name: "Photographer En Route",
    content: `{{photographerName}} is on the way! ETA: {{etaMinutes}} min. Track live: {{trackingLink}} - {{companyName}}`,
  },
  photographer_arrived: {
    name: "Photographer Arrived",
    content: `{{photographerName}} has arrived at the property and is ready to begin. - {{companyName}}`,
  },
  gallery_ready: {
    name: "Gallery Ready",
    content: `Great news! Your {{photoCount}} photos are ready! View your gallery: {{galleryLink}} - {{companyName}}`,
  },
  invoice_sent: {
    name: "Invoice Sent",
    content: `Invoice #{{invoiceNumber}} for {{invoiceAmount}} has been sent. Due: {{dueDate}}. Pay here: {{paymentLink}} - {{companyName}}`,
  },
  payment_received: {
    name: "Payment Received",
    content: `Thank you! We received your payment of {{paymentAmount}} for invoice #{{invoiceNumber}}. Receipt: {{receiptLink}} - {{companyName}}`,
  },
  custom: {
    name: "Custom Message",
    content: "",
  },
};

/**
 * Interpolate variables in a template string
 * Variables are in the format {{variableName}}
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

/**
 * Extract variable names from a template string
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];

  return [...new Set(matches.map((m) => m.slice(2, -2)))];
}

/**
 * Validate that all required variables are provided
 */
export function validateTemplateVariables(
  template: string,
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  const required = extractVariables(template);
  const missing = required.filter((v) => !variables[v]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Character count helper (SMS is 160 chars for standard, 70 for unicode)
 */
export function getSMSCharacterInfo(message: string): {
  length: number;
  segments: number;
  hasUnicode: boolean;
} {
  // Check for unicode characters
  const hasUnicode = /[^\x00-\x7F]/.test(message);

  const segmentSize = hasUnicode ? 70 : 160;
  const segments = Math.ceil(message.length / segmentSize);

  return {
    length: message.length,
    segments,
    hasUnicode,
  };
}
