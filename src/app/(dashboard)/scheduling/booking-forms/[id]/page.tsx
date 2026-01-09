import { notFound } from "next/navigation";
import { getBookingForm } from "@/lib/actions/booking-forms";
import { getServices } from "@/lib/actions/services";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { prisma } from "@/lib/db";
import { BookingFormEditClient } from "./booking-form-edit-client";

export const dynamic = "force-dynamic";

interface BookingFormEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingFormEditPage({
  params,
}: BookingFormEditPageProps) {
  const { id } = await params;
  const organizationId = await requireOrganizationId();

  const [bookingForm, services, organization] = await Promise.all([
    getBookingForm(id),
    getServices(),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        industries: true,
        primaryIndustry: true,
      },
    }),
  ]);

  if (!bookingForm) {
    notFound();
  }

  return (
    <div data-element="scheduling-booking-forms-edit-page">
      <BookingFormEditClient
        bookingForm={bookingForm}
        services={services}
        organizationIndustries={organization?.industries || []}
      />
    </div>
  );
}
