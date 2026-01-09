import { redirect } from "next/navigation";
import Link from "next/link";
import { getQuestionnaireForCompletion } from "@/lib/actions/questionnaire-portal";
import { QuestionnaireForm } from "./questionnaire-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuestionnaireCompletionPage({ params }: Props) {
  const { id } = await params;
  const result = await getQuestionnaireForCompletion(id);

  if (!result.success) {
    redirect("/portal/login");
  }

  if (!result.data) {
    return (
      <div data-element="portal-questionnaire-page" className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white">Questionnaire Not Found</h1>
          <p className="mt-2 text-[#7c7c7c]">
            This questionnaire may have already been completed or is no longer available.
          </p>
          <Link
            href="/portal"
            className="mt-4 inline-block rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#3b82f6]/90"
          >
            Return to Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-element="portal-questionnaire-page">
      <QuestionnaireForm questionnaire={result.data} />
    </div>
  );
}
