import {
  checkAchievements,
  updateDeliveryStreak,
  updateLoginStreak,
  incrementStat,
  addRevenue,
} from "@/lib/actions/gamification";
import { incrementChallengeProgress } from "@/lib/actions/challenges";
import type { TriggerType } from "./achievements";

// ============================================================================
// GAMIFICATION EVENT TYPES
// ============================================================================

export type GamificationEvent =
  | { type: "gallery_created" }
  | { type: "gallery_delivered" }
  | { type: "client_added" }
  | { type: "payment_received"; amountCents: number }
  | { type: "invoice_paid"; amountCents: number }
  | { type: "contract_signed" }
  | { type: "booking_confirmed" }
  | { type: "login" }
  | { type: "integration_connected"; integration: string }
  | { type: "email_sent" }
  | { type: "sms_sent" }
  | { type: "onboarding_step_completed"; progress: number; isFirstStep: boolean }
  | { type: "onboarding_complete"; daysToComplete: number };

// ============================================================================
// FIRE-AND-FORGET TRIGGER
// ============================================================================

/**
 * Fire gamification triggers after an action completes
 * This runs asynchronously and does NOT block the main action
 *
 * @param userId - The user ID to track gamification for
 * @param organizationId - The organization ID
 * @param event - The gamification event that occurred
 */
export function fireGamificationTrigger(
  userId: string,
  organizationId: string,
  event: GamificationEvent
): void {
  // Fire and forget - don't await
  handleTrigger(userId, organizationId, event).catch((err) => {
    console.error("[Gamification] Trigger error:", err);
  });
}

/**
 * Internal handler for gamification triggers
 */
async function handleTrigger(
  userId: string,
  organizationId: string,
  event: GamificationEvent
): Promise<void> {
  const triggerTypes: TriggerType[] = [];

  switch (event.type) {
    case "gallery_created":
      await incrementStat(userId, "totalGalleries");
      await incrementChallengeProgress(userId, organizationId, "gallery_created");
      triggerTypes.push("gallery_count");
      break;

    case "gallery_delivered":
      await updateDeliveryStreak(userId);
      await incrementChallengeProgress(userId, organizationId, "gallery_delivered");
      triggerTypes.push("delivery_count", "streak_delivery");
      break;

    case "client_added":
      await incrementStat(userId, "totalClients");
      await incrementChallengeProgress(userId, organizationId, "client_added");
      triggerTypes.push("client_count");
      break;

    case "payment_received":
    case "invoice_paid":
      await incrementStat(userId, "totalPayments");
      await addRevenue(userId, event.amountCents);
      await incrementChallengeProgress(userId, organizationId, "payment_received");
      triggerTypes.push("payment_count", "revenue_cents");
      break;

    case "contract_signed":
      await incrementChallengeProgress(userId, organizationId, "contract_signed");
      triggerTypes.push("contract_signed_count");
      break;

    case "booking_confirmed":
      await incrementStat(userId, "totalBookings");
      await incrementChallengeProgress(userId, organizationId, "booking_confirmed");
      triggerTypes.push("booking_count");
      break;

    case "login":
      await updateLoginStreak(userId);
      triggerTypes.push("streak_login");
      break;

    case "integration_connected":
      await incrementStat(userId, "totalIntegrations");
      await incrementChallengeProgress(userId, organizationId, "integration_connected");
      triggerTypes.push("integration_count");
      break;

    case "email_sent":
      await incrementStat(userId, "totalEmails");
      await incrementChallengeProgress(userId, organizationId, "email_sent");
      triggerTypes.push("email_count");
      break;

    case "sms_sent":
      await incrementStat(userId, "totalSms");
      await incrementChallengeProgress(userId, organizationId, "sms_sent");
      triggerTypes.push("sms_count");
      break;

    case "onboarding_step_completed":
      if (event.isFirstStep) {
        triggerTypes.push("onboarding_first_step");
      }
      // Check progress milestones (25%, 50%, 75%)
      if (event.progress >= 25) triggerTypes.push("onboarding_progress");
      break;

    case "onboarding_complete":
      triggerTypes.push("onboarding_complete");
      // Check for speed achievement (completed in under 7 days)
      if (event.daysToComplete <= 7) {
        triggerTypes.push("onboarding_speed");
      }
      break;

    default:
      // Log unknown event types for debugging but don't fail silently
      console.warn(
        `[Gamification] Unknown event type: ${(event as { type: string }).type}`
      );
      return;
  }

  // Check for newly unlocked achievements
  if (triggerTypes.length > 0) {
    await checkAchievements(userId, organizationId, triggerTypes);
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Trigger login streak check (call on dashboard page load)
 */
export function triggerLoginStreak(userId: string, organizationId: string): void {
  fireGamificationTrigger(userId, organizationId, { type: "login" });
}

/**
 * Trigger after gallery creation
 */
export function triggerGalleryCreated(userId: string, organizationId: string): void {
  fireGamificationTrigger(userId, organizationId, { type: "gallery_created" });
}

/**
 * Trigger after gallery delivery
 */
export function triggerGalleryDelivered(userId: string, organizationId: string): void {
  fireGamificationTrigger(userId, organizationId, { type: "gallery_delivered" });
}

/**
 * Trigger after client added
 */
export function triggerClientAdded(userId: string, organizationId: string): void {
  fireGamificationTrigger(userId, organizationId, { type: "client_added" });
}

/**
 * Trigger after payment received
 */
export function triggerPaymentReceived(
  userId: string,
  organizationId: string,
  amountCents: number
): void {
  fireGamificationTrigger(userId, organizationId, {
    type: "payment_received",
    amountCents,
  });
}

/**
 * Trigger after contract signed
 */
export function triggerContractSigned(userId: string, organizationId: string): void {
  fireGamificationTrigger(userId, organizationId, { type: "contract_signed" });
}

/**
 * Trigger after booking confirmed
 */
export function triggerBookingConfirmed(userId: string, organizationId: string): void {
  fireGamificationTrigger(userId, organizationId, { type: "booking_confirmed" });
}

/**
 * Trigger after connecting an integration (Google Calendar, Dropbox, Stripe, etc.)
 */
export function triggerIntegrationConnected(
  userId: string,
  organizationId: string,
  integration: string
): void {
  fireGamificationTrigger(userId, organizationId, {
    type: "integration_connected",
    integration,
  });
}

/**
 * Trigger after sending an email
 */
export function triggerEmailSent(userId: string, organizationId: string): void {
  fireGamificationTrigger(userId, organizationId, { type: "email_sent" });
}

/**
 * Trigger after sending an SMS
 */
export function triggerSmsSent(userId: string, organizationId: string): void {
  fireGamificationTrigger(userId, organizationId, { type: "sms_sent" });
}

/**
 * Trigger after completing an onboarding step
 * @param progress - Current progress percentage (0-100)
 * @param isFirstStep - Whether this is the first step completed
 */
export function triggerOnboardingStepCompleted(
  userId: string,
  organizationId: string,
  progress: number,
  isFirstStep: boolean = false
): void {
  fireGamificationTrigger(userId, organizationId, {
    type: "onboarding_step_completed",
    progress,
    isFirstStep,
  });
}

/**
 * Trigger when onboarding is fully completed
 * @param daysToComplete - Number of days from account creation to completion
 */
export function triggerOnboardingComplete(
  userId: string,
  organizationId: string,
  daysToComplete: number
): void {
  fireGamificationTrigger(userId, organizationId, {
    type: "onboarding_complete",
    daysToComplete,
  });
}
