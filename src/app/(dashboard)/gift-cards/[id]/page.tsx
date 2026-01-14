export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GiftCardDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Gift Card Details"
      subtitle="Manage gift card"
      icon="💳"
      description="View balance, transaction history, and manage gift card status."
      features={[
        "Current balance display",
        "Transaction history log",
        "Recipient information",
        "Resend gift card email",
        "Adjust balance manually",
        "Deactivate or refund",
      ]}
      relatedLinks={[
        { label: "All Gift Cards", href: "/gift-cards" },
        { label: "Orders", href: "/orders" },
      ]}
    />
  );
}
