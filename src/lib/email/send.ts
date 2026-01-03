/**
 * Email Send Functions
 *
 * This file contains all the email sending functions for the application.
 * Each function wraps a specific email template with the appropriate subject
 * line and sender configuration.
 *
 * Email templates are located in: /src/emails/
 * Email infrastructure (Resend): /src/lib/email/resend.ts
 *
 * Usage:
 * - Import the specific send function you need
 * - Call it with the required parameters
 * - Handle the success/error response
 *
 * Example:
 *   const result = await sendGalleryDeliveredEmail({
 *     to: "client@example.com",
 *     clientName: "John",
 *     galleryName: "Wedding Photos",
 *     galleryUrl: "https://...",
 *     photographerName: "Jane's Photography"
 *   });
 *   if (!result.success) console.error(result.error);
 */

import { sendEmail } from "./resend";
import { GalleryDeliveredEmail } from "@/emails/gallery-delivered";
import { PaymentReceiptEmail } from "@/emails/payment-receipt";
import { BookingConfirmationEmail } from "@/emails/booking-confirmation";
import { WelcomeEmail } from "@/emails/welcome";
import { PropertyLeadEmail } from "@/emails/property-lead";
import { GalleryExpirationEmail } from "@/emails/gallery-expiration";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { ContractSigningEmail } from "@/emails/contract-signing";
import { TeamInvitationEmail } from "@/emails/team-invitation";

/**
 * Send gallery delivered notification to client
 */
export async function sendGalleryDeliveredEmail(params: {
  to: string;
  clientName: string;
  galleryName: string;
  galleryUrl: string;
  photographerName: string;
  photographerEmail?: string;
  photoCount?: number;
  expiresAt?: Date;
}) {
  const {
    to,
    clientName,
    galleryName,
    galleryUrl,
    photographerName,
    photographerEmail,
    photoCount,
    expiresAt,
  } = params;

  return sendEmail({
    to,
    subject: `Your photos are ready: ${galleryName}`,
    react: GalleryDeliveredEmail({
      clientName,
      galleryName,
      galleryUrl,
      photographerName,
      photoCount,
      expiresAt: expiresAt?.toISOString(),
    }),
    replyTo: photographerEmail,
  });
}

/**
 * Send payment receipt to client
 */
export async function sendPaymentReceiptEmail(params: {
  to: string;
  clientName: string;
  galleryName: string;
  galleryUrl: string;
  amountCents: number;
  currency: string;
  photographerName: string;
  photographerEmail?: string;
  transactionId?: string;
}) {
  const {
    to,
    clientName,
    galleryName,
    galleryUrl,
    amountCents,
    currency,
    photographerName,
    photographerEmail,
    transactionId,
  } = params;

  return sendEmail({
    to,
    subject: `Payment received for ${galleryName}`,
    react: PaymentReceiptEmail({
      clientName,
      galleryName,
      galleryUrl,
      amountCents,
      currency,
      photographerName,
      transactionId,
    }),
    replyTo: photographerEmail,
  });
}

/**
 * Send booking confirmation to client
 */
export async function sendBookingConfirmationEmail(params: {
  to: string;
  clientName: string;
  bookingTitle: string;
  bookingDate: Date;
  bookingTime: string;
  location?: string;
  photographerName: string;
  photographerEmail?: string;
  photographerPhone?: string;
  notes?: string;
}) {
  const {
    to,
    clientName,
    bookingTitle,
    bookingDate,
    bookingTime,
    location,
    photographerName,
    photographerEmail,
    photographerPhone,
    notes,
  } = params;

  return sendEmail({
    to,
    subject: `Booking confirmed: ${bookingTitle}`,
    react: BookingConfirmationEmail({
      clientName,
      bookingTitle,
      bookingDate: bookingDate.toISOString(),
      bookingTime,
      location,
      photographerName,
      photographerPhone,
      notes,
    }),
    replyTo: photographerEmail,
  });
}

/**
 * Send welcome email to new organization
 */
export async function sendWelcomeEmail(params: {
  to: string;
  userName: string;
  organizationName: string;
}) {
  const { to, userName, organizationName } = params;

  return sendEmail({
    to,
    subject: `Welcome to PhotoProOS, ${userName}!`,
    react: WelcomeEmail({
      userName,
      organizationName,
    }),
  });
}

/**
 * Send property lead notification to photographer
 */
export async function sendPropertyLeadEmail(params: {
  to: string;
  photographerName: string;
  propertyAddress: string;
  propertyUrl: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  leadMessage?: string;
}) {
  const {
    to,
    photographerName,
    propertyAddress,
    propertyUrl,
    leadName,
    leadEmail,
    leadPhone,
    leadMessage,
  } = params;

  return sendEmail({
    to,
    subject: `New inquiry for ${propertyAddress}`,
    react: PropertyLeadEmail({
      photographerName,
      propertyAddress,
      propertyUrl,
      leadName,
      leadEmail,
      leadPhone,
      leadMessage,
    }),
    replyTo: leadEmail,
  });
}

/**
 * Send gallery expiration warning to client
 */
export async function sendGalleryExpirationEmail(params: {
  to: string;
  clientName: string;
  galleryName: string;
  galleryUrl: string;
  daysRemaining: number;
  photographerName: string;
  photographerEmail?: string;
}) {
  const {
    to,
    clientName,
    galleryName,
    galleryUrl,
    daysRemaining,
    photographerName,
    photographerEmail,
  } = params;

  const urgency = daysRemaining <= 1 ? "urgent" : daysRemaining <= 3 ? "warning" : "reminder";
  const subject = daysRemaining <= 1
    ? `⚠️ Last chance: "${galleryName}" expires tomorrow!`
    : daysRemaining <= 3
    ? `Reminder: "${galleryName}" expires in ${daysRemaining} days`
    : `Your gallery "${galleryName}" expires in ${daysRemaining} days`;

  return sendEmail({
    to,
    subject,
    react: GalleryExpirationEmail({
      clientName,
      galleryName,
      galleryUrl,
      daysRemaining,
      photographerName,
      urgency,
    }),
    replyTo: photographerEmail,
  });
}

// =============================================================================
// Order Emails
// =============================================================================

/**
 * Send order confirmation email to customer
 *
 * Triggered by: Stripe webhook when order payment completes
 * Location: src/app/api/webhooks/stripe/route.ts -> handleOrderPaymentCompleted()
 */
export async function sendOrderConfirmationEmail(params: {
  to: string;
  clientName: string;
  orderNumber: string;
  items: Array<{
    name: string;
    itemType: "bundle" | "service";
    quantity: number;
    totalCents: number;
  }>;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  photographerName: string;
  photographerEmail?: string;
  photographerPhone?: string;
  preferredTime?: string | null;
  clientNotes?: string | null;
}) {
  const {
    to,
    clientName,
    orderNumber,
    items,
    subtotalCents,
    taxCents,
    totalCents,
    photographerName,
    photographerEmail,
    photographerPhone,
    preferredTime,
    clientNotes,
  } = params;

  return sendEmail({
    to,
    subject: `Order Confirmed: ${orderNumber}`,
    react: OrderConfirmationEmail({
      clientName,
      orderNumber,
      items,
      subtotalCents,
      taxCents,
      totalCents,
      photographerName,
      photographerEmail,
      photographerPhone,
      preferredTime,
      clientNotes,
    }),
    replyTo: photographerEmail,
  });
}

// =============================================================================
// Contract Emails
// =============================================================================

/**
 * Send contract signing invitation to signer
 *
 * Triggered by: sendContractToSigners() or resendSigningInvitation()
 * Location: src/lib/actions/contracts.ts, src/lib/actions/contract-signing.ts
 */
export async function sendContractSigningEmail(params: {
  to: string;
  signerName: string;
  contractName: string;
  signingUrl: string;
  photographerName: string;
  photographerEmail?: string;
  expiresAt?: Date;
  isReminder?: boolean;
}) {
  const {
    to,
    signerName,
    contractName,
    signingUrl,
    photographerName,
    photographerEmail,
    expiresAt,
    isReminder = false,
  } = params;

  const subject = isReminder
    ? `Reminder: Please sign "${contractName}"`
    : `${photographerName} has sent you a contract to sign`;

  return sendEmail({
    to,
    subject,
    react: ContractSigningEmail({
      signerName,
      contractName,
      signingUrl,
      photographerName,
      photographerEmail,
      expiresAt: expiresAt?.toISOString(),
      isReminder,
    }),
    replyTo: photographerEmail,
  });
}

/**
 * Send contract signed confirmation to signer
 *
 * Triggered by: After successful signature submission
 * Location: src/lib/actions/contract-signing.ts -> submitSignature()
 */
export async function sendContractSignedConfirmationEmail(params: {
  to: string;
  signerName: string;
  contractName: string;
  photographerName: string;
  photographerEmail?: string;
  pdfUrl?: string;
}) {
  const {
    to,
    signerName,
    contractName,
    photographerName,
    photographerEmail,
  } = params;

  // For now, use the ContractSigningEmail with a modified message
  // In the future, create a dedicated ContractSignedEmail template
  return sendEmail({
    to,
    subject: `Contract Signed: ${contractName}`,
    react: ContractSigningEmail({
      signerName,
      contractName,
      signingUrl: "", // Not needed for confirmation
      photographerName,
      photographerEmail,
      isReminder: false,
    }),
    replyTo: photographerEmail,
  });
}

// =============================================================================
// Team Invitation Emails
// =============================================================================

/**
 * Send team invitation email
 *
 * Triggered by: createInvitation() action
 * Location: src/lib/actions/invitations.ts
 */
export async function sendTeamInvitationEmail(params: {
  to: string;
  inviteeName?: string;
  organizationName: string;
  inviterName: string;
  role: "admin" | "member";
  inviteUrl: string;
  expiresInDays?: number;
}) {
  const {
    to,
    inviteeName = "there",
    organizationName,
    inviterName,
    role,
    inviteUrl,
    expiresInDays = 7,
  } = params;

  return sendEmail({
    to,
    subject: `${inviterName} invited you to join ${organizationName}`,
    react: TeamInvitationEmail({
      inviteeName,
      organizationName,
      inviterName,
      role,
      inviteUrl,
      expiresInDays,
    }),
  });
}
