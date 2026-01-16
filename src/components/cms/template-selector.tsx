"use client";

import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import { getPageTemplates, applyTemplate, seedDefaultTemplates } from "@/lib/actions/cms-templates";
import type { CMSPageTemplate } from "@prisma/client";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";
import {
  FileText,
  Layout,
  Loader2,
  Check,
  Image,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface TemplateSelectorProps {
  onSelect: (components: PageComponentInstance[], templateName: string) => void;
  onCancel: () => void;
  className?: string;
}

interface TemplateCardProps {
  template: CMSPageTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  general: <FileText className="w-5 h-5" />,
  photography: <Image className="w-5 h-5" />,
  "real-estate": <Layout className="w-5 h-5" />,
  wedding: <Sparkles className="w-5 h-5" />,
  commercial: <Layout className="w-5 h-5" />,
};

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const componentCount = (template.components as PageComponentInstance[])?.length || 0;
  const Icon = INDUSTRY_ICONS[template.industry || "general"] || <FileText className="w-5 h-5" />;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col p-4 rounded-xl border-2 text-left transition-all",
        isSelected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
      )}
    >
      {/* Thumbnail or Icon */}
      <div
        className={cn(
          "w-full h-32 rounded-lg mb-3 flex items-center justify-center",
          "bg-[var(--background-tertiary)]"
        )}
      >
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-[var(--foreground-muted)]">{Icon}</div>
        )}
      </div>

      {/* Template Info */}
      <div>
        <h4 className="font-medium mb-1">{template.name}</h4>
        {template.description && (
          <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
            {template.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {template.industry && (
            <span className="px-2 py-0.5 text-xs bg-[var(--background-tertiary)] rounded">
              {template.industry}
            </span>
          )}
          <span className="text-xs text-[var(--foreground-muted)]">
            {componentCount} component{componentCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
}

export function TemplateSelector({
  onSelect,
  onCancel,
  className,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<CMSPageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CMSPageTemplate | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const result = await getPageTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
        // Auto-select "blank" template if available
        const blankTemplate = result.data.find((t) => t.slug === "blank");
        if (blankTemplate) {
          setSelectedTemplate(blankTemplate);
        }
      }
      setLoading(false);
    };

    fetchTemplates();
  }, []);

  // Get unique industries
  const industries = Array.from(
    new Set(templates.map((t) => t.industry).filter(Boolean) as string[])
  );

  // Filter templates by industry
  const filteredTemplates = selectedIndustry
    ? templates.filter((t) => t.industry === selectedIndustry)
    : templates;

  // Handle seed templates
  const handleSeedTemplates = async () => {
    startTransition(async () => {
      const result = await seedDefaultTemplates();
      if (result.success) {
        // Refresh templates
        const fetchResult = await getPageTemplates();
        if (fetchResult.success && fetchResult.data) {
          setTemplates(fetchResult.data);
        }
      }
    });
  };

  // Handle apply template
  const handleApply = async () => {
    if (!selectedTemplate) return;

    startTransition(async () => {
      if (selectedTemplate.slug === "blank") {
        // Blank template - no components
        onSelect([], selectedTemplate.name);
      } else {
        const result = await applyTemplate(selectedTemplate.id);
        if (result.success && result.data) {
          onSelect(result.data.components, selectedTemplate.name);
        }
      }
    });
  };

  return (
    <div className={cn("template-selector", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Choose a Template</h2>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Start with a pre-built template or begin from scratch
          </p>
        </div>
        {templates.length === 0 && !loading && (
          <button
            onClick={handleSeedTemplates}
            disabled={isPending}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm rounded-lg",
              "bg-[var(--primary)] text-white",
              "hover:bg-[var(--primary)]/90",
              "disabled:opacity-50",
              "transition-colors"
            )}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Load Default Templates
          </button>
        )}
      </div>

      {/* Industry Filter */}
      {industries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedIndustry(null)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              selectedIndustry === null
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)]"
            )}
          >
            All Templates
          </button>
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg capitalize transition-colors",
                selectedIndustry === industry
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)]"
              )}
            >
              {industry}
            </button>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--foreground-muted)]" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-3 text-[var(--foreground-muted)] opacity-50" />
          <p className="text-[var(--foreground-muted)]">No templates available</p>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Click &quot;Load Default Templates&quot; to add starter templates
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onSelect={() => setSelectedTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg hover:bg-[var(--background-hover)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={!selectedTemplate || isPending}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm rounded-lg",
            "bg-[var(--primary)] text-white",
            "hover:bg-[var(--primary)]/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Use Template
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Modal wrapper for template selector
 */
interface TemplateSelectorModalProps {
  open: boolean;
  onSelect: (components: PageComponentInstance[], templateName: string) => void;
  onClose: () => void;
}

export function TemplateSelectorModal({
  open,
  onSelect,
  onClose,
}: TemplateSelectorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[var(--card)] rounded-xl shadow-2xl border border-[var(--border)] w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          <TemplateSelector
            onSelect={(components, name) => {
              onSelect(components, name);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
