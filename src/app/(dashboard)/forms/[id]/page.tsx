export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getForm } from "@/lib/actions/custom-forms";
import { FormEditorClient } from "./form-editor-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FormEditorPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getForm(id);

  if (!result.success || !result.form) {
    notFound();
  }

  return <FormEditorClient form={result.form} />;
}
