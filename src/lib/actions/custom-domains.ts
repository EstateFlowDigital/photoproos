"use server";

/**
 * Custom Domain Management
 *
 * Handles CNAME verification and custom domain setup for property websites.
 */

import { ok, fail, type VoidActionResult } from "@/lib/types/action-result";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import dns from "dns";
import { promisify } from "util";

const resolveCname = promisify(dns.resolveCname);

// The CNAME target that users should point their domains to
const CNAME_TARGET = process.env.CNAME_TARGET || "cname.photoproos.com";

interface DomainStatus {
  domain: string;
  isVerified: boolean;
  sslStatus: "pending" | "active" | "failed";
  cnameTarget: string;
  lastChecked: Date | null;
  errorMessage: string | null;
}

/**
 * Connect a custom domain to a property website
 */
export async function connectCustomDomain(
  propertyWebsiteId: string,
  domain: string
): Promise<{ success: boolean; cnameTarget?: string; error?: string }> {
  try {
    // Validate domain format
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return fail("Invalid domain format");
    }

    // Normalize domain (lowercase, no trailing dots)
    const normalizedDomain = domain.toLowerCase().replace(/\.$/, "");

    // Check if domain is already in use
    const existingDomain = await prisma.propertyWebsite.findFirst({
      where: {
        customDomain: normalizedDomain,
        id: { not: propertyWebsiteId },
      },
    });

    if (existingDomain) {
      return fail("This domain is already connected to another property");
    }

    // Get the property website
    const website = await prisma.propertyWebsite.findUnique({
      where: { id: propertyWebsiteId },
    });

    if (!website) {
      return fail("Property website not found");
    }

    // Update with the new domain
    await prisma.propertyWebsite.update({
      where: { id: propertyWebsiteId },
      data: {
        customDomain: normalizedDomain,
        customDomainVerified: false,
        customDomainSsl: false,
      },
    });

    revalidatePath(`/properties/${propertyWebsiteId}`);

    return {
      success: true,
      cnameTarget: CNAME_TARGET,
    };
  } catch (error) {
    console.error("Error connecting custom domain:", error);
    return fail("Failed to connect domain");
  }
}

/**
 * Verify a custom domain's CNAME record
 */
export async function verifyCustomDomain(
  propertyWebsiteId: string
): Promise<{ success: boolean; isVerified?: boolean; error?: string }> {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { id: propertyWebsiteId },
      select: {
        id: true,
        customDomain: true,
        customDomainVerified: true,
      },
    });

    if (!website) {
      return fail("Property website not found");
    }

    if (!website.customDomain) {
      return fail("No custom domain configured");
    }

    // Already verified
    if (website.customDomainVerified) {
      return { success: true, isVerified: true };
    }

    // Check DNS CNAME record
    try {
      const records = await resolveCname(website.customDomain);
      const isPointingCorrectly = records.some(
        (record) => record.toLowerCase() === CNAME_TARGET.toLowerCase()
      );

      if (isPointingCorrectly) {
        // Mark as verified
        await prisma.propertyWebsite.update({
          where: { id: propertyWebsiteId },
          data: {
            customDomainVerified: true,
            customDomainSsl: true, // In production, this would trigger SSL provisioning
          },
        });

        revalidatePath(`/properties/${propertyWebsiteId}`);

        return { success: true, isVerified: true };
      } else {
        return {
          success: true,
          isVerified: false,
        };
      }
    } catch (dnsError) {
      // DNS lookup failed - domain not configured yet
      return { success: true, isVerified: false };
    }
  } catch (error) {
    console.error("Error verifying custom domain:", error);
    return fail("Failed to verify domain");
  }
}

/**
 * Get custom domain status
 */
export async function getCustomDomainStatus(
  propertyWebsiteId: string
): Promise<{ success: boolean; status?: DomainStatus; error?: string }> {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { id: propertyWebsiteId },
      select: {
        customDomain: true,
        customDomainVerified: true,
        customDomainSsl: true,
      },
    });

    if (!website) {
      return fail("Property website not found");
    }

    if (!website.customDomain) {
      return { success: true, status: undefined };
    }

    return {
      success: true,
      status: {
        domain: website.customDomain,
        isVerified: website.customDomainVerified,
        sslStatus: website.customDomainSsl ? "active" : website.customDomainVerified ? "pending" : "pending",
        cnameTarget: CNAME_TARGET,
        lastChecked: new Date(),
        errorMessage: null,
      },
    };
  } catch (error) {
    console.error("Error getting domain status:", error);
    return fail("Failed to get domain status");
  }
}

/**
 * Disconnect a custom domain
 */
export async function disconnectCustomDomain(
  propertyWebsiteId: string
): Promise<VoidActionResult> {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { id: propertyWebsiteId },
    });

    if (!website) {
      return fail("Property website not found");
    }

    await prisma.propertyWebsite.update({
      where: { id: propertyWebsiteId },
      data: {
        customDomain: null,
        customDomainVerified: false,
        customDomainSsl: false,
      },
    });

    revalidatePath(`/properties/${propertyWebsiteId}`);

    return ok();
  } catch (error) {
    console.error("Error disconnecting custom domain:", error);
    return fail("Failed to disconnect domain");
  }
}

/**
 * Check domain availability (for purchased domains feature)
 */
export async function checkDomainAvailability(
  domain: string
): Promise<{ success: boolean; available?: boolean; price?: number; error?: string }> {
  // This would integrate with Cloudflare Registrar API in production
  // For now, return a mock response
  return {
    success: true,
    available: true,
    price: 1499, // $14.99 in cents
  };
}

/**
 * Get the CNAME target for DNS configuration instructions
 */
export async function getCnameTarget(): Promise<string> {
  return CNAME_TARGET;
}
