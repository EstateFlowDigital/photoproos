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
import { QuestionnaireAssignedEmail } from "@/emails/questionnaire-assigned";
import { QuestionnaireReminderEmail } from "@/emails/questionnaire-reminder";
import { QuestionnaireCompletedEmail } from "@/emails/questionnaire-completed";
import { PhotographerDigestEmail } from "@/emails/photographer-digest";
import { PortfolioContactEmail } from "@/emails/portfolio-contact";
import { BookingFormSubmittedEmail } from "@/emails/booking-form-submitted";

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
 * Send portfolio contact form notification to photographer
 *
 * Triggered by: submitPortfolioContactForm() action
 * Location: src/lib/actions/portfolio-websites.ts
 */
export async function sendPortfolioContactEmail(params: {
  to: string;
  photographerName: string;
  portfolioName: string;
  portfolioUrl: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
}) {
  const {
    to,
    photographerName,
    portfolioName,
    portfolioUrl,
    senderName,
    senderEmail,
    senderPhone,
    message,
  } = params;

  return sendEmail({
    to,
    subject: `New inquiry from ${senderName} via ${portfolioName}`,
    react: PortfolioContactEmail({
      photographerName,
      portfolioName,
      portfolioUrl,
      senderName,
      senderEmail,
      senderPhone,
      message,
    }),
    replyTo: senderEmail,
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

// =============================================================================
// Questionnaire Emails
// =============================================================================

/**
 * Send questionnaire assigned notification to client
 *
 * Triggered by: assignQuestionnaireToClient() action
 * Location: src/lib/actions/client-questionnaires.ts
 */
export async function sendQuestionnaireAssignedEmail(params: {
  to: string;
  clientId?: string;
  clientName: string;
  questionnaireName: string;
  questionnaireDescription?: string;
  personalNote?: string;
  dueDate?: Date;
  portalUrl: string;
  photographerName: string;
  photographerEmail?: string;
  organizationName: string;
  bookingTitle?: string;
  bookingDate?: Date;
}) {
  const {
    to,
    clientId,
    clientName,
    questionnaireName,
    questionnaireDescription,
    personalNote,
    dueDate,
    portalUrl,
    photographerName,
    photographerEmail,
    organizationName,
    bookingTitle,
    bookingDate,
  } = params;

  // Generate unsubscribe URL if clientId is provided
  let unsubscribeUrl: string | undefined;
  if (clientId) {
    const { generateUnsubscribeUrl } = await import("@/lib/email/unsubscribe");
    unsubscribeUrl = generateUnsubscribeUrl(clientId);
  }

  return sendEmail({
    to,
    subject: `${photographerName} has sent you a questionnaire to complete`,
    react: QuestionnaireAssignedEmail({
      clientName,
      questionnaireName,
      questionnaireDescription,
      personalNote,
      dueDate: dueDate?.toISOString(),
      portalUrl,
      photographerName,
      organizationName,
      bookingTitle,
      bookingDate: bookingDate?.toISOString(),
      unsubscribeUrl,
    }),
    replyTo: photographerEmail,
  });
}

/**
 * Send questionnaire reminder to client
 *
 * Triggered by: sendQuestionnaireReminder() action
 * Location: src/lib/actions/client-questionnaires.ts
 */
export async function sendQuestionnaireReminderEmail(params: {
  to: string;
  clientId?: string;
  clientName: string;
  questionnaireName: string;
  dueDate?: Date;
  isOverdue: boolean;
  portalUrl: string;
  photographerName: string;
  photographerEmail?: string;
  organizationName: string;
  bookingTitle?: string;
  bookingDate?: Date;
  reminderCount: number;
}) {
  const {
    to,
    clientId,
    clientName,
    questionnaireName,
    dueDate,
    isOverdue,
    portalUrl,
    photographerName,
    photographerEmail,
    organizationName,
    bookingTitle,
    bookingDate,
    reminderCount,
  } = params;

  // Generate unsubscribe URL if clientId is provided
  let unsubscribeUrl: string | undefined;
  if (clientId) {
    const { generateUnsubscribeUrl } = await import("@/lib/email/unsubscribe");
    unsubscribeUrl = generateUnsubscribeUrl(clientId);
  }

  const subject = isOverdue
    ? `Overdue: Please complete your questionnaire for ${photographerName}`
    : `Reminder: Please complete your questionnaire for ${photographerName}`;

  return sendEmail({
    to,
    subject,
    react: QuestionnaireReminderEmail({
      clientName,
      questionnaireName,
      dueDate: dueDate?.toISOString(),
      isOverdue,
      portalUrl,
      photographerName,
      organizationName,
      bookingTitle,
      bookingDate: bookingDate?.toISOString(),
      reminderCount,
      unsubscribeUrl,
    }),
    replyTo: photographerEmail,
  });
}

/**
 * Send questionnaire completed notification to photographer
 *
 * Triggered by: submitQuestionnaireResponses() action
 * Location: src/lib/actions/questionnaire-portal.ts
 */
export async function sendQuestionnaireCompletedEmail(params: {
  to: string;
  photographerName: string;
  clientName: string;
  clientEmail: string;
  questionnaireName: string;
  responseCount: number;
  agreementCount: number;
  viewResponsesUrl: string;
  organizationName: string;
  bookingTitle?: string;
  bookingDate?: Date;
  completedAt: Date;
}) {
  const {
    to,
    photographerName,
    clientName,
    clientEmail,
    questionnaireName,
    responseCount,
    agreementCount,
    viewResponsesUrl,
    organizationName,
    bookingTitle,
    bookingDate,
    completedAt,
  } = params;

  return sendEmail({
    to,
    subject: `${clientName} completed the ${questionnaireName} questionnaire`,
    react: QuestionnaireCompletedEmail({
      photographerName,
      clientName,
      clientEmail,
      questionnaireName,
      responseCount,
      agreementCount,
      viewResponsesUrl,
      organizationName,
      bookingTitle,
      bookingDate: bookingDate?.toISOString(),
      completedAt: completedAt.toISOString(),
    }),
    replyTo: clientEmail,
  });
}

// =============================================================================
// Photographer Digest Email
// =============================================================================

interface QuestionnaireDigestItem {
  id: string;
  clientName: string;
  questionnaireName: string;
  dueDate?: Date;
  status: "pending" | "in_progress" | "overdue";
  bookingTitle?: string;
}

/**
 * Send daily digest email to photographer
 *
 * Triggered by: Cron job (daily)
 * Location: src/app/api/cron/photographer-digest/route.ts
 */
export async function sendPhotographerDigestEmail(params: {
  to: string;
  photographerName: string;
  organizationName: string;
  dashboardUrl: string;
  pendingCount: number;
  inProgressCount: number;
  overdueCount: number;
  completedTodayCount: number;
  questionnaires: QuestionnaireDigestItem[];
}) {
  const {
    to,
    photographerName,
    organizationName,
    dashboardUrl,
    pendingCount,
    inProgressCount,
    overdueCount,
    completedTodayCount,
    questionnaires,
  } = params;

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return sendEmail({
    to,
    subject: `Daily Digest: ${overdueCount > 0 ? `${overdueCount} overdue, ` : ""}${pendingCount} pending questionnaires`,
    react: PhotographerDigestEmail({
      photographerName,
      organizationName,
      dashboardUrl,
      date,
      pendingCount,
      inProgressCount,
      overdueCount,
      completedTodayCount,
      questionnaires: questionnaires.map((q) => ({
        ...q,
        dueDate: q.dueDate?.toISOString(),
      })),
    }),
  });
}

// =============================================================================
// Booking Form Submission Confirmation
// =============================================================================

/**
 * Send booking form submission confirmation to client
 *
 * Triggered by: submitBookingForm() when confirmationEmail is enabled
 * Location: src/lib/actions/booking-forms.ts
 */
export async function sendBookingFormSubmittedEmail(params: {
  to: string;
  clientName: string;
  serviceName?: string;
  preferredDate?: string;
  preferredTime?: string;
  photographerName: string;
  photographerEmail?: string;
  photographerPhone?: string;
  formName?: string;
  notes?: string;
}) {
  const {
    to,
    clientName,
    serviceName,
    preferredDate,
    preferredTime,
    photographerName,
    photographerEmail,
    photographerPhone,
    formName,
    notes,
  } = params;

  return sendEmail({
    to,
    subject: `Your booking request has been received - ${photographerName}`,
    react: BookingFormSubmittedEmail({
      clientName,
      serviceName,
      preferredDate,
      preferredTime,
      photographerName,
      photographerEmail,
      photographerPhone,
      formName,
      notes,
    }),
    replyTo: photographerEmail,
  });
}
