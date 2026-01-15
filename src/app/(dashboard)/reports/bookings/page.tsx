import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Reports | PhotoProOS",
  description: "Analyze booking trends and patterns.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { BookingsReportClient } from "./bookings-report-client";

export default async function BookingsReportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reports-bookings-page" className="space-y-6">
      <PageHeader
        title="Booking Analytics"
        subtitle="Track booking patterns and conversion"
        backHref="/reports"
      />

      <BookingsReportClient />
    </div>
  );
}
