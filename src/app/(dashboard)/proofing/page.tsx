export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ProofingPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="proofing-page">
      <ComingSoonPage
        title="Proofing Sessions"
        subtitle="Client photo selection and proofing"
        icon="✨"
        description="Create proofing sessions for clients to select favorites and request edits."
        features={[
          "Selection limits to help clients choose",
          "Favorite, reject, and maybe categories",
          "Comment threads on individual images",
          "Side-by-side comparison view",
          "Export selections to Lightroom or Capture One",
          "Deadline reminders for pending selections",
        ]}
        relatedLinks={[
          { label: "Galleries", href: "/galleries" },
          { label: "Client Portal", href: "/portal/proofing" },
          { label: "Orders", href: "/orders" },
        ]}
      />
    </div>
  );
}
