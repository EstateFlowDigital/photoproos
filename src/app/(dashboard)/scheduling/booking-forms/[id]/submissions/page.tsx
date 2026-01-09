import { notFound } from "next/navigation";
import { getBookingForm, getFormSubmissions } from "@/lib/actions/booking-forms";
import { SubmissionsPageClient } from "./submissions-page-client";

export const dynamic = "force-dynamic";

interface SubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionsPage({ params }: SubmissionsPageProps) {
  const { id } = await params;

  const [bookingForm, submissions] = await Promise.all([
    getBookingForm(id),
    getFormSubmissions(id),
  ]);

  if (!bookingForm) {
    notFound();
  }

  return (
    <div data-element="scheduling-booking-forms-submissions-page">
      <SubmissionsPageClient
        bookingForm={bookingForm}
        submissions={submissions}
      />
    </div>
  );
}
