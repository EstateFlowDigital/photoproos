"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import type {
  TaxPrepSessionSummary,
  TaxExpenseSummary,
  TaxDocumentWithExtraction,
} from "@/lib/actions/tax-prep";
import {
  updateTaxEntityType,
  markExpensesReviewed,
  acceptTaxDisclaimer,
  submitTaxPrepFeedback,
  generateTaxSummary,
  createTaxDocument,
  processTaxDocumentWithAI,
  confirmTaxDocumentData,
} from "@/lib/actions/tax-prep";
import type { TaxEntityType, ExpenseCategory } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface TaxPrepClientProps {
  taxYear: number;
  initialSession: TaxPrepSessionSummary | null;
  initialExpenses: TaxExpenseSummary | null;
  initialRevenue: {
    totalRevenue: number;
    paidRevenue: number;
    monthlyBreakdown: { month: string; amount: number }[];
  } | null;
  initialDocuments: TaxDocumentWithExtraction[];
}

type WizardStep = "entity" | "expenses" | "documents" | "summary" | "disclaimer" | "complete";

// ============================================================================
// ENTITY TYPES
// ============================================================================

const ENTITY_TYPES: { value: TaxEntityType; label: string; description: string }[] = [
  {
    value: "sole_proprietor",
    label: "Sole Proprietor",
    description: "You operate as an individual with no formal business structure",
  },
  {
    value: "llc_single_member",
    label: "Single-Member LLC",
    description: "LLC with one owner, taxed as a disregarded entity",
  },
  {
    value: "llc_multi_member",
    label: "Multi-Member LLC",
    description: "LLC with multiple owners, taxed as a partnership",
  },
  {
    value: "s_corp",
    label: "S Corporation",
    description: "Corporation that passes income through to shareholders",
  },
  {
    value: "c_corp",
    label: "C Corporation",
    description: "Traditional corporation with double taxation",
  },
  {
    value: "partnership",
    label: "Partnership",
    description: "Business owned by two or more individuals",
  },
];

// ============================================================================
// ICONS
// ============================================================================

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5h-.75V3.75a.75.75 0 0 0 0-1.5h-15ZM9 6a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm-.75 3.75A.75.75 0 0 1 9 9h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM9 12a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm3.75-5.25A.75.75 0 0 1 13.5 6H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM13.5 9a.75.75 0 0 0 0 1.5H15a.75.75 0 0 0 0-1.5h-1.5Zm-.75 3.75a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM9 19.5v-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 19.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
        clipRule="evenodd"
      />
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
    </svg>
  );
}

function CurrencyDollarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path
          fillRule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function WizardProgress({
  currentStep,
  steps,
}: {
  currentStep: WizardStep;
  steps: { id: WizardStep; label: string; completed: boolean }[];
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
              step.completed
                ? "bg-[var(--success)] text-white"
                : index === currentIndex
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-tertiary)] text-foreground-muted"
            )}
          >
            {step.completed ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              index + 1
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-12 h-0.5 mx-2",
                step.completed
                  ? "bg-[var(--success)]"
                  : "bg-[var(--border)]"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ExpenseCategoryCard({
  category,
  amount,
  count,
}: {
  category: ExpenseCategory;
  amount: number;
  count: number;
}) {
  const categoryLabels: Record<ExpenseCategory, string> = {
    labor: "Labor",
    travel: "Travel",
    equipment: "Equipment",
    software: "Software",
    materials: "Materials",
    marketing: "Marketing",
    fees: "Fees",
    insurance: "Insurance",
    other: "Other",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-foreground">{categoryLabels[category]}</span>
        <Badge variant="outline" className="text-xs">
          {count} items
        </Badge>
      </div>
      <span className="font-semibold text-foreground">
        {formatCurrency(amount / 100)}
      </span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TaxPrepClient({
  taxYear,
  initialSession,
  initialExpenses,
  initialRevenue,
  initialDocuments,
}: TaxPrepClientProps) {
  const { showToast } = useToast();

  const [session, setSession] = useState(initialSession);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [revenue, setRevenue] = useState(initialRevenue);
  const [documents, setDocuments] = useState(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Determine current step based on session status
  const getCurrentStep = (): WizardStep => {
    if (!session) return "entity";
    if (!session.entityType) return "entity";
    if (!session.expensesReviewed) return "expenses";
    if (!session.documentsUploaded || documents.some((d) => !d.confirmed)) return "documents";
    if (!session.summaryGenerated) return "summary";
    if (!session.disclaimerAcceptedAt) return "disclaimer";
    return "complete";
  };

  const [currentStep, setCurrentStep] = useState<WizardStep>(getCurrentStep);

  const steps = [
    { id: "entity" as const, label: "Business Type", completed: !!session?.entityType },
    { id: "expenses" as const, label: "Review Expenses", completed: !!session?.expensesReviewed },
    { id: "documents" as const, label: "Documents", completed: !!session?.documentsUploaded && !documents.some((d) => !d.confirmed) },
    { id: "summary" as const, label: "Summary", completed: !!session?.summaryGenerated },
    { id: "disclaimer" as const, label: "Disclaimer", completed: !!session?.disclaimerAcceptedAt },
  ];

  // Handlers
  const handleEntitySelect = async (entityType: TaxEntityType) => {
    if (!session) return;
    setLoading(true);
    const result = await updateTaxEntityType(session.id, entityType);
    if (result.success) {
      setSession({ ...session, entityType, status: "in_progress" });
      setCurrentStep("expenses");
      showToast("Business type saved", "success");
    } else {
      showToast(result.error || "Failed to save", "error");
    }
    setLoading(false);
  };

  const handleExpensesReviewed = async () => {
    if (!session) return;
    setLoading(true);
    const result = await markExpensesReviewed(session.id);
    if (result.success) {
      setSession({ ...session, expensesReviewed: true });
      setCurrentStep("documents");
      showToast("Expenses marked as reviewed", "success");
    } else {
      showToast(result.error || "Failed to save", "error");
    }
    setLoading(false);
  };

  const handleGenerateSummary = async () => {
    if (!session) return;
    setLoading(true);
    const result = await generateTaxSummary(session.id);
    if (result.success) {
      setSession({ ...session, summaryGenerated: true, status: "review_pending" });
      setCurrentStep("disclaimer");
      showToast("Tax summary generated", "success");
    } else {
      showToast(result.error || "Failed to generate summary", "error");
    }
    setLoading(false);
  };

  const handleAcceptDisclaimer = async () => {
    if (!session) return;
    setLoading(true);
    const result = await acceptTaxDisclaimer(session.id);
    if (result.success) {
      setSession({ ...session, disclaimerAcceptedAt: new Date() });
      setCurrentStep("complete");
      showToast("Disclaimer accepted", "success");
    } else {
      showToast(result.error || "Failed to accept", "error");
    }
    setLoading(false);
  };

  const handleSubmitFeedback = async () => {
    if (!session || rating === 0) return;
    setLoading(true);
    const result = await submitTaxPrepFeedback(session.id, rating, feedback);
    if (result.success) {
      showToast("Thank you for your feedback!", "success");
    } else {
      showToast(result.error || "Failed to submit feedback", "error");
    }
    setLoading(false);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "entity":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="h-5 w-5 text-[var(--primary)]" />
                Select Your Business Entity Type
              </CardTitle>
              <CardDescription>
                This determines how your taxes are reported. If you are unsure, consult a tax professional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!session ? (
                <div className="text-center py-8">
                  <p className="text-foreground-muted mb-4">
                    Unable to load tax preparation session. Please try refreshing the page.
                  </p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {ENTITY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleEntitySelect(type.value)}
                      disabled={loading || !session}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all",
                        "hover:border-[var(--primary)] hover:bg-[var(--background-hover)]",
                        session?.entityType === type.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--border)]",
                        (!session || loading) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="font-medium text-foreground">{type.label}</div>
                      <div className="text-sm text-foreground-muted mt-1">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "expenses":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-[var(--primary)]" />
                Review Your {taxYear} Expenses
              </CardTitle>
              <CardDescription>
                Review your business expenses by category. Make sure all expenses are properly categorized.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenses ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg bg-[var(--background-tertiary)]">
                      <div className="text-sm text-foreground-muted">Total Expenses</div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatCurrency(expenses.totalExpenses / 100)}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--background-tertiary)]">
                      <div className="text-sm text-foreground-muted">Total Mileage</div>
                      <div className="text-2xl font-bold text-foreground">
                        {expenses.totalMileage.toLocaleString()} mi
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--background-tertiary)]">
                      <div className="text-sm text-foreground-muted">Total Revenue</div>
                      <div className="text-2xl font-bold text-[var(--success)]">
                        {formatCurrency((revenue?.totalRevenue || 0) / 100)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Expenses by Category</h4>
                    <div className="border border-[var(--border)] rounded-lg p-4">
                      {expenses.expensesByCategory.map((cat) => (
                        <ExpenseCategoryCard
                          key={cat.category}
                          category={cat.category}
                          amount={cat.amount}
                          count={cat.count}
                        />
                      ))}
                      {expenses.expensesByCategory.length === 0 && (
                        <p className="text-foreground-muted text-center py-4">
                          No expenses recorded for {taxYear}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleExpensesReviewed} disabled={loading}>
                      {loading ? "Saving..." : "Mark as Reviewed & Continue"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground-muted text-center py-8">
                  Unable to load expense data
                </p>
              )}
            </CardContent>
          </Card>
        );

      case "documents":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DocumentIcon className="h-5 w-5 text-[var(--primary)]" />
                Upload Tax Documents
              </CardTitle>
              <CardDescription>
                Upload receipts, 1099s, and other tax documents. Our AI will extract the relevant information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center">
                  <UploadIcon className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                  <p className="text-foreground-muted mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Supports PDF, JPG, PNG (max 10MB)
                  </p>
                  <Button variant="outline" className="mt-4">
                    Browse Files
                  </Button>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Uploaded Documents ({documents.length})</h4>
                    <div className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)]">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <DocumentIcon className="h-5 w-5 text-foreground-muted" />
                            <div>
                              <div className="font-medium text-foreground">{doc.filename}</div>
                              <div className="text-sm text-foreground-muted">
                                {doc.extractionStatus === "completed" && doc.extractedData ? (
                                  <>
                                    {doc.extractedData.vendor && `${doc.extractedData.vendor} • `}
                                    {doc.extractedData.amount && formatCurrency(doc.extractedData.amount)}
                                  </>
                                ) : (
                                  doc.extractionStatus === "processing" ? "Processing..." : doc.extractionStatus
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={doc.confirmed ? "default" : "outline"}
                            className={doc.confirmed ? "bg-[var(--success)]" : ""}
                          >
                            {doc.confirmed ? "Confirmed" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("expenses")}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep("summary")} disabled={loading}>
                    Continue to Summary
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "summary":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-[var(--primary)]" />
                Tax Summary for {taxYear}
              </CardTitle>
              <CardDescription>
                Review your annual business summary before generating the final report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-6 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
                    <div className="text-sm text-foreground-muted">Total Revenue</div>
                    <div className="text-3xl font-bold text-[var(--success)]">
                      {formatCurrency((revenue?.totalRevenue || 0) / 100)}
                    </div>
                  </div>
                  <div className="p-6 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
                    <div className="text-sm text-foreground-muted">Total Expenses</div>
                    <div className="text-3xl font-bold text-[var(--error)]">
                      {formatCurrency((expenses?.totalExpenses || 0) / 100)}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                  <div className="text-sm text-foreground-muted">Estimated Net Income</div>
                  <div className="text-3xl font-bold text-[var(--primary)]">
                    {formatCurrency(
                      ((revenue?.totalRevenue || 0) - (expenses?.totalExpenses || 0)) / 100
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted mt-2">
                    Note: This is a simplified estimate. Consult a tax professional for accurate calculations.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("documents")}>
                    Back
                  </Button>
                  <Button onClick={handleGenerateSummary} disabled={loading}>
                    {loading ? "Generating..." : "Generate Tax Summary"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "disclaimer":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-[var(--warning)]" />
                Important Tax Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20">
                  <h4 className="font-semibold text-foreground mb-3">Please Read Carefully</h4>
                  <div className="space-y-3 text-sm text-foreground-muted">
                    <p>
                      The tax preparation tools and summaries provided by this platform are intended
                      for informational and organizational purposes only.
                    </p>
                    <p>
                      <strong className="text-foreground">This is not tax advice.</strong> The information generated
                      should not be considered professional tax, legal, or financial advice.
                    </p>
                    <p>
                      We strongly recommend consulting with a qualified tax professional,
                      CPA, or tax attorney before filing your taxes or making tax-related decisions.
                    </p>
                    <p>
                      By continuing, you acknowledge that you understand this information is
                      provided as-is without any warranties, and you assume full responsibility
                      for verifying all information with a qualified professional.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("summary")}>
                    Back
                  </Button>
                  <Button onClick={handleAcceptDisclaimer} disabled={loading}>
                    {loading ? "Processing..." : "I Understand & Accept"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "complete":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[var(--success)]" />
                Tax Preparation Complete!
              </CardTitle>
              <CardDescription>
                Your {taxYear} tax preparation summary is ready for your tax professional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--success)]/20 mb-4"
                  >
                    <CheckCircleIcon className="h-10 w-10 text-[var(--success)]" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground">All Done!</h3>
                  <p className="text-foreground-muted mt-2">
                    You can now download your tax summary or share it with your accountant.
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline">
                    Download Summary (PDF)
                  </Button>
                  <Button>
                    Email to Accountant
                  </Button>
                </div>

                <div className="border-t border-[var(--border)] pt-6 mt-6">
                  <h4 className="font-medium text-foreground mb-4 text-center">
                    How was your experience?
                  </h4>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <StarIcon
                          className={cn(
                            "h-8 w-8",
                            star <= rating ? "text-[var(--warning)]" : "text-foreground-muted"
                          )}
                          filled={star <= rating}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Any additional feedback? (optional)"
                        className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-foreground resize-none"
                        rows={3}
                      />
                      <div className="flex justify-center mt-4">
                        <Button onClick={handleSubmitFeedback} disabled={loading}>
                          {loading ? "Submitting..." : "Submit Feedback"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <WizardProgress currentStep={currentStep} steps={steps} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
