export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function LicensesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Usage Licenses"
      subtitle="Photo licensing and usage rights"
      icon="©️"
      description="Define and sell photo licenses with usage terms, exclusivity, and territories."
      features={[
        "License type definitions (editorial, commercial, exclusive)",
        "Territory and usage restrictions",
        "Duration and renewal tracking",
        "License agreement generation",
        "Stock licensing support",
        "Usage rights documentation",
      ]}
      relatedLinks={[
        { label: "Releases", href: "/releases" },
        { label: "Contracts", href: "/contracts" },
        { label: "Galleries", href: "/galleries" },
      ]}
    />
  );
}
