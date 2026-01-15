"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Layer, LayerType } from "@/components/marketing-studio/types";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  Square,
  Circle,
  Minus,
  Layers,
  GripVertical,
  Group,
} from "lucide-react";

interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onAddLayer: (type: LayerType) => void;
  onDeleteLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onReorderLayers: (fromIndex: number, toIndex: number) => void;
  onDuplicateLayer: (id: string) => void;
  className?: string;
}

const LAYER_TYPE_ICONS: Record<LayerType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  mockup: Layers,
  text: Type,
  shape: Square,
  logo: Layers,
  group: Group,
};

const LAYER_TYPE_NAMES: Record<LayerType, string> = {
  image: "Image",
  mockup: "Mockup",
  text: "Text",
  shape: "Shape",
  logo: "Logo",
  group: "Group",
};

const ADD_LAYER_OPTIONS: { type: LayerType; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { type: "text", icon: Type, label: "Add Text" },
  { type: "image", icon: ImageIcon, label: "Add Image" },
  { type: "shape", icon: Square, label: "Add Shape" },
];

export function LayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onToggleVisibility,
  onToggleLock,
  onReorderLayers,
  onDuplicateLayer,
  className,
}: LayersPanelProps) {
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const addMenuRef = React.useRef<HTMLDivElement>(null);

  // Sort layers by zIndex (highest first)
  const sortedLayers = React.useMemo(
    () => [...layers].sort((a, b) => b.zIndex - a.zIndex),
    [layers]
  );

  // Close add menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent, layerId: string, index: number) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDeleteLayer(layerId);
      } else if (e.key === "ArrowUp" && index > 0) {
        e.preventDefault();
        onReorderLayers(index, index - 1);
      } else if (e.key === "ArrowDown" && index < sortedLayers.length - 1) {
        e.preventDefault();
        onReorderLayers(index, index + 1);
      }
    },
    [sortedLayers.length, onDeleteLayer, onReorderLayers]
  );

  // Handle drag start
  const handleDragStart = React.useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  // Handle drag over
  const handleDragOver = React.useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderLayers(draggedIndex, index);
      setDraggedIndex(index);
    }
  }, [draggedIndex, onReorderLayers]);

  // Handle drag end
  const handleDragEnd = React.useCallback(() => {
    setDraggedIndex(null);
  }, []);

  return (
    <div className={cn("layers-panel flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
          <span className="text-sm font-medium text-[var(--foreground)]">Layers</span>
          <span className="text-xs text-[var(--foreground-muted)]">({layers.length})</span>
        </div>
        <div className="relative" ref={addMenuRef}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center justify-center h-7 w-7 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label="Add new layer"
            aria-expanded={showAddMenu}
            aria-haspopup="menu"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
          {showAddMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-lg z-10"
              role="menu"
              aria-label="Add layer options"
            >
              {ADD_LAYER_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    onAddLayer(option.type);
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)] first:rounded-t-lg last:rounded-b-lg focus:outline-none focus-visible:bg-[var(--background-hover)]"
                  role="menuitem"
                >
                  <option.icon className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Layer list">
        {sortedLayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Layers className="h-8 w-8 text-[var(--foreground-muted)] mb-2" aria-hidden="true" />
            <p className="text-sm text-[var(--foreground-muted)]">No layers yet</p>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              Add a layer to get started
            </p>
          </div>
        ) : (
          <ul className="py-1">
            {sortedLayers.map((layer, index) => {
              const Icon = LAYER_TYPE_ICONS[layer.type];
              const isSelected = selectedLayerId === layer.id;
              const isDragging = draggedIndex === index;

              return (
                <li
                  key={layer.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group relative",
                    isDragging && "opacity-50"
                  )}
                >
                  <button
                    onClick={() => onSelectLayer(isSelected ? null : layer.id)}
                    onKeyDown={(e) => handleKeyDown(e, layer.id, index)}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]",
                      isSelected
                        ? "bg-[var(--primary)]/10 border-l-2 border-[var(--primary)]"
                        : "hover:bg-[var(--background-hover)] border-l-2 border-transparent"
                    )}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={`${layer.name}, ${LAYER_TYPE_NAMES[layer.type]} layer${layer.visible ? "" : ", hidden"}${layer.locked ? ", locked" : ""}`}
                  >
                    {/* Drag Handle */}
                    <GripVertical
                      className="h-3 w-3 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                      aria-hidden="true"
                    />

                    {/* Layer Type Icon */}
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded",
                        isSelected ? "bg-[var(--primary)]/20" : "bg-[var(--background)]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          isSelected ? "text-[var(--primary)]" : "text-[var(--foreground-muted)]"
                        )}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Layer Name */}
                    <span
                      className={cn(
                        "flex-1 text-xs font-medium truncate",
                        isSelected ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]",
                        !layer.visible && "opacity-50"
                      )}
                    >
                      {layer.name}
                    </span>

                    {/* Layer Controls */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Visibility Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(layer.id);
                        }}
                        className="p-1 rounded hover:bg-[var(--background)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label={layer.visible ? "Hide layer" : "Show layer"}
                      >
                        {layer.visible ? (
                          <Eye className="h-3 w-3 text-[var(--foreground-muted)]" aria-hidden="true" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-[var(--foreground-muted)]" aria-hidden="true" />
                        )}
                      </button>

                      {/* Lock Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(layer.id);
                        }}
                        className="p-1 rounded hover:bg-[var(--background)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label={layer.locked ? "Unlock layer" : "Lock layer"}
                      >
                        {layer.locked ? (
                          <Lock className="h-3 w-3 text-[var(--warning)]" aria-hidden="true" />
                        ) : (
                          <Unlock className="h-3 w-3 text-[var(--foreground-muted)]" aria-hidden="true" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLayer(layer.id);
                        }}
                        className="p-1 rounded hover:bg-[var(--error)]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label="Delete layer"
                      >
                        <Trash2 className="h-3 w-3 text-[var(--foreground-muted)] hover:text-[var(--error)]" aria-hidden="true" />
                      </button>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer Actions */}
      {selectedLayerId && (
        <div className="flex items-center justify-between p-2 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const currentIndex = sortedLayers.findIndex((l) => l.id === selectedLayerId);
                if (currentIndex > 0) {
                  onReorderLayers(currentIndex, currentIndex - 1);
                }
              }}
              disabled={sortedLayers.findIndex((l) => l.id === selectedLayerId) === 0}
              className="p-1.5 rounded hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label="Move layer up"
            >
              <ChevronUp className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
            </button>
            <button
              onClick={() => {
                const currentIndex = sortedLayers.findIndex((l) => l.id === selectedLayerId);
                if (currentIndex < sortedLayers.length - 1) {
                  onReorderLayers(currentIndex, currentIndex + 1);
                }
              }}
              disabled={sortedLayers.findIndex((l) => l.id === selectedLayerId) === sortedLayers.length - 1}
              className="p-1.5 rounded hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label="Move layer down"
            >
              <ChevronDown className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
            </button>
          </div>
          <button
            onClick={() => onDuplicateLayer(selectedLayerId)}
            className="text-xs text-[var(--primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded px-1"
          >
            Duplicate
          </button>
        </div>
      )}
    </div>
  );
}
