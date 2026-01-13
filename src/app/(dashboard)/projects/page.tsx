import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateDefaultBoard, getBoard } from "@/lib/actions/projects";
import { getTeamMembers } from "@/lib/actions/settings";
import { getClients } from "@/lib/actions/clients";
import { getGalleries } from "@/lib/actions/galleries";
import { ProjectsClient } from "./projects-client";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get or create the default board
  const defaultBoard = await getOrCreateDefaultBoard();

  // Fetch all data in parallel
  const [board, teamMembersRaw, clientsRaw, galleriesRaw, walkthroughPreferenceResult] = await Promise.all([
    getBoard(defaultBoard.id),
    getTeamMembers(),
    getClients(),
    getGalleries(),
    getWalkthroughPreference("projects"),
  ]);

  if (!board) {
    redirect("/dashboard");
  }

  // Transform data to match expected client component types
  const teamMembers = teamMembersRaw.map((m) => ({
    id: m.id,
    clerkUserId: m.user.id,
    fullName: m.user.fullName,
    email: m.user.email,
    avatarUrl: m.user.avatarUrl,
    role: m.role as string,
  }));

  const clients = clientsRaw.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    company: c.company,
  }));

  const galleries = galleriesRaw.map((g) => ({
    id: g.id,
    name: g.name,
  }));

  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div data-element="projects-page" className="space-y-6">
      <WalkthroughWrapper pageId="projects" initialState={walkthroughState} />
      <ProjectsClient
        board={board}
        teamMembers={teamMembers}
        clients={clients}
        galleries={galleries}
      />
    </div>
  );
}
