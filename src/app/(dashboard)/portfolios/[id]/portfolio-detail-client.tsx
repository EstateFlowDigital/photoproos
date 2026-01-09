"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  updatePortfolioWebsite,
  updatePortfolioWebsiteProjects,
  publishPortfolioWebsite,
  deletePortfolioWebsite,
} from "@/lib/actions/portfolio-websites";

interface PortfolioProject {
  id: string;
  projectId: string;
  position: number;
  project: {
    id: string;
    name: string;
    coverImageUrl: string | null;
    status: string;
    client: {
      fullName: string | null;
      email: string;
    } | null;
  };
}

interface PortfolioWebsite {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  isPublished: boolean;
  projects: PortfolioProject[];
}

interface AvailableProject {
  id: string;
  name: string;
  status: string;
  coverImageUrl: string | null;
  client: {
    fullName: string | null;
    email: string;
  } | null;
}

interface PortfolioDetailClientProps {
  website: PortfolioWebsite;
  availableProjects: AvailableProject[];
}

export function PortfolioDetailClient({ website, availableProjects }: PortfolioDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(website.name);
  const [slug, setSlug] = useState(website.slug);
  const [description, setDescription] = useState(website.description || "");
  const [heroTitle, setHeroTitle] = useState(website.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState(website.heroSubtitle || "");
  const [primaryColor, setPrimaryColor] = useState(website.primaryColor || "#3b82f6");
  const [accentColor, setAccentColor] = useState(website.accentColor || "#8b5cf6");

  const [selectedProjectIds, setSelectedProjectIds] = useState(() => {
    return new Set(website.projects.map((item) => item.projectId));
  });

  const selectedProjectsCount = selectedProjectIds.size;
  const previewUrl = `/portfolio/${slug || website.slug}`;

  const projectList = useMemo(() => availableProjects, [availableProjects]);

  const handleSaveDetails = () => {
    startTransition(async () => {
      const result = await updatePortfolioWebsite(website.id, {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        heroTitle: heroTitle.trim() || null,
        heroSubtitle: heroSubtitle.trim() || null,
        primaryColor,
        accentColor,
      });

      if (result.success) {
        showToast("Portfolio details updated", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to update portfolio", "error");
      }
    });
  };

  const handleSaveProjects = () => {
    startTransition(async () => {
      const result = await updatePortfolioWebsiteProjects(
        website.id,
        Array.from(selectedProjectIds)
      );

      if (result.success) {
        showToast("Portfolio projects updated", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to update projects", "error");
      }
    });
  };

  const handlePublishToggle = () => {
    startTransition(async () => {
      const result = await publishPortfolioWebsite(website.id, !website.isPublished);
      if (result.success) {
        showToast(
          website.isPublished ? "Portfolio unpublished" : "Portfolio published",
          "success"
        );
        router.refresh();
      } else {
        showToast(result.error || "Failed to update publish status", "error");
      }
    });
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete portfolio",
      description: "Delete this portfolio website? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deletePortfolioWebsite(website.id);
      if (result.success) {
        showToast("Portfolio website deleted", "success");
        router.push("/portfolios");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete portfolio", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium",
            website.isPublished
              ? "bg-green-500/10 text-green-400"
              : "bg-[var(--background-secondary)] text-foreground-muted"
          )}
        >
          {website.isPublished ? "Published" : "Draft"}
        </span>
        <Link
          href={previewUrl}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          Preview
        </Link>
        <button
          onClick={handlePublishToggle}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          {website.isPublished ? "Unpublish" : "Publish"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground">Website Details</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Control the branding and hero content for your portfolio.
          </p>

          <div className="mt-5 grid gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Website Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Public URL</label>
              <div className="mt-2 flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground">
                <span className="text-foreground-muted">/portfolio/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="ml-1 flex-1 bg-transparent text-sm text-foreground outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 min-h-[120px] w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Hero Title</label>
              <input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Hero Subtitle</label>
              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="mt-2 min-h-[90px] w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Primary Color</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Accent Color</label>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSaveDetails}
              disabled={isPending}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              Save Details
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20 disabled:opacity-50"
            >
              Delete Portfolio
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground">Portfolio Projects</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Select which galleries appear on your website.
          </p>

          <div className="mt-4 space-y-3">
            {projectList.map((project) => {
              const checked = selectedProjectIds.has(project.id);
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProjectIds((prev) => {
                      const next = new Set(prev);
                      if (checked) {
                        next.delete(project.id);
                      } else {
                        next.add(project.id);
                      }
                      return next;
                    });
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                    checked
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--card-border)] hover:bg-[var(--background-hover)]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      checked
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--card-border)]"
                    )}
                  >
                    {checked && <CheckIcon className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{project.name}</p>
                    <p className="text-xs text-foreground-muted">
                      {project.client?.fullName || project.client?.email || "No client"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground-muted">
            <span>{selectedProjectsCount} selected</span>
            <button
              onClick={handleSaveProjects}
              disabled={isPending}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              Save Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
