"use server";

import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import { fail, type ActionResult } from "@/lib/types/action-result";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getValidEmail(value?: string | null): string | null {
  if (!value) return null;
  return EMAIL_REGEX.test(value.trim()) ? value.trim() : null;
}

function formatStripeError(error: unknown): string {
  if (error && typeof error === "object") {
    const stripeError = error as { message?: string; code?: string };

    if (stripeError.code === "email_invalid") {
      return "Please provide a valid email address in your organization settings before connecting Stripe.";
    }

    if (stripeError.message) {
      if (stripeError.message.includes("platform profile")) {
        return "Stripe Connect setup is incomplete for this platform. Complete the Stripe platform profile before onboarding accounts.";
      }
      if (stripeError.message.includes("managing losses")) {
        return "Stripe Connect requires a platform profile update. Review loss management settings in Stripe and try again.";
      }
      return stripeError.message;
    }
  }

  return "Failed to create Connect account";
}

/**
 * Create a Stripe Connect account for the organization and return the onboarding link
 */
export async function createConnectAccount(): Promise<
  ActionResult<{ accountId: string; onboardingUrl: string }>
> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          where: { role: "owner" },
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    });

    if (!organization) {
      return fail("Organization not found");
    }

    // Check if already has a Connect account
    if (organization.stripeConnectAccountId) {
      // Return existing account with a new onboarding link
      const accountLink = await getStripe().accountLinks.create({
        account: organization.stripeConnectAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?success=true`,
        type: "account_onboarding",
      });

      return {
        success: true,
        data: {
          accountId: organization.stripeConnectAccountId,
          onboardingUrl: accountLink.url,
        },
      };
    }

    // Create a new Connect account
    // Note: Don't pre-fill email - Stripe will collect it during onboarding
    const ownerEmail = organization.members[0]?.user?.email || null;
    const supportEmail =
      getValidEmail(organization.publicEmail) ||
      getValidEmail(organization.emailReplyTo) ||
      getValidEmail(ownerEmail);

    const account = await getStripe().accounts.create({
      type: "express",
      country: "US",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      business_profile: {
        name: organization.name,
        support_email: supportEmail || undefined,
      },
      email: supportEmail || undefined,
      metadata: {
        organizationId,
        organizationName: organization.name,
      },
    });

    // Save the account ID to the organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeConnectAccountId: account.id,
        stripeConnectOnboarded: false,
      },
    });

    // Create the onboarding link
    const accountLink = await getStripe().accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?success=true`,
      type: "account_onboarding",
    });

    revalidatePath("/settings/payments");

    return {
      success: true,
      data: {
        accountId: account.id,
        onboardingUrl: accountLink.url,
      },
    };
  } catch (error) {
    console.error("Error creating Connect account:", error);
    return fail(formatStripeError(error));
  }
}

/**
 * Get the current Stripe Connect account status
 */
export async function getConnectAccountStatus(): Promise<
  ActionResult<{
    hasAccount: boolean;
    accountId: string | null;
    isOnboarded: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    pendingVerification: boolean;
  }>
> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return fail("Organization not found");
    }

    if (!organization.stripeConnectAccountId) {
      return {
        success: true,
        data: {
          hasAccount: false,
          accountId: null,
          isOnboarded: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          pendingVerification: false,
        },
      };
    }

    // Get the account from Stripe
    const account = await getStripe().accounts.retrieve(
      organization.stripeConnectAccountId
    );

    const isOnboarded =
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted;

    // Update the organization if onboarding status changed
    if (isOnboarded !== organization.stripeConnectOnboarded) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeConnectOnboarded: isOnboarded },
      });
    }

    return {
      success: true,
      data: {
        hasAccount: true,
        accountId: organization.stripeConnectAccountId,
        isOnboarded,
        chargesEnabled: account.charges_enabled ?? false,
        payoutsEnabled: account.payouts_enabled ?? false,
        detailsSubmitted: account.details_submitted ?? false,
        pendingVerification:
          (account.requirements?.pending_verification?.length ?? 0) > 0,
      },
    };
  } catch (error) {
    console.error("Error getting Connect account status:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get account status");
  }
}

/**
 * Create a new account link for returning to onboarding
 */
export async function createAccountLink(): Promise<
  ActionResult<{ url: string }>
> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization?.stripeConnectAccountId) {
      return fail("No Connect account found");
    }

    const accountLink = await getStripe().accountLinks.create({
      account: organization.stripeConnectAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?success=true`,
      type: "account_onboarding",
    });

    return { success: true, data: { url: accountLink.url } };
  } catch (error) {
    console.error("Error creating account link:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create account link");
  }
}

/**
 * Create a login link for the Express dashboard
 */
export async function createDashboardLink(): Promise<
  ActionResult<{ url: string }>
> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization?.stripeConnectAccountId) {
      return fail("No Connect account found");
    }

    const loginLink = await getStripe().accounts.createLoginLink(
      organization.stripeConnectAccountId
    );

    return { success: true, data: { url: loginLink.url } };
  } catch (error) {
    console.error("Error creating dashboard link:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create dashboard link");
  }
}

// ============================================================================
// DETAILED ACCOUNT INFO
// ============================================================================

export interface ConnectAccountDetails {
  hasAccount: boolean;
  accountId: string | null;
  isOnboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  pendingVerification: boolean;
  isTestMode: boolean;
  businessType: string | null;
  businessName: string | null;
  email: string | null;
  country: string | null;
  defaultCurrency: string | null;
  payoutSchedule: {
    interval: string;
    delayDays: number;
    weeklyAnchor?: string;
    monthlyAnchor?: number;
  } | null;
  externalAccounts: Array<{
    id: string;
    type: "bank_account" | "card";
    last4: string;
    bankName?: string;
    currency: string;
    isDefault: boolean;
  }>;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  } | null;
  capabilities: {
    cardPayments: string;
    transfers: string;
  } | null;
}

/**
 * Check if Stripe is in test mode
 */
export async function isStripeTestMode(): Promise<boolean> {
  const key = process.env.STRIPE_SECRET_KEY || "";
  return key.startsWith("sk_test_");
}

/**
 * Get detailed Stripe Connect account information
 */
export async function getConnectAccountDetails(): Promise<
  ActionResult<ConnectAccountDetails>
> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return fail("Organization not found");
    }

    const defaultResult: ConnectAccountDetails = {
      hasAccount: false,
      accountId: null,
      isOnboarded: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      pendingVerification: false,
      isTestMode: await isStripeTestMode(),
      businessType: null,
      businessName: null,
      email: null,
      country: null,
      defaultCurrency: null,
      payoutSchedule: null,
      externalAccounts: [],
      requirements: null,
      capabilities: null,
    };

    if (!organization.stripeConnectAccountId) {
      return { success: true, data: defaultResult };
    }

    // Get the full account from Stripe with expanded external_accounts
    const account = await getStripe().accounts.retrieve(
      organization.stripeConnectAccountId,
      {
        expand: ["external_accounts"],
      }
    );

    const isOnboarded =
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted;

    // Update the organization if onboarding status changed
    if (isOnboarded !== organization.stripeConnectOnboarded) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeConnectOnboarded: isOnboarded },
      });
    }

    // Extract external accounts (bank accounts and cards)
    const externalAccounts: ConnectAccountDetails["externalAccounts"] = [];
    if (account.external_accounts?.data) {
      for (const ext of account.external_accounts.data) {
        if (ext.object === "bank_account") {
          externalAccounts.push({
            id: ext.id,
            type: "bank_account",
            last4: ext.last4,
            bankName: ext.bank_name || undefined,
            currency: ext.currency,
            isDefault: ext.default_for_currency ?? false,
          });
        } else if (ext.object === "card") {
          externalAccounts.push({
            id: ext.id,
            type: "card",
            last4: ext.last4,
            currency: ext.currency || "usd",
            isDefault: ext.default_for_currency ?? false,
          });
        }
      }
    }

    // Extract payout schedule
    let payoutSchedule: ConnectAccountDetails["payoutSchedule"] = null;
    if (account.settings?.payouts?.schedule) {
      const schedule = account.settings.payouts.schedule;
      payoutSchedule = {
        interval: schedule.interval,
        delayDays: schedule.delay_days as number,
        weeklyAnchor: schedule.weekly_anchor,
        monthlyAnchor: schedule.monthly_anchor,
      };
    }

    // Extract requirements
    let requirements: ConnectAccountDetails["requirements"] = null;
    if (account.requirements) {
      requirements = {
        currentlyDue: account.requirements.currently_due || [],
        eventuallyDue: account.requirements.eventually_due || [],
        pastDue: account.requirements.past_due || [],
      };
    }

    // Extract capabilities
    let capabilities: ConnectAccountDetails["capabilities"] = null;
    if (account.capabilities) {
      capabilities = {
        cardPayments: account.capabilities.card_payments || "inactive",
        transfers: account.capabilities.transfers || "inactive",
      };
    }

    // Get business name from the account
    let businessName: string | null = null;
    if (account.business_profile?.name) {
      businessName = account.business_profile.name;
    } else if (account.individual?.first_name) {
      businessName = `${account.individual.first_name} ${account.individual.last_name || ""}`.trim();
    }

    return {
      success: true,
      data: {
        hasAccount: true,
        accountId: organization.stripeConnectAccountId,
        isOnboarded,
        chargesEnabled: account.charges_enabled ?? false,
        payoutsEnabled: account.payouts_enabled ?? false,
        detailsSubmitted: account.details_submitted ?? false,
        pendingVerification:
          (account.requirements?.pending_verification?.length ?? 0) > 0,
        isTestMode: await isStripeTestMode(),
        businessType: account.business_type || null,
        businessName,
        email: account.email || null,
        country: account.country || null,
        defaultCurrency: account.default_currency || null,
        payoutSchedule,
        externalAccounts,
        requirements,
        capabilities,
      },
    };
  } catch (error) {
    console.error("Error getting Connect account details:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get account details");
  }
}
