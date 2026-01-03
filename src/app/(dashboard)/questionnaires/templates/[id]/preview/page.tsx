import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuestionnaireTemplate } from "@/lib/actions/questionnaire-templates";
import { QuestionnairePreviewClient } from "./preview-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuestionnaireTemplatePreviewPage({ params }: Props) {
  const { id } = await params;
  const result = await getQuestionnaireTemplate(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const template = result.data;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              <EyeIcon className="w-4 h-4" />
              Preview Mode
            </div>
            <span className="text-white/80 text-sm">
              This is how your clients will see the questionnaire
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/questionnaires/templates/${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Editor
            </Link>
            <Link
              href={`/questionnaires/templates/${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#6366f1] rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Template
            </Link>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <QuestionnairePreviewClient template={template} />
    </div>
  );
}

// Icons
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}
