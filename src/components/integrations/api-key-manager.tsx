"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusIcon,
  CopyIcon,
  TrashIcon,
  CheckIcon,
  WarningIcon,
  KeyIcon,
} from "@/components/ui/settings-icons";
import { generateNewApiKey, revokeApiKey, deleteApiKey } from "@/lib/actions/api-keys";

// ============================================================================
// Types
// ============================================================================

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

// ============================================================================
// API Key Manager
// ============================================================================

interface ApiKeyManagerProps {
  apiKeys: ApiKey[];
  onRefresh: () => void;
  className?: string;
}

export function ApiKeyManager({ apiKeys, onRefresh, className }: ApiKeyManagerProps) {
  const confirm = useConfirm();
  const [isCreating, setIsCreating] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [newKeyValue, setNewKeyValue] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError("Please enter a name for the API key");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await generateNewApiKey({ name: newKeyName.trim() });

    if (result.success && result.apiKey) {
      setNewKeyValue(result.apiKey.fullKey);
      setNewKeyName("");
      onRefresh();
    } else {
      setError("error" in result ? result.error : "Failed to generate API key");
    }

    setIsLoading(false);
  };

  const handleRevokeKey = async (keyId: string) => {
    const confirmed = await confirm({
      title: "Revoke API key",
      description: "Are you sure you want to revoke this API key? This action cannot be undone.",
      confirmText: "Revoke",
      variant: "destructive",
    });
    if (!confirmed) return;

    setIsLoading(true);
    const result = await revokeApiKey(keyId);

    if (result.success) {
      onRefresh();
    } else {
      setError(result.error || "Failed to revoke API key");
    }

    setIsLoading(false);
  };

  const handleDeleteKey = async (keyId: string) => {
    const confirmed = await confirm({
      title: "Delete API key",
      description: "Are you sure you want to permanently delete this API key?",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    setIsLoading(true);
    const result = await deleteApiKey(keyId);

    if (result.success) {
      onRefresh();
    } else {
      setError(result.error || "Failed to delete API key");
    }

    setIsLoading(false);
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const handleDismissNewKey = () => {
    setNewKeyValue(null);
    setIsCreating(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">API Keys</h3>
          <p className="text-sm text-foreground-muted">
            Generate API keys to authenticate with the PhotoProOS API
          </p>
        </div>
        {!isCreating && !newKeyValue && (
          <Button variant="secondary" size="sm" onClick={() => setIsCreating(true)}>
            <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
            Create Key
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
          <WarningIcon className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-[var(--error)]/70 hover:text-[var(--error)]">
            Dismiss
          </button>
        </div>
      )}

      {/* New Key Created */}
      {newKeyValue && (
        <div className="rounded-lg border border-[var(--warning)]/50 bg-[var(--warning)]/5 p-4">
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Save your API key</p>
              <p className="mt-1 text-sm text-foreground-muted">
                This is the only time you will see this key. Copy it now and store it securely.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-[var(--background)] px-3 py-2 font-mono text-sm text-foreground">
                  {newKeyValue}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(newKeyValue, "new-key")}
                >
                  {copiedId === "new-key" ? (
                    <>
                      <CheckIcon className="mr-1.5 h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="mr-1.5 h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="default"
                size="sm"
                className="mt-3"
                onClick={handleDismissNewKey}
              >
                I&apos;ve saved my key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Key Form */}
      {isCreating && !newKeyValue && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="space-y-3">
            <Input
              label="Key Name"
              placeholder="e.g., Production API Key"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleCreateKey}
                disabled={isLoading || !newKeyName.trim()}
              >
                {isLoading ? "Creating..." : "Create API Key"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setNewKeyName("");
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Keys */}
      {apiKeys.length > 0 ? (
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4",
                !key.isActive && "opacity-60"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                <KeyIcon className="h-5 w-5 text-foreground-muted" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{key.name}</span>
                  {!key.isActive && (
                    <span className="rounded-full bg-[var(--error)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--error)]">
                      Revoked
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground-muted">
                  <code className="font-mono">{key.keyPrefix}...</code>
                  <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                  {key.lastUsedAt && (
                    <span>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(key.keyPrefix, key.id)}
                  title="Copy key prefix"
                >
                  {copiedId === key.id ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
                {key.isActive ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeKey(key.id)}
                    disabled={isLoading}
                    className="text-foreground-muted hover:text-[var(--error)]"
                    title="Revoke key"
                  >
                    Revoke
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                    disabled={isLoading}
                    className="text-foreground-muted hover:text-[var(--error)]"
                    title="Delete key"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isCreating &&
        !newKeyValue && (
          <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
            <KeyIcon className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="mt-2 text-sm font-medium text-foreground">No API keys</p>
            <p className="mt-1 text-sm text-foreground-muted">
              Create an API key to start using the PhotoProOS API
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => setIsCreating(true)}
            >
              <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
              Create your first key
            </Button>
          </div>
        )
      )}
    </div>
  );
}
