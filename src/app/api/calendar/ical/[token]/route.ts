/**
 * iCal Feed Export API
 *
 * Generates an iCalendar (.ics) feed for bookings that can be subscribed to
 * from external calendar applications (Google Calendar, Apple Calendar, Outlook, etc.)
 *
 * Usage:
 * - Generate a unique feed token per user/organization
 * - Subscribe using URL: /api/calendar/ical/[token]
 * - Supports filtering by user if token includes user context
 *
 * Security:
 * - Token-based authentication (no session required for calendar apps)
 * - Tokens can be regenerated if compromised
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// iCal date format: YYYYMMDDTHHMMSSZ
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// Escape special characters in iCal text
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Fold long lines (iCal spec requires lines <= 75 chars)
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  const result: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    result.push(remaining.slice(0, maxLength));
    remaining = " " + remaining.slice(maxLength);
  }
  result.push(remaining);

  return result.join("\r\n");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the calendar feed by token
    const feed = await prisma.calendarFeed.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            name: true,
            publicName: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!feed || !feed.isActive) {
      return new NextResponse("Calendar feed not found or inactive", {
        status: 404,
      });
    }

    // Update last accessed timestamp
    await prisma.calendarFeed.update({
      where: { id: feed.id },
      data: { lastAccessedAt: new Date() },
    });

    // Get date range for calendar (past 30 days to 365 days in future)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where: {
        organizationId: feed.organizationId,
        ...(feed.userId && { assignedUserId: feed.userId }),
        status: { notIn: ["cancelled"] },
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      include: {
        client: {
          select: {
            fullName: true,
            company: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        locationRef: {
          select: {
            formattedAddress: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    // Generate iCal content
    const calendarName = feed.user
      ? `${feed.user.fullName}'s Bookings`
      : `${feed.organization.publicName || feed.organization.name} Bookings`;

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PhotoProOS//Calendar Feed//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escapeICalText(calendarName)}`,
      `X-WR-TIMEZONE:${feed.timezone || "America/New_York"}`,
    ];

    // Add each booking as a VEVENT
    for (const booking of bookings) {
      const uid = `${booking.id}@photoproos.com`;
      const created = formatICalDate(booking.createdAt);
      const modified = formatICalDate(booking.updatedAt);
      const start = formatICalDate(booking.startTime);
      const end = formatICalDate(booking.endTime);

      // Build description
      const descriptionParts: string[] = [];
      if (booking.client?.fullName) {
        descriptionParts.push(`Client: ${booking.client.fullName}`);
      }
      if (booking.client?.company) {
        descriptionParts.push(`Company: ${booking.client.company}`);
      }
      if (booking.client?.phone) {
        descriptionParts.push(`Phone: ${booking.client.phone}`);
      }
      if (booking.service?.name) {
        descriptionParts.push(`Service: ${booking.service.name}`);
      }
      if (booking.description) {
        descriptionParts.push(`\\n${booking.description}`);
      }
      if (booking.notes) {
        descriptionParts.push(`\\nNotes: ${booking.notes}`);
      }

      const description = escapeICalText(descriptionParts.join("\\n"));

      // Build location
      const location =
        booking.locationRef?.formattedAddress ||
        booking.location ||
        (booking.isVirtual ? "Virtual Meeting" : "");

      // Status mapping
      const statusMap: Record<string, string> = {
        confirmed: "CONFIRMED",
        pending: "TENTATIVE",
        completed: "CONFIRMED",
        cancelled: "CANCELLED",
        no_show: "CANCELLED",
      };

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${modified}`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${end}`);
      lines.push(`CREATED:${created}`);
      lines.push(`LAST-MODIFIED:${modified}`);
      lines.push(`SUMMARY:${escapeICalText(booking.title)}`);

      if (description) {
        lines.push(foldLine(`DESCRIPTION:${description}`));
      }

      if (location) {
        lines.push(foldLine(`LOCATION:${escapeICalText(location)}`));
      }

      if (booking.isVirtual && booking.meetingUrl) {
        lines.push(`URL:${booking.meetingUrl}`);
      }

      lines.push(`STATUS:${statusMap[booking.status] || "CONFIRMED"}`);

      // Add organizer info from the organization
      lines.push(`ORGANIZER;CN=${escapeICalText(feed.organization.publicName || feed.organization.name)}:mailto:noreply@photoproos.com`);

      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    // Join with proper line endings
    const icalContent = lines.join("\r\n");

    // Return iCal response
    return new NextResponse(icalContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${calendarName.replace(/[^a-z0-9]/gi, "-")}.ics"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating iCal feed:", error);
    return new NextResponse("Failed to generate calendar feed", {
      status: 500,
    });
  }
}
