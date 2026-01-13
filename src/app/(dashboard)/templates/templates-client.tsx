"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Mail,
  ClipboardList,
  PenTool,
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Edit2,
  Trash2,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type TemplateCategory = "email" | "contract" | "questionnaire" | "proposal";

interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  lastModified: string;
  usageCount: number;
  isDefault: boolean;
}

// Mock data
const MOCK_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Booking Confirmation",
    category: "email",
    description: "Sent automatically when a booking is confirmed",
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 156,
    isDefault: true,
  },
  {
    id: "2",
    name: "Gallery Delivery",
    category: "email",
    description: "Send when gallery is ready for client",
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 89,
    isDefault: true,
  },
  {
    id: "3",
    name: "Wedding Photography Contract",
    category: "contract",
    description: "Standard wedding photography agreement",
    lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 45,
    isDefault: true,
  },
  {
    id: "4",
    name: "Portrait Session Contract",
    category: "contract",
    description: "Agreement for portrait and headshot sessions",
    lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 32,
    isDefault: false,
  },
  {
    id: "5",
    name: "Wedding Questionnaire",
    category: "questionnaire",
    description: "Pre-wedding details gathering form",
    lastModified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 28,
    isDefault: true,
  },
  {
    id: "6",
    name: "Wedding Package Proposal",
    category: "proposal",
    description: "Complete wedding photography packages",
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 19,
    isDefault: true,
  },
  {
    id: "7",
    name: "Payment Reminder",
    category: "email",
    description: "Gentle reminder for outstanding invoices",
    lastModified: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 67,
    isDefault: true,
  },
  {
    id: "8",
    name: "Corporate Headshots Questionnaire",
    category: "questionnaire",
    description: "Gather info for business headshot sessions",
    lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 15,
    isDefault: false,
  },
];

const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; icon: React.ElementType; color: string; bg: string; href: string }> = {
  email: { label: "Email Templates", icon: Mail, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", href: "/templates/emails" },
  contract: { label: "Contract Templates", icon: FileText, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10", href: "/contracts" },
  questionnaire: { label: "Questionnaire Templates", icon: ClipboardList, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", href: "/questionnaires/templates" },
  proposal: { label: "Proposal Templates", icon: PenTool, color: "text-[var(--secondary)]", bg: "bg-[var(--secondary)]/10", href: "/templates/proposals" },
};

export function TemplatesClient() {
  const { showToast } = useToast();
  const [templates] = useState<Template[]>(MOCK_TEMPLATES);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.description.toLowerCase().includes(search.toLowerCase())
  );

  // Group templates by category
  const groupedTemplates = Object.entries(CATEGORY_CONFIG).map(([category, config]) => ({
    category: category as TemplateCategory,
    config,
    templates: filteredTemplates.filter((t) => t.category === category),
  }));

  const handleDuplicate = (templateId: string) => {
    showToast("Template duplicated", "success");
    setOpenMenuId(null);
  };

  const handleDelete = (templateId: string) => {
    showToast("Template deleted", "success");
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Create Template
        </Button>
      </div>

      {/* Category Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
          const Icon = config.icon;
          const count = templates.filter((t) => t.category === category).length;
          return (
            <Link
              key={category}
              href={config.href}
              className="card p-5 hover:bg-[var(--background-hover)] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
              </div>
              <h3 className="mt-3 font-medium text-foreground">{config.label}</h3>
              <p className="text-sm text-foreground-muted">{count} templates</p>
            </Link>
          );
        })}
      </div>

      {/* All Templates */}
      {groupedTemplates.map(({ category, config, templates: categoryTemplates }) => {
        if (categoryTemplates.length === 0) return null;
        const Icon = config.icon;

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <h3 className="font-medium text-foreground">{config.label}</h3>
                <span className="text-sm text-foreground-muted">({categoryTemplates.length})</span>
              </div>
              <Link href={config.href} className="text-sm text-[var(--primary)] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {categoryTemplates.slice(0, 3).map((template) => (
                <div
                  key={template.id}
                  className="card p-4 flex items-center justify-between gap-4 hover:bg-[var(--background-hover)] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground truncate">{template.name}</h4>
                        {template.isDefault && (
                          <Star className="h-3 w-3 text-[var(--warning)] fill-[var(--warning)]" />
                        )}
                      </div>
                      <p className="text-xs text-foreground-muted truncate">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-foreground-muted">Used {template.usageCount} times</p>
                      <p className="text-xs text-foreground-muted">Modified {formatDate(template.lastModified)}</p>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === template.id ? null : template.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === template.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(template.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
