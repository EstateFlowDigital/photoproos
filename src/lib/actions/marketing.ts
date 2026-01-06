"use server";

import { getResend, DEFAULT_FROM_EMAIL } from "@/lib/email/resend";
import { ok, type ActionResult } from "@/lib/types/action-result";

/**
 * Subscribe to the newsletter
 */
export async function subscribeToNewsletter(
  email: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate email
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" };
    }

    // Add to Resend audience (if you have an audience set up)
    // For now, we'll send a welcome email as confirmation
    const { data, error } = await getResend().emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: email,
      subject: "Welcome to PhotoProOS!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto;">
              <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Welcome to PhotoProOS!</h1>
              <p style="color: #a7a7a7; line-height: 1.6; margin-bottom: 24px;">
                Thanks for subscribing to our newsletter. You'll receive updates on new features, photography tips, and exclusive offers.
              </p>
              <p style="color: #a7a7a7; line-height: 1.6; margin-bottom: 24px;">
                In the meantime, explore what PhotoProOS can do for your photography business:
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/features/galleries" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                Explore Features
              </a>
              <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
                You can unsubscribe at any time by clicking the link in our emails.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Newsletter signup error:", error);
      return { success: false, error: "Failed to subscribe. Please try again." };
    }

    return { success: true, data: { id: data?.id || "sent" } };
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Submit contact form
 */
export async function submitContactForm(input: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}): Promise<ActionResult> {
  try {
    const { name, email, company, subject, message } = input;

    // Validate required fields
    if (!name || !email || !message) {
      return { success: false, error: "Please fill in all required fields" };
    }

    if (!email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const subjectLabels: Record<string, string> = {
      general: "General Inquiry",
      sales: "Sales Question",
      support: "Technical Support",
      partnership: "Partnership",
      press: "Press Inquiry",
      other: "Other",
    };

    // Send notification to team
    const { error: teamError } = await getResend().emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: process.env.CONTACT_EMAIL || "hello@photoproos.com",
      replyTo: email,
      subject: `[Contact Form] ${subjectLabels[subject] || subject} from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto;">
              <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 24px;">New Contact Form Submission</h1>

              <div style="background-color: #141414; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0;">
                  <strong style="color: #a7a7a7;">From:</strong><br>
                  ${name}${company ? ` (${company})` : ""}
                </p>
                <p style="margin: 0 0 12px 0;">
                  <strong style="color: #a7a7a7;">Email:</strong><br>
                  <a href="mailto:${email}" style="color: #3b82f6;">${email}</a>
                </p>
                <p style="margin: 0 0 12px 0;">
                  <strong style="color: #a7a7a7;">Subject:</strong><br>
                  ${subjectLabels[subject] || subject}
                </p>
                <p style="margin: 0;">
                  <strong style="color: #a7a7a7;">Message:</strong><br>
                  ${message.replace(/\n/g, "<br>")}
                </p>
              </div>

              <a href="mailto:${email}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                Reply to ${name}
              </a>
            </div>
          </body>
        </html>
      `,
    });

    if (teamError) {
      console.error("Contact form team notification error:", teamError);
      return { success: false, error: "Failed to send message. Please try again." };
    }

    // Send confirmation to user
    await getResend().emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: email,
      subject: "We received your message - PhotoProOS",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto;">
              <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Thanks for reaching out!</h1>
              <p style="color: #a7a7a7; line-height: 1.6; margin-bottom: 24px;">
                Hi ${name},
              </p>
              <p style="color: #a7a7a7; line-height: 1.6; margin-bottom: 24px;">
                We've received your message and will get back to you within 24 hours. In the meantime, here's a copy of what you sent:
              </p>
              <div style="background-color: #141414; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0;">
                  <strong style="color: #a7a7a7;">Subject:</strong> ${subjectLabels[subject] || subject}
                </p>
                <p style="margin: 0; white-space: pre-wrap;">
                  ${message}
                </p>
              </div>
              <p style="color: #a7a7a7; line-height: 1.6;">
                Best regards,<br>
                The PhotoProOS Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Contact form error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
