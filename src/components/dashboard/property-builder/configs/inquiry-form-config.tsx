"use client";

interface InquiryFormConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function InquiryFormConfig({ config, updateConfig }: InquiryFormConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          value={(config.title as string) || "Interested in This Property?"}
          onChange={(e) => updateConfig("title", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Subtitle</label>
        <input
          type="text"
          value={(config.subtitle as string) || "Fill out the form below and we'll be in touch"}
          onChange={(e) => updateConfig("subtitle", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Submit Button Text</label>
        <input
          type="text"
          value={(config.submitText as string) || "Send Inquiry"}
          onChange={(e) => updateConfig("submitText", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Success Message</label>
        <input
          type="text"
          value={(config.successMessage as string) || "Thank you! We'll be in touch soon."}
          onChange={(e) => updateConfig("successMessage", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={(config.showScheduleTour as boolean) ?? true}
          onChange={(e) => updateConfig("showScheduleTour", e.target.checked)}
          className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
        />
        <span className="text-sm text-foreground">Show "Schedule a Tour" Option</span>
      </label>

      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] p-3">
        <p className="text-sm text-foreground-secondary">
          Default fields: Name, Email, Phone (optional), Message (optional). Leads will be captured and shown in your Leads tab.
        </p>
      </div>
    </div>
  );
}
