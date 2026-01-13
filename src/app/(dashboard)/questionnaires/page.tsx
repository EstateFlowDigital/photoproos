import { Metadata } from "next";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { getQuestionnaireTemplates, getTemplatesByIndustry } from "@/lib/actions/questionnaire-templates";
import { getClientQuestionnaires, getQuestionnaireStats } from "@/lib/actions/client-questionnaires";
import { getClients } from "@/lib/actions/clients";
import { prisma } from "@/lib/db";
import { QuestionnairesPageClient } from "./questionnaires-page-client";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

export const metadata: Metadata = {
  title: "Questionnaires | PhotoProOS",
  description: "Manage client questionnaire templates and assignments",
};

export const dynamic = "force-dynamic";

export default async function QuestionnairesPage() {
  const organizationId = await requireOrganizationId();

  // Fetch templates, assigned questionnaires, stats, clients, and walkthrough preference in parallel
  const [templatesResult, templatesByIndustryResult, questionnairesResult, statsResult, organization, clients, walkthroughPreferenceResult] =
    await Promise.all([
      getQuestionnaireTemplates(),
      getTemplatesByIndustry(),
      getClientQuestionnaires(),
      getQuestionnaireStats(),
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          industries: true,
          primaryIndustry: true,
        },
      }),
      getClients(),
      getWalkthroughPreference("questionnaires"),
    ]);

  const templates = templatesResult.success ? templatesResult.data : [];
  const templatesByIndustry = templatesByIndustryResult.success
    ? templatesByIndustryResult.data
    : {};
  const questionnaires = questionnairesResult.success ? questionnairesResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;

  // Map clients for the modal
  const mappedClients = (clients || []).map((c) => ({
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    company: c.company,
  }));

  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div data-element="questionnaires-page" className="space-y-6">
      <WalkthroughWrapper pageId="questionnaires" initialState={walkthroughState} />
      <QuestionnairesPageClient
        templates={templates}
        templatesByIndustry={templatesByIndustry}
        questionnaires={questionnaires}
        stats={stats}
        organizationIndustries={organization?.industries || []}
        primaryIndustry={organization?.primaryIndustry || "real_estate"}
        clients={mappedClients}
      />
    </div>
  );
}
