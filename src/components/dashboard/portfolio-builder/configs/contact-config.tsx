"use client";

interface ContactConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function ContactConfigForm({
  config,
  updateConfig,
}: ContactConfigFormProps) {
  const title = (config.title as string) || "Get in Touch";
  const subtitle = (config.subtitle as string) || "";
  const showForm = config.showForm !== false;
  const showMap = config.showMap === true;
  const showSocial = config.showSocial !== false;
  const showEmail = config.showEmail !== false;
  const showPhone = config.showPhone !== false;
  const mapAddress = (config.mapAddress as string) || "";

  return (
    <div className="space-y-5">
      {/* Section Title */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Section Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => updateConfig({ title: e.target.value })}
          placeholder="Get in Touch"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Subtitle{" "}
          <span className="text-foreground-muted">(optional)</span>
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => updateConfig({ subtitle: e.target.value })}
          placeholder="I'd love to hear about your project"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Display Options */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Display Options
        </label>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showForm}
              onChange={(e) => updateConfig({ showForm: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">Show contact form</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showEmail}
              onChange={(e) => updateConfig({ showEmail: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">
              Show email address (from organization settings)
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showPhone}
              onChange={(e) => updateConfig({ showPhone: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">
              Show phone number (from organization settings)
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showSocial}
              onChange={(e) => updateConfig({ showSocial: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">
              Show social media links
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showMap}
              onChange={(e) => updateConfig({ showMap: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">Show map</span>
          </label>
        </div>
      </div>

      {/* Map Address */}
      {showMap && (
        <div>
          <label className="text-sm font-medium text-foreground">
            Map Address
          </label>
          <input
            type="text"
            value={mapAddress}
            onChange={(e) => updateConfig({ mapAddress: e.target.value || null })}
            placeholder="123 Main St, City, State 12345"
            className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
          />
          <p className="mt-1 text-xs text-foreground-muted">
            Enter a full address for the embedded map
          </p>
        </div>
      )}
    </div>
  );
}
