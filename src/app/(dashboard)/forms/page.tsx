import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forms | PhotoProOS",
  description: "Create and manage custom forms for client inquiries.",
};

export const dynamic = "force-dynamic";

import { getForms } from "@/lib/actions/custom-forms";
import { FormsPageClient } from "./forms-page-client";

export default async function FormsPage() {
  const result = await getForms();
  const forms = result.success ? result.data : [];

  return (
    <div data-element="forms-page">
      <FormsPageClient forms={forms} />
    </div>
  );
}
