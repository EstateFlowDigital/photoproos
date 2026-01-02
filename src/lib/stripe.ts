import Stripe from "stripe";

// Lazy initialization to avoid build-time errors when env vars are not set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Legacy export for backward compatibility (use getStripe() instead)
export const stripe = {
  get instance(): Stripe {
    return getStripe();
  },
};

// Platform fee percentage (can be configured per organization)
export const DEFAULT_PLATFORM_FEE_PERCENT = 5;
