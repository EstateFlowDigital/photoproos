import { getBookingForms } from "@/lib/actions/booking-forms";
import { getServices } from "@/lib/actions/services";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { prisma } from "@/lib/db";
import { BookingFormsPageClient } from "./booking-forms-page-client";

export const dynamic = "force-dynamic";

export default async function BookingFormsPage() {
  const organizationId = await requireOrganizationId();

  // Fetch booking forms and organization industries in parallel
  const [bookingForms, services, organization] = await Promise.all([
    getBookingForms(),
    getServices(),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        industries: true,
        primaryIndustry: true,
      },
    }),
  ]);

  return (
    <BookingFormsPageClient
      bookingForms={bookingForms}
      services={services}
      organizationIndustries={organization?.industries || []}
      primaryIndustry={organization?.primaryIndustry || "real_estate"}
    />
  );
}
