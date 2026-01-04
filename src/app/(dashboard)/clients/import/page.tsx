import { Suspense } from "react";
import { ClientImportClient } from "./client-import-client";

export const metadata = {
  title: "Import Clients | PhotoProOS",
  description: "Import clients from CSV file",
};

export default function ClientImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Import Clients</h1>
        <p className="mt-1 text-foreground-muted">
          Bulk import clients from a CSV file.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-[var(--background-secondary)] rounded w-1/3" />
              <div className="h-32 bg-[var(--background-secondary)] rounded" />
            </div>
          </div>
        }
      >
        <ClientImportClient />
      </Suspense>
    </div>
  );
}
