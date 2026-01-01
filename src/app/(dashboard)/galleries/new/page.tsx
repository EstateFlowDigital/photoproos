export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { GalleryNewForm } from "./gallery-new-form";
import Link from "next/link";

// Demo clients for the dropdown
const demoClients = [
  { id: "1", name: "Premier Realty", email: "contact@premierrealty.com" },
  { id: "2", name: "Tech Solutions Inc", email: "admin@techsolutions.com" },
  { id: "3", name: "Bella Cucina", email: "info@bellacucina.com" },
  { id: "4", name: "Design Studio Pro", email: "hello@designstudiopro.com" },
  { id: "5", name: "Sarah Mitchell", email: "sarah.m@email.com" },
  { id: "6", name: "Berkshire Properties", email: "listings@berkshire.com" },
  { id: "7", name: "Innovate Tech", email: "events@innovatetech.com" },
  { id: "8", name: "Luxury Living Realty", email: "info@luxuryliving.com" },
];

export default function NewGalleryPage() {
  return (
    <div className="space-y-6">
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

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Form submissions are disabled. This is a preview of the gallery creation flow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <GalleryNewForm clients={demoClients} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Choose a descriptive name that your client will recognize.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Select a service package or set custom pricing for the gallery.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Upload a cover image that represents the gallery best.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Galleries</span>
                <span className="text-sm font-medium text-foreground">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Delivered This Month</span>
                <span className="text-sm font-medium text-foreground">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Revenue This Month</span>
                <span className="text-sm font-medium text-[var(--success)]">$8,420</span>
              </div>
            </div>
          </div>

          {/* Recent Clients */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Clients</h2>
            <div className="space-y-3">
              {demoClients.slice(0, 4).map((client) => (
                <div key={client.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-xs text-foreground-muted truncate">{client.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
