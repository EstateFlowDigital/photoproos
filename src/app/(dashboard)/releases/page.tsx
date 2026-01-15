import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Model Releases | PhotoProOS",
  description: "Manage model and property releases.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ReleasesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Releases"
      subtitle="Model and property release forms"
      icon="📋"
      description="Manage model releases, property releases, and talent agreements with e-signatures."
      features={[
        "Model release templates",
        "Property release forms",
        "Minor/guardian consent forms",
        "E-signature collection",
        "Link to specific projects",
        "PDF export and secure storage",
      ]}
      relatedLinks={[
        { label: "Contracts", href: "/contracts" },
        { label: "Waivers", href: "/waivers" },
        { label: "Licenses", href: "/licenses" },
      ]}
    />
  );
}
