export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function BenchmarksPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="benchmarks-page">
      <ComingSoonPage
        title="Industry Benchmarks"
        subtitle="Compare your performance to industry standards"
        icon="📊"
        description="See how your metrics compare to photographers in your market and niche."
        features={[
          "Industry average comparisons",
          "Booking rate benchmarks",
          "Revenue per session analysis",
          "Client acquisition cost comparisons",
          "Market-specific insights",
          "Performance percentile rankings",
        ]}
        relatedLinks={[
          { label: "Reports", href: "/reports" },
          { label: "Goals", href: "/goals" },
          { label: "Dashboard", href: "/dashboard" },
        ]}
      />
    </div>
  );
}
