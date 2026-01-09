"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  templateType: string;
  content: string;
  availableVariables: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    smsLogs: number;
  };
}

interface SMSTemplatesClientProps {
  templates: Template[];
}

export function SMSTemplatesClient({ templates }: SMSTemplatesClientProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.templateType.toLowerCase().includes(term) ||
        t.content.toLowerCase().includes(term)
    );
  }, [search, templates]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Templates</h2>
          <p className="text-sm text-foreground-secondary">
            Manage the messages used for booking, payment, and gallery notifications.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 sm:max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center text-foreground-secondary">
            No templates match your search.
          </div>
        ) : (
          filtered.map((template) => (
            <div
              key={template.id}
              className={cn(
                "flex h-full flex-col gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground-secondary">
                    {template.templateType.replace(/_/g, " ")}
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {template.isDefault && (
                    <span className="rounded-full bg-[var(--primary)]/10 px-2 py-1 text-xs font-medium text-[var(--primary)]">
                      Default
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      template.isActive
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : "bg-[var(--background-secondary)] text-foreground-muted"
                    )}
                  >
                    {template.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <p className="text-sm text-foreground-secondary line-clamp-3 whitespace-pre-wrap">{template.content}</p>

              {template.availableVariables.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {template.availableVariables.map((v) => (
                    <span key={v} className="rounded-md bg-[var(--background-secondary)] px-2 py-1 text-foreground-muted">
                      {v}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex items-start justify-between gap-4 flex-wrap text-sm text-foreground-secondary">
                <span>{template._count.smsLogs} messages sent</span>
                <Link
                  href={`/settings/sms/templates/${template.id}`}
                  className="text-[var(--primary)] hover:underline"
                >
                  View & edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
