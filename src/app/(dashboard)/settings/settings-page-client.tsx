"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { exportAllData, deleteAccount } from "@/lib/actions/settings";
import { resetOnboarding } from "@/lib/actions/onboarding";
import { SettingsExportImport } from "@/components/settings/settings-export-import";
import { SettingsHistory } from "@/components/settings/settings-history";

interface SettingsPageClientProps {
  organizationName?: string;
  organizationId?: string;
}

export function SettingsPageClient({
  organizationName = "your organization",
  organizationId,
}: SettingsPageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Restart onboarding state
  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);

  const requiredDeleteText = `delete ${organizationName}`;

  const handleRestartOnboarding = async () => {
    if (!organizationId) {
      showToast("Organization not found", "error");
      return;
    }

    setIsResettingOnboarding(true);
    try {
      const result = await resetOnboarding(organizationId);
      if (result.success) {
        showToast("Onboarding reset! Redirecting...", "success");
        router.push("/onboarding");
      } else {
        showToast(result.error || "Failed to reset onboarding", "error");
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsResettingOnboarding(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const result = await exportAllData();
      if (result.success && result.data) {
        // Create and download the JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${organizationName.replace(/\s+/g, "-").toLowerCase()}-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast("Your data has been exported successfully.", "success");
        setIsExportModalOpen(false);
      } else {
        showToast("error" in result ? result.error : "Failed to export data", "error");
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== requiredDeleteText) {
      showToast("Please type the confirmation text exactly as shown", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteAccount(deleteConfirmText);
        if (result.success) {
          showToast("Your account has been deleted", "success");
          // Redirect to sign-in after deletion
          router.push("/sign-in");
        } else {
          showToast(result.error || "Failed to delete account", "error");
        }
      } catch (error) {
        showToast("An unexpected error occurred", "error");
      }
    });
  };

  return (
    <>
      {/* Settings Export/Import Section */}
      <SettingsExportImport className="mt-8" />

      {/* Settings History Section */}
      <SettingsHistory className="mt-4" />

      {/* Restart Onboarding Section */}
      <div className="mt-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-medium text-foreground">Restart Onboarding</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Go through the setup wizard again to update your preferences, industries, or features.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRestartOnboarding}
            disabled={isResettingOnboarding}
          >
            {isResettingOnboarding ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                Resetting...
              </>
            ) : (
              <>
                <RestartIcon className="h-4 w-4" />
                Restart Onboarding
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-4 rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/5 p-6">
        <h3 className="font-medium text-foreground">Danger Zone</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Irreversible and destructive actions
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="danger-outline"
            onClick={() => setIsExportModalOpen(true)}
          >
            Export All Data
          </Button>
          <Button
            variant="danger-outline"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Export Data Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Export All Data</DialogTitle>
            <DialogDescription>
              Download a complete backup of your organization data.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <p className="text-sm text-foreground-muted">
                This export will include:
              </p>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                  Organization settings and branding
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                  All clients and their contact information
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                  Galleries, projects, and asset metadata
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                  Bookings and scheduling data
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                  Invoices and payment records
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                  Service packages and pricing
                </li>
              </ul>
              <div className="rounded-lg bg-[var(--background-secondary)] p-3 text-sm text-foreground-muted">
                <strong className="text-foreground">Note:</strong> Actual image files are not included in this export.
                Only metadata and URLs are exported.
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Exporting...
                </>
              ) : (
                <>
                  <DownloadIcon className="h-4 w-4" />
                  Download Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={(open) => {
        setIsDeleteModalOpen(open);
        if (!open) setDeleteConfirmText("");
      }}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="text-[var(--error)]">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 p-4">
                <div className="flex items-start gap-3">
                  <WarningIcon className="h-5 w-5 text-[var(--error)] shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-[var(--error)]">
                      This will permanently delete:
                    </p>
                    <ul className="mt-2 space-y-1 text-foreground-muted">
                      <li>• Your organization and all settings</li>
                      <li>• All clients and their data</li>
                      <li>• All galleries, projects, and assets</li>
                      <li>• All bookings and scheduling data</li>
                      <li>• All invoices and payment records</li>
                      <li>• All team members will lose access</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="delete-confirm" className="block text-sm font-medium text-foreground mb-2">
                  To confirm, type <span className="font-mono text-[var(--error)]">{requiredDeleteText}</span> below:
                </label>
                <input
                  type="text"
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={requiredDeleteText}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--error)] focus:outline-none focus:ring-1 focus:ring-[var(--error)]"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== requiredDeleteText || isPending}
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
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

function RestartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}
