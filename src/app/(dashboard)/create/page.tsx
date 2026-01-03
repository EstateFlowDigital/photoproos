import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/clerk";
import { getWizardData } from "@/lib/actions/create-wizard";
import { CreateWizardClient } from "./create-wizard-client";

export const metadata = {
  title: "New Project | ListingLens",
  description: "Create a new project with client, services, gallery, and optional booking",
};

export default async function CreatePage() {
  const auth = await getAuthContext();
  if (!auth?.organizationId) {
    redirect("/sign-in");
  }

  const data = await getWizardData();
  if (!data) {
    redirect("/dashboard");
  }

  return (
    <CreateWizardClient
      clients={data.clients}
      services={data.services}
      locations={data.locations}
      bookingTypes={data.bookingTypes}
    />
  );
}
