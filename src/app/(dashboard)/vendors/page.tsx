export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function VendorsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="vendors-page">
      <ComingSoonPage
        title="Vendors"
        subtitle="Manage vendor relationships and referrals"
        icon="🤝"
        description="Track vendor contacts, referral agreements, and collaboration history."
        features={[
          "Vendor contact directory",
          "Preferred vendor lists by category",
          "Referral tracking and agreements",
          "Collaboration history and notes",
          "Share vendor info with clients",
          "Vendor rating and reviews",
        ]}
        relatedLinks={[
          { label: "Referrals", href: "/referrals" },
          { label: "Clients", href: "/clients" },
          { label: "Contacts", href: "/contacts" },
        ]}
      />
    </div>
  );
}
