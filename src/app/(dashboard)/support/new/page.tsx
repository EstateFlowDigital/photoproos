export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { NewTicketForm } from "./new-ticket-form";

export default async function NewSupportTicketPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="new-support-ticket-page">
      <PageHeader
        title="New Support Ticket"
        subtitle="Submit a support request"
        backHref="/support"
      />

      <NewTicketForm />
    </div>
  );
}
