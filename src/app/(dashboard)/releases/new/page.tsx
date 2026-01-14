export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function NewReleasePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="New Release"
      subtitle="Create a new release form"
      icon="➕"
      description="Choose release type (model, property, minor) and send for signature."
      features={[
        "Model, property, and minor release types",
        "Customizable release templates",
        "Electronic signature collection",
        "Client and project linking",
        "Expiration and usage terms",
        "Legal compliance verification",
      ]}
      relatedLinks={[
        { label: "All Releases", href: "/releases" },
        { label: "Contracts", href: "/contracts" },
      ]}
    />
  );
}
