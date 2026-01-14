export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CouponDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Coupon Details"
      subtitle="View coupon usage"
      icon="📊"
      description="View usage stats, redemption history, and edit coupon settings."
      features={[
        "Usage statistics dashboard",
        "Redemption history log",
        "Edit discount settings",
        "Expiration and limit management",
        "Revenue impact analysis",
        "Duplicate and deactivate options",
      ]}
      relatedLinks={[
        { label: "All Coupons", href: "/coupons" },
        { label: "Orders", href: "/orders" },
      ]}
    />
  );
}
