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
  | { type: "login" };

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
