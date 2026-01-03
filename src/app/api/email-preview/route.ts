import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { render } from "@react-email/render";
import { QuestionnaireAssignedEmail } from "@/emails/questionnaire-assigned";
import { QuestionnaireReminderEmail } from "@/emails/questionnaire-reminder";
import { QuestionnaireCompletedEmail } from "@/emails/questionnaire-completed";
import { PhotographerDigestEmail } from "@/emails/photographer-digest";

export async function GET(request: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const template = searchParams.get("template");

  if (!template) {
    return NextResponse.json(
      { error: "Template parameter required" },
      { status: 400 }
    );
  }

  try {
    let html: string;

    switch (template) {
      case "questionnaire-assigned":
        html = await render(
          QuestionnaireAssignedEmail({
            clientName: searchParams.get("clientName") || "John Doe",
            questionnaireName:
              searchParams.get("questionnaireName") || "Pre-Session Questionnaire",
            questionnaireDescription:
              searchParams.get("description") ||
              "Please complete this questionnaire to help us prepare for your photography session.",
            dueDate: searchParams.get("dueDate") || undefined,
            portalUrl: "https://example.com/portal/questionnaires/123",
            photographerName:
              searchParams.get("photographerName") || "Jane's Photography",
            organizationName:
              searchParams.get("organizationName") || "Jane's Photography",
            bookingTitle: searchParams.get("bookingTitle") || undefined,
            bookingDate: searchParams.get("bookingDate") || undefined,
          })
        );
        break;

      case "questionnaire-reminder":
        html = await render(
          QuestionnaireReminderEmail({
            clientName: searchParams.get("clientName") || "John Doe",
            questionnaireName:
              searchParams.get("questionnaireName") || "Pre-Session Questionnaire",
            dueDate: searchParams.get("dueDate") || undefined,
            isOverdue: searchParams.get("isOverdue") === "true",
            portalUrl: "https://example.com/portal/questionnaires/123",
            photographerName:
              searchParams.get("photographerName") || "Jane's Photography",
            organizationName:
              searchParams.get("organizationName") || "Jane's Photography",
            bookingTitle: searchParams.get("bookingTitle") || undefined,
            bookingDate: searchParams.get("bookingDate") || undefined,
            reminderCount: parseInt(searchParams.get("reminderCount") || "1"),
          })
        );
        break;

      case "questionnaire-completed":
        html = await render(
          QuestionnaireCompletedEmail({
            photographerName:
              searchParams.get("photographerName") || "Jane",
            clientName: searchParams.get("clientName") || "John Doe",
            clientEmail: "john@example.com",
            questionnaireName:
              searchParams.get("questionnaireName") || "Pre-Session Questionnaire",
            responseCount: parseInt(searchParams.get("responseCount") || "12"),
            agreementCount: parseInt(searchParams.get("agreementCount") || "2"),
            viewResponsesUrl: "https://example.com/questionnaires/assigned/123",
            organizationName:
              searchParams.get("organizationName") || "Jane's Photography",
            bookingTitle: searchParams.get("bookingTitle") || undefined,
            bookingDate: searchParams.get("bookingDate") || undefined,
            completedAt: new Date().toISOString(),
          })
        );
        break;

      case "photographer-digest":
        html = await render(
          PhotographerDigestEmail({
            photographerName:
              searchParams.get("photographerName") || "Jane",
            organizationName:
              searchParams.get("organizationName") || "Jane's Photography",
            dashboardUrl: "https://example.com/questionnaires",
            date: new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            pendingCount: parseInt(searchParams.get("pendingCount") || "5"),
            inProgressCount: parseInt(searchParams.get("inProgressCount") || "3"),
            overdueCount: parseInt(searchParams.get("overdueCount") || "2"),
            completedTodayCount: parseInt(
              searchParams.get("completedTodayCount") || "1"
            ),
            questionnaires: [
              {
                id: "1",
                clientName: "Sarah Johnson",
                questionnaireName: "Wedding Details",
                dueDate: new Date(
                  Date.now() - 2 * 24 * 60 * 60 * 1000
                ).toISOString(),
                status: "overdue",
                bookingTitle: "Johnson Wedding",
              },
              {
                id: "2",
                clientName: "Mike Smith",
                questionnaireName: "Property Information",
                dueDate: new Date(
                  Date.now() + 1 * 24 * 60 * 60 * 1000
                ).toISOString(),
                status: "pending",
                bookingTitle: "123 Main St Listing",
              },
              {
                id: "3",
                clientName: "Emily Brown",
                questionnaireName: "Corporate Headshots Brief",
                status: "in_progress",
              },
            ],
          })
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown template: ${template}` },
          { status: 400 }
        );
    }

    // Return HTML with proper content type for browser rendering
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error rendering email preview:", error);
    return NextResponse.json(
      { error: "Failed to render email preview" },
      { status: 500 }
    );
  }
}
