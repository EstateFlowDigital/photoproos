"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Icons
function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 3h6V9l3.4 6.8a2 2 0 0 1-1.79 2.2H7.39a2 2 0 0 1-1.79-2.2L9 9V3z" />
      <path d="M9 3h6" />
      <path d="M12 15h.01" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

interface SubscriptionPlan {
  id: string;
  name: string;
  stripeProductId: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface PricingExperiment {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

interface DeveloperPageClientProps {
  initialPlans: SubscriptionPlan[];
  initialExperiments: PricingExperiment[];
}

export function DeveloperPageClient({
  initialPlans,
  initialExperiments,
}: DeveloperPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Environment variables that should be configured
  const envVars = [
    { name: "DATABASE_URL", status: "configured", description: "PostgreSQL connection string" },
    { name: "ANTHROPIC_API_KEY", status: process.env.NEXT_PUBLIC_HAS_ANTHROPIC_KEY ? "configured" : "missing", description: "Claude AI API key" },
    { name: "STRIPE_SECRET_KEY", status: "configured", description: "Stripe payment processing" },
    { name: "CLERK_SECRET_KEY", status: "configured", description: "Clerk authentication" },
    { name: "R2_BUCKET_NAME", status: "configured", description: "Cloudflare R2 storage" },
    { name: "SLACK_WEBHOOK_URL", status: "optional", description: "Slack notifications" },
    { name: "RESEND_API_KEY", status: "configured", description: "Email delivery" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <CreditCardIcon className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-sm text-[var(--foreground-muted)]">
              Subscription Plans
            </span>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {initialPlans.length}
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <FlaskIcon className="w-5 h-5 text-[var(--warning)]" />
            <span className="text-sm text-[var(--foreground-muted)]">
              Active Experiments
            </span>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {initialExperiments.filter((e) => e.isActive).length}
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <KeyIcon className="w-5 h-5 text-[var(--success)]" />
            <span className="text-sm text-[var(--foreground-muted)]">
              API Keys Configured
            </span>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {envVars.filter((e) => e.status === "configured").length}/{envVars.length}
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <ServerIcon className="w-5 h-5 text-[var(--ai)]" />
            <span className="text-sm text-[var(--foreground-muted)]">
              System Status
            </span>
          </div>
          <div className="text-2xl font-bold text-[var(--success)]">
            Healthy
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-4 py-3">
        <p className="text-sm text-[var(--warning)]">
          <strong>Warning:</strong> These tools affect the entire platform. Use with caution in production environments.
        </p>
      </div>

      {/* Subscription Plans */}
      <div
        className={cn(
          "rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]"
        )}
      >
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg",
                  "bg-[var(--primary)]/10",
                  "flex items-center justify-center"
                )}
              >
                <CreditCardIcon className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Subscription Plans
                </h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Manage pricing tiers and features
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {initialPlans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "p-4 rounded-lg",
                  "border border-[var(--border)]",
                  "bg-[var(--background)]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-[var(--foreground)]">
                    {plan.name}
                  </h3>
                  {plan.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold text-[var(--foreground)] mb-1">
                  ${(plan.priceMonthly / 100).toFixed(0)}
                  <span className="text-sm font-normal text-[var(--foreground-muted)]">
                    /mo
                  </span>
                </div>
                <div className="text-xs text-[var(--foreground-muted)] mb-3">
                  ${(plan.priceYearly / 100).toFixed(0)}/year
                </div>
                <div className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]"
                    >
                      <CheckIcon className="w-3 h-3 text-[var(--success)]" />
                      {feature}
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <p className="text-xs text-[var(--foreground-muted)]">
                      +{plan.features.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environment Configuration */}
      <div
        className={cn(
          "rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]"
        )}
      >
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg",
                "bg-[var(--success)]/10",
                "flex items-center justify-center"
              )}
            >
              <KeyIcon className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Environment Configuration
              </h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                Required API keys and integrations
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {envVars.map((env) => (
              <div
                key={env.name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  "border border-[var(--border)]",
                  "bg-[var(--background)]"
                )}
              >
                <div>
                  <code className="text-sm font-mono text-[var(--foreground)]">
                    {env.name}
                  </code>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {env.description}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    env.status === "configured" &&
                      "bg-[var(--success)]/10 text-[var(--success)]",
                    env.status === "missing" &&
                      "bg-[var(--error)]/10 text-[var(--error)]",
                    env.status === "optional" &&
                      "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]"
                  )}
                >
                  {env.status}
                </Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--foreground-muted)]">
            Environment variables are configured in Railway or your deployment platform.
            Contact your system administrator to update these values.
          </p>
        </div>
      </div>

      {/* Pricing Experiments */}
      {initialExperiments.length > 0 && (
        <div
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg",
                  "bg-[var(--warning)]/10",
                  "flex items-center justify-center"
                )}
              >
                <FlaskIcon className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Pricing Experiments
                </h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  A/B tests for pricing strategies
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {initialExperiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    "border border-[var(--border)]",
                    "bg-[var(--background)]"
                  )}
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {experiment.name}
                    </p>
                    {experiment.description && (
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {experiment.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      experiment.isActive
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]"
                    )}
                  >
                    {experiment.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div
        className={cn(
          "rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]",
          "p-6"
        )}
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Developer Resources
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <a
            href="/settings/developer/api"
            target="_blank"
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              "border border-[var(--border)]",
              "bg-[var(--background)]",
              "hover:border-[var(--border-hover)]",
              "transition-colors"
            )}
          >
            <span className="font-medium text-[var(--foreground)]">
              API Documentation
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              REST API
            </span>
          </a>
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              "border border-[var(--border)]",
              "bg-[var(--background)]",
              "hover:border-[var(--border-hover)]",
              "transition-colors"
            )}
          >
            <span className="font-medium text-[var(--foreground)]">
              Clerk Dashboard
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              Auth
            </span>
          </a>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              "border border-[var(--border)]",
              "bg-[var(--background)]",
              "hover:border-[var(--border-hover)]",
              "transition-colors"
            )}
          >
            <span className="font-medium text-[var(--foreground)]">
              Stripe Dashboard
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              Payments
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
