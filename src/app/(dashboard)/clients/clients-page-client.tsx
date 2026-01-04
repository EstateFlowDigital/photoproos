"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreateClientModal } from "@/components/modals/create-client-modal";
import { useToast } from "@/components/ui/toast";
import { impersonateClientPortal } from "@/lib/actions/clients";
import { ClientSearch } from "./client-search";
import { PageHeader, PageContextNav, UsersIcon, TagIcon } from "@/components/dashboard";

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

interface ClientTag {
  id: string;
  name: string;
  color: string | null;
}

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  company: string | null;
  industry: string;
  lifetimeRevenueCents: number;
  _count: { projects: number };
  tags?: ClientTag[];
}

interface Tag {
  id: string;
  name: string;
  color: string | null;
  clientCount: number;
}

interface ClientsPageClientProps {
  clients: Client[];
  searchQuery?: string;
  allTags?: Tag[];
  activeTagId?: string;
}

export function ClientsPageClient({ clients, searchQuery, allTags = [], activeTagId }: ClientsPageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  const handleClientCreated = (client: { id: string }) => {
    router.refresh();
  };

  const handleImpersonate = async (clientId: string) => {
    setImpersonatingId(clientId);
    try {
      const result = await impersonateClientPortal(clientId);
      if (result.success) {
        const portalUrl = result.data.portalUrl || "/portal";
        const newWindow = window.open(portalUrl, "_blank", "noopener,noreferrer");
        if (!newWindow) {
          window.location.href = portalUrl;
        }
      } else {
        showToast(result.error || "Unable to open client portal", "error");
      }
    } catch {
      showToast("Unable to open client portal", "error");
    } finally {
      setImpersonatingId(null);
    }
  };

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} clients in your database`}
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 sm:w-auto"
          >
            <PlusIcon className="h-4 w-4" />
            Add Client
          </button>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "All Clients", href: "/clients", icon: <UsersIcon className="h-4 w-4" /> },
          { label: "Tags", href: "/clients?view=tags", icon: <TagIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Search bar */}
      <ClientSearch initialQuery={searchQuery || ""} />

      {/* Tag Filter Pills */}
      {allTags && allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/clients"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              !activeTagId
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-secondary hover:bg-[var(--background-hover)]"
            )}
          >
            All
          </Link>
          {allTags.map((tag) => (
            <Link
              key={tag.id}
              href={`/clients?tag=${tag.id}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                activeTagId === tag.id
                  ? "text-white"
                  : "bg-[var(--background-secondary)] text-foreground-secondary hover:bg-[var(--background-hover)]"
              )}
              style={activeTagId === tag.id ? { backgroundColor: tag.color || "#3b82f6" } : undefined}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color || "#6b7280" }}
              />
              {tag.name}
              <span className="text-xs opacity-70">({tag.clientCount})</span>
            </Link>
          ))}
        </div>
      )}

      {/* Clients Table */}
      {clients.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
          <table className="w-full min-w-[640px]">
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
                  className="group relative transition-colors hover:bg-[var(--background-hover)] cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/clients/${client.id}`}
                      className="absolute inset-0 z-0"
                      aria-label={`View client: ${client.fullName || client.email}`}
                    />
                    <div className="relative z-10 pointer-events-none flex items-center gap-3">
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
                        {client.tags && client.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {client.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                style={{ backgroundColor: tag.color || "#6b7280" }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span className="relative z-10 pointer-events-none inline-flex rounded-full bg-[var(--background-secondary)] px-2.5 py-1 text-xs font-medium text-foreground-secondary">
                      {industryLabels[client.industry] || client.industry}
                    </span>
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-foreground-muted lg:table-cell">
                    <span className="relative z-10 pointer-events-none">{client._count.projects} projects</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "relative z-10 pointer-events-none font-medium",
                      client.lifetimeRevenueCents > 0
                        ? "text-[var(--success)]"
                        : "text-foreground-muted"
                    )}>
                      {formatCurrency(client.lifetimeRevenueCents)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative z-10 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleImpersonate(client.id)}
                        disabled={impersonatingId === client.id}
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--card-border)] px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
                        aria-label={`View ${client.fullName || client.email} portal`}
                      >
                        <PortalIcon className="h-3.5 w-3.5 text-foreground-muted" />
                        {impersonatingId === client.id ? "Opening..." : "Portal"}
                      </button>
                      <ChevronRightIcon className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                    </div>
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
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 sm:w-auto"
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

function PortalIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-6 16a6 6 0 0 1 12 0 .75.75 0 0 1-1.5 0 4.5 4.5 0 0 0-9 0 .75.75 0 0 1-1.5 0Z" clipRule="evenodd" />
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
