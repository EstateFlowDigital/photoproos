"use client";

import { useState, useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";
import { ComponentLibrary } from "./component-library";
import { ComponentEditor } from "./component-editor";
import type { PageComponentInstance, ComponentWithSchema } from "@/lib/cms/page-builder-utils";
import type { MarketingPage } from "@prisma/client";
import {
  addComponentToPage,
  removeComponentFromPage,
  reorderPageComponents,
  updateComponentInstanceContent,
  duplicateComponentInstance,
} from "@/lib/actions/cms-page-builder";
import {
  GripVertical,
  Trash2,
  Copy,
  Settings,
  Eye,
  ChevronUp,
  ChevronDown,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface PageBuilderProps {
  page: MarketingPage;
  initialComponents: PageComponentInstance[];
  onSave?: (components: PageComponentInstance[]) => void;
  className?: string;
}

interface CanvasComponentProps {
  instance: PageComponentInstance;
  index: number;
  totalCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDropTarget: boolean;
}

// ============================================================================
// CANVAS COMPONENT
// ============================================================================

function CanvasComponent({
  instance,
  index,
  totalCount,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDropTarget,
}: CanvasComponentProps) {
  const content = instance.content as Record<string, unknown>;
  const title = (content.title as string) || (content.headline as string) || instance.componentSlug;

  return (
    <div
      className={cn(
        "canvas-component group relative",
        "border-2 rounded-lg transition-all",
        isSelected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--border)] hover:border-[var(--border-hover)]",
        isDropTarget && "border-dashed border-[var(--primary)]"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={onSelect}
    >
      {/* Component Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] rounded-t-lg border-b border-[var(--border)]">
        <GripVertical className="w-4 h-4 text-[var(--foreground-muted)] cursor-grab" />
        <span className="text-sm font-medium flex-1 truncate">{title}</span>
        <span className="text-xs text-[var(--foreground-muted)] px-2 py-0.5 bg-[var(--background-tertiary)] rounded">
          {instance.componentSlug}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            className="p-1 rounded hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalCount - 1}
            className="p-1 rounded hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 rounded hover:bg-[var(--background-hover)]"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="p-1 rounded hover:bg-[var(--background-hover)]"
            title="Edit"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 rounded hover:bg-red-500/10 text-red-500"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Component Preview */}
      <div className="p-4 min-h-[60px] bg-[var(--background-tertiary)]/50">
        <ComponentPreview instance={instance} />
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT PREVIEW
// ============================================================================

function ComponentPreview({ instance }: { instance: PageComponentInstance }) {
  const content = instance.content as Record<string, unknown>;

  // Simple preview based on component type
  switch (instance.componentSlug) {
    case "hero":
      return (
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold">{content.headline as string || "Hero Headline"}</h3>
          {content.subheadline && (
            <p className="text-sm text-[var(--foreground-secondary)]">{content.subheadline as string}</p>
          )}
          {content.ctaText && (
            <button className="mt-2 px-4 py-1 text-xs bg-[var(--primary)] text-white rounded">
              {content.ctaText as string}
            </button>
          )}
        </div>
      );

    case "features-grid":
    case "features-list":
      const features = content.features as Array<{ title: string; description?: string }> || [];
      return (
        <div className="space-y-2">
          {content.title && <h4 className="font-medium">{content.title as string}</h4>}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {features.slice(0, 4).map((f, i) => (
              <div key={i} className="p-2 bg-[var(--card)] rounded border border-[var(--border)]">
                <p className="font-medium">{f.title}</p>
              </div>
            ))}
          </div>
          {features.length > 4 && (
            <p className="text-xs text-[var(--foreground-muted)]">+{features.length - 4} more</p>
          )}
        </div>
      );

    case "testimonials":
      const testimonials = content.testimonials as Array<{ quote: string; author: string }> || [];
      return (
        <div className="space-y-2">
          {content.title && <h4 className="font-medium">{content.title as string}</h4>}
          {testimonials.length > 0 ? (
            <div className="p-3 bg-[var(--card)] rounded border border-[var(--border)] text-sm italic">
              &quot;{testimonials[0].quote}&quot;
              <p className="text-xs text-[var(--foreground-secondary)] mt-1 not-italic">
                — {testimonials[0].author}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[var(--foreground-muted)]">No testimonials added</p>
          )}
        </div>
      );

    case "faq-accordion":
      const faqs = content.faqs as Array<{ question: string }> || [];
      return (
        <div className="space-y-2">
          {content.title && <h4 className="font-medium">{content.title as string}</h4>}
          <div className="space-y-1 text-xs">
            {faqs.slice(0, 3).map((faq, i) => (
              <div key={i} className="p-2 bg-[var(--card)] rounded border border-[var(--border)]">
                {faq.question}
              </div>
            ))}
            {faqs.length > 3 && (
              <p className="text-[var(--foreground-muted)]">+{faqs.length - 3} more</p>
            )}
          </div>
        </div>
      );

    case "cta-section":
      return (
        <div className="text-center space-y-2">
          <h4 className="font-medium">{content.headline as string || "Call to Action"}</h4>
          {content.description && (
            <p className="text-sm text-[var(--foreground-secondary)]">{content.description as string}</p>
          )}
          <div className="flex gap-2 justify-center">
            {content.primaryCtaText && (
              <button className="px-3 py-1 text-xs bg-[var(--primary)] text-white rounded">
                {content.primaryCtaText as string}
              </button>
            )}
            {content.secondaryCtaText && (
              <button className="px-3 py-1 text-xs border border-[var(--border)] rounded">
                {content.secondaryCtaText as string}
              </button>
            )}
          </div>
        </div>
      );

    case "stats-metrics":
      const stats = content.stats as Array<{ value: string; label: string }> || [];
      return (
        <div className="space-y-2">
          {content.title && <h4 className="font-medium">{content.title as string}</h4>}
          <div className="flex gap-4 text-center">
            {stats.slice(0, 4).map((stat, i) => (
              <div key={i} className="flex-1">
                <p className="text-lg font-bold text-[var(--primary)]">{stat.value}</p>
                <p className="text-xs text-[var(--foreground-secondary)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "text-block":
      return (
        <div className="text-sm text-[var(--foreground-secondary)] line-clamp-3">
          {(content.content as string)?.replace(/<[^>]*>/g, "") || "Rich text content..."}
        </div>
      );

    case "pricing-table":
      return (
        <div className="text-center space-y-2">
          <h4 className="font-medium">{content.title as string || "Pricing"}</h4>
          <div className="flex gap-2 justify-center">
            <div className="w-20 h-24 bg-[var(--card)] border border-[var(--border)] rounded flex items-center justify-center text-xs">
              Basic
            </div>
            <div className="w-20 h-24 bg-[var(--primary)]/10 border border-[var(--primary)] rounded flex items-center justify-center text-xs">
              Pro
            </div>
            <div className="w-20 h-24 bg-[var(--card)] border border-[var(--border)] rounded flex items-center justify-center text-xs">
              Enterprise
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-12 text-sm text-[var(--foreground-muted)]">
          {instance.componentSlug} component
        </div>
      );
  }
}

// ============================================================================
// DROP ZONE
// ============================================================================

interface DropZoneProps {
  onDrop: () => void;
  isOver: boolean;
}

function DropZone({ onDrop, isOver }: DropZoneProps) {
  return (
    <div
      className={cn(
        "drop-zone py-4 border-2 border-dashed rounded-lg transition-all",
        isOver
          ? "border-[var(--primary)] bg-[var(--primary)]/10"
          : "border-[var(--border)] hover:border-[var(--border-hover)]"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <div className="flex flex-col items-center justify-center text-sm text-[var(--foreground-muted)]">
        <Plus className="w-5 h-5 mb-1" />
        <span>Drop component here</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE BUILDER
// ============================================================================

export function PageBuilder({
  page,
  initialComponents,
  onSave,
  className,
}: PageBuilderProps) {
  const [components, setComponents] = useState<PageComponentInstance[]>(initialComponents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Find selected component
  const selectedComponent = selectedId
    ? components.find((c) => c.id === selectedId)
    : null;

  // Handle adding a component from library
  const handleComponentSelect = useCallback(
    async (component: ComponentWithSchema) => {
      setError(null);
      startTransition(async () => {
        const result = await addComponentToPage(page.id, component.slug);
        if (result.success && result.data) {
          setComponents((prev) => [...prev, result.data.instance]);
          setSelectedId(result.data.instance.id);
          onSave?.(components);
        } else {
          setError(result.error || "Failed to add component");
        }
      });
    },
    [page.id, onSave, components]
  );

  // Handle removing a component
  const handleRemove = useCallback(
    async (instanceId: string) => {
      setError(null);
      startTransition(async () => {
        const result = await removeComponentFromPage(page.id, instanceId);
        if (result.success) {
          setComponents((prev) => prev.filter((c) => c.id !== instanceId));
          if (selectedId === instanceId) {
            setSelectedId(null);
          }
          onSave?.(components);
        } else {
          setError(result.error || "Failed to remove component");
        }
      });
    },
    [page.id, selectedId, onSave, components]
  );

  // Handle duplicating a component
  const handleDuplicate = useCallback(
    async (instanceId: string) => {
      setError(null);
      startTransition(async () => {
        const result = await duplicateComponentInstance(page.id, instanceId);
        if (result.success && result.data) {
          const instance = result.data.instance;
          const originalIndex = components.findIndex((c) => c.id === instanceId);
          setComponents((prev) => {
            const newComponents = [...prev];
            newComponents.splice(originalIndex + 1, 0, instance);
            return newComponents.map((c, i) => ({ ...c, order: i }));
          });
          setSelectedId(instance.id);
          onSave?.(components);
        } else {
          setError(result.error || "Failed to duplicate component");
        }
      });
    },
    [page.id, components, onSave]
  );

  // Handle reordering
  const handleMove = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      setError(null);
      startTransition(async () => {
        const result = await reorderPageComponents(page.id, fromIndex, toIndex);
        if (result.success) {
          setComponents((prev) => {
            const newComponents = [...prev];
            const [removed] = newComponents.splice(fromIndex, 1);
            newComponents.splice(toIndex, 0, removed);
            return newComponents.map((c, i) => ({ ...c, order: i }));
          });
          onSave?.(components);
        } else {
          setError(result.error || "Failed to reorder components");
        }
      });
    },
    [page.id, onSave, components]
  );

  // Handle content update
  const handleContentUpdate = useCallback(
    async (instanceId: string, content: Record<string, unknown>) => {
      setError(null);
      startTransition(async () => {
        const result = await updateComponentInstanceContent(page.id, instanceId, content);
        if (result.success) {
          setComponents((prev) =>
            prev.map((c) =>
              c.id === instanceId ? { ...c, content: { ...c.content, ...content } } : c
            )
          );
          onSave?.(components);
        } else {
          setError(result.error || "Failed to update content");
        }
      });
    },
    [page.id, onSave, components]
  );

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragSourceIndex(index);
    e.dataTransfer.setData("application/json", JSON.stringify({
      type: "reorder",
      index,
    }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragSourceIndex !== null && dragSourceIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));

      if (data.type === "reorder" && dragSourceIndex !== null) {
        handleMove(dragSourceIndex, targetIndex);
      } else if (data.type === "component") {
        // Handle drop from library - add at specific position
        startTransition(async () => {
          const result = await addComponentToPage(page.id, data.componentSlug, targetIndex);
          if (result.success && result.data) {
            setComponents((prev) => {
              const newComponents = [...prev];
              newComponents.splice(targetIndex, 0, result.data!.instance);
              return newComponents.map((c, i) => ({ ...c, order: i }));
            });
            setSelectedId(result.data.instance.id);
          }
        });
      }
    } catch {
      // Invalid drag data
    }

    setDragSourceIndex(null);
  };

  const handleCanvasDragEnd = () => {
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={cn("page-builder grid grid-cols-[280px_1fr_350px] h-full", className)}>
      {/* Component Library */}
      <div className="border-r border-[var(--border)] bg-[var(--card)]">
        <ComponentLibrary onComponentSelect={handleComponentSelect} />
      </div>

      {/* Canvas */}
      <div
        className="canvas-area flex flex-col overflow-hidden bg-[var(--background-tertiary)]"
        onDragEnd={handleCanvasDragEnd}
      >
        {/* Canvas Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{page.title}</h3>
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />}
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
            <span>{components.length} component{components.length !== 1 ? "s" : ""}</span>
            <button className="flex items-center gap-1 px-3 py-1 rounded hover:bg-[var(--background-hover)]">
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-500">
            <AlertTriangle className="w-4 h-4" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Canvas Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {components.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--background-elevated)] flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-[var(--foreground-muted)]" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Start building your page</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Drag components from the library or click to add
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {components.map((instance, index) => (
                <CanvasComponent
                  key={instance.id}
                  instance={instance}
                  index={index}
                  totalCount={components.length}
                  isSelected={selectedId === instance.id}
                  onSelect={() => setSelectedId(instance.id)}
                  onRemove={() => handleRemove(instance.id)}
                  onDuplicate={() => handleDuplicate(instance.id)}
                  onMoveUp={() => handleMove(index, index - 1)}
                  onMoveDown={() => handleMove(index, index + 1)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDropTarget={dragOverIndex === index}
                />
              ))}

              {/* Drop zone at end */}
              <DropZone
                onDrop={() => {
                  if (dragSourceIndex !== null) {
                    handleMove(dragSourceIndex, components.length - 1);
                  }
                }}
                isOver={dragOverIndex === components.length}
              />
            </div>
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="border-l border-[var(--border)] bg-[var(--card)] overflow-y-auto">
        {selectedComponent ? (
          <ComponentEditor
            instance={selectedComponent}
            onUpdate={(content) => handleContentUpdate(selectedComponent.id, content)}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-sm text-[var(--foreground-muted)]">
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a component to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { CanvasComponent, ComponentPreview, DropZone };
export type { PageBuilderProps, CanvasComponentProps };
