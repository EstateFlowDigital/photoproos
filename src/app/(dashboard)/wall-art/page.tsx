import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wall Art | PhotoProOS",
  description: "Offer wall art and canvas print options.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { WallArtClient } from "./wall-art-client";

export default async function WallArtPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="wall-art-page">
      <PageHeader
        title="Wall Art"
        subtitle="Canvas, metal prints, and framed products"
      />

      <WallArtClient />
    </div>
  );
}
