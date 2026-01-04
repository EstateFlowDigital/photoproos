import { Resend, CreateEmailOptions } from "resend";
import { render } from "@react-email/render";

// Lazy initialization to avoid build-time errors when env vars are not set
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Default sender
export const DEFAULT_FROM_EMAIL = "PhotoProOS <noreply@photoproos.com>";

// Email send options interface
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 * Returns success status and resendId for tracking
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  resendId?: string;
  error?: string;
}> {
  const { to, subject, react, text, from = DEFAULT_FROM_EMAIL, replyTo } = options;

  try {
    let html: string | undefined;
    if (react) {
      try {
        html = await render(react);
      } catch (renderError) {
        console.error("Error rendering email:", renderError);
        if (!text) {
          return {
            success: false,
            error:
              renderError instanceof Error ? renderError.message : "Failed to render email",
          };
        }
      }
    }

    // Build email options based on what's provided
    const emailOptions: {
      from: string;
      to: string[];
      subject: string;
      html?: string;
      text?: string;
      replyTo?: string;
    } = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      replyTo,
    };

    if (html) {
      emailOptions.html = html;
    }

    if (text && !emailOptions.text) {
      emailOptions.text = text;
    }

    const { data, error } = await getResend().emails.send(
      emailOptions as CreateEmailOptions
    );

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, resendId: data?.id };
  } catch (err) {
    console.error("Failed to send email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
