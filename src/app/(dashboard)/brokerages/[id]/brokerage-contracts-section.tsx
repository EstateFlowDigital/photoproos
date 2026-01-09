"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { createBrokerageContract } from "@/lib/actions/brokerage-contracts";

interface BrokerageContract {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number | null;
  discountFixedCents: number | null;
  paymentTermsDays: number;
  isActive: boolean;
}

interface BrokerageContractsSectionProps {
  brokerageId: string;
  contracts: BrokerageContract[];
}

export function BrokerageContractsSection({
  brokerageId,
  contracts,
}: BrokerageContractsSectionProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountType: "percent" as "percent" | "fixed" | "none",
    discountPercent: "",
    discountFixedCents: "",
    paymentTermsDays: "30",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discountType: "percent",
      discountPercent: "",
      discountFixedCents: "",
      paymentTermsDays: "30",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Contract name is required", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createBrokerageContract({
        brokerageId,
        name: formData.name,
        description: formData.description || null,
        discountPercent:
          formData.discountType === "percent" && formData.discountPercent
            ? parseFloat(formData.discountPercent)
            : null,
        discountFixedCents:
          formData.discountType === "fixed" && formData.discountFixedCents
            ? Math.round(parseFloat(formData.discountFixedCents) * 100)
            : null,
        paymentTermsDays: parseInt(formData.paymentTermsDays) || 30,
      });

      if (result.success) {
        showToast("Contract created successfully", "success");
        setShowModal(false);
        resetForm();
        router.refresh();
      } else {
        showToast(result.error || "Failed to create contract", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Pricing Contracts</h2>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Add Contract
          </button>
        </div>

        {contracts.length > 0 ? (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="flex flex-col gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      contract.isActive
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                    )}
                  >
                    <DocumentIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{contract.name}</p>
                    <p className="text-xs text-foreground-muted">
                      {contract.discountPercent
                        ? `${contract.discountPercent}% discount`
                        : contract.discountFixedCents
                        ? `${formatCurrency(contract.discountFixedCents)} off`
                        : "No discount"}
                      {" • "}Net {contract.paymentTermsDays}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      contract.isActive
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                    )}
                  >
                    {contract.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
            <DocumentIcon className="mx-auto h-10 w-10 text-foreground-muted" />
            <p className="mt-3 text-sm text-foreground">No pricing contracts yet</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Add a contract to define pricing terms for this brokerage
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Add First Contract
            </button>
          </div>
        )}
      </div>

      {/* Add Contract Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-foreground">Add Pricing Contract</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                  Contract Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Pricing"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of pricing terms"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Discount Type</label>
                <div className="flex gap-2">
                  {(["percent", "fixed", "none"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: type })}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        formData.discountType === type
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--card-border)] bg-[var(--background)] text-foreground hover:bg-[var(--background-hover)]"
                      )}
                    >
                      {type === "percent" ? "Percentage" : type === "fixed" ? "Fixed Amount" : "None"}
                    </button>
                  ))}
                </div>
              </div>

              {formData.discountType === "percent" && (
                <div>
                  <label htmlFor="discountPercent" className="block text-sm font-medium text-foreground mb-1.5">
                    Discount Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="discountPercent"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      placeholder="10"
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 pr-8 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">%</span>
                  </div>
                </div>
              )}

              {formData.discountType === "fixed" && (
                <div>
                  <label htmlFor="discountFixed" className="block text-sm font-medium text-foreground mb-1.5">
                    Fixed Discount Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                    <input
                      type="number"
                      id="discountFixed"
                      value={formData.discountFixedCents}
                      onChange={(e) => setFormData({ ...formData, discountFixedCents: e.target.value })}
                      placeholder="50"
                      min="0"
                      step="1"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-foreground mb-1.5">
                  Payment Terms
                </label>
                <select
                  id="paymentTerms"
                  value={formData.paymentTermsDays}
                  onChange={(e) => setFormData({ ...formData, paymentTermsDays: e.target.value })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="0">Due on receipt</option>
                  <option value="7">Net 7</option>
                  <option value="15">Net 15</option>
                  <option value="30">Net 30</option>
                  <option value="45">Net 45</option>
                  <option value="60">Net 60</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Icons
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13ZM13.25 9a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm-6.5 4a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75Zm4-1.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
