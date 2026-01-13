"use client";

import { useState } from "react";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  permissions: string[];
  environment: "production" | "test";
}

// Mock data
const MOCK_API_KEYS: ApiKey[] = [
  {
    id: "1",
    name: "Production API Key",
    prefix: "pk_live_abc123",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    expiresAt: null,
    permissions: ["read:galleries", "write:galleries", "read:clients", "read:bookings"],
    environment: "production",
  },
  {
    id: "2",
    name: "Test API Key",
    prefix: "pk_test_xyz789",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: null,
    permissions: ["read:galleries", "write:galleries", "read:clients", "write:clients", "read:bookings", "write:bookings"],
    environment: "test",
  },
  {
    id: "3",
    name: "Webhook Integration",
    prefix: "pk_live_wh456",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: null,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["read:webhooks", "write:webhooks"],
    environment: "production",
  },
];

const AVAILABLE_PERMISSIONS = [
  { value: "read:galleries", label: "Read Galleries" },
  { value: "write:galleries", label: "Write Galleries" },
  { value: "read:clients", label: "Read Clients" },
  { value: "write:clients", label: "Write Clients" },
  { value: "read:bookings", label: "Read Bookings" },
  { value: "write:bookings", label: "Write Bookings" },
  { value: "read:invoices", label: "Read Invoices" },
  { value: "write:invoices", label: "Write Invoices" },
  { value: "read:webhooks", label: "Read Webhooks" },
  { value: "write:webhooks", label: "Write Webhooks" },
];

export function ApiKeysClient() {
  const { showToast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_API_KEYS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnvironment, setNewKeyEnvironment] = useState<"production" | "test">("test");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", "success");
  };

  const handleToggleReveal = (keyId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const handleDelete = (keyId: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    showToast("API key deleted", "success");
  };

  const handleTogglePermission = (permission: string) => {
    setNewKeyPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      showToast("Please enter a key name", "error");
      return;
    }
    if (newKeyPermissions.length === 0) {
      showToast("Please select at least one permission", "error");
      return;
    }

    setIsCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const generatedKey = `pk_${newKeyEnvironment === "production" ? "live" : "test"}_${Math.random().toString(36).substring(2, 15)}`;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      prefix: generatedKey.substring(0, 15) + "...",
      createdAt: new Date().toISOString(),
      lastUsed: null,
      expiresAt: null,
      permissions: newKeyPermissions,
      environment: newKeyEnvironment,
    };

    setApiKeys((prev) => [newKey, ...prev]);
    setNewKeyGenerated(generatedKey);
    setIsCreating(false);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewKeyName("");
    setNewKeyEnvironment("test");
    setNewKeyPermissions([]);
    setNewKeyGenerated(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <Key className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Your API Keys</h3>
            <p className="text-sm text-foreground-muted">{apiKeys.length} keys created</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create API Key
        </Button>
      </div>

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <div className="card p-12 text-center">
          <Key className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No API keys yet</h3>
          <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
            Create an API key to integrate with external services and applications.
          </p>
          <Button className="mt-6" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Your First API Key
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    key.environment === "production"
                      ? "bg-[var(--success)]/10"
                      : "bg-[var(--warning)]/10"
                  }`}>
                    <Key className={`h-5 w-5 ${
                      key.environment === "production"
                        ? "text-[var(--success)]"
                        : "text-[var(--warning)]"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{key.name}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        key.environment === "production"
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--warning)]/10 text-[var(--warning)]"
                      }`}>
                        {key.environment}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="text-sm text-foreground-muted font-mono">
                        {revealedKeys.has(key.id) ? key.prefix : "••••••••••••••••"}
                      </code>
                      <button
                        onClick={() => handleToggleReveal(key.id)}
                        className="text-foreground-muted hover:text-foreground"
                      >
                        {revealedKeys.has(key.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(key.prefix)}
                        className="text-foreground-muted hover:text-foreground"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {key.permissions.slice(0, 4).map((perm) => (
                        <span
                          key={perm}
                          className="rounded-full bg-[var(--background-tertiary)] px-2 py-0.5 text-xs text-foreground-muted"
                        >
                          {perm}
                        </span>
                      ))}
                      {key.permissions.length > 4 && (
                        <span className="rounded-full bg-[var(--background-tertiary)] px-2 py-0.5 text-xs text-foreground-muted">
                          +{key.permissions.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(key.id)}>
                    <Trash2 className="h-4 w-4 text-[var(--error)]" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-6 text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Created {formatDate(key.createdAt)}
                </span>
                {key.lastUsed && (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Last used {formatRelativeTime(key.lastUsed)}
                  </span>
                )}
                {key.expiresAt && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-[var(--warning)]" />
                    Expires {formatDate(key.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documentation Link */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-foreground-muted" />
            <div>
              <p className="font-medium text-foreground">API Documentation</p>
              <p className="text-sm text-foreground-muted">Learn how to integrate with our API</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            View Docs
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                {newKeyGenerated ? "API Key Created" : "Create API Key"}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {newKeyGenerated ? (
              <div className="space-y-6">
                <div className="rounded-lg bg-[var(--success)]/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[var(--success)]">API key created successfully!</p>
                      <p className="text-sm text-foreground-muted mt-1">
                        Copy this key now. You won't be able to see it again.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Your API Key</label>
                  <div className="flex items-center gap-2 rounded-lg bg-[var(--background-tertiary)] p-3">
                    <code className="flex-1 text-sm font-mono text-foreground break-all">
                      {newKeyGenerated}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(newKeyGenerated)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button className="w-full" onClick={handleCloseModal}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Key Name */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API Key"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground"
                  />
                </div>

                {/* Environment */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Environment</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewKeyEnvironment("test")}
                      className={`flex-1 rounded-lg border p-3 text-left ${
                        newKeyEnvironment === "test"
                          ? "border-[var(--warning)] bg-[var(--warning)]/10"
                          : "border-[var(--card-border)]"
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">Test</p>
                      <p className="text-xs text-foreground-muted">For development</p>
                    </button>
                    <button
                      onClick={() => setNewKeyEnvironment("production")}
                      className={`flex-1 rounded-lg border p-3 text-left ${
                        newKeyEnvironment === "production"
                          ? "border-[var(--success)] bg-[var(--success)]/10"
                          : "border-[var(--card-border)]"
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">Production</p>
                      <p className="text-xs text-foreground-muted">For live apps</p>
                    </button>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <button
                        key={perm.value}
                        onClick={() => handleTogglePermission(perm.value)}
                        className={`flex items-center gap-2 rounded-lg border p-2 text-left text-sm ${
                          newKeyPermissions.includes(perm.value)
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-[var(--card-border)]"
                        }`}
                      >
                        <div className={`flex h-4 w-4 items-center justify-center rounded ${
                          newKeyPermissions.includes(perm.value)
                            ? "bg-[var(--primary)]"
                            : "border border-[var(--card-border)]"
                        }`}>
                          {newKeyPermissions.includes(perm.value) && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="text-foreground">{perm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleCreateKey} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Key"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
