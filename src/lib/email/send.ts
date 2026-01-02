import { sendEmail } from "./resend";
import { GalleryDeliveredEmail } from "@/emails/gallery-delivered";
import { PaymentReceiptEmail } from "@/emails/payment-receipt";
import { BookingConfirmationEmail } from "@/emails/booking-confirmation";
import { WelcomeEmail } from "@/emails/welcome";
import { PropertyLeadEmail } from "@/emails/property-lead";

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
