import { redirect } from "next/navigation";

// Workflows are now managed in the super-admin area
export default function WorkflowPage() {
  redirect("/super-admin/marketing/workflows");
}
