export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GearDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Gear Details"
      subtitle="Equipment information"
      icon="🔧"
      description="View equipment details, maintenance history, and usage statistics."
      features={[
        "Equipment specifications",
        "Maintenance history log",
        "Usage statistics and tracking",
        "Purchase and warranty info",
        "Service reminders",
        "Insurance documentation",
      ]}
      relatedLinks={[
        { label: "All Gear", href: "/gear" },
        { label: "Maintenance", href: "/gear/maintenance" },
      ]}
    />
  );
}
