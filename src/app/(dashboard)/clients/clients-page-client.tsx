"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreateClientModal } from "@/components/modals/create-client-modal";
import { ClientSearch } from "./client-search";

// Industry display names
const industryLabels: Record<string, string> = {
  real_estate: "Real Estate",
  wedding: "Wedding",
  portrait: "Portrait",
  commercial: "Commercial",
  architecture: "Architecture",
  food_hospitality: "Food & Hospitality",
  events: "Events",
  headshots: "Headshots",
  product: "Product",
  other: "Other",
};

// Helper to format currency
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  company: string | null;
  industry: string;
  lifetimeRevenueCents: number;
  _count: { projects: number };
}

interface ClientsPageClientProps {
  clients: Client[];
  searchQuery?: string;
}

export function ClientsPageClient({ clients, searchQuery }: ClientsPageClientProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleClientCreated = (client: { id: string }) => {
    router.refresh();
  };

  return (
    <>
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-foreground-muted">{clients.length} clients in your database</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
        >
          <PlusIcon className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Search bar */}
      <ClientSearch initialQuery={searchQuery || ""} />

      {/* Clients Table */}
      {clients.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Client
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Industry
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                  Projects
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="transition-colors hover:bg-[var(--background-hover)]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-medium text-white">
                        {(client.fullName || client.email).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {client.fullName || client.email}
                        </p>
                        {client.company && (
                          <p className="text-sm text-foreground-muted">{client.company}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span className="inline-flex rounded-full bg-[var(--background-secondary)] px-2.5 py-1 text-xs font-medium text-foreground-secondary">
                      {industryLabels[client.industry] || client.industry}
                    </span>
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-foreground-muted lg:table-cell">
                    {client._count.projects} projects
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "font-medium",
                      client.lifetimeRevenueCents > 0
                        ? "text-[var(--success)]"
                        : "text-foreground-muted"
                    )}>
                      {formatCurrency(client.lifetimeRevenueCents)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <ClientsIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No clients yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Add your first client to start managing your photography business.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Client
          </button>
        </div>
      )}

      {/* Create Client Modal */}
      <CreateClientModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleClientCreated}
      />
    </>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}
