"use client";

import { useState, useEffect, useTransition } from "react";
import { Bookmark, Trash2, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getComponentPresets, deleteComponentPreset, applyPreset } from "@/lib/actions/cms-presets";
import type { CMSComponentPreset, CMSComponentType } from "@prisma/client";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";
import { generateComponentId } from "@/lib/cms/page-builder-utils";

interface PresetLibraryProps {
  onPresetSelect: (instance: Partial<PageComponentInstance>) => void;
  filterType?: CMSComponentType;
  className?: string;
}

export function PresetLibrary({
  onPresetSelect,
  filterType,
  className,
}: PresetLibraryProps) {
  const [presets, setPresets] = useState<CMSComponentPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Fetch presets
  useEffect(() => {
    const fetchPresets = async () => {
      setLoading(true);
      const result = await getComponentPresets(filterType);
      if (result.success && result.data) {
        setPresets(result.data);
      }
      setLoading(false);
    };

    fetchPresets();
  }, [filterType]);

  // Get unique categories
  const categories = Array.from(
    new Set(presets.map((p) => p.category).filter(Boolean) as string[])
  );

  // Filter presets
  const filteredPresets = presets.filter((preset) => {
    const matchesSearch =
      !searchQuery ||
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || preset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group presets by component type
  const groupedPresets = filteredPresets.reduce(
    (acc, preset) => {
      const type = preset.componentType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(preset);
      return acc;
    },
    {} as Record<string, CMSComponentPreset[]>
  );

  const handlePresetClick = async (preset: CMSComponentPreset) => {
    startTransition(async () => {
      const result = await applyPreset(preset.id);
      if (result.success && result.data) {
        onPresetSelect({
          id: generateComponentId(),
          componentSlug: preset.componentType,
          content: result.data,
          order: 0,
        });
      }
    });
  };

  const handleDelete = async (e: React.MouseEvent, presetId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this preset?")) return;

    startTransition(async () => {
      const result = await deleteComponentPreset(presetId);
      if (result.success) {
        setPresets((prev) => prev.filter((p) => p.id !== presetId));
      }
    });
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-[var(--foreground-muted)]" />
      </div>
    );
  }

  return (
    <div className={cn("preset-library", className)}>
      {/* Search and Filter */}
      <div className="p-4 border-b border-[var(--border)] space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search presets..."
            className={cn(
              "w-full pl-9 pr-3 py-2 rounded-lg text-sm",
              "bg-[var(--background-tertiary)] border border-[var(--border)]",
              "focus:outline-none focus:border-[var(--primary)]",
              "transition-colors"
            )}
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-full transition-colors",
                selectedCategory === null
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-full transition-colors",
                  selectedCategory === category
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Presets List */}
      <div className="p-4 overflow-y-auto">
        {filteredPresets.length === 0 ? (
          <div className="text-center py-8 text-[var(--foreground-muted)]">
            <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No presets found</p>
            <p className="text-xs mt-1">
              Save components as presets to reuse them
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPresets).map(([type, typePresets]) => (
              <div key={type}>
                <h4 className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
                  {type.replace(/_/g, " ")}
                </h4>
                <div className="space-y-2">
                  {typePresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetClick(preset)}
                      className={cn(
                        "group relative p-3 rounded-lg cursor-pointer",
                        "bg-[var(--background-tertiary)] border border-[var(--border)]",
                        "hover:border-[var(--primary)] hover:bg-[var(--primary)]/5",
                        "transition-all"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{preset.name}</p>
                          {preset.description && (
                            <p className="text-xs text-[var(--foreground-muted)] mt-0.5 line-clamp-2">
                              {preset.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {preset.category && (
                              <span className="px-1.5 py-0.5 text-xs bg-[var(--background-elevated)] rounded">
                                {preset.category}
                              </span>
                            )}
                            {preset.isGlobal && (
                              <span className="px-1.5 py-0.5 text-xs bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                                Global
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        {!preset.isGlobal && (
                          <button
                            onClick={(e) => handleDelete(e, preset.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Loading overlay */}
                      {isPending && (
                        <div className="absolute inset-0 bg-[var(--card)]/80 rounded-lg flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
