export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { GalleryNewForm } from "./gallery-new-form";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getGalleryTemplates } from "@/lib/actions/gallery-templates";

async function getClients(organizationId: string) {
  try {
    const clients = await prisma.client.findMany({
      where: { organizationId },
      select: {
        id: true,
        fullName: true,
        company: true,
        email: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return clients.map((c) => ({
      id: c.id,
      name: c.company || c.fullName || "Unknown",
      email: c.email,
    }));
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

async function getStats(organizationId: string) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalGalleries, deliveredThisMonth, revenueThisMonth] = await Promise.all([
      prisma.project.count({ where: { organizationId } }),
      prisma.project.count({
        where: {
          organizationId,
          status: "delivered",
          deliveredAt: { gte: startOfMonth },
        },
      }),
      prisma.payment.aggregate({
        where: {
          organizationId,
          status: "paid",
          paidAt: { gte: startOfMonth },
        },
        _sum: { amountCents: true },
      }),
    ]);

    return {
      totalGalleries,
      deliveredThisMonth,
      revenueThisMonth: revenueThisMonth._sum.amountCents || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { totalGalleries: 0, deliveredThisMonth: 0, revenueThisMonth: 0 };
  }
}

export default async function NewGalleryPage() {
  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const [clients, stats, templatesResult] = await Promise.all([
    getClients(auth.organizationId),
    getStats(auth.organizationId),
    getGalleryTemplates(),
  ]);

  const templates = templatesResult.success ? templatesResult.data : [];

  return (
    <div className="space-y-6" data-element="galleries-new-page">
      <PageHeader
        title="Create New Gallery"
        subtitle="Set up a new photo gallery for your client"
        actions={
          <Link
            href="/galleries"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Galleries
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <GalleryNewForm clients={clients} templates={templates || []} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Choose a descriptive name that your client will recognize.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Select a service package or set custom pricing for the gallery.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>You can add photos after creating the gallery.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Total Galleries</span>
                <span className="text-sm font-medium text-foreground">{stats.totalGalleries}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Delivered This Month</span>
                <span className="text-sm font-medium text-foreground">{stats.deliveredThisMonth}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Revenue This Month</span>
                <span className="text-sm font-medium text-[var(--success)]">
                  ${(stats.revenueThisMonth / 100).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Clients */}
          {clients.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Clients</h2>
              <div className="space-y-3">
                {clients.slice(0, 4).map((client) => (
                  <div key={client.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--background-secondary)] text-foreground-muted text-xs font-medium uppercase">
                      {(client.name || "?").charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{client.name || "Unknown"}</p>
                      <p className="text-xs text-foreground-muted truncate">{client.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for clients */}
          {clients.length === 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">No Clients Yet</h2>
              <p className="text-sm text-foreground-muted mb-4">
                Add your first client to get started with galleries.
              </p>
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                <PlusIcon className="h-4 w-4" />
                Add Client
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
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
