import { getForms } from "@/lib/actions/custom-forms";
import { FormsPageClient } from "./forms-page-client";

export default async function FormsPage() {
  const result = await getForms();
  const forms = result.success ? result.forms ?? [] : [];

  return <FormsPageClient forms={forms} />;
}
