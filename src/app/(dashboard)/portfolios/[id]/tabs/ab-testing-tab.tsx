"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  getABTests,
  getABTestStats,
  createABTest,
  startABTest,
  pauseABTest,
  completeABTest,
  deleteABTest,
} from "@/lib/actions/ab-testing";
import type { PortfolioTemplate, PortfolioABTestStatus } from "@prisma/client";

interface ABTestingTabProps {
  website: {
    id: string;
    name: string;
    heroTitle: string | null;
    heroSubtitle: string | null;
    primaryColor: string | null;
    template: PortfolioTemplate;
  };
  isPending: boolean;
}

interface ABTest {
  id: string;
  name: string;
  description: string | null;
  status: PortfolioABTestStatus;
  controlTrafficPercent: number;
  variantTrafficPercent: number;
  variantHeroTitle: string | null;
  variantHeroSubtitle: string | null;
  variantPrimaryColor: string | null;
  controlViews: number;
  controlConversions: number;
  variantViews: number;
  variantConversions: number;
  winningVariant: string | null;
  createdAt: Date;
  _count: { assignments: number };
}

export function ABTestingTab({ website, isPending: externalPending }: ABTestingTabProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [testStats, setTestStats] = useState<Record<string, unknown> | null>(null);

  // New test form state
  const [newTest, setNewTest] = useState({
    name: "",
    description: "",
    variantHeroTitle: "",
    variantHeroSubtitle: "",
    variantPrimaryColor: "",
    controlTrafficPercent: 50,
  });

  useEffect(() => {
    loadTests();
  }, [website.id]);

  async function loadTests() {
    setLoading(true);
    const result = await getABTests(website.id);
    if (result.success && result.tests) {
      setTests(result.tests as ABTest[]);
    }
    setLoading(false);
  }

  async function loadTestStats(testId: string) {
    const result = await getABTestStats(testId);
    if (result.success && result.stats) {
      setTestStats(result.stats);
    }
  }

  function handleCreateTest() {
    if (!newTest.name.trim()) {
      showToast("Please enter a test name", "error");
      return;
    }

    startTransition(async () => {
      const result = await createABTest({
        portfolioWebsiteId: website.id,
        name: newTest.name.trim(),
        description: newTest.description.trim() || undefined,
        variantHeroTitle: newTest.variantHeroTitle.trim() || undefined,
        variantHeroSubtitle: newTest.variantHeroSubtitle.trim() || undefined,
        variantPrimaryColor: newTest.variantPrimaryColor.trim() || undefined,
        controlTrafficPercent: newTest.controlTrafficPercent,
        variantTrafficPercent: 100 - newTest.controlTrafficPercent,
      });

      if (result.success) {
        showToast("A/B test created", "success");
        setShowCreateForm(false);
        setNewTest({
          name: "",
          description: "",
          variantHeroTitle: "",
          variantHeroSubtitle: "",
          variantPrimaryColor: "",
          controlTrafficPercent: 50,
        });
        loadTests();
      } else {
        showToast(result.error || "Failed to create test", "error");
      }
    });
  }

  function handleStartTest(testId: string) {
    startTransition(async () => {
      const result = await startABTest(testId);
      if (result.success) {
        showToast("Test started", "success");
        loadTests();
      } else {
        showToast(result.error || "Failed to start test", "error");
      }
    });
  }

  function handlePauseTest(testId: string) {
    startTransition(async () => {
      const result = await pauseABTest(testId);
      if (result.success) {
        showToast("Test paused", "success");
        loadTests();
      } else {
        showToast(result.error || "Failed to pause test", "error");
      }
    });
  }

  function handleCompleteTest(testId: string, winner?: "control" | "variant") {
    startTransition(async () => {
      const result = await completeABTest(testId, winner);
      if (result.success) {
        showToast("Test completed", "success");
        loadTests();
      } else {
        showToast(result.error || "Failed to complete test", "error");
      }
    });
  }

  function handleDeleteTest(testId: string) {
    if (!confirm("Are you sure you want to delete this test?")) return;

    startTransition(async () => {
      const result = await deleteABTest(testId);
      if (result.success) {
        showToast("Test deleted", "success");
        loadTests();
      } else {
        showToast(result.error || "Failed to delete test", "error");
      }
    });
  }

  const activeTest = tests.find((t) => t.status === "running");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">A/B Testing</h3>
          <p className="text-sm text-foreground-muted">
            Test different portfolio variations to see what performs best
          </p>
        </div>
        {!activeTest && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            Create Test
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-6">
          <h4 className="mb-4 font-semibold text-foreground">Create New A/B Test</h4>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Test Name</label>
              <input
                type="text"
                value={newTest.name}
                onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                placeholder="e.g., Hero Title Variation"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Description (optional)</label>
              <textarea
                value={newTest.description}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                placeholder="Describe what you're testing..."
                rows={2}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div className="border-t border-[var(--card-border)] pt-4">
              <p className="mb-3 text-sm font-medium text-foreground">Variant Settings (what's different)</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-foreground-muted">Variant Hero Title</label>
                  <input
                    type="text"
                    value={newTest.variantHeroTitle}
                    onChange={(e) => setNewTest({ ...newTest, variantHeroTitle: e.target.value })}
                    placeholder={website.heroTitle || "Leave empty to keep original"}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-foreground-muted">Variant Hero Subtitle</label>
                  <input
                    type="text"
                    value={newTest.variantHeroSubtitle}
                    onChange={(e) => setNewTest({ ...newTest, variantHeroSubtitle: e.target.value })}
                    placeholder={website.heroSubtitle || "Leave empty to keep original"}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-sm text-foreground-muted">Variant Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newTest.variantPrimaryColor || website.primaryColor || "#3b82f6"}
                    onChange={(e) => setNewTest({ ...newTest, variantPrimaryColor: e.target.value })}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-[var(--card-border)]"
                  />
                  <input
                    type="text"
                    value={newTest.variantPrimaryColor}
                    onChange={(e) => setNewTest({ ...newTest, variantPrimaryColor: e.target.value })}
                    placeholder={website.primaryColor || "#3b82f6"}
                    className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--card-border)] pt-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Traffic Split: {newTest.controlTrafficPercent}% Control / {100 - newTest.controlTrafficPercent}% Variant
              </label>
              <input
                type="range"
                min="10"
                max="90"
                value={newTest.controlTrafficPercent}
                onChange={(e) => setNewTest({ ...newTest, controlTrafficPercent: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateTest}
                disabled={isPending || externalPending}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                Create Test
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests List */}
      {loading ? (
        <div className="py-12 text-center text-foreground-muted">Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] py-12 text-center">
          <TestTubeIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <p className="mt-2 text-foreground-muted">No A/B tests yet</p>
          <p className="text-sm text-foreground-muted">Create a test to start optimizing your portfolio</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{test.name}</h4>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        test.status === "running"
                          ? "bg-green-500/10 text-green-400"
                          : test.status === "paused"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : test.status === "completed"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                  </div>
                  {test.description && (
                    <p className="mt-1 text-sm text-foreground-muted">{test.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {test.status === "draft" && (
                    <button
                      onClick={() => handleStartTest(test.id)}
                      disabled={isPending}
                      className="rounded-lg bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                    >
                      Start
                    </button>
                  )}
                  {test.status === "running" && (
                    <button
                      onClick={() => handlePauseTest(test.id)}
                      disabled={isPending}
                      className="rounded-lg bg-yellow-500/10 px-3 py-1.5 text-sm font-medium text-yellow-400 transition-colors hover:bg-yellow-500/20 disabled:opacity-50"
                    >
                      Pause
                    </button>
                  )}
                  {test.status === "paused" && (
                    <button
                      onClick={() => handleStartTest(test.id)}
                      disabled={isPending}
                      className="rounded-lg bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                    >
                      Resume
                    </button>
                  )}
                  {(test.status === "running" || test.status === "paused") && (
                    <button
                      onClick={() => handleCompleteTest(test.id)}
                      disabled={isPending}
                      className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    disabled={isPending}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                  <p className="text-sm font-medium text-foreground">Control ({test.controlTrafficPercent}%)</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{test.controlViews}</span>
                    <span className="text-sm text-foreground-muted">views</span>
                  </div>
                  {test.controlViews > 0 && (
                    <p className="mt-1 text-xs text-foreground-muted">
                      {((test.controlConversions / test.controlViews) * 100).toFixed(1)}% conversion
                    </p>
                  )}
                </div>
                <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                  <p className="text-sm font-medium text-foreground">Variant ({test.variantTrafficPercent}%)</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{test.variantViews}</span>
                    <span className="text-sm text-foreground-muted">views</span>
                  </div>
                  {test.variantViews > 0 && (
                    <p className="mt-1 text-xs text-foreground-muted">
                      {((test.variantConversions / test.variantViews) * 100).toFixed(1)}% conversion
                    </p>
                  )}
                </div>
              </div>

              {test.winningVariant && (
                <div className="mt-4 rounded-lg bg-green-500/10 p-3 text-center">
                  <p className="font-medium text-green-400">
                    Winner: {test.winningVariant === "control" ? "Control" : "Variant"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
      <path d="M8.5 2h7" />
      <path d="M14.5 16h-5" />
    </svg>
  );
}
