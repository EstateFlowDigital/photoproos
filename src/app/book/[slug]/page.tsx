import { notFound } from "next/navigation";
import { getBookingFormBySlug } from "@/lib/actions/booking-forms";
import { getClientSession } from "@/lib/actions/client-auth";
import { prisma } from "@/lib/db";
import { BookingFormPublic } from "./booking-form-public";
import type { ClientPreferences } from "@/lib/types/client-preferences";

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

  const session = await getClientSession();
  const rawClientProfile = session
    ? await prisma.client.findUnique({
        where: { id: session.clientId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          preferences: true,
        },
      })
    : null;

  // Transform to properly type preferences
  const clientProfile = rawClientProfile
    ? {
        ...rawClientProfile,
        preferences: rawClientProfile.preferences as ClientPreferences | null,
      }
    : null;

  return (
    <BookingFormPublic
      form={form}
      organization={form.organization}
      clientProfile={clientProfile}
    />
  );
}
