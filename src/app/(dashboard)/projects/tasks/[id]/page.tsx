export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PageHeader, Breadcrumb } from "@/components/dashboard";
import Link from "next/link";
import { getTask } from "@/lib/actions/projects";
import { getTeamMembers } from "@/lib/actions/settings";
import { getClients } from "@/lib/actions/clients";
import { getGalleries } from "@/lib/actions/galleries";
import { TaskDetailClient } from "./task-detail-client";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;

  const task = await getTask(id);

  if (!task) {
    notFound();
  }

  // Fetch related data for dropdowns
  const [teamMembersRaw, clientsRaw, galleriesRaw] = await Promise.all([
    getTeamMembers(),
    getClients(),
    getGalleries(),
  ]);

  // Transform data
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

  // Map task to client-friendly format
  const mappedTask = {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    position: task.position,
    tags: task.tags,
    dueDate: task.dueDate,
    startDate: task.startDate,
    completedAt: task.completedAt,
    estimatedMinutes: task.estimatedMinutes,
    actualMinutes: task.actualMinutes,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    board: task.board,
    column: task.column,
    assignee: task.assignee,
    client: task.client,
    project: task.project,
    booking: task.booking,
    invoice: task.invoice,
    propertyWebsite: task.propertyWebsite,
    subtasks: task.subtasks.map((s) => ({
      id: s.id,
      title: s.title,
      isCompleted: s.isCompleted,
      position: s.position,
    })),
    comments: task.comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorId: c.author?.id || null,
      authorName: c.author?.fullName || null,
      createdAt: c.createdAt,
    })),
  };

  const priorityColors = {
    urgent: "bg-[var(--error)]/10 text-[var(--error)]",
    high: "bg-[var(--warning)]/10 text-[var(--warning)]",
    medium: "bg-[var(--primary)]/10 text-[var(--primary)]",
    low: "bg-[var(--foreground-muted)]/10 text-foreground-muted",
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Projects", href: "/projects" },
          { label: task.board.name, href: "/projects" },
          { label: task.title },
        ]}
      />
      <PageHeader
        title={task.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className="text-foreground-muted">•</span>
            <span>{task.column.name}</span>
            {task.assignee && (
              <>
                <span className="text-foreground-muted">•</span>
                <span>Assigned to {task.assignee.fullName || task.assignee.email}</span>
              </>
            )}
            {task.dueDate && (
              <>
                <span className="text-foreground-muted">•</span>
                <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
              </>
            )}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              title="Back to Board"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden md:inline">Back to Board</span>
            </Link>
          </div>
        }
      />

      <TaskDetailClient
        task={mappedTask}
        teamMembers={teamMembers}
        clients={clients}
        galleries={galleries}
      />
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}
