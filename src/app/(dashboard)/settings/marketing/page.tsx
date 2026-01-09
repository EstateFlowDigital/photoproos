export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";
import { Megaphone, Plus, Package, Image, Video, FileText, Sparkles, Lightbulb } from "lucide-react";

export default async function MarketingSettingsPage() {
  const organizationId = await requireOrganizationId();

  // Get marketing kits for this organization
  const marketingKits = await prisma.marketingKit.findMany({
    where: { organizationId },
    include: {
      propertyWebsite: {
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
        },
      },
      _count: {
        select: { assets: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Get templates count
  const templatesCount = await prisma.marketingTemplate.count({
    where: {
      OR: [
        { organizationId },
        { isSystem: true },
        { isPublic: true },
      ],
    },
  });

  // Get total assets count
  const assetsCount = await prisma.marketingAsset.count({
    where: {
      marketingKit: { organizationId },
    },
  });

  return (
    <div data-element="settings-marketing-page" className="space-y-6">
      <PageHeader
        title="Marketing Kit"
        subtitle="Generate social media content, flyers, and marketing materials for your listings"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Marketing Kits List */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-foreground">Your Marketing Kits</h2>
              <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Kit
              </Button>
            </div>

            {marketingKits.length > 0 ? (
              <div className="space-y-3">
                {marketingKits.map((kit) => (
                  <div
                    key={kit.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] hover:bg-[var(--background-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-foreground truncate">{kit.name}</h3>
                        {kit.propertyWebsite && (
                          <p className="text-sm text-foreground-muted truncate">
                            {kit.propertyWebsite.address}, {kit.propertyWebsite.city}, {kit.propertyWebsite.state}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-4 flex-wrap sm:justify-end gap-3 sm:gap-4 pl-13 sm:pl-0">
                      <span className="text-sm text-foreground-muted whitespace-nowrap">
                        {kit._count.assets} asset{kit._count.assets !== 1 ? "s" : ""}
                      </span>
                      <Button variant="outline" size="sm" disabled>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 mx-auto items-center justify-center rounded-full bg-[var(--background-secondary)]">
                  <Megaphone className="h-7 w-7 sm:h-8 sm:w-8 text-foreground-muted" />
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-medium text-foreground">No marketing kits yet</h3>
                <p className="mt-2 text-sm text-foreground-muted max-w-sm mx-auto px-4">
                  Marketing kits are automatically created when you set up property websites.
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/properties">
                    <Plus className="h-4 w-4 mr-2" />
                    Go to Properties
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Feature Overview */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">Marketing Kit Features</h2>
                <p className="mt-1 text-sm text-foreground-muted">
                  Generate professional marketing materials for your property listings automatically.
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-foreground-secondary">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    <span className="truncate">Social media tiles (Just Listed, Open House)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    <span className="truncate">Property flyers and brochures</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    <span className="truncate">Branded and MLS-compliant versions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    <span className="truncate">Co-branded materials with agent info</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    <span className="truncate">Video slideshows and reels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    <span className="truncate">Email templates and banners</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/10 text-[var(--warning)]">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">More Features Coming Soon</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  We're expanding the Marketing Kit with AI-powered content generation,
                  social media scheduling, and advanced video editing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                    <Package className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <span className="text-sm text-foreground-muted">Marketing Kits</span>
                </div>
                <span className="text-sm font-medium text-foreground">{marketingKits.length}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                    <Image className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <span className="text-sm text-foreground-muted">Total Assets</span>
                </div>
                <span className="text-sm font-medium text-foreground">{assetsCount}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                    <FileText className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <span className="text-sm text-foreground-muted">Templates</span>
                </div>
                <span className="text-sm font-medium text-foreground">{templatesCount}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                    <Video className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <span className="text-sm text-foreground-muted">Videos</span>
                </div>
                <span className="text-sm font-medium text-foreground-muted">Coming soon</span>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">1</div>
                <p>Create a property website first to generate marketing materials.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">2</div>
                <p>Choose branded, MLS-compliant, or co-branded versions based on your needs.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">3</div>
                <p>Download assets in multiple sizes for different social platforms.</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/properties"
                className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Property Website
              </Link>
              <Link
                href="/settings/branding"
                className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Customize Branding
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
