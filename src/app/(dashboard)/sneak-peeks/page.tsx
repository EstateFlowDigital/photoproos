import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sneak Peeks | PhotoProOS",
  description: "Share sneak peek photos with clients.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SneakPeeksClient } from "./sneak-peeks-client";

export default async function SneakPeeksPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="sneak-peeks-page">
      <PageHeader
        title="Sneak Peeks"
        subtitle="Quick preview galleries for clients"
      />

      <SneakPeeksClient />
    </div>
  );
}
