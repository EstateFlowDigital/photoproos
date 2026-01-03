import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientQuestionnaire } from "@/lib/actions/client-questionnaires";
import { QuestionnaireResponseViewer } from "./response-viewer";

export const metadata: Metadata = {
  title: "Questionnaire Responses | PhotoProOS",
  description: "View client questionnaire responses",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuestionnaireResponsePage({ params }: Props) {
  const { id } = await params;
  const result = await getClientQuestionnaire(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <QuestionnaireResponseViewer questionnaire={result.data} />;
}
