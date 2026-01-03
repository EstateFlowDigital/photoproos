import crypto from "crypto";

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || "fallback-unsubscribe-secret";

/**
 * Generate a secure unsubscribe token for a client
 * Token format: clientId:timestamp:signature
 */
export function generateUnsubscribeToken(clientId: string): string {
  const timestamp = Date.now().toString();
  const data = `${clientId}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(data)
    .digest("hex")
    .substring(0, 16);

  return Buffer.from(`${data}:${signature}`).toString("base64url");
}

/**
 * Verify and decode an unsubscribe token
 * Returns clientId if valid, null if invalid or expired (30 days)
 */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");

    if (parts.length !== 3) {
      return null;
    }

    const [clientId, timestamp, signature] = parts;

    // Verify timestamp is not too old (30 days)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (tokenAge > maxAge) {
      return null;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", UNSUBSCRIBE_SECRET)
      .update(`${clientId}:${timestamp}`)
      .digest("hex")
      .substring(0, 16);

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    return clientId;
  } catch {
    return null;
  }
}

/**
 * Generate an unsubscribe URL for a client
 */
export function generateUnsubscribeUrl(clientId: string): string {
  const token = generateUnsubscribeToken(clientId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";
  return `${baseUrl}/unsubscribe?token=${token}`;
}
