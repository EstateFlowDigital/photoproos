"use server";

import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
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
    const account = await getStripe().accounts.create({
      type: "express",
      country: "US",
      email: organization.name, // Use org name as placeholder, user will update
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
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
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create Connect account" };
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
      return { success: false, error: "Organization not found" };
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
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get account status" };
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
      return { success: false, error: "No Connect account found" };
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
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create account link" };
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
      return { success: false, error: "No Connect account found" };
    }

    const loginLink = await getStripe().accounts.createLoginLink(
      organization.stripeConnectAccountId
    );

    return { success: true, data: { url: loginLink.url } };
  } catch (error) {
    console.error("Error creating dashboard link:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create dashboard link" };
  }
}
