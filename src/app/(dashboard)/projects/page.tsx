import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateDefaultBoard, getBoard } from "@/lib/actions/projects";
import { ProjectsClient } from "./projects-client";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get or create the default board
  const defaultBoard = await getOrCreateDefaultBoard();

  // Get full board data with tasks
  const board = await getBoard(defaultBoard.id);

  if (!board) {
    redirect("/dashboard");
  }

  return <ProjectsClient board={board} />;
}
