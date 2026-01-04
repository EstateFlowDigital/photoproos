import { notFound } from "next/navigation";
import { getForm } from "@/lib/actions/custom-forms";
import { FormEditorClient } from "./form-editor-client";

export default async function FormEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getForm(params.id);

  if (!result.success || !result.form) {
    notFound();
  }

  return <FormEditorClient form={result.form} />;
}
