export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";
import { Megaphone, Plus, Package, Image, Video, FileText, Sparkles } from "lucide-react";

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
    <div className="space-y-6">
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

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Marketing Kits"
          value={marketingKits.length}
          description="Active kits"
        />
        <StatCard
          icon={Image}
          label="Total Assets"
          value={assetsCount}
          description="Generated materials"
        />
        <StatCard
          icon={FileText}
          label="Templates"
          value={templatesCount}
          description="Available templates"
        />
        <StatCard
          icon={Video}
          label="Videos"
          value={0}
          description="Coming soon"
        />
      </div>

      {/* Feature Overview */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Marketing Kit Features</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Generate professional marketing materials for your property listings automatically.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-foreground-secondary">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                Social media tiles (Just Listed, Open House, etc.)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                Property flyers and brochures
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                Branded and MLS-compliant versions
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                Co-branded materials with agent info
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                Video slideshows and reels
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                Email templates and banners
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Marketing Kits List */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Your Marketing Kits</h2>
          <Button variant="outline" size="sm" disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Kit
          </Button>
        </div>

        {marketingKits.length > 0 ? (
          <div className="space-y-3">
            {marketingKits.map((kit) => (
              <div
                key={kit.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] hover:bg-[var(--background-hover)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{kit.name}</h3>
                    {kit.propertyWebsite && (
                      <p className="text-sm text-foreground-muted">
                        {kit.propertyWebsite.address}, {kit.propertyWebsite.city}, {kit.propertyWebsite.state}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-foreground-muted">
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
          <div className="text-center py-12">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[var(--background-secondary)]">
              <Megaphone className="h-8 w-8 text-foreground-muted" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">No marketing kits yet</h3>
            <p className="mt-2 text-sm text-foreground-muted max-w-sm mx-auto">
              Marketing kits are automatically created when you set up property websites.
              Create a property website to get started.
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

      {/* Coming Soon Notice */}
      <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10 text-[var(--warning)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">More Features Coming Soon</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              We're working on expanding the Marketing Kit with AI-powered content generation,
              social media scheduling integration, and advanced video editing capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
          <Icon className="h-5 w-5 text-foreground-muted" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-foreground-muted">{label}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-foreground-muted">{description}</p>
    </div>
  );
}
