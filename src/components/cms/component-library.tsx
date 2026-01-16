"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getCMSComponents } from "@/lib/actions/cms-page-builder";
import type { CMSComponentCategory } from "@prisma/client";
import type { ComponentWithSchema } from "@/lib/cms/page-builder";
import {
  Layout,
  Grid3x3,
  List,
  MessageSquare,
  HelpCircle,
  MousePointer,
  BarChart3,
  CreditCard,
  Users,
  Image,
  Images,
  FileText,
  PlayCircle,
  Table,
  Clock,
  Squares,
  Mail,
  Send,
  Star,
  CheckCircle,
  Code,
  Search,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface ComponentLibraryProps {
  onComponentSelect: (component: ComponentWithSchema) => void;
  className?: string;
}

interface ComponentCardProps {
  component: ComponentWithSchema;
  onSelect: () => void;
  isDraggable?: boolean;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ElementType> = {
  layout: Layout,
  grid: Grid3x3,
  list: List,
  "message-square": MessageSquare,
  "help-circle": HelpCircle,
  "mouse-pointer": MousePointer,
  "bar-chart": BarChart3,
  "credit-card": CreditCard,
  users: Users,
  image: Image,
  images: Images,
  "file-text": FileText,
  "play-circle": PlayCircle,
  table: Table,
  clock: Clock,
  squares: Squares,
  mail: Mail,
  send: Send,
  star: Star,
  "check-circle": CheckCircle,
  code: Code,
};

function getIconComponent(iconName: string | null): React.ElementType {
  if (!iconName) return Layout;
  return ICON_MAP[iconName] || Layout;
}

// ============================================================================
// CATEGORY CONFIG
// ============================================================================

const CATEGORY_CONFIG: Record<
  CMSComponentCategory,
  { label: string; icon: React.ElementType; color: string }
> = {
  hero: { label: "Hero Sections", icon: Layout, color: "text-blue-400" },
  content: { label: "Content", icon: FileText, color: "text-green-400" },
  social: { label: "Social Proof", icon: MessageSquare, color: "text-purple-400" },
  conversion: { label: "Conversion", icon: MousePointer, color: "text-orange-400" },
  navigation: { label: "Navigation", icon: Grid3x3, color: "text-cyan-400" },
  data: { label: "Data Display", icon: BarChart3, color: "text-yellow-400" },
  custom: { label: "Custom", icon: Code, color: "text-gray-400" },
};

// ============================================================================
// COMPONENT CARD
// ============================================================================

function ComponentCard({ component, onSelect, isDraggable = true }: ComponentCardProps) {
  const Icon = getIconComponent(component.icon);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      type: "component",
      componentId: component.id,
      componentSlug: component.slug,
    }));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      onClick={onSelect}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={cn(
        "component-card group",
        "flex items-center gap-3 p-3 rounded-lg",
        "bg-[var(--card)] border border-[var(--border)]",
        "hover:bg-[var(--background-hover)] hover:border-[var(--border-hover)]",
        "cursor-pointer transition-all",
        isDraggable && "cursor-grab active:cursor-grabbing"
      )}
    >
      {isDraggable && (
        <GripVertical className="w-4 h-4 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      <div className="w-8 h-8 rounded bg-[var(--background-tertiary)] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[var(--foreground-secondary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{component.name}</p>
        {component.description && (
          <p className="text-xs text-[var(--foreground-muted)] truncate">
            {component.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CATEGORY GROUP
// ============================================================================

interface CategoryGroupProps {
  category: CMSComponentCategory;
  components: ComponentWithSchema[];
  onComponentSelect: (component: ComponentWithSchema) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

function CategoryGroup({
  category,
  components,
  onComponentSelect,
  isExpanded,
  onToggle,
}: CategoryGroupProps) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  if (components.length === 0) return null;

  return (
    <div className="category-group">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-[var(--background-hover)] rounded-lg transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
        )}
        <Icon className={cn("w-4 h-4", config.color)} />
        <span>{config.label}</span>
        <span className="ml-auto text-xs text-[var(--foreground-muted)]">
          {components.length}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-2">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onSelect={() => onComponentSelect(component)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComponentLibrary({ onComponentSelect, className }: ComponentLibraryProps) {
  const [components, setComponents] = useState<ComponentWithSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<CMSComponentCategory>>(
    new Set(["hero", "content", "conversion"])
  );

  useEffect(() => {
    async function loadComponents() {
      setLoading(true);
      const result = await getCMSComponents();
      if (result.success && result.data) {
        setComponents(result.data);
      }
      setLoading(false);
    }
    loadComponents();
  }, []);

  // Filter components by search query
  const filteredComponents = searchQuery
    ? components.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : components;

  // Group by category
  const groupedComponents = filteredComponents.reduce(
    (acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    },
    {} as Record<CMSComponentCategory, ComponentWithSchema[]>
  );

  const toggleCategory = (category: CMSComponentCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Category order
  const categoryOrder: CMSComponentCategory[] = [
    "hero",
    "content",
    "social",
    "conversion",
    "data",
    "navigation",
    "custom",
  ];

  return (
    <div className={cn("component-library flex flex-col h-full", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold mb-2">Components</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-6 bg-[var(--background-tertiary)] rounded w-24" />
                <div className="h-16 bg-[var(--background-tertiary)] rounded" />
                <div className="h-16 bg-[var(--background-tertiary)] rounded" />
              </div>
            ))}
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--foreground-muted)]">
              {searchQuery ? "No components found" : "No components available"}
            </p>
          </div>
        ) : searchQuery ? (
          // Flat list when searching
          <div className="space-y-2">
            {filteredComponents.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onSelect={() => onComponentSelect(component)}
              />
            ))}
          </div>
        ) : (
          // Grouped by category when not searching
          categoryOrder.map((category) => (
            <CategoryGroup
              key={category}
              category={category}
              components={groupedComponents[category] || []}
              onComponentSelect={onComponentSelect}
              isExpanded={expandedCategories.has(category)}
              onToggle={() => toggleCategory(category)}
            />
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--foreground-muted)] text-center">
          Drag components to the canvas or click to add
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ComponentCard, CategoryGroup };
export type { ComponentLibraryProps, ComponentCardProps };
