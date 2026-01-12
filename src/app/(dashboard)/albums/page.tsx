export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function AlbumsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="albums-page">
      <ComingSoonPage
        title="Albums"
        subtitle="Create and manage photo albums"
        icon="📚"
        description="Design custom photo albums with templates and order fulfillment integration."
        features={[
          "Drag-and-drop album designer",
          "Professional album templates and layouts",
          "Auto-design with AI suggestions",
          "Client approval workflow",
          "Direct print lab integration",
          "Multiple sizes and cover options",
        ]}
        relatedLinks={[
          { label: "Prints", href: "/prints" },
          { label: "Wall Art", href: "/wall-art" },
          { label: "Galleries", href: "/galleries" },
        ]}
      />
    </div>
  );
}
