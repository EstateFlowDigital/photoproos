"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import type { PropertyWebsiteSection, PropertySectionType } from "@prisma/client";
import {
  reorderPropertySections,
  createPropertySection,
  deletePropertySection,
  togglePropertySectionVisibility,
  duplicatePropertySection,
} from "@/lib/actions/property-websites";
import {
  PROPERTY_SECTION_DEFINITIONS,
  getPropertySectionsByCategory,
  type PropertySectionDefinition,
} from "@/lib/property-templates";
import { PropertySectionConfigModal } from "@/components/dashboard/property-builder/section-config-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";

interface SectionsTabProps {
  propertyWebsiteId: string;
  sections: PropertyWebsiteSection[];
}

export function SectionsTab({ propertyWebsiteId, sections: initialSections }: SectionsTabProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [sections, setSections] = useState(initialSections);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<PropertyWebsiteSection | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    e.currentTarget.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    setSections(newSections);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Persist the new order
    const sectionIds = newSections.map((s) => s.id);
    startTransition(async () => {
      const result = await reorderPropertySections(propertyWebsiteId, sectionIds);
      if (!result.success) {
        showToast("Failed to reorder sections", "error");
        setSections(initialSections);
      }
    });
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setSections(newSections);

    const sectionIds = newSections.map((s) => s.id);
    startTransition(async () => {
      const result = await reorderPropertySections(propertyWebsiteId, sectionIds);
      if (!result.success) {
        showToast("Failed to reorder sections", "error");
        setSections(initialSections);
      }
    });
  };

  const handleMoveDown = async (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setSections(newSections);

    const sectionIds = newSections.map((s) => s.id);
    startTransition(async () => {
      const result = await reorderPropertySections(propertyWebsiteId, sectionIds);
      if (!result.success) {
        showToast("Failed to reorder sections", "error");
        setSections(initialSections);
      }
    });
  };

  const handleAddSection = async (sectionType: PropertySectionType) => {
    setLoading(true);
    try {
      const result = await createPropertySection({
        propertyWebsiteId,
        sectionType,
      });
      if (result.success) {
        showToast("Section added", "success");
        setIsAddModalOpen(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to add section", "error");
      }
    } catch {
      showToast("Failed to add section", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    setLoading(true);
    try {
      const result = await deletePropertySection(sectionId);
      if (result.success) {
        setSections(sections.filter((s) => s.id !== sectionId));
        showToast("Section deleted", "success");
      } else {
        showToast(result.error || "Failed to delete section", "error");
      }
    } catch {
      showToast("Failed to delete section", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (sectionId: string) => {
    try {
      const result = await togglePropertySectionVisibility(sectionId);
      if (result.success) {
        setSections(
          sections.map((s) =>
            s.id === sectionId ? { ...s, isVisible: result.isVisible ?? !s.isVisible } : s
          )
        );
        showToast(result.isVisible ? "Section shown" : "Section hidden", "success");
      } else {
        showToast(result.error || "Failed to toggle visibility", "error");
      }
    } catch {
      showToast("Failed to toggle visibility", "error");
    }
  };

  const handleDuplicateSection = async (sectionId: string) => {
    setLoading(true);
    try {
      const result = await duplicatePropertySection(sectionId);
      if (result.success) {
        showToast("Section duplicated", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to duplicate section", "error");
      }
    } catch {
      showToast("Failed to duplicate section", "error");
    } finally {
      setLoading(false);
    }
  };

  const getSectionDefinition = (type: PropertySectionType): PropertySectionDefinition | undefined => {
    return PROPERTY_SECTION_DEFINITIONS.find((s) => s.type === type);
  };

  const sectionCategories = [
    { id: "property", name: "Property", description: "Core property information (auto-fills from property data)" },
    { id: "location", name: "Location", description: "Maps and neighborhood information" },
    { id: "contact", name: "Contact", description: "Agent info and inquiry forms" },
    { id: "marketing", name: "Marketing", description: "Testimonials and social proof" },
    { id: "tools", name: "Tools", description: "Interactive calculators and tools" },
    { id: "freeform", name: "Freeform", description: "Custom content blocks" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Page Sections</h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            Drag and drop to reorder. Sections with the magic wand auto-fill from property data.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          Add Section
        </button>
      </div>

      {/* Section list */}
      {sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <LayersIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No sections yet</h3>
          <p className="mt-2 text-foreground-secondary">
            Add sections to build your property website. Sections auto-fill with your property data.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Your First Section
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((section, index) => {
            const definition = getSectionDefinition(section.sectionType);
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
                className={`group flex items-center gap-3 rounded-xl border bg-[var(--card)] p-4 transition-all ${
                  isDragging
                    ? "opacity-50 ring-2 ring-[var(--primary)]"
                    : isDragOver
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                } ${!section.isVisible ? "opacity-60" : ""}`}
              >
                {/* Drag handle */}
                <div className="cursor-grab text-foreground-muted hover:text-foreground">
                  <GripIcon className="h-5 w-5" />
                </div>

                {/* Section icon & info */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                      definition?.autoFill
                        ? "bg-[var(--ai)]/10 text-[var(--ai)]"
                        : "bg-[var(--primary)]/10 text-[var(--primary)]"
                    }`}
                  >
                    <SectionIcon type={section.sectionType} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground">
                        {section.customTitle || definition?.name || section.sectionType}
                      </p>
                      {definition?.autoFill && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--ai)]/10 px-2 py-0.5 text-xs text-[var(--ai)]">
                          <WandIcon className="h-3 w-3" />
                          Auto-fill
                        </span>
                      )}
                      {!section.isVisible && (
                        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-foreground-muted">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-foreground-secondary">
                      {definition?.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || loading}
                    className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sections.length - 1 || loading}
                    className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setIsConfigModalOpen(true);
                    }}
                    className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
                    title="Edit section"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(section.id)}
                    className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
                    title={section.isVisible ? "Hide section" : "Show section"}
                  >
                    {section.isVisible ? (
                      <EyeIcon className="h-4 w-4" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDuplicateSection(section.id)}
                    disabled={loading}
                    className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
                    title="Duplicate section"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    disabled={loading}
                    className="rounded-lg p-2 text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
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

      {/* Quick tips */}
      <div className="rounded-xl border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-4">
        <div className="flex gap-3">
          <WandIcon className="h-5 w-5 flex-shrink-0 text-[var(--ai)]" />
          <div>
            <h4 className="font-medium text-[var(--ai)]">Auto-Fill Sections</h4>
            <p className="mt-1 text-sm text-foreground-secondary">
              Sections marked with the magic wand automatically populate with your property data.
              When you update property details, these sections update too.
            </p>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Choose a section to add to your property website. Auto-fill sections populate with your property data.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {sectionCategories.map((category) => {
                const categorySections = getPropertySectionsByCategory(category.id);
                if (categorySections.length === 0) return null;

                return (
                  <div key={category.id}>
                    <div className="mb-3">
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                      <p className="text-sm text-foreground-secondary">{category.description}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {categorySections.map((section) => (
                        <button
                          key={section.type}
                          onClick={() => handleAddSection(section.type)}
                          disabled={loading}
                          className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 text-left transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)] disabled:opacity-50"
                        >
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                              section.autoFill
                                ? "bg-[var(--ai)]/10 text-[var(--ai)]"
                                : "bg-[var(--primary)]/10 text-[var(--primary)]"
                            }`}
                          >
                            <SectionIcon type={section.type} className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{section.name}</p>
                              {section.autoFill && (
                                <WandIcon className="h-3 w-3 text-[var(--ai)]" />
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-foreground-secondary line-clamp-2">
                              {section.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Section Config Modal */}
      {selectedSection && (
        <PropertySectionConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false);
            setSelectedSection(null);
          }}
          section={selectedSection}
          onSave={() => {
            router.refresh();
            setIsConfigModalOpen(false);
            setSelectedSection(null);
          }}
        />
      )}
    </div>
  );
}

// Section icon mapper
function SectionIcon({ type, className }: { type: PropertySectionType; className?: string }) {
  const iconMap: Record<PropertySectionType, React.ReactNode> = {
    property_hero: <HomeIcon className={className} />,
    property_details: <GridIcon className={className} />,
    property_features: <ListIcon className={className} />,
    property_description: <FileTextIcon className={className} />,
    property_gallery: <ImagesIcon className={className} />,
    floor_plans: <LayoutIcon className={className} />,
    virtual_tour: <ViewIcon className={className} />,
    video_tour: <VideoIcon className={className} />,
    location_map: <MapPinIcon className={className} />,
    neighborhood: <BuildingIcon className={className} />,
    walk_score: <FootprintsIcon className={className} />,
    agent_info: <UserIcon className={className} />,
    inquiry_form: <MessageIcon className={className} />,
    open_house: <CalendarIcon className={className} />,
    testimonials: <QuoteIcon className={className} />,
    similar_properties: <Grid3x3Icon className={className} />,
    price_history: <TrendingIcon className={className} />,
    mortgage_calculator: <CalculatorIcon className={className} />,
    text_block: <TypeIcon className={className} />,
    image_block: <ImageIcon className={className} />,
    video_block: <PlayIcon className={className} />,
    spacer: <MinusIcon className={className} />,
    divider: <SeparatorIcon className={className} />,
    call_to_action: <MousePointerIcon className={className} />,
    custom_html: <CodeIcon className={className} />,
  };

  return iconMap[type] || <LayersIcon className={className} />;
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 006 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

// Section-specific icons
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ImagesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function ViewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function FootprintsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10a4 4 0 11-8 0 4 4 0 018 0zM5 15a3 3 0 013-3h8a3 3 0 013 3v3H5v-3z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </svg>
  );
}

function Grid3x3Icon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function CalculatorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function TypeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

function SeparatorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
    </svg>
  );
}

function MousePointerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}
