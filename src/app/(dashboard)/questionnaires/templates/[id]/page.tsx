import { notFound } from "next/navigation";
import { getQuestionnaireTemplate } from "@/lib/actions/questionnaire-templates";
import { TemplateEditorClient } from "./template-editor-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuestionnaireTemplateEditPage({ params }: Props) {
  const { id } = await params;
  const result = await getQuestionnaireTemplate(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const template = result.data;

  // System templates cannot be edited directly - redirect to duplicate flow
  if (template.isSystemTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-element="questionnaires-templates-edit-page">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-foreground mb-2">
            System Template
          </h1>
          <p className="text-foreground-muted mb-4">
            System templates cannot be edited directly. Would you like to create a copy that you can customize?
          </p>
          <a
            href={`/questionnaires/templates/new?from=${template.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
          >
            Create Copy
          </a>
        </div>
      </div>
    );
  }

  return <TemplateEditorClient template={template} />;
}
