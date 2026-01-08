/**
 * AI Document Extraction Service
 *
 * Uses Claude Vision API to extract structured data from tax documents.
 * Supports receipts, invoices, 1099s, and other tax-related documents.
 */

import type { ExpenseCategory, TaxDocumentType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface ExtractedDocumentData {
  // Common fields for all document types
  vendor?: string;
  amount?: number;
  date?: string;
  description?: string;

  // Categorization
  category?: ExpenseCategory;
  taxDeductible?: boolean;
  confidence?: number; // 0-1 confidence score

  // Additional extracted fields
  paymentMethod?: string;
  taxAmount?: number;
  subtotal?: number;
  receiptNumber?: string;
  address?: string;
  phone?: string;

  // 1099-specific fields
  form1099?: {
    payerName?: string;
    payerTIN?: string;
    recipientName?: string;
    recipientTIN?: string;
    totalCompensation?: number;
    federalTaxWithheld?: number;
    stateTaxWithheld?: number;
  };
}

export interface DocumentExtractionResult {
  success: boolean;
  data?: ExtractedDocumentData;
  error?: string;
  rawResponse?: string;
}

// ============================================================================
// EXTRACTION PROMPTS
// ============================================================================

const EXTRACTION_SYSTEM_PROMPT = `You are an expert document analyzer specializing in tax-related documents for photographers and small businesses. Your job is to extract structured data from receipts, invoices, 1099 forms, and other business documents.

You must respond with a valid JSON object containing the extracted data. Do not include any text outside the JSON.

Guidelines:
- Extract amounts as numbers (e.g., 125.50 not "$125.50")
- Format dates as YYYY-MM-DD
- Be conservative with tax deductibility assessments
- Provide a confidence score (0-1) based on document clarity
- For partial data, include what you can extract
- Categories must be one of: labor, travel, equipment, software, materials, marketing, fees, insurance, other`;

const getExtractionPrompt = (documentType: TaxDocumentType): string => {
  switch (documentType) {
    case "receipt":
      return `Extract the following from this receipt image:
- vendor: Business name
- amount: Total amount paid
- date: Transaction date
- description: Brief description of what was purchased
- category: Best expense category (labor, travel, equipment, software, materials, marketing, fees, insurance, other)
- taxDeductible: Whether this appears to be a business expense (true/false)
- paymentMethod: How it was paid (cash, credit card, etc.)
- taxAmount: Sales tax amount if shown
- subtotal: Pre-tax amount if shown
- receiptNumber: Receipt or transaction number
- address: Store/vendor address
- phone: Store/vendor phone

Respond with a JSON object containing these fields.`;

    case "invoice":
      return `Extract the following from this invoice image:
- vendor: Business/person who sent the invoice
- amount: Total amount due
- date: Invoice date
- description: Services/products described
- category: Best expense category
- taxDeductible: Whether this appears to be a business expense
- receiptNumber: Invoice number
- address: Vendor address
- phone: Vendor phone

Respond with a JSON object containing these fields.`;

    case "form_1099":
      return `Extract the following from this 1099 form image:
- form1099.payerName: Payer's name
- form1099.payerTIN: Payer's TIN/EIN
- form1099.recipientName: Recipient's name
- form1099.recipientTIN: Recipient's TIN/SSN (partially masked is fine)
- form1099.totalCompensation: Total compensation/payments
- form1099.federalTaxWithheld: Federal tax withheld
- form1099.stateTaxWithheld: State tax withheld
- date: Tax year
- amount: Total compensation

Respond with a JSON object containing these fields.`;

    case "bank_statement":
      return `Extract business-relevant transactions from this bank statement:
- date: Statement period
- description: Summary of business transactions
- amount: Total of business-related transactions if identifiable

Note: Bank statements contain sensitive data. Focus only on business expense totals.
Respond with a JSON object.`;

    case "mileage_log":
      return `Extract from this mileage log:
- date: Date or date range
- description: Trip purposes
- amount: Total miles if calculable
- category: Should be "travel"

Respond with a JSON object.`;

    default:
      return `Extract any relevant business expense information from this document:
- vendor: Source/issuer
- amount: Amount
- date: Date
- description: What this document relates to
- category: Best expense category
- taxDeductible: Whether this appears business-related

Respond with a JSON object.`;
  }
};

// ============================================================================
// ANTHROPIC API INTEGRATION
// ============================================================================

interface AnthropicMessage {
  role: "user" | "assistant";
  content:
    | string
    | Array<{
        type: "text" | "image";
        text?: string;
        source?: {
          type: "base64";
          media_type: string;
          data: string;
        };
      }>;
}

interface AnthropicResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call the Anthropic API with vision capability
 */
async function callAnthropicVision(
  imageBase64: string,
  mediaType: string,
  prompt: string
): Promise<{ success: boolean; text?: string; error?: string; tokens?: { input: number; output: number } }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "ANTHROPIC_API_KEY is not configured",
    };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: EXTRACTION_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ] as AnthropicMessage[],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = (await response.json()) as AnthropicResponse;
    const textContent = data.content.find((c) => c.type === "text");

    return {
      success: true,
      text: textContent?.text || "",
      tokens: data.usage
        ? { input: data.usage.input_tokens, output: data.usage.output_tokens }
        : undefined,
    };
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// DOCUMENT EXTRACTION
// ============================================================================

/**
 * Extract data from a document image using Claude Vision
 */
export async function extractDocumentData(
  imageBase64: string,
  mediaType: string,
  documentType: TaxDocumentType
): Promise<DocumentExtractionResult> {
  const prompt = getExtractionPrompt(documentType);

  const result = await callAnthropicVision(imageBase64, mediaType, prompt);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  try {
    // Parse the JSON response
    const text = result.text || "";

    // Try to extract JSON from the response (handles cases where there's extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: "No valid JSON found in response",
        rawResponse: text,
      };
    }

    const data = JSON.parse(jsonMatch[0]) as ExtractedDocumentData;

    // Add default confidence if not provided
    if (data.confidence === undefined) {
      data.confidence = 0.8;
    }

    return {
      success: true,
      data,
      rawResponse: text,
    };
  } catch (parseError) {
    console.error("Error parsing extraction result:", parseError);
    return {
      success: false,
      error: "Failed to parse extraction result",
      rawResponse: result.text,
    };
  }
}

/**
 * Extract document data from a URL (fetches and processes)
 */
export async function extractDocumentFromUrl(
  imageUrl: string,
  documentType: TaxDocumentType
): Promise<DocumentExtractionResult> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch image: ${response.status}`,
      };
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return extractDocumentData(base64, contentType, documentType);
  } catch (error) {
    console.error("Error extracting document from URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// CATEGORY MAPPING
// ============================================================================

/**
 * Map extracted description to expense category using AI suggestions
 */
export function suggestCategory(
  description: string,
  vendor?: string
): ExpenseCategory {
  const text = `${description} ${vendor || ""}`.toLowerCase();

  // Simple keyword-based categorization as fallback
  if (
    text.includes("gas") ||
    text.includes("fuel") ||
    text.includes("parking") ||
    text.includes("uber") ||
    text.includes("lyft") ||
    text.includes("mileage") ||
    text.includes("airline") ||
    text.includes("hotel")
  ) {
    return "travel";
  }

  if (
    text.includes("camera") ||
    text.includes("lens") ||
    text.includes("tripod") ||
    text.includes("lighting") ||
    text.includes("drone") ||
    text.includes("memory card") ||
    text.includes("sd card")
  ) {
    return "equipment";
  }

  if (
    text.includes("adobe") ||
    text.includes("lightroom") ||
    text.includes("photoshop") ||
    text.includes("subscription") ||
    text.includes("software")
  ) {
    return "software";
  }

  if (
    text.includes("contractor") ||
    text.includes("assistant") ||
    text.includes("editor") ||
    text.includes("second shooter")
  ) {
    return "labor";
  }

  if (
    text.includes("facebook") ||
    text.includes("instagram") ||
    text.includes("google ads") ||
    text.includes("advertising") ||
    text.includes("marketing")
  ) {
    return "marketing";
  }

  if (
    text.includes("insurance") ||
    text.includes("liability")
  ) {
    return "insurance";
  }

  if (
    text.includes("stripe") ||
    text.includes("paypal") ||
    text.includes("transaction fee") ||
    text.includes("processing fee")
  ) {
    return "fees";
  }

  return "other";
}
