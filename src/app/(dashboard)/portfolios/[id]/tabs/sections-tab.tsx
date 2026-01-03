"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { PortfolioSectionType } from "@prisma/client";
import type { PortfolioWebsite } from "../portfolio-editor-client";
import {
  createPortfolioSection,
  deletePortfolioSection,
  toggleSectionVisibility,
  duplicatePortfolioSection,
  reorderPortfolioSections,
} from "@/lib/actions/portfolio-websites";
import {
  SECTION_DEFINITIONS,
  getPresetSections,
  getFreeformBlocks,
} from "@/lib/portfolio-templates";
import { SectionConfigModal } from "@/components/dashboard/portfolio-builder/section-config-modal";

interface SectionsTabProps {
  website: PortfolioWebsite;
  isPending: boolean;
  availableProjects?: { id: string; name: string; coverImageUrl: string | null }[];
  onSave?: () => void;
}

export function SectionsTab({ website, isPending: parentPending, availableProjects = [], onSave }: SectionsTabProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState<PortfolioWebsite["sections"][number] | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const loading = isPending || parentPending;

  const handleAddSection = (sectionType: PortfolioSectionType) => {
    startTransition(async () => {
      const result = await createPortfolioSection(website.id, {
        sectionType,
      });

      if (result.success) {
        showToast("Section added", "success");
        setShowAddModal(false);
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to add section", "error");
      }
    });
  };

  const handleToggleVisibility = (sectionId: string) => {
    startTransition(async () => {
      const result = await toggleSectionVisibility(sectionId);

      if (result.success) {
        showToast(
          result.isVisible ? "Section visible" : "Section hidden",
          "success"
        );
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to toggle visibility", "error");
      }
    });
  };

  const handleDuplicate = (sectionId: string) => {
    startTransition(async () => {
      const result = await duplicatePortfolioSection(sectionId);

      if (result.success) {
        showToast("Section duplicated", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to duplicate section", "error");
      }
    });
  };

  const handleDelete = (sectionId: string) => {
    if (!confirm("Delete this section? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await deletePortfolioSection(sectionId);

      if (result.success) {
        showToast("Section deleted", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to delete section", "error");
      }
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const sectionIds = website.sections.map((s) => s.id);
    [sectionIds[index], sectionIds[index - 1]] = [
      sectionIds[index - 1],
      sectionIds[index],
    ];

    startTransition(async () => {
      const result = await reorderPortfolioSections(website.id, sectionIds);
      if (result.success) {
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to reorder", "error");
      }
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === website.sections.length - 1) return;

    const sectionIds = website.sections.map((s) => s.id);
    [sectionIds[index], sectionIds[index + 1]] = [
      sectionIds[index + 1],
      sectionIds[index],
    ];

    startTransition(async () => {
      const result = await reorderPortfolioSections(website.id, sectionIds);
      if (result.success) {
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to reorder", "error");
      }
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());

    // Add drag image styling
    if (e.currentTarget instanceof HTMLElement) {
      dragNodeRef.current = e.currentTarget as HTMLDivElement;
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder sections
    const sectionIds = [...website.sections.map((s) => s.id)];
    const [draggedId] = sectionIds.splice(draggedIndex, 1);
    sectionIds.splice(dropIndex, 0, draggedId);

    startTransition(async () => {
      const result = await reorderPortfolioSections(website.id, sectionIds);
      if (result.success) {
        showToast("Section moved", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to reorder", "error");
      }
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getSectionDefinition = (type: PortfolioSectionType) => {
    return SECTION_DEFINITIONS.find((s) => s.type === type);
  };

  const presetSections = getPresetSections();
  const freeformBlocks = getFreeformBlocks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sections</h3>
          <p className="text-sm text-foreground-muted">
            Build your portfolio page by adding and arranging sections.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          Add Section
        </button>
      </div>

      {/* Sections List */}
      {website.sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-12 text-center">
          <LayoutIcon className="mx-auto h-10 w-10 text-foreground-muted" />
          <p className="mt-3 text-sm font-medium text-foreground">
            No sections yet
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            Add your first section to start building your portfolio.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Section
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {website.sections.map((section, index) => {
            const definition = getSectionDefinition(section.sectionType);
            const isFirst = index === 0;
            const isLast = index === website.sections.length - 1;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={section.id}
                draggable={!loading}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  "flex items-center gap-4 rounded-xl border bg-[var(--card)] p-4 transition-all",
                  !section.isVisible && "opacity-50",
                  isDragging && "opacity-50 ring-2 ring-[var(--primary)]",
                  isDragOver && "border-[var(--primary)] bg-[var(--primary)]/5",
                  !isDragging && !isDragOver && "border-[var(--card-border)]",
                  !loading && "cursor-grab active:cursor-grabbing"
                )}
              >
                {/* Drag Handle / Order Controls */}
                <div className="flex flex-col items-center gap-1">
                  <GripIcon className="h-5 w-5 text-foreground-muted" />
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst || loading}
                      className="rounded p-0.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUpIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast || loading}
                      className="rounded p-0.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDownIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Section Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {section.customTitle || definition?.name || section.sectionType}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        definition?.category === "preset"
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      {definition?.category || "custom"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    {definition?.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingSection(section)}
                    disabled={loading}
                    className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] disabled:opacity-50"
                    title="Edit section"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(section.id)}
                    disabled={loading}
                    className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
                    title={section.isVisible ? "Hide section" : "Show section"}
                  >
                    {section.isVisible ? (
                      <EyeIcon className="h-4 w-4" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDuplicate(section.id)}
                    disabled={loading}
                    className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
                    title="Duplicate section"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    disabled={loading}
                    className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error)] disabled:opacity-50"
                    title="Delete section"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Add Section
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Preset Sections */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-foreground-muted">
                Preset Sections
              </h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {presetSections.map((section) => (
                  <button
                    key={section.type}
                    onClick={() => handleAddSection(section.type)}
                    disabled={loading}
                    className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 disabled:opacity-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                      <SectionIcon type={section.type} className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {section.name}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-muted">
                        {section.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Freeform Blocks */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-foreground-muted">
                Freeform Blocks
              </h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {freeformBlocks.map((section) => (
                  <button
                    key={section.type}
                    onClick={() => handleAddSection(section.type)}
                    disabled={loading}
                    className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 text-left transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)] disabled:opacity-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background-secondary)] text-foreground-muted">
                      <SectionIcon type={section.type} className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {section.name}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-muted">
                        {section.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Config Modal */}
      {editingSection && (
        <SectionConfigModal
          section={editingSection}
          availableProjects={availableProjects}
          onClose={() => {
            setEditingSection(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// Section Icon component
function SectionIcon({
  type,
  className,
}: {
  type: PortfolioSectionType;
  className?: string;
}) {
  switch (type) {
    case "hero":
      return <SparklesIcon className={className} />;
    case "about":
      return <UserIcon className={className} />;
    case "gallery":
      return <ImagesIcon className={className} />;
    case "services":
      return <PackageIcon className={className} />;
    case "testimonials":
      return <QuoteIcon className={className} />;
    case "awards":
      return <TrophyIcon className={className} />;
    case "contact":
      return <MailIcon className={className} />;
    case "faq":
      return <HelpCircleIcon className={className} />;
    case "text":
      return <TypeIcon className={className} />;
    case "image":
      return <ImageIcon className={className} />;
    case "video":
      return <PlayIcon className={className} />;
    case "spacer":
      return <MinusIcon className={className} />;
    case "custom_html":
      return <CodeIcon className={className} />;
    default:
      return <LayoutIcon className={className} />;
  }
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function ImagesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 22H4a2 2 0 0 1-2-2V6" />
      <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
      <circle cx="12" cy="8" r="2" />
      <rect width="16" height="16" x="6" y="2" rx="2" />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function TypeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" x2="15" y1="20" y2="20" />
      <line x1="12" x2="12" y1="4" y2="20" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="6" r="1" fill="currentColor" />
      <circle cx="15" cy="6" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="18" r="1" fill="currentColor" />
      <circle cx="15" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}
