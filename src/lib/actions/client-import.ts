"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { getAuthContext } from "@/lib/auth/clerk";
import { logActivity } from "@/lib/utils/activity";
import type { ClientIndustry } from "@prisma/client";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CSVClientRow {
  email: string;
  fullName?: string;
  company?: string;
  phone?: string;
  address?: string;
  industry?: string;
  notes?: string;
  source?: string;
  isVIP?: boolean | string;
}

export interface ImportValidationResult {
  valid: boolean;
  rowNumber: number;
  data: CSVClientRow;
  errors: string[];
  warnings: string[];
}

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  newClients: number;
  validationResults: ImportValidationResult[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
  details: Array<{
    email: string;
    status: "imported" | "skipped" | "failed";
    reason?: string;
  }>;
}

const VALID_INDUSTRIES: ClientIndustry[] = [
  "real_estate",
  "commercial",
  "architecture",
  "food_hospitality",
  "events",
  "portrait",
  "wedding",
  "headshots",
  "product",
  "other",
];

/**
 * Parse CSV content into rows
 */
function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else if (char === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * Validate a single client row
 */
function validateRow(
  row: CSVClientRow,
  rowNumber: number,
  existingEmails: Set<string>
): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Email is required and must be valid
  if (!row.email) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push("Invalid email format");
  } else if (existingEmails.has(row.email.toLowerCase())) {
    warnings.push("Client with this email already exists (will be skipped)");
  }

  // Validate industry if provided
  if (row.industry) {
    const normalizedIndustry = row.industry.toLowerCase().replace(/\s+/g, "_");
    if (!VALID_INDUSTRIES.includes(normalizedIndustry as ClientIndustry)) {
      warnings.push(`Unknown industry "${row.industry}", will use "other"`);
    }
  }

  // Validate phone format (optional but if provided, basic check)
  if (row.phone) {
    const digitsOnly = row.phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      warnings.push("Phone number seems short, please verify");
    }
  }

  return {
    valid: errors.length === 0,
    rowNumber,
    data: row,
    errors,
    warnings,
  };
}

/**
 * Preview CSV import - validate without importing
 */
export async function previewClientImport(
  csvContent: string
): Promise<ActionResult<ImportPreview>> {
  try {
    const organizationId = await requireOrganizationId();

    // Parse CSV
    const rows = parseCSV(csvContent);
    if (rows.length < 2) {
      return { success: false, error: "CSV must have a header row and at least one data row" };
    }

    // Extract headers (first row)
    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const requiredHeaders = ["email"];
    const optionalHeaders = ["fullname", "full_name", "name", "company", "phone", "address", "industry", "notes", "source", "isvip", "is_vip", "vip"];

    // Check for required headers
    const emailIndex = headers.findIndex((h) => h === "email" || h === "e-mail");
    if (emailIndex === -1) {
      return { success: false, error: "CSV must have an 'email' column" };
    }

    // Map headers to indices
    const headerMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      if (h === "email" || h === "e-mail") headerMap.email = i;
      if (h === "fullname" || h === "full_name" || h === "name") headerMap.fullName = i;
      if (h === "company" || h === "organization") headerMap.company = i;
      if (h === "phone" || h === "telephone" || h === "mobile") headerMap.phone = i;
      if (h === "address" || h === "location") headerMap.address = i;
      if (h === "industry" || h === "type" || h === "category") headerMap.industry = i;
      if (h === "notes" || h === "comments") headerMap.notes = i;
      if (h === "source" || h === "lead_source" || h === "referral") headerMap.source = i;
      if (h === "isvip" || h === "is_vip" || h === "vip") headerMap.isVIP = i;
    });

    // Get existing clients for duplicate detection
    const existingClients = await prisma.client.findMany({
      where: { organizationId },
      select: { email: true },
    });
    const existingEmails = new Set(existingClients.map((c) => c.email.toLowerCase()));

    // Parse data rows
    const validationResults: ImportValidationResult[] = [];
    let validRows = 0;
    let invalidRows = 0;
    let duplicateRows = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // Skip empty rows
      if (row.every((cell) => !cell.trim())) continue;

      const clientRow: CSVClientRow = {
        email: headerMap.email !== undefined ? row[headerMap.email] || "" : "",
        fullName: headerMap.fullName !== undefined ? row[headerMap.fullName] : undefined,
        company: headerMap.company !== undefined ? row[headerMap.company] : undefined,
        phone: headerMap.phone !== undefined ? row[headerMap.phone] : undefined,
        address: headerMap.address !== undefined ? row[headerMap.address] : undefined,
        industry: headerMap.industry !== undefined ? row[headerMap.industry] : undefined,
        notes: headerMap.notes !== undefined ? row[headerMap.notes] : undefined,
        source: headerMap.source !== undefined ? row[headerMap.source] : undefined,
        isVIP: headerMap.isVIP !== undefined ? row[headerMap.isVIP] : undefined,
      };

      const result = validateRow(clientRow, i + 1, existingEmails);
      validationResults.push(result);

      if (result.valid) {
        if (result.warnings.some((w) => w.includes("already exists"))) {
          duplicateRows++;
        } else {
          validRows++;
        }
      } else {
        invalidRows++;
      }
    }

    return {
      success: true,
      data: {
        totalRows: validationResults.length,
        validRows,
        invalidRows,
        duplicateRows,
        newClients: validRows,
        validationResults,
      },
    };
  } catch (error) {
    console.error("Error previewing import:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to preview import" };
  }
}

/**
 * Import clients from validated CSV data
 */
export async function importClients(
  csvContent: string,
  options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  }
): Promise<ActionResult<ImportResult>> {
  try {
    const organizationId = await requireOrganizationId();
    const auth = await getAuthContext();

    const skipDuplicates = options?.skipDuplicates ?? true;
    const updateExisting = options?.updateExisting ?? false;

    // First, get preview to validate
    const previewResult = await previewClientImport(csvContent);
    if (!previewResult.success) {
      return { success: false, error: previewResult.error };
    }

    const { validationResults } = previewResult.data;

    // Get existing clients
    const existingClients = await prisma.client.findMany({
      where: { organizationId },
      select: { id: true, email: true },
    });
    const existingEmailMap = new Map(
      existingClients.map((c) => [c.email.toLowerCase(), c.id])
    );

    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      failed: 0,
      details: [],
    };

    for (const validation of validationResults) {
      const { data, valid, warnings } = validation;

      // Skip invalid rows
      if (!valid) {
        result.failed++;
        result.details.push({
          email: data.email || "unknown",
          status: "failed",
          reason: validation.errors.join(", "),
        });
        continue;
      }

      const normalizedEmail = data.email.toLowerCase().trim();
      const existingId = existingEmailMap.get(normalizedEmail);

      // Handle duplicates
      if (existingId) {
        if (updateExisting) {
          // Update existing client
          try {
            await prisma.client.update({
              where: { id: existingId },
              data: {
                fullName: data.fullName || undefined,
                company: data.company || undefined,
                phone: data.phone || undefined,
                address: data.address || undefined,
                industry: normalizeIndustry(data.industry),
                notes: data.notes || undefined,
                source: data.source || undefined,
                isVIP: parseBoolean(data.isVIP),
              },
            });
            result.imported++;
            result.details.push({
              email: data.email,
              status: "imported",
              reason: "Updated existing client",
            });
          } catch {
            result.failed++;
            result.details.push({
              email: data.email,
              status: "failed",
              reason: "Failed to update",
            });
          }
        } else if (skipDuplicates) {
          result.skipped++;
          result.details.push({
            email: data.email,
            status: "skipped",
            reason: "Duplicate email",
          });
        }
        continue;
      }

      // Create new client
      try {
        await prisma.client.create({
          data: {
            organizationId,
            email: data.email.trim(),
            fullName: data.fullName?.trim() || null,
            company: data.company?.trim() || null,
            phone: data.phone?.trim() || null,
            address: data.address?.trim() || null,
            industry: normalizeIndustry(data.industry),
            notes: data.notes?.trim() || null,
            source: data.source?.trim() || null,
            isVIP: parseBoolean(data.isVIP),
          },
        });
        result.imported++;
        result.details.push({
          email: data.email,
          status: "imported",
        });
      } catch {
        result.failed++;
        result.details.push({
          email: data.email,
          status: "failed",
          reason: "Failed to create",
        });
      }
    }

    // Log activity
    await logActivity({
      organizationId,
      type: "client_created",
      description: `Imported ${result.imported} clients from CSV`,
      userId: auth?.userId,
      metadata: {
        imported: result.imported,
        skipped: result.skipped,
        failed: result.failed,
      },
    });

    revalidatePath("/clients");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error importing clients:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to import clients" };
  }
}

/**
 * Get a sample CSV template
 */
export async function getImportTemplate(): Promise<string> {
  const headers = [
    "email",
    "fullName",
    "company",
    "phone",
    "address",
    "industry",
    "notes",
    "source",
    "isVIP",
  ];

  const sampleRow = [
    "john@example.com",
    "John Smith",
    "Smith Real Estate",
    "(555) 123-4567",
    "123 Main St, City, ST 12345",
    "real_estate",
    "Preferred client",
    "referral",
    "false",
  ];

  return [headers.join(","), sampleRow.join(",")].join("\n");
}

// Helper functions
function normalizeIndustry(industry?: string): ClientIndustry {
  if (!industry) return "other";
  const normalized = industry.toLowerCase().replace(/\s+/g, "_");
  if (VALID_INDUSTRIES.includes(normalized as ClientIndustry)) {
    return normalized as ClientIndustry;
  }
  return "other";
}

function parseBoolean(value?: boolean | string): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    return lower === "true" || lower === "yes" || lower === "1" || lower === "y";
  }
  return false;
}
