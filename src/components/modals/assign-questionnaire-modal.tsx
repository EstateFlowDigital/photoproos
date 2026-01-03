"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { assignQuestionnaireToClient } from "@/lib/actions/client-questionnaires";
import type { QuestionnaireTemplateWithRelations } from "@/lib/actions/questionnaire-templates";

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  company?: string | null;
}

interface Booking {
  id: string;
  title: string;
}

interface Project {
  id: string;
  name: string;
}

interface FieldErrors {
  template?: string;
  client?: string;
}

interface AssignQuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (questionnaire: { id: string }) => void;
  templates: QuestionnaireTemplateWithRelations[];
  clients: Client[];
  bookings?: Booking[];
  projects?: Project[];
  defaultClientId?: string;
  defaultBookingId?: string;
  defaultProjectId?: string;
}

export function AssignQuestionnaireModal({
  open,
  onOpenChange,
  onSuccess,
  templates,
  clients,
  bookings = [],
  projects = [],
  defaultClientId,
  defaultBookingId,
  defaultProjectId,
}: AssignQuestionnaireModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [templateId, setTemplateId] = useState("");
  const [clientId, setClientId] = useState(defaultClientId || "");
  const [bookingId, setBookingId] = useState(defaultBookingId || "");
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [isRequired, setIsRequired] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [sendReminders, setSendReminders] = useState(true);
  const [internalNotes, setInternalNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "template" && !value) {
      setFieldErrors((prev) => ({ ...prev, template: "Please select a template" }));
    } else if (field === "client" && !value) {
      setFieldErrors((prev) => ({ ...prev, client: "Please select a client" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getSelectClassName = (fieldName: keyof FieldErrors) => {
    const hasError = touched[fieldName] && fieldErrors[fieldName];
    return hasError
      ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]"
      : "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    const errors: FieldErrors = {};
    if (!templateId) errors.template = "Please select a template";
    if (!clientId) errors.client = "Please select a client";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ template: true, client: true });
      return;
    }

    startTransition(async () => {
      try {
        const result = await assignQuestionnaireToClient({
          templateId,
          clientId,
          bookingId: bookingId || undefined,
          projectId: projectId || undefined,
          isRequired,
          dueDate: dueDate || undefined,
          sendReminders,
          internalNotes: internalNotes.trim() || undefined,
        });

        if (result.success) {
          // Reset form
          resetForm();
          onOpenChange(false);

          showToast("Questionnaire assigned successfully", "success");

          // Call success callback
          onSuccess?.({ id: result.data.id });

          // Refresh the page
          router.refresh();
        } else {
          setError(result.error);
          showToast(result.error, "error");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        showToast("An unexpected error occurred", "error");
      }
    });
  };

  const resetForm = () => {
    setTemplateId("");
    setClientId(defaultClientId || "");
    setBookingId(defaultBookingId || "");
    setProjectId(defaultProjectId || "");
    setIsRequired(true);
    setDueDate("");
    setSendReminders(true);
    setInternalNotes("");
    setError(null);
    setFieldErrors({});
    setTouched({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Get selected template for preview
  const selectedTemplate = templates.find((t) => t.id === templateId);

  // Set default date to 7 days from now
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 7);
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Assign Questionnaire</DialogTitle>
          <DialogDescription>
            Send a questionnaire to a client to collect information before their shoot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {error && (
              <div className="rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)]">
                {error}
              </div>
            )}

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Template <span className="text-[var(--error)]">*</span>
              </label>
              <select
                value={templateId}
                onChange={(e) => {
                  setTemplateId(e.target.value);
                  handleBlur("template", e.target.value);
                }}
                onBlur={(e) => handleBlur("template", e.target.value)}
                className={cn(
                  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]",
                  getSelectClassName("template")
                )}
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.industry.replace(/_/g, " ")})
                  </option>
                ))}
              </select>
              {touched.template && fieldErrors.template && (
                <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.template}</p>
              )}
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="rounded-lg border border-[var(--card-border)] bg-background p-3">
                <p className="text-xs text-foreground-muted mb-2">Template preview:</p>
                <div className="flex items-center gap-4 text-xs text-foreground-muted">
                  <span>{selectedTemplate.fields.length} fields</span>
                  <span>{selectedTemplate.legalAgreements.length} legal agreements</span>
                  {selectedTemplate.isSystemTemplate && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400">
                      System Template
                    </span>
                  )}
                </div>
                {selectedTemplate.description && (
                  <p className="mt-2 text-xs text-foreground-muted line-clamp-2">
                    {selectedTemplate.description}
                  </p>
                )}
              </div>
            )}

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Client <span className="text-[var(--error)]">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  handleBlur("client", e.target.value);
                }}
                onBlur={(e) => handleBlur("client", e.target.value)}
                disabled={!!defaultClientId}
                className={cn(
                  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed",
                  getSelectClassName("client")
                )}
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName || client.company || client.email}
                  </option>
                ))}
              </select>
              {touched.client && fieldErrors.client && (
                <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.client}</p>
              )}
            </div>

            {/* Link to Booking (optional) */}
            {bookings.length > 0 && (
              <Select
                name="booking"
                label="Link to Booking"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="None"
                options={bookings.map((booking) => ({
                  value: booking.id,
                  label: booking.title,
                }))}
              />
            )}

            {/* Link to Project (optional) */}
            {projects.length > 0 && (
              <Select
                name="project"
                label="Link to Project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="None"
                options={projects.map((project) => ({
                  value: project.id,
                  label: project.name,
                }))}
              />
            )}

            {/* Due Date */}
            <div>
              <label htmlFor="due-date" className="block text-sm font-medium text-foreground mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                id="due-date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={minDate}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <p className="mt-1 text-xs text-foreground-muted">
                Leave blank for no deadline
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 rounded-lg border border-[var(--card-border)] bg-background p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Required</span>
                  <p className="text-xs text-foreground-muted">Client must complete before the shoot</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={sendReminders}
                  onChange={(e) => setSendReminders(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Send Reminders</span>
                  <p className="text-xs text-foreground-muted">Automatically remind client if not completed</p>
                </div>
              </label>
            </div>

            {/* Internal Notes */}
            <div>
              <label htmlFor="internal-notes" className="block text-sm font-medium text-foreground mb-1.5">
                Internal Notes
              </label>
              <textarea
                id="internal-notes"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Notes for your team (not visible to client)"
                rows={3}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Assigning...
                </>
              ) : (
                "Assign Questionnaire"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
