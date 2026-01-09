import { Suspense } from "react";
import { ClientMergeClient } from "./client-merge-client";

export const metadata = {
  title: "Merge Clients | PhotoProOS",
  description: "Find and merge duplicate client records",
};

export default function ClientMergePage() {
  return (
    <div className="space-y-6" data-element="clients-merge-page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Merge Duplicate Clients</h1>
        <p className="mt-1 text-foreground-muted">
          Find and merge duplicate client records to keep your database clean.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-[var(--background-secondary)] rounded w-1/3" />
              <div className="h-24 bg-[var(--background-secondary)] rounded" />
              <div className="h-24 bg-[var(--background-secondary)] rounded" />
            </div>
          </div>
        }
      >
        <ClientMergeClient />
      </Suspense>
    </div>
  );
}
