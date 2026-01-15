import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio | PhotoProOS",
  description: "Manage your photography studio space.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { StudioClient } from "./studio-client";

export default async function StudioPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="studio-page">
      <PageHeader
        title="Studio"
        subtitle="Manage studio space and bookings"
      />

      <StudioClient />
    </div>
  );
}
