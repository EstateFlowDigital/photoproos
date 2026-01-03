import { notFound } from "next/navigation";
import { getBookingForm, getFormSubmissions } from "@/lib/actions/booking-forms";
import { SubmissionsPageClient } from "./submissions-page-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingFormSubmissionsPage({ params }: PageProps) {
  const { id } = await params;

  const bookingForm = await getBookingForm(id);
  if (!bookingForm) {
    notFound();
  }

  const submissions = await getFormSubmissions(id);

  return (
    <SubmissionsPageClient
      bookingForm={{
        id: bookingForm.id,
        name: bookingForm.name,
        slug: bookingForm.slug,
        fields: bookingForm.fields.map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          sortOrder: f.sortOrder,
        })),
      }}
      submissions={submissions.map((s) => ({
        id: s.id,
        bookingFormId: id,
        bookingId: s.booking?.id ?? null,
        data: s.data,
        clientName: s.clientName,
        clientEmail: s.clientEmail,
        clientPhone: s.clientPhone,
        preferredDate: s.preferredDate,
        preferredTime: s.preferredTime,
        serviceId: s.serviceId,
        status: s.status,
        convertedAt: s.convertedAt,
        rejectedAt: s.rejectedAt,
        rejectionNote: s.rejectionNote,
        createdAt: s.createdAt,
        booking: s.booking
          ? {
              id: s.booking.id,
              title: s.booking.title,
              startTime: s.booking.startTime,
              status: s.booking.status,
            }
          : null,
      }))}
    />
  );
}
