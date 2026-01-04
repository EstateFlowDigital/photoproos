type SlackWebhookPayload = {
  text: string;
};

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";

async function postSlackMessage(payload: SlackWebhookPayload): Promise<void> {
  if (!SLACK_WEBHOOK_URL) return;

  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
  }
}

interface SlackBookingPayload {
  organizationId: string;
  bookingId: string;
  title: string;
  clientName: string | null;
  clientEmail: string | null;
  startTime: Date;
  endTime?: Date;
  location?: string;
}

interface SlackPaymentPayload {
  organizationId: string;
  paymentId: string;
  amountCents: number;
  clientName: string | null;
  clientEmail: string | null;
  description: string;
}

function formatBookingTime(startTime: Date, endTime?: Date) {
  if (!endTime) return startTime.toISOString();
  return `${startTime.toISOString()} - ${endTime.toISOString()}`;
}

export async function notifySlackNewBooking(payload: SlackBookingPayload): Promise<void> {
  const clientLabel = payload.clientName || payload.clientEmail || "Unknown client";
  const timeLabel = formatBookingTime(payload.startTime, payload.endTime);
  const locationLabel = payload.location ? `\nLocation: ${payload.location}` : "";

  await postSlackMessage({
    text: [
      `New booking created: ${payload.title}`,
      `Client: ${clientLabel}`,
      `Time: ${timeLabel}`,
      locationLabel ? locationLabel : "",
      `Org: ${payload.organizationId}`,
      `Booking ID: ${payload.bookingId}`,
    ].filter(Boolean).join("\n"),
  });
}

export async function notifySlackCancellation(payload: SlackBookingPayload): Promise<void> {
  const clientLabel = payload.clientName || payload.clientEmail || "Unknown client";
  const timeLabel = formatBookingTime(payload.startTime, payload.endTime);

  await postSlackMessage({
    text: [
      `Booking cancelled: ${payload.title}`,
      `Client: ${clientLabel}`,
      `Time: ${timeLabel}`,
      `Org: ${payload.organizationId}`,
      `Booking ID: ${payload.bookingId}`,
    ].filter(Boolean).join("\n"),
  });
}

export async function notifySlackPayment(payload: SlackPaymentPayload): Promise<void> {
  const clientLabel = payload.clientName || payload.clientEmail || "Unknown client";
  const amountLabel = `$${(payload.amountCents / 100).toFixed(2)}`;

  await postSlackMessage({
    text: [
      `Payment received: ${amountLabel}`,
      `Client: ${clientLabel}`,
      `Description: ${payload.description}`,
      `Org: ${payload.organizationId}`,
      `Payment ID: ${payload.paymentId}`,
    ].filter(Boolean).join("\n"),
  });
}
