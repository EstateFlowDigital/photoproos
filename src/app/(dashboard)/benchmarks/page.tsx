import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benchmarks | PhotoProOS",
  description: "Compare your performance against industry benchmarks.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { BenchmarksClient } from "./benchmarks-client";

export default async function BenchmarksPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="benchmarks-page">
      <PageHeader
        title="Industry Benchmarks"
        subtitle="Compare your performance to industry standards"
      />

      <BenchmarksClient />
    </div>
  );
}
