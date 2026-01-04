import { Suspense } from "react";
import { RecurringInvoicesClient } from "./recurring-invoices-client";

export const metadata = {
  title: "Recurring Invoices | PhotoProOS",
  description: "Manage subscription and retainer billing",
};

export default function RecurringInvoicesPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-[var(--background-secondary)] rounded w-1/3" />
              <div className="h-64 bg-[var(--background-secondary)] rounded" />
            </div>
          </div>
        }
      >
        <RecurringInvoicesClient />
      </Suspense>
    </div>
  );
}
