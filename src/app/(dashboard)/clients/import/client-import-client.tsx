"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  previewClientImport,
  importClients,
  getImportTemplate,
  type ImportPreview,
  type ImportResult,
} from "@/lib/actions/client-import";

type Step = "upload" | "preview" | "importing" | "complete";

export function ClientImportClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("upload");
  const [csvContent, setCsvContent] = useState<string>("");
  const [_fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [_isLoading, setIsLoading] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      showToast("Please select a CSV file", "error");
      return;
    }

    setFileName(file.name);
    const content = await file.text();
    setCsvContent(content);

    // Auto-preview
    setIsLoading(true);
    const previewResult = await previewClientImport(content);
    if (previewResult.success) {
      setPreview(previewResult.data);
      setStep("preview");
    } else {
      showToast(previewResult.error, "error");
    }
    setIsLoading(false);
  }, [showToast]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      showToast("Please drop a CSV file", "error");
      return;
    }

    setFileName(file.name);
    const content = await file.text();
    setCsvContent(content);

    setIsLoading(true);
    const previewResult = await previewClientImport(content);
    if (previewResult.success) {
      setPreview(previewResult.data);
      setStep("preview");
    } else {
      showToast(previewResult.error, "error");
    }
    setIsLoading(false);
  }, [showToast]);

  const handleImport = async () => {
    if (!csvContent) return;

    setStep("importing");
    setIsLoading(true);

    const importResult = await importClients(csvContent, {
      skipDuplicates,
      updateExisting,
    });

    if (importResult.success) {
      setResult(importResult.data);
      setStep("complete");
      showToast(
        `Successfully imported ${importResult.data.imported} clients`,
        "success"
      );
    } else {
      showToast(importResult.error, "error");
      setStep("preview");
    }

    setIsLoading(false);
  };

  const handleDownloadTemplate = async () => {
    const template = await getImportTemplate();
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "client_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStep("upload");
    setCsvContent("");
    setFileName("");
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        {["upload", "preview", "complete"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                step === s || (step === "importing" && s === "preview")
                  ? "bg-[var(--primary)] text-white"
                  : step === "complete" && s !== "complete"
                    ? "bg-[var(--success)] text-white"
                    : "bg-[var(--background-secondary)] text-foreground-muted"
              )}
            >
              {step === "complete" && s !== "complete" ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium capitalize",
                step === s ? "text-foreground" : "text-foreground-muted"
              )}
            >
              {s}
            </span>
            {i < 2 && (
              <div className="ml-2 h-px w-12 bg-[var(--card-border)]" />
            )}
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <div className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center transition-colors hover:border-[var(--primary)]"
          >
            <UploadIcon className="mx-auto h-12 w-12 text-foreground-muted" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Drop your CSV file here
            </h3>
            <p className="mt-2 text-sm text-foreground-muted">
              or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              style={{ position: "relative" }}
            />
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="sr-only"
              />
              Select File
            </label>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-3">CSV Format</h3>
            <p className="text-sm text-foreground-muted mb-4">
              Your CSV file should have the following columns (email is required):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="py-2 px-3 text-left text-foreground">Column</th>
                    <th className="py-2 px-3 text-left text-foreground">Required</th>
                    <th className="py-2 px-3 text-left text-foreground">Example</th>
                  </tr>
                </thead>
                <tbody className="text-foreground-muted">
                  <tr className="border-b border-[var(--card-border)]">
                    <td className="py-2 px-3 font-medium">email</td>
                    <td className="py-2 px-3">Yes</td>
                    <td className="py-2 px-3">john@example.com</td>
                  </tr>
                  <tr className="border-b border-[var(--card-border)]">
                    <td className="py-2 px-3">fullName</td>
                    <td className="py-2 px-3">No</td>
                    <td className="py-2 px-3">John Smith</td>
                  </tr>
                  <tr className="border-b border-[var(--card-border)]">
                    <td className="py-2 px-3">company</td>
                    <td className="py-2 px-3">No</td>
                    <td className="py-2 px-3">Smith Real Estate</td>
                  </tr>
                  <tr className="border-b border-[var(--card-border)]">
                    <td className="py-2 px-3">phone</td>
                    <td className="py-2 px-3">No</td>
                    <td className="py-2 px-3">(555) 123-4567</td>
                  </tr>
                  <tr className="border-b border-[var(--card-border)]">
                    <td className="py-2 px-3">industry</td>
                    <td className="py-2 px-3">No</td>
                    <td className="py-2 px-3">real_estate, commercial, events...</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">isVIP</td>
                    <td className="py-2 px-3">No</td>
                    <td className="py-2 px-3">true/false</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
            >
              <DownloadIcon className="h-4 w-4" />
              Download Template CSV
            </button>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {(step === "preview" || step === "importing") && preview && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-sm text-foreground-muted">Total Rows</p>
              <p className="text-2xl font-bold text-foreground">{preview.totalRows}</p>
            </div>
            <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/5 p-4">
              <p className="text-sm text-[var(--success)]">Ready to Import</p>
              <p className="text-2xl font-bold text-[var(--success)]">{preview.validRows}</p>
            </div>
            <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4">
              <p className="text-sm text-[var(--warning)]">Duplicates</p>
              <p className="text-2xl font-bold text-[var(--warning)]">{preview.duplicateRows}</p>
            </div>
            <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-4">
              <p className="text-sm text-[var(--error)]">Invalid</p>
              <p className="text-2xl font-bold text-[var(--error)]">{preview.invalidRows}</p>
            </div>
          </div>

          {/* Options */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Import Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={skipDuplicates}
                  onCheckedChange={(checked) => setSkipDuplicates(checked === true)}
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Skip duplicates</span>
                  <p className="text-xs text-foreground-muted">
                    Skip rows where email already exists in your database
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={updateExisting}
                  onCheckedChange={(checked) => setUpdateExisting(checked === true)}
                  disabled={skipDuplicates}
                />
                <div>
                  <span className={cn("text-sm font-medium", skipDuplicates ? "text-foreground-muted" : "text-foreground")}>
                    Update existing clients
                  </span>
                  <p className="text-xs text-foreground-muted">
                    Update existing client data with CSV values (instead of skipping)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Validation Results */}
          {preview.invalidRows > 0 && (
            <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
              <h3 className="font-semibold text-[var(--error)] mb-3">Invalid Rows</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {preview.validationResults
                  .filter((r) => !r.valid)
                  .map((r) => (
                    <div key={r.rowNumber} className="text-sm">
                      <span className="font-medium text-foreground">Row {r.rowNumber}:</span>
                      <span className="ml-2 text-[var(--error)]">{r.errors.join(", ")}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={step === "importing"}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={step === "importing" || preview.validRows === 0}
              className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {step === "importing" ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Importing...
                </span>
              ) : (
                `Import ${preview.validRows} Clients`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Complete Step */}
      {step === "complete" && result && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/10">
            <CheckIcon className="h-8 w-8 text-[var(--success)]" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-foreground">Import Complete!</h3>
          <p className="mt-2 text-foreground-muted">
            Successfully imported {result.imported} clients
            {result.skipped > 0 && `, skipped ${result.skipped} duplicates`}
            {result.failed > 0 && `, ${result.failed} failed`}.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Import More
            </button>
            <button
              onClick={() => router.push("/clients")}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              View Clients
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
