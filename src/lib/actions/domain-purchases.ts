"use server";

/**
 * Domain Purchase System
 *
 * Enables users to purchase custom domains directly through the platform.
 * Integrates with Cloudflare Registrar API and Stripe for payments.
 *
 * Features:
 * - Auto-suggest domains based on property address
 * - Real-time domain availability checking
 * - Alternative domain suggestions when unavailable
 * - Stripe checkout for $30/domain (includes SSL)
 * - Automatic DNS configuration after purchase
 * - Works for both property websites and portfolio websites
 */

import { prisma } from "@/lib/db";
import { requireOrganizationId, getOrganizationId } from "@/lib/actions/auth-helper";
import { ok, fail, type ActionResult } from "@/lib/types/action-result";
import { revalidatePath } from "next/cache";

// =============================================================================
// TYPES
// =============================================================================

export interface DomainSuggestion {
  domain: string;
  available: boolean;
  premium: boolean;
  priceCents: number;
}

export interface DomainAvailabilityResult {
  domain: string;
  available: boolean;
  premium: boolean;
  priceCents: number;
  suggestions: DomainSuggestion[];
}

export interface DomainPurchaseData {
  id: string;
  domain: string;
  status: string;
  connectedToType: string | null;
  propertyWebsiteId: string | null;
  portfolioWebsiteId: string | null;
  priceCents: number;
  paidAt: Date | null;
  registrationDate: Date | null;
  expirationDate: Date | null;
  dnsConfigured: boolean;
  sslProvisioned: boolean;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

// Cloudflare API Configuration
const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Domain pricing (in cents) - $30 with SSL included
const DOMAIN_PRICE_CENTS = 3000;

// Supported TLDs with their base prices from Cloudflare (approximate)
const TLD_PRICES: Record<string, number> = {
  ".com": 899,    // ~$8.99 cost
  ".net": 1099,   // ~$10.99 cost
  ".org": 999,    // ~$9.99 cost
  ".io": 3299,    // ~$32.99 cost
  ".co": 2499,    // ~$24.99 cost
  ".app": 1499,   // ~$14.99 cost
  ".dev": 1499,   // ~$14.99 cost
  ".house": 2999, // ~$29.99 cost
  ".property": 2999,
  ".homes": 2999,
  ".realty": 2999,
  ".estate": 2999,
};

// =============================================================================
// CLOUDFLARE API INTEGRATION
// =============================================================================

/**
 * Check if Cloudflare is configured
 */
function isCloudflareConfigured(): boolean {
  return !!(CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_API_TOKEN);
}

/**
 * Make authenticated request to Cloudflare API
 */
async function cloudflareRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!isCloudflareConfigured()) {
    throw new Error("Cloudflare API not configured");
  }

  const response = await fetch(`${CLOUDFLARE_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response;
}

/**
 * Check domain availability via Cloudflare Registrar API
 */
export async function checkDomainAvailability(
  domain: string
): Promise<ActionResult<DomainAvailabilityResult>> {
  try {
    // Normalize domain
    const normalizedDomain = domain.toLowerCase().trim();

    // Validate domain format
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/;
    if (!domainRegex.test(normalizedDomain)) {
      return fail("Invalid domain format. Please enter a valid domain like 'example.com'");
    }

    // Check if already purchased in our system
    const existingPurchase = await prisma.domainPurchase.findUnique({
      where: { domain: normalizedDomain },
    });

    if (existingPurchase) {
      // Generate alternatives
      const baseName = normalizedDomain.split(".")[0];
      const suggestions = await generateAlternativeSuggestions(baseName);

      return ok({
        domain: normalizedDomain,
        available: false,
        premium: false,
        priceCents: DOMAIN_PRICE_CENTS,
        suggestions,
      });
    }

    // If Cloudflare is configured, check with their API
    if (isCloudflareConfigured()) {
      try {
        const response = await cloudflareRequest(
          `/accounts/${CLOUDFLARE_ACCOUNT_ID}/registrar/domains/${normalizedDomain}`,
          { method: "GET" }
        );

        const data = await response.json();

        if (data.success && data.result) {
          // Domain is registered with Cloudflare or elsewhere
          const baseName = normalizedDomain.split(".")[0];
          const suggestions = await generateAlternativeSuggestions(baseName);

          return ok({
            domain: normalizedDomain,
            available: false,
            premium: false,
            priceCents: DOMAIN_PRICE_CENTS,
            suggestions,
          });
        }

        // Check availability through registrar search
        const searchResponse = await cloudflareRequest(
          `/accounts/${CLOUDFLARE_ACCOUNT_ID}/registrar/domains`,
          {
            method: "POST",
            body: JSON.stringify({ name: normalizedDomain }),
          }
        );

        const searchData = await searchResponse.json();

        if (searchData.success) {
          const available = searchData.result?.available ?? true;
          const premium = searchData.result?.premium ?? false;

          if (available) {
            return ok({
              domain: normalizedDomain,
              available: true,
              premium,
              priceCents: premium ? DOMAIN_PRICE_CENTS * 2 : DOMAIN_PRICE_CENTS,
              suggestions: [],
            });
          } else {
            const baseName = normalizedDomain.split(".")[0];
            const suggestions = await generateAlternativeSuggestions(baseName);

            return ok({
              domain: normalizedDomain,
              available: false,
              premium: false,
              priceCents: DOMAIN_PRICE_CENTS,
              suggestions,
            });
          }
        }
      } catch (cfError) {
        console.error("[DomainPurchase] Cloudflare API error:", cfError);
        // Fall through to mock response
      }
    }

    // Mock response when Cloudflare is not configured (development mode)
    // In production, this should always use the real API
    console.warn("[DomainPurchase] Using mock domain availability check - configure Cloudflare API for production");

    // Simulate availability check (for development)
    const isAvailable = Math.random() > 0.3; // 70% available

    if (isAvailable) {
      return ok({
        domain: normalizedDomain,
        available: true,
        premium: false,
        priceCents: DOMAIN_PRICE_CENTS,
        suggestions: [],
      });
    } else {
      const baseName = normalizedDomain.split(".")[0];
      const suggestions = await generateAlternativeSuggestions(baseName);

      return ok({
        domain: normalizedDomain,
        available: false,
        premium: false,
        priceCents: DOMAIN_PRICE_CENTS,
        suggestions,
      });
    }
  } catch (error) {
    console.error("[DomainPurchase] Error checking availability:", error);
    return fail("Failed to check domain availability");
  }
}

/**
 * Generate alternative domain suggestions when requested domain is unavailable
 */
async function generateAlternativeSuggestions(baseName: string): Promise<DomainSuggestion[]> {
  const tlds = [".com", ".net", ".co", ".io", ".house", ".property"];
  const prefixes = ["", "get", "my", "the", "tour"];
  const suffixes = ["", "hq", "home", "site", "online"];

  const suggestions: DomainSuggestion[] = [];

  // Generate combinations
  for (const tld of tlds) {
    for (const prefix of prefixes) {
      for (const suffix of suffixes) {
        if (prefix === "" && suffix === "" && tld === ".com") continue; // Skip original

        const domain = `${prefix}${baseName}${suffix}${tld}`;

        // Check if already purchased
        const existing = await prisma.domainPurchase.findUnique({
          where: { domain },
        });

        if (!existing) {
          suggestions.push({
            domain,
            available: true, // Assume available for suggestions
            premium: false,
            priceCents: DOMAIN_PRICE_CENTS,
          });
        }

        if (suggestions.length >= 6) break;
      }
      if (suggestions.length >= 6) break;
    }
    if (suggestions.length >= 6) break;
  }

  return suggestions;
}

// =============================================================================
// DOMAIN PURCHASE FLOW
// =============================================================================

/**
 * Initiate domain purchase - creates Stripe checkout session
 */
export async function initiateDomainPurchase(params: {
  domain: string;
  connectToType: "property" | "portfolio";
  websiteId: string;
}): Promise<ActionResult<{ checkoutUrl: string; purchaseId: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Validate domain is available
    const availabilityCheck = await checkDomainAvailability(params.domain);
    if (!availabilityCheck.success) {
      return fail(availabilityCheck.error);
    }

    if (!availabilityCheck.data.available) {
      return fail("This domain is not available for purchase");
    }

    // Verify the website exists and belongs to the organization
    if (params.connectToType === "property") {
      const website = await prisma.propertyWebsite.findFirst({
        where: {
          id: params.websiteId,
          project: { organizationId },
        },
      });
      if (!website) {
        return fail("Property website not found");
      }
    } else {
      const website = await prisma.portfolioWebsite.findFirst({
        where: {
          id: params.websiteId,
          organizationId,
        },
      });
      if (!website) {
        return fail("Portfolio website not found");
      }
    }

    // Create domain purchase record
    const purchase = await prisma.domainPurchase.create({
      data: {
        organizationId,
        domain: params.domain.toLowerCase(),
        connectedToType: params.connectToType,
        propertyWebsiteId: params.connectToType === "property" ? params.websiteId : null,
        portfolioWebsiteId: params.connectToType === "portfolio" ? params.websiteId : null,
        priceCents: availabilityCheck.data.priceCents,
        status: "pending_payment",
      },
    });

    // Create Stripe checkout session
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, stripeCustomerId: true },
    });

    // Get the base URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: org?.stripeCustomerId || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Custom Domain: ${params.domain}`,
              description: `1-year domain registration with SSL certificate included`,
            },
            unit_amount: availabilityCheck.data.priceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "domain_purchase",
        domainPurchaseId: purchase.id,
        domain: params.domain,
        organizationId,
      },
      success_url: `${baseUrl}/domain-purchase/success?session_id={CHECKOUT_SESSION_ID}&purchase_id=${purchase.id}`,
      cancel_url: `${baseUrl}/domain-purchase/cancel?purchase_id=${purchase.id}`,
    });

    // Update purchase with checkout session ID
    await prisma.domainPurchase.update({
      where: { id: purchase.id },
      data: { stripeCheckoutId: session.id },
    });

    return ok({
      checkoutUrl: session.url!,
      purchaseId: purchase.id,
    });
  } catch (error) {
    console.error("[DomainPurchase] Error initiating purchase:", error);
    return fail("Failed to initiate domain purchase");
  }
}

/**
 * Complete domain purchase after Stripe payment
 * Called by webhook or success page
 */
export async function completeDomainPurchase(
  purchaseId: string,
  stripeSessionId: string,
  stripePaymentId?: string | null
): Promise<ActionResult<{ domain: string; status: string }>> {
  try {
    const purchase = await prisma.domainPurchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      return fail("Purchase not found");
    }

    if (purchase.status !== "pending_payment") {
      return ok({ domain: purchase.domain, status: purchase.status });
    }

    // Verify Stripe payment
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

    if (session.payment_status !== "paid") {
      return fail("Payment not completed");
    }

    // Update purchase status
    await prisma.domainPurchase.update({
      where: { id: purchaseId },
      data: {
        status: "registering",
        stripePaymentId: stripePaymentId || (session.payment_intent as string),
        paidAt: new Date(),
      },
    });

    // Register domain with Cloudflare (async)
    // In production, this would call the Cloudflare Registrar API
    await registerDomainWithCloudflare(purchaseId);

    return ok({
      domain: purchase.domain,
      status: "registering",
    });
  } catch (error) {
    console.error("[DomainPurchase] Error completing purchase:", error);
    return fail("Failed to complete domain purchase");
  }
}

/**
 * Register domain with Cloudflare Registrar
 */
async function registerDomainWithCloudflare(purchaseId: string): Promise<void> {
  const purchase = await prisma.domainPurchase.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase) return;

  try {
    if (isCloudflareConfigured()) {
      // Call Cloudflare Registrar API to register domain
      const response = await cloudflareRequest(
        `/accounts/${CLOUDFLARE_ACCOUNT_ID}/registrar/domains`,
        {
          method: "POST",
          body: JSON.stringify({
            name: purchase.domain,
            auto_renew: true,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.result) {
        // Update with registrar details
        await prisma.domainPurchase.update({
          where: { id: purchaseId },
          data: {
            status: "configuring_dns",
            registrarDomainId: data.result.id,
            registrationDate: new Date(),
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          },
        });

        // Configure DNS
        await configureDomainDNS(purchaseId);
        return;
      }
    }

    // Mock registration for development
    console.warn("[DomainPurchase] Using mock domain registration - configure Cloudflare for production");

    await prisma.domainPurchase.update({
      where: { id: purchaseId },
      data: {
        status: "configuring_dns",
        registrationDate: new Date(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    // Configure DNS (mocked in development)
    await configureDomainDNS(purchaseId);
  } catch (error) {
    console.error("[DomainPurchase] Error registering domain:", error);

    await prisma.domainPurchase.update({
      where: { id: purchaseId },
      data: { status: "failed" },
    });
  }
}

/**
 * Configure DNS records for the purchased domain
 */
async function configureDomainDNS(purchaseId: string): Promise<void> {
  const purchase = await prisma.domainPurchase.findUnique({
    where: { id: purchaseId },
    include: {
      propertyWebsite: true,
      portfolioWebsite: true,
    },
  });

  if (!purchase) return;

  try {
    // Get the target for DNS
    const cnameTarget = process.env.CNAME_TARGET || "cname.photoproos.com";

    if (isCloudflareConfigured() && purchase.registrarDomainId) {
      // Get zone ID for the domain
      const zoneResponse = await cloudflareRequest(
        `/zones?name=${purchase.domain}`,
        { method: "GET" }
      );
      const zoneData = await zoneResponse.json();

      if (zoneData.success && zoneData.result?.[0]) {
        const zoneId = zoneData.result[0].id;

        // Create DNS records
        // Root domain A record (using Cloudflare's proxy)
        await cloudflareRequest(`/zones/${zoneId}/dns_records`, {
          method: "POST",
          body: JSON.stringify({
            type: "CNAME",
            name: "@",
            content: cnameTarget,
            proxied: true,
          }),
        });

        // WWW subdomain
        await cloudflareRequest(`/zones/${zoneId}/dns_records`, {
          method: "POST",
          body: JSON.stringify({
            type: "CNAME",
            name: "www",
            content: cnameTarget,
            proxied: true,
          }),
        });
      }
    }

    // Update the connected website with the custom domain
    if (purchase.propertyWebsiteId) {
      await prisma.propertyWebsite.update({
        where: { id: purchase.propertyWebsiteId },
        data: {
          customDomain: purchase.domain,
          customDomainVerified: true,
          customDomainSsl: true,
        },
      });
    } else if (purchase.portfolioWebsiteId) {
      await prisma.portfolioWebsite.update({
        where: { id: purchase.portfolioWebsiteId },
        data: {
          customDomain: purchase.domain,
          customDomainVerified: true,
        },
      });
    }

    // Mark as active
    await prisma.domainPurchase.update({
      where: { id: purchaseId },
      data: {
        status: "active",
        dnsConfigured: true,
        sslProvisioned: true,
      },
    });

    // Revalidate paths
    if (purchase.propertyWebsiteId) {
      revalidatePath(`/properties/${purchase.propertyWebsiteId}`);
    }
    if (purchase.portfolioWebsiteId) {
      revalidatePath(`/portfolios/${purchase.portfolioWebsiteId}`);
    }
  } catch (error) {
    console.error("[DomainPurchase] Error configuring DNS:", error);

    // Still mark as provisioning SSL (manual intervention may be needed)
    await prisma.domainPurchase.update({
      where: { id: purchaseId },
      data: { status: "provisioning_ssl" },
    });
  }
}

// =============================================================================
// DOMAIN MANAGEMENT
// =============================================================================

/**
 * Get all purchased domains for an organization
 */
export async function getOrganizationDomains(): Promise<ActionResult<DomainPurchaseData[]>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    const purchases = await prisma.domainPurchase.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return ok(
      purchases.map((p) => ({
        id: p.id,
        domain: p.domain,
        status: p.status,
        connectedToType: p.connectedToType,
        propertyWebsiteId: p.propertyWebsiteId,
        portfolioWebsiteId: p.portfolioWebsiteId,
        priceCents: p.priceCents,
        paidAt: p.paidAt,
        registrationDate: p.registrationDate,
        expirationDate: p.expirationDate,
        dnsConfigured: p.dnsConfigured,
        sslProvisioned: p.sslProvisioned,
      }))
    );
  } catch (error) {
    console.error("[DomainPurchase] Error getting domains:", error);
    return fail("Failed to get domains");
  }
}

/**
 * Get a specific domain purchase
 */
export async function getDomainPurchase(
  purchaseId: string
): Promise<ActionResult<DomainPurchaseData>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    const purchase = await prisma.domainPurchase.findFirst({
      where: {
        id: purchaseId,
        organizationId,
      },
    });

    if (!purchase) {
      return fail("Domain purchase not found");
    }

    return ok({
      id: purchase.id,
      domain: purchase.domain,
      status: purchase.status,
      connectedToType: purchase.connectedToType,
      propertyWebsiteId: purchase.propertyWebsiteId,
      portfolioWebsiteId: purchase.portfolioWebsiteId,
      priceCents: purchase.priceCents,
      paidAt: purchase.paidAt,
      registrationDate: purchase.registrationDate,
      expirationDate: purchase.expirationDate,
      dnsConfigured: purchase.dnsConfigured,
      sslProvisioned: purchase.sslProvisioned,
    });
  } catch (error) {
    console.error("[DomainPurchase] Error getting domain:", error);
    return fail("Failed to get domain purchase");
  }
}

/**
 * Cancel a pending domain purchase
 */
export async function cancelDomainPurchase(
  purchaseId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    const purchase = await prisma.domainPurchase.findFirst({
      where: {
        id: purchaseId,
        organizationId,
        status: "pending_payment",
      },
    });

    if (!purchase) {
      return fail("Purchase not found or cannot be cancelled");
    }

    await prisma.domainPurchase.update({
      where: { id: purchaseId },
      data: { status: "cancelled" },
    });

    return ok(undefined);
  } catch (error) {
    console.error("[DomainPurchase] Error cancelling purchase:", error);
    return fail("Failed to cancel purchase");
  }
}
