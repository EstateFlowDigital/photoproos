import { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP Clients | PhotoProOS",
  description: "Manage your VIP client program.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { VipClient } from "./vip-client";

export default async function VipPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="vip-page">
      <PageHeader
        title="VIP Clients"
        subtitle="Manage top-tier client relationships"
      />

      <VipClient />
    </div>
  );
}
