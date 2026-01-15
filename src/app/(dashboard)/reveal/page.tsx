import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery Reveals | PhotoProOS",
  description: "Create exciting gallery reveal experiences.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { RevealClient } from "./reveal-client";

export default async function RevealPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="reveal-page">
      <PageHeader
        title="Reveal & IPS"
        subtitle="In-person sales and reveal galleries"
      />

      <RevealClient />
    </div>
  );
}
