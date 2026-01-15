import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gear | PhotoProOS",
  description: "Track and manage your photography equipment inventory.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { GearClient } from "./gear-client";

export default async function GearPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="gear-page">
      <PageHeader
        title="Gear"
        subtitle="Equipment inventory and tracking"
      />

      <GearClient />
    </div>
  );
}
