"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  exportSettings,
  importSettings,
  validateImportData,
  type ExportedSettings,
  type ImportOptions,
} from "@/lib/actions/settings-export";

interface SettingsExportImportProps {
  className?: string;
}

/**
 * SettingsExportImport
 *
 * Component for exporting and importing organization settings.
 */
export function SettingsExportImport({ className }: SettingsExportImportProps) {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<ExportedSettings | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    branding: true,
    notifications: true,
    workflow: true,
    travel: true,
    sms: true,
    reviews: true,
    gamification: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportSettings();
      if (result.success && result.data) {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `settings-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast({
          title: "Settings exported",
          description: "Your settings have been downloaded as a JSON file.",
          variant: "success",
        });
      } else {
        showToast({
          title: "Export failed",
          description: result.error || "Failed to export settings",
          variant: "error",
        });
      }
    } catch {
      showToast({
        title: "Export failed",
        description: "An error occurred while exporting settings",
        variant: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the data
      const validation = await validateImportData(data);
      if (!validation.success || !validation.data?.valid) {
        const errors = validation.data?.errors || ["Invalid file format"];
        showToast({
          title: "Invalid file",
          description: errors.join(", "),
          variant: "error",
        });
        return;
      }

      setImportData(data as ExportedSettings);
      setShowImportDialog(true);
    } catch {
      showToast({
        title: "Invalid file",
        description: "Could not parse the settings file. Please ensure it's a valid JSON file.",
        variant: "error",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setIsImporting(true);
    try {
      const result = await importSettings(importData, importOptions);
      if (result.success && result.data) {
        showToast({
          title: "Settings imported",
          description: `Imported: ${result.data.imported.join(", ")}`,
          variant: "success",
        });
        setShowImportDialog(false);
        setImportData(null);
        // Refresh the page to reflect changes
        window.location.reload();
      } else {
        showToast({
          title: "Import failed",
          description: result.error || "Failed to import settings",
          variant: "error",
        });
      }
    } catch {
      showToast({
        title: "Import failed",
        description: "An error occurred while importing settings",
        variant: "error",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const toggleOption = (key: keyof ImportOptions) => {
    setImportOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5", className)}>
      <h3 className="text-base font-semibold text-foreground mb-1">
        Export & Import Settings
      </h3>
      <p className="text-sm text-foreground-muted mb-4">
        Backup your settings or transfer them to another account.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Settings"}
        </Button>

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
        >
          <UploadIcon className="h-4 w-4 mr-2" />
          Import Settings
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Import Dialog */}
      {showImportDialog && importData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-lg"
            role="dialog"
            aria-labelledby="import-dialog-title"
          >
            <h4 id="import-dialog-title" className="text-lg font-semibold text-foreground mb-2">
              Import Settings
            </h4>
            <p className="text-sm text-foreground-muted mb-4">
              From: <strong>{importData.organizationName}</strong>
              <br />
              Exported: {new Date(importData.exportedAt).toLocaleString()}
            </p>

            <div className="mb-4">
              <p className="text-sm font-medium text-foreground mb-2">
                Select what to import:
              </p>
              <div className="space-y-2">
                {Object.entries(importOptions).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => toggleOption(key as keyof ImportOptions)}
                      className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm text-foreground capitalize">
                      {key}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-3 py-2 mb-4">
              <p className="text-xs text-[var(--warning)]">
                This will overwrite your current settings. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportDialog(false);
                  setImportData(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={isImporting || !Object.values(importOptions).some(Boolean)}
              >
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

SettingsExportImport.displayName = "SettingsExportImport";
