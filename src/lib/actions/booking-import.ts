"use server";

/**
 * Booking Import Actions
 *
 * Handles bulk import of bookings from CSV files.
 * Supports validation, preview, and batch import.
 */

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { BookingStatus } from "@prisma/client";
import type { ActionResult } from "@/lib/types/action-result";

// CSV row structure for booking import
interface CSVBookingRow {
  title: string; // Required
  clientEmail?: string; // Email to match existing client
  clientName?: string; // Name for new or unmatched client
  clientPhone?: string;
  serviceName?: string; // Service name to match
  startDate: string; // Required: YYYY-MM-DD or MM/DD/YYYY
  startTime: string; // Required: HH:MM or HH:MM AM/PM
  endDate?: string; // Defaults to startDate
  endTime?: string; // Required: HH:MM or HH:MM AM/PM
  location?: string;
  status?: string; // pending, confirmed, completed, cancelled
  notes?: string;
  description?: string;
}

interface ImportValidationResult {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: CSVBookingRow;
  matchedClientId?: string;
  matchedServiceId?: string;
}

interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningRows: number;
  validationResults: ImportValidationResult[];
}

interface ImportResult {
  imported: number;
  failed: number;
  errors: { row: number; error: string }[];
}

// =============================================================================
// CSV Parsing
// =============================================================================

function parseCSV(csvContent: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        currentRow.push(currentField.trim());
        if (currentRow.some((field) => field !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
        if (char === "\r") i++; // Skip \n in \r\n
      } else if (char !== "\r") {
        currentField += char;
      }
    }
  }

  // Handle last row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Header mapping for flexibility
const HEADER_MAPPINGS: Record<string, keyof CSVBookingRow> = {
  title: "title",
  name: "title",
  booking_title: "title",
  bookingtitle: "title",
  event: "title",
  event_name: "title",
  client_email: "clientEmail",
  clientemail: "clientEmail",
  email: "clientEmail",
  client_name: "clientName",
  clientname: "clientName",
  client: "clientName",
  customer: "clientName",
  customer_name: "clientName",
  client_phone: "clientPhone",
  clientphone: "clientPhone",
  phone: "clientPhone",
  service: "serviceName",
  service_name: "serviceName",
  servicename: "serviceName",
  type: "serviceName",
  booking_type: "serviceName",
  start_date: "startDate",
  startdate: "startDate",
  date: "startDate",
  start_time: "startTime",
  starttime: "startTime",
  time: "startTime",
  end_date: "endDate",
  enddate: "endDate",
  end_time: "endTime",
  endtime: "endTime",
  location: "location",
  address: "location",
  venue: "location",
  status: "status",
  booking_status: "status",
  notes: "notes",
  note: "notes",
  comments: "notes",
  description: "description",
  details: "description",
};

function mapHeaders(headers: string[]): Map<number, keyof CSVBookingRow> {
  const mapping = new Map<number, keyof CSVBookingRow>();

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim().replace(/\s+/g, "_");
    const mappedField = HEADER_MAPPINGS[normalized];
    if (mappedField) {
      mapping.set(index, mappedField);
    }
  });

  return mapping;
}

// =============================================================================
// Date/Time Parsing
// =============================================================================

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Try MM/DD/YYYY or M/D/YYYY
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Try DD/MM/YYYY
  const euMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return null;
}

function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;

  // Try HH:MM (24-hour)
  const time24Match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (time24Match) {
    const [, hours, minutes] = time24Match;
    return { hours: parseInt(hours), minutes: parseInt(minutes) };
  }

  // Try HH:MM AM/PM
  const time12Match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (time12Match) {
    const [, hours, minutes, period] = time12Match;
    let h = parseInt(hours);
    if (period.toUpperCase() === "PM" && h !== 12) h += 12;
    if (period.toUpperCase() === "AM" && h === 12) h = 0;
    return { hours: h, minutes: parseInt(minutes) };
  }

  return null;
}

function combineDateAndTime(
  date: Date,
  time: { hours: number; minutes: number }
): Date {
  const combined = new Date(date);
  combined.setHours(time.hours, time.minutes, 0, 0);
  return combined;
}

// =============================================================================
// Validation
// =============================================================================

const VALID_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

async function validateRow(
  row: CSVBookingRow,
  rowNumber: number,
  organizationId: string,
  existingClients: Map<string, string>,
  existingServices: Map<string, string>
): Promise<ImportValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let matchedClientId: string | undefined;
  let matchedServiceId: string | undefined;

  // Required: title
  if (!row.title) {
    errors.push("Title is required");
  }

  // Required: startDate
  if (!row.startDate) {
    errors.push("Start date is required");
  } else {
    const parsedDate = parseDate(row.startDate);
    if (!parsedDate) {
      errors.push(
        `Invalid start date format: "${row.startDate}". Use YYYY-MM-DD or MM/DD/YYYY`
      );
    }
  }

  // Required: startTime
  if (!row.startTime) {
    errors.push("Start time is required");
  } else {
    const parsedTime = parseTime(row.startTime);
    if (!parsedTime) {
      errors.push(
        `Invalid start time format: "${row.startTime}". Use HH:MM or HH:MM AM/PM`
      );
    }
  }

  // Required: endTime (or calculate default duration)
  if (!row.endTime) {
    warnings.push("No end time specified. Will default to 1 hour after start.");
  } else {
    const parsedTime = parseTime(row.endTime);
    if (!parsedTime) {
      errors.push(
        `Invalid end time format: "${row.endTime}". Use HH:MM or HH:MM AM/PM`
      );
    }
  }

  // Optional: status validation
  if (row.status) {
    const normalizedStatus = row.status.toLowerCase().trim();
    if (!VALID_STATUSES.includes(normalizedStatus as BookingStatus)) {
      warnings.push(
        `Invalid status "${row.status}". Will default to "pending". Valid: ${VALID_STATUSES.join(", ")}`
      );
    }
  }

  // Optional: client matching
  if (row.clientEmail) {
    const normalizedEmail = row.clientEmail.toLowerCase().trim();
    if (existingClients.has(normalizedEmail)) {
      matchedClientId = existingClients.get(normalizedEmail);
    } else {
      warnings.push(
        `Client with email "${row.clientEmail}" not found. Booking will be created without client link.`
      );
    }
  }

  // Optional: service matching
  if (row.serviceName) {
    const normalizedService = row.serviceName.toLowerCase().trim();
    if (existingServices.has(normalizedService)) {
      matchedServiceId = existingServices.get(normalizedService);
    } else {
      warnings.push(
        `Service "${row.serviceName}" not found. Booking will be created without service link.`
      );
    }
  }

  return {
    rowNumber,
    isValid: errors.length === 0,
    errors,
    warnings,
    data: row,
    matchedClientId,
    matchedServiceId,
  };
}

// =============================================================================
// Public Actions
// =============================================================================

/**
 * Preview a booking import from CSV data
 */
export async function previewBookingImport(
  csvContent: string
): Promise<ActionResult<ImportPreview>> {
  try {
    const organizationId = await requireOrganizationId();

    const rows = parseCSV(csvContent);
    if (rows.length < 2) {
      return { success: false, error: "CSV must have headers and at least one data row" };
    }

    const headers = rows[0];
    const headerMapping = mapHeaders(headers);

    if (!headerMapping.size) {
      return {
        success: false,
        error: "Could not recognize any valid headers. Expected: title, startDate, startTime, endTime",
      };
    }

    // Check for required headers
    const mappedFields = new Set(headerMapping.values());
    if (!mappedFields.has("title")) {
      return { success: false, error: "Missing required header: title (or name, event)" };
    }
    if (!mappedFields.has("startDate")) {
      return { success: false, error: "Missing required header: startDate (or date)" };
    }
    if (!mappedFields.has("startTime")) {
      return { success: false, error: "Missing required header: startTime (or time)" };
    }

    // Load existing clients and services for matching
    const [clients, services] = await Promise.all([
      prisma.client.findMany({
        where: { organizationId },
        select: { id: true, email: true },
      }),
      prisma.service.findMany({
        where: { organizationId },
        select: { id: true, name: true },
      }),
    ]);

    const existingClients = new Map(
      clients.map((c) => [c.email.toLowerCase(), c.id])
    );
    const existingServices = new Map(
      services.map((s) => [s.name.toLowerCase(), s.id])
    );

    // Parse and validate data rows
    const validationResults: ImportValidationResult[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const bookingData: CSVBookingRow = {
        title: "",
        startDate: "",
        startTime: "",
      };

      headerMapping.forEach((field, index) => {
        if (row[index] !== undefined) {
          (bookingData as unknown as Record<string, string>)[field] = row[index];
        }
      });

      const result = await validateRow(
        bookingData,
        i + 1,
        organizationId,
        existingClients,
        existingServices
      );
      validationResults.push(result);
    }

    const validRows = validationResults.filter((r) => r.isValid).length;
    const invalidRows = validationResults.filter((r) => !r.isValid).length;
    const warningRows = validationResults.filter(
      (r) => r.isValid && r.warnings.length > 0
    ).length;

    return {
      success: true,
      data: {
        totalRows: validationResults.length,
        validRows,
        invalidRows,
        warningRows,
        validationResults,
      },
    };
  } catch (error) {
    console.error("[BookingImport] Preview error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to preview import" };
  }
}

/**
 * Execute the booking import
 */
export async function importBookings(
  csvContent: string,
  options?: {
    skipInvalid?: boolean; // Skip invalid rows instead of failing
    defaultDurationMinutes?: number; // Default duration if no end time (default: 60)
  }
): Promise<ActionResult<ImportResult>> {
  try {
    const organizationId = await requireOrganizationId();
    const defaultDuration = options?.defaultDurationMinutes || 60;

    // First, run the preview to get validation results
    const previewResult = await previewBookingImport(csvContent);
    if (!previewResult.success) {
      return { success: false, error: previewResult.error };
    }

    const { validationResults } = previewResult.data;

    // Check for invalid rows
    const invalidRows = validationResults.filter((r) => !r.isValid);
    if (invalidRows.length > 0 && !options?.skipInvalid) {
      return {
        success: false,
        error: `${invalidRows.length} row(s) have validation errors. Fix them or enable "Skip Invalid Rows".`,
      };
    }

    // Import valid rows
    const validRows = validationResults.filter((r) => r.isValid);
    const importErrors: { row: number; error: string }[] = [];
    let imported = 0;

    for (const result of validRows) {
      try {
        const { data, matchedClientId, matchedServiceId } = result;

        // Parse dates and times
        const startDate = parseDate(data.startDate)!;
        const startTime = parseTime(data.startTime)!;
        const startDateTime = combineDateAndTime(startDate, startTime);

        let endDateTime: Date;
        if (data.endTime) {
          const endDate = data.endDate ? parseDate(data.endDate)! : startDate;
          const endTime = parseTime(data.endTime)!;
          endDateTime = combineDateAndTime(endDate, endTime);
        } else {
          endDateTime = new Date(startDateTime.getTime() + defaultDuration * 60000);
        }

        // Determine status
        let status: BookingStatus = "pending";
        if (data.status) {
          const normalizedStatus = data.status.toLowerCase().trim();
          if (VALID_STATUSES.includes(normalizedStatus as BookingStatus)) {
            status = normalizedStatus as BookingStatus;
          }
        }

        // Create booking
        await prisma.booking.create({
          data: {
            organizationId,
            title: data.title,
            clientId: matchedClientId || null,
            serviceId: matchedServiceId || null,
            clientName: !matchedClientId ? data.clientName : null,
            clientEmail: !matchedClientId ? data.clientEmail : null,
            clientPhone: !matchedClientId ? data.clientPhone : null,
            startTime: startDateTime,
            endTime: endDateTime,
            location: data.location || null,
            status,
            notes: data.notes || null,
            description: data.description || null,
          },
        });

        imported++;
      } catch (error) {
        console.error(`[BookingImport] Row ${result.rowNumber} error:`, error);
        importErrors.push({
          row: result.rowNumber,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        type: "booking_created",
        description: `Imported ${imported} booking(s) from CSV`,
        metadata: {
          imported,
          failed: importErrors.length,
          total: validRows.length,
        },
      },
    });

    return {
      success: true,
      data: {
        imported,
        failed: importErrors.length,
        errors: importErrors,
      },
    };
  } catch (error) {
    console.error("[BookingImport] Import error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to import bookings" };
  }
}

/**
 * Get a sample CSV template for booking imports
 */
export async function getBookingImportTemplate(): Promise<ActionResult<string>> {
  try {
    const template = `title,clientEmail,serviceName,startDate,startTime,endTime,location,status,notes
"Smith Wedding","john@example.com","Wedding Photography","2025-03-15","10:00 AM","06:00 PM","123 Venue Lane, City","confirmed","Outdoor ceremony"
"Johnson Headshots","jane@example.com","Headshots","2025-03-16","02:00 PM","03:30 PM","Studio A","pending","Corporate headshots for LinkedIn"
"Corporate Event","events@company.com","Event Photography","2025-03-20","09:00","17:00","Convention Center","confirmed","Annual company meeting"`;

    return { success: true, data: template };
  } catch (error) {
    console.error("[BookingImport] Template error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to generate template" };
  }
}
