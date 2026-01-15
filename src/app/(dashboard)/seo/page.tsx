import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "SEO Tools | PhotoProOS",
  description: "Optimize your online presence for search engines.",
};

export const dynamic = "force-dynamic";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SeoClient } from "./seo-client";

export default async function SeoPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="seo-page">
      <PageHeader
        title="SEO"
        subtitle="Search engine optimization settings"
      />

      <SeoClient />
    </div>
  );
}
