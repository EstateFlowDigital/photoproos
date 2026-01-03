import { notFound } from "next/navigation";
import { getBookingFormBySlug } from "@/lib/actions/booking-forms";
import { BookingFormPublic } from "./booking-form-public";

export const dynamic = "force-dynamic";

interface BookingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { slug } = await params;
  const form = await getBookingFormBySlug(slug);

  if (!form) {
    return {
      title: "Form Not Found",
    };
  }

  return {
    title: form.headline || form.name || "Book a Session",
    description: form.subheadline || form.description || "Request a photography session",
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = await params;
  const form = await getBookingFormBySlug(slug);

  if (!form) {
    notFound();
  }

  // The organization is already included in the form from getBookingFormBySlug
  // View count is also incremented in getBookingFormBySlug

  return (
    <BookingFormPublic
      form={form}
      organization={form.organization}
    />
  );
}
