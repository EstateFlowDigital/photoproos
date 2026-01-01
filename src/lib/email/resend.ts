import { Resend } from "resend";

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender
export const DEFAULT_FROM_EMAIL = "PhotoProOS <noreply@photoproos.com>";

// Email send options interface
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, react, from = DEFAULT_FROM_EMAIL, replyTo } = options;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      replyTo,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
