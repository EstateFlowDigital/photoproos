"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { createContract } from "@/lib/actions/contracts";

interface Client {
  id: string;
  fullName: string | null;
  company: string | null;
  email: string;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  content: string;
}

interface ContractFormData {
  name: string;
  content: string;
  clientId: string | null;
  templateId: string | null;
  expiresAt: string;
}

interface ContractFormClientProps {
  clients: Client[];
  templates: Template[];
}

// Template variables that can be inserted
const TEMPLATE_VARIABLES = [
  { key: "{{client_name}}", label: "Client Name" },
  { key: "{{client_email}}", label: "Client Email" },
  { key: "{{photographer_name}}", label: "Photographer Name" },
  { key: "{{session_date}}", label: "Session Date" },
  { key: "{{session_location}}", label: "Location" },
  { key: "{{total_amount}}", label: "Total Amount" },
  { key: "{{deposit_amount}}", label: "Deposit Amount" },
  { key: "{{current_date}}", label: "Current Date" },
];

export function ContractFormClient({ clients, templates }: ContractFormClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const clientIdFromUrl = searchParams?.get("clientId");
  const templateIdFromUrl = searchParams?.get("templateId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ContractFormData>({
    name: "",
    content: getDefaultContent(),
    clientId: clientIdFromUrl || null,
    templateId: templateIdFromUrl || null,
    expiresAt: "",
  });

  // When template changes, update the content
  useEffect(() => {
    if (formData.templateId) {
      const template = templates.find((t) => t.id === formData.templateId);
      if (template) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || template.name,
          content: template.content,
        }));
      }
    }
  }, [formData.templateId, templates]);

  // Set initial template from URL
  useEffect(() => {
    if (templateIdFromUrl) {
      const template = templates.find((t) => t.id === templateIdFromUrl);
      if (template) {
        setFormData((prev) => ({
          ...prev,
          templateId: templateIdFromUrl,
          name: template.name,
          content: template.content,
        }));
      }
    }
  }, [templateIdFromUrl, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Contract name is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Contract content is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createContract({
        name: formData.name,
        content: formData.content,
        clientId: formData.clientId || undefined,
        templateId: formData.templateId || undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      });

      if (result.success) {
        showToast("Contract created successfully", "success");
        router.push(`/contracts/${result.data.id}`);
        router.refresh();
      } else {
        setError(result.error || "Failed to create contract");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    if (templateId === "") {
      setFormData((prev) => ({
        ...prev,
        templateId: null,
        content: getDefaultContent(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, templateId }));
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        formData.content.slice(0, start) + variable + formData.content.slice(end);
      setFormData({ ...formData, content: newContent });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const selectedClient = clients.find((c) => c.id === formData.clientId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Contract Details</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                  Contract Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Wedding Photography Contract - Smith"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="template" className="block text-sm font-medium text-foreground mb-1.5">
                    Start from Template
                  </label>
                  <select
                    id="template"
                    value={formData.templateId || ""}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="">Start from scratch</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="expiresAt" className="block text-sm font-medium text-foreground mb-1.5">
                    Expires On
                  </label>
                  <input
                    type="date"
                    id="expiresAt"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="client" className="block text-sm font-medium text-foreground mb-1.5">
                  Assign to Client
                </label>
                <select
                  id="client"
                  value={formData.clientId || ""}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value || null })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="">No client assigned</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.fullName || client.company || client.email}
                    </option>
                  ))}
                </select>
                {selectedClient && (
                  <p className="mt-1 text-xs text-foreground-muted">
                    {selectedClient.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Contract Content</h2>
              <span className="text-xs text-foreground-muted">
                Use variables like {"{{client_name}}"} for dynamic content
              </span>
            </div>

            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={20}
              placeholder="Enter your contract content here..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-foreground font-mono placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Insert Variable</h3>
            <p className="text-xs text-foreground-muted mb-4">
              Click to insert at cursor position
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_VARIABLES.map((variable) => (
                <button
                  key={variable.key}
                  type="button"
                  onClick={() => insertVariable(variable.key)}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-[var(--background-hover)] hover:border-[var(--border-hover)]"
                >
                  {variable.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Next Steps</h3>
            <ul className="space-y-2 text-xs text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                Create the contract with your content
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                Add signers (client and/or yourself)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                Send the contract for signing
              </li>
            </ul>
          </div>

          {/* Actions Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Contract"}
              </button>

              <Link
                href="/contracts"
                className="block w-full rounded-lg border border-[var(--card-border)] px-4 py-2.5 text-sm font-medium text-foreground text-center transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* No templates notice */}
          {templates.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
              <p className="text-sm text-foreground-muted mb-3">
                No templates yet
              </p>
              <Link
                href="/contracts/templates/new"
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Create a template
              </Link>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

function getDefaultContent(): string {
  return `PHOTOGRAPHY SERVICES AGREEMENT

This Photography Services Agreement ("Agreement") is entered into between:

Photographer: {{photographer_name}}
Client: {{client_name}}

1. SERVICES
The Photographer agrees to provide photography services as described below.

2. DATE AND LOCATION
Date: {{session_date}}
Location: {{session_location}}

3. PAYMENT
Total Fee: {{total_amount}}

4. TERMS AND CONDITIONS
[Add your terms and conditions here]

5. CANCELLATION POLICY
[Add your cancellation policy here]

6. COPYRIGHT & USAGE
The Photographer retains copyright to all images. Client receives a license for personal use.


SIGNATURES

Photographer: ______________________ Date: __________

Client: ______________________ Date: __________`;
}
