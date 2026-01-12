export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function PrintsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="prints-page">
      <ComingSoonPage
        title="Print Products"
        subtitle="Manage print orders and fulfillment"
        icon="🖨️"
        description="Sell prints with automated fulfillment through lab partners."
        features={[
          "Multiple print sizes and paper types",
          "Automatic fulfillment through WHCC, Miller's, Bay Photo",
          "Custom pricing with markup settings",
          "Print preview with color profiles",
          "Drop-shipping directly to clients",
          "Order tracking and notifications",
        ]}
        relatedLinks={[
          { label: "Albums", href: "/albums" },
          { label: "Wall Art", href: "/wall-art" },
          { label: "Orders", href: "/orders" },
        ]}
      />
    </div>
  );
}
