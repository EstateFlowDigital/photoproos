"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Plus,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Play,
  FileText,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  checkContentGovernance,
  createGovernancePolicy,
  toggleGovernancePolicyActive,
  deleteGovernancePolicy,
  initializeGovernancePolicies,
} from "@/lib/actions/cms-governance";
import type { CMSGovernancePolicy, GovernancePolicyType, GovernanceAction } from "@prisma/client";

interface GovernancePageClientProps {
  initialPolicies: CMSGovernancePolicy[];
  initialStats: {
    totalPolicies: number;
    activePolicies: number;
    unresolvedViolations: number;
  } | null;
  initialDashboard: {
    recentViolations: Array<{
      id: string;
      entityType: string;
      entityId: string;
      policyId: string;
      field: string;
      message: string;
      severity: string;
      status: string;
      createdAt: Date;
    }>;
    violationsByType: Record<string, number>;
  } | null;
}

export function GovernancePageClient({
  initialPolicies,
  initialStats,
  initialDashboard,
}: GovernancePageClientProps) {
  const [policies, setPolicies] = useState(initialPolicies);
  const [stats] = useState(initialStats);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    policyName: string;
    passed: boolean;
    violations: Array<{ field: string; message: string; severity: string }>;
  }> | null>(null);

  // Test content state
  const [testContent, setTestContent] = useState({
    title: "Summer Photography Sale - Book Now!",
    body: "Get 20% off all photography packages this summer. Our professional photographers capture your special moments with stunning quality. Book your session today and receive complimentary prints.",
    metaDescription: "Summer sale on photography packages",
  });

  const handleInitDefaults = async () => {
    setIsLoading(true);
    const result = await initializeGovernancePolicies();
    if (result.success) {
      window.location.reload();
    }
    setIsLoading(false);
  };

  const handleTogglePolicy = async (id: string, isActive: boolean) => {
    const result = await toggleGovernancePolicyActive(id, !isActive);
    if (result.success && result.data) {
      setPolicies(policies.map(p => p.id === id ? result.data! : p));
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm("Delete this policy?")) return;
    const result = await deleteGovernancePolicy(id);
    if (result.success) {
      setPolicies(policies.filter(p => p.id !== id));
    }
  };

  const handleTestContent = async () => {
    setIsLoading(true);
    const result = await checkContentGovernance(
      "MarketingPage",
      "test-page-123",
      testContent
    );
    if (result.success && result.data) {
      setTestResults(result.data);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/cms"
          className="p-2 hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            Content Governance
          </h1>
          <p className="text-foreground-secondary text-sm">
            Enforce content standards and quality rules
          </p>
        </div>
        <button
          onClick={handleInitDefaults}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Init Defaults
        </button>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-center">
            <p className="text-3xl font-bold">{stats.totalPolicies}</p>
            <p className="text-sm text-foreground-secondary">Total Policies</p>
          </div>
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-center">
            <p className="text-3xl font-bold text-green-500">{stats.activePolicies}</p>
            <p className="text-sm text-foreground-secondary">Active</p>
          </div>
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-center">
            <p className="text-3xl font-bold text-yellow-500">{stats.unresolvedViolations}</p>
            <p className="text-sm text-foreground-secondary">Open Violations</p>
          </div>
        </div>
      )}

      {/* Test Content Section */}
      <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-green-500" />
          Test Content Against Policies
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={testContent.title}
                onChange={(e) => setTestContent({ ...testContent, title: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Body Content</label>
              <textarea
                value={testContent.body}
                onChange={(e) => setTestContent({ ...testContent, body: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <input
                type="text"
                value={testContent.metaDescription}
                onChange={(e) => setTestContent({ ...testContent, metaDescription: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleTestContent}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run Governance Check
            </button>
          </div>

          {/* Results */}
          <div className="p-4 bg-[var(--background-tertiary)] rounded-lg">
            <h3 className="text-sm font-medium mb-3">Check Results</h3>
            {testResults ? (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.passed
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-red-500/10 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {result.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium text-sm">{result.policyName}</span>
                    </div>
                    {result.violations.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {result.violations.map((v, i) => (
                          <li key={i} className="text-xs text-foreground-secondary flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
                            <span>
                              <strong>{v.field}:</strong> {v.message}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {testResults.every(r => r.passed) && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-500">All checks passed!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-foreground-muted">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click &quot;Run Governance Check&quot; to test</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Policies List */}
      <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Active Policies</h2>

        {policies.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
            <p className="text-foreground-secondary mb-4">No policies created yet</p>
            <button
              onClick={handleInitDefaults}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
            >
              Initialize Default Policies
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                onToggle={() => handleTogglePolicy(policy.id, policy.isActive)}
                onDelete={() => handleDeletePolicy(policy.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Violations */}
      {initialDashboard?.recentViolations && initialDashboard.recentViolations.length > 0 && (
        <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Recent Violations
          </h2>
          <div className="space-y-2">
            {initialDashboard.recentViolations.slice(0, 5).map((violation) => (
              <div
                key={violation.id}
                className="flex items-center justify-between p-3 bg-[var(--background-tertiary)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-4 h-4 ${
                    violation.severity === "error" ? "text-red-500" : "text-yellow-500"
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{violation.message}</p>
                    <p className="text-xs text-foreground-muted">
                      {violation.entityType} • {violation.field}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  violation.status === "resolved"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  {violation.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Policy Modal */}
      {showCreateForm && (
        <CreatePolicyModal
          onClose={() => setShowCreateForm(false)}
          onCreated={(policy) => {
            setPolicies([...policies, policy]);
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PolicyCard({
  policy,
  onToggle,
  onDelete,
}: {
  policy: CMSGovernancePolicy;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const rules = policy.rules as Array<{ field: string; check: string }>;

  const typeColors: Record<string, string> = {
    brand_voice: "bg-purple-500/10 text-purple-500",
    seo: "bg-blue-500/10 text-blue-500",
    accessibility: "bg-green-500/10 text-green-500",
    freshness: "bg-orange-500/10 text-orange-500",
    legal_compliance: "bg-red-500/10 text-red-500",
    approval_gates: "bg-yellow-500/10 text-yellow-500",
    publishing_windows: "bg-pink-500/10 text-pink-500",
  };

  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      policy.isActive
        ? "bg-[var(--background-tertiary)] border-[var(--border)]"
        : "bg-[var(--background)] border-[var(--border)] opacity-60"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{policy.name}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${typeColors[policy.type] || "bg-gray-500/10 text-gray-500"}`}>
              {policy.type.replace("_", " ")}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              policy.action === "block"
                ? "bg-red-500/10 text-red-500"
                : "bg-yellow-500/10 text-yellow-500"
            }`}>
              {policy.action}
            </span>
          </div>
          {policy.description && (
            <p className="text-sm text-foreground-secondary mb-2">{policy.description}</p>
          )}
          <p className="text-xs text-foreground-muted">
            {rules.length} rules • Targets: {(policy.targetTypes as string[]).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`p-1.5 rounded transition-colors ${
              policy.isActive
                ? "text-green-500 hover:bg-green-500/10"
                : "text-foreground-muted hover:bg-[var(--background-hover)]"
            }`}
          >
            {policy.isActive ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-foreground-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CreatePolicyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (policy: CMSGovernancePolicy) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "brand_voice" as GovernancePolicyType,
    action: "warn" as GovernanceAction,
    targetTypes: ["MarketingPage"],
    ruleField: "title",
    ruleCheck: "min_length",
    ruleValue: "10",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createGovernancePolicy({
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      action: formData.action,
      targetTypes: formData.targetTypes,
      rules: [{
        field: formData.ruleField,
        check: formData.ruleCheck,
        value: formData.ruleValue,
        severity: formData.action === "block" ? "error" : "warning",
        message: `${formData.ruleField} must ${formData.ruleCheck.replace("_", " ")} ${formData.ruleValue}`,
      }],
    });

    if (result.success && result.data) {
      onCreated(result.data);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create Policy</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm"
              placeholder="e.g., Title Length Check"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as GovernancePolicyType })}
              className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option value="brand_voice">Brand Voice</option>
              <option value="seo">SEO</option>
              <option value="accessibility">Accessibility</option>
              <option value="freshness">Freshness</option>
              <option value="legal_compliance">Legal Compliance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Action</label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value as GovernanceAction })}
              className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option value="warn">Warn (Allow publish with warning)</option>
              <option value="block">Block (Prevent publish)</option>
              <option value="require_override">Require Override</option>
            </select>
          </div>

          <div className="p-3 bg-[var(--background-tertiary)] rounded-lg space-y-3">
            <p className="text-xs font-medium text-foreground-secondary uppercase">Rule</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs mb-1">Field</label>
                <select
                  value={formData.ruleField}
                  onChange={(e) => setFormData({ ...formData, ruleField: e.target.value })}
                  className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
                >
                  <option value="title">title</option>
                  <option value="body">body</option>
                  <option value="metaDescription">metaDescription</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Check</label>
                <select
                  value={formData.ruleCheck}
                  onChange={(e) => setFormData({ ...formData, ruleCheck: e.target.value })}
                  className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
                >
                  <option value="min_length">min_length</option>
                  <option value="max_length">max_length</option>
                  <option value="contains">contains</option>
                  <option value="not_contains">not_contains</option>
                  <option value="required">required</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Value</label>
                <input
                  type="text"
                  value={formData.ruleValue}
                  onChange={(e) => setFormData({ ...formData, ruleValue: e.target.value })}
                  className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
