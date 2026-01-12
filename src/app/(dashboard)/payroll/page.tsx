export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function PayrollPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Payroll"
      subtitle="Process contractor and employee payments"
      icon="💵"
      description="Run payroll, track contractor payments, and manage compensation records."
      features={[
        "Contractor payment processing",
        "Automatic pay calculations from timesheets",
        "Direct deposit and check payments",
        "1099 and W-9 document management",
        "Payment history and records",
        "Year-end tax reporting",
      ]}
      relatedLinks={[
        { label: "Timesheets", href: "/timesheets" },
        { label: "Associates", href: "/associates" },
        { label: "Commissions", href: "/commissions" },
      ]}
    />
  );
}
