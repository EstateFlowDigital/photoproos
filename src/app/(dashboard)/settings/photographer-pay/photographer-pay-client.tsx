"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { upsertPhotographerRate, deletePhotographerRate } from "@/lib/actions/photographer-pay";
import type { PhotographerRateWithRelations } from "@/lib/actions/photographer-pay";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
}

interface Service {
  id: string;
  name: string;
  category: string;
}

interface Stats {
  totalEarned: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
}

interface PhotographerPayClientProps {
  members: Member[];
  rates: PhotographerRateWithRelations[];
  stats: Stats;
  services: Service[];
}

export function PhotographerPayClient({
  members,
  rates,
  stats,
  services,
}: PhotographerPayClientProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group rates by user
  const ratesByUser = rates.reduce((acc, rate) => {
    if (!acc[rate.userId]) {
      acc[rate.userId] = [];
    }
    acc[rate.userId].push(rate);
    return acc;
  }, {} as Record<string, PhotographerRateWithRelations[]>);

  const handleSaveRate = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const userId = formData.get("userId") as string;
      const serviceId = formData.get("serviceId") as string;
      const rateType = formData.get("rateType") as "percentage" | "fixed" | "hourly";
      const rateValue = parseFloat(formData.get("rateValue") as string);
      const minPay = formData.get("minPay") as string;
      const maxPay = formData.get("maxPay") as string;

      await upsertPhotographerRate({
        userId,
        serviceId: serviceId === "default" ? null : serviceId,
        rateType,
        rateValue: rateType === "percentage" ? rateValue : Math.round(rateValue * 100),
        minPayCents: minPay ? Math.round(parseFloat(minPay) * 100) : null,
        maxPayCents: maxPay ? Math.round(parseFloat(maxPay) * 100) : null,
      });

      setIsAddingRate(false);
      setEditingRateId(null);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRate = async (rateId: string) => {
    const confirmed = await confirm({
      title: "Delete rate",
      description: "Are you sure you want to delete this rate? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await deletePhotographerRate(rateId);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Stats */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total Earned</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(stats.totalEarned)}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Pending</p>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{formatCurrency(stats.pendingAmount)}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Approved</p>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{formatCurrency(stats.approvedAmount)}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Paid Out</p>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(stats.paidAmount)}</p>
        </div>
      </div>

      {/* Pay Rates Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pay Rates</h2>
            <p className="text-sm text-foreground-muted">Configure how photographers are paid for each service</p>
          </div>
          <Button variant="primary" onClick={() => setIsAddingRate(true)}>
            <PlusIcon className="h-4 w-4" />
            Add Rate
          </Button>
        </div>

        {/* Add Rate Form */}
        {isAddingRate && (
          <form action={handleSaveRate} className="mb-6 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <h3 className="font-medium text-foreground mb-4">Add New Rate</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select
                label="Team Member"
                name="userId"
                required
                placeholder="Select member..."
                options={members.map((member) => ({
                  value: member.userId,
                  label: member.user.fullName || member.user.email,
                }))}
              />

              <Select
                label="Service"
                name="serviceId"
                options={[
                  { value: "default", label: "Default (all services)" },
                  ...services.map((service) => ({
                    value: service.id,
                    label: service.name,
                  })),
                ]}
              />

              <Select
                label="Rate Type"
                name="rateType"
                required
                options={[
                  { value: "percentage", label: "Percentage of Invoice" },
                  { value: "fixed", label: "Fixed Amount" },
                  { value: "hourly", label: "Hourly Rate" },
                ]}
              />

              <Input
                label="Rate Value"
                type="number"
                name="rateValue"
                required
                step="0.01"
                min="0"
                placeholder="e.g., 40 for 40% or $40"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Minimum Pay (optional)"
                type="number"
                name="minPay"
                step="0.01"
                min="0"
                placeholder="e.g., 50 for $50 minimum"
              />

              <Input
                label="Maximum Pay (optional)"
                type="number"
                name="maxPay"
                step="0.01"
                min="0"
                placeholder="e.g., 500 for $500 cap"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Rate"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddingRate(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Rates by Team Member */}
        {members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => {
              const memberRates = ratesByUser[member.userId] || [];
              return (
                <div
                  key={member.userId}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                      {(member.user.fullName || member.user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.user.fullName || member.user.email}</p>
                      <p className="text-sm text-foreground-muted">{member.user.email}</p>
                    </div>
                  </div>

                  {memberRates.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {memberRates.map((rate) => {
                        const service = rate.serviceId
                          ? services.find((s) => s.id === rate.serviceId)
                          : null;
                        return (
                          <div
                            key={rate.id}
                            className="flex flex-col gap-2 rounded-lg bg-[var(--card)] px-4 py-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm text-foreground">
                                {service ? service.name : "Default Rate"}
                              </span>
                              <span className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                rate.rateType === "percentage"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : rate.rateType === "fixed"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-purple-500/10 text-purple-400"
                              )}>
                                {rate.rateType === "percentage"
                                  ? `${rate.rateValue}%`
                                  : rate.rateType === "fixed"
                                  ? formatCurrency(rate.rateValue)
                                  : `${formatCurrency(rate.rateValue)}/hr`}
                              </span>
                              {(rate.minPayCents || rate.maxPayCents) && (
                                <span className="text-xs text-foreground-muted">
                                  {rate.minPayCents && `Min: ${formatCurrency(rate.minPayCents)}`}
                                  {rate.minPayCents && rate.maxPayCents && " • "}
                                  {rate.maxPayCents && `Max: ${formatCurrency(rate.maxPayCents)}`}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteRate(rate.id)}
                              disabled={isSubmitting}
                              className="rounded-lg p-1.5 text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-foreground-muted italic">No rates configured</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-[var(--card-border)] p-8 text-center">
            <UsersIcon className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="mt-2 text-sm text-foreground">No team members yet</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Add team members to configure their pay rates
            </p>
          </div>
        )}
      </div>

      {/* Rate Type Explanation */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Rate Types</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-[var(--background)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                Percentage
              </span>
            </div>
            <p className="text-sm text-foreground-secondary">
              Photographer receives a percentage of the invoice total. Great for variable pricing.
            </p>
          </div>
          <div className="rounded-lg bg-[var(--background)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                Fixed
              </span>
            </div>
            <p className="text-sm text-foreground-secondary">
              Photographer receives a flat fee per job regardless of invoice amount.
            </p>
          </div>
          <div className="rounded-lg bg-[var(--background)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400">
                Hourly
              </span>
            </div>
            <p className="text-sm text-foreground-secondary">
              Photographer is paid based on time spent on the job (uses booking duration).
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Icon Components
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
    </svg>
  );
}
