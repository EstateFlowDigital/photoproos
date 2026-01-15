import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients | PhotoProOS",
  description: "Manage your photography clients, track projects, and organize contacts with tags and filters.",
};

export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav, UsersIcon, TagIcon } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ClientsPageClient } from "./clients-page-client";
import { TagsManagementClient } from "./tags-management-client";
import { getClientTags } from "@/lib/actions/client-tags";
import type { Prisma } from "@prisma/client";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

interface PageProps {
  searchParams: Promise<{ q?: string; view?: string; tag?: string }>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const { q: searchQuery, view, tag: tagFilter } = await searchParams;

  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
      </div>
    );
  }

  // If viewing tags, show tags management
  if (view === "tags") {
    const tagsResult = await getClientTags();
    const tags = tagsResult.success ? tagsResult.data : [];

    return (
      <div className="space-y-6" data-element="clients-tags-page">
        <PageHeader
          title="Clients"
          subtitle="Manage client tags and categories"
        />

        <PageContextNav
          items={[
            { label: "All Clients", href: "/clients", icon: <UsersIcon className="h-4 w-4" /> },
            { label: "Tags", href: "/clients?view=tags", icon: <TagIcon className="h-4 w-4" /> },
          ]}
        />

        <TagsManagementClient tags={tags} />
      </div>
    );
  }

  // Build filter conditions
  const whereConditions: Prisma.ClientWhereInput = {
    organizationId: organization.id,
  };

  // Search filter
  if (searchQuery) {
    whereConditions.OR = [
      { fullName: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
      { company: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  // Tag filter
  if (tagFilter) {
    whereConditions.tags = {
      some: { tagId: tagFilter },
    };
  }

  // Fetch clients with project count and optional search filter
  const clients = await prisma.client.findMany({
    where: whereConditions,
    include: {
      _count: { select: { projects: true } },
      tags: {
        include: {
          tag: true,
        },
      },
      invoices: {
        where: { status: "paid" },
        select: { totalCents: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform clients to include tags array and calculated revenue
  const clientsWithTags = clients.map((client) => {
    // Calculate revenue from paid invoices
    const calculatedRevenue = client.invoices.reduce(
      (sum, invoice) => sum + invoice.totalCents,
      0
    );
    // Use calculated revenue if available, otherwise fall back to stored value
    const lifetimeRevenue = calculatedRevenue > 0 ? calculatedRevenue : client.lifetimeRevenueCents;

    return {
      id: client.id,
      fullName: client.fullName,
      email: client.email,
      company: client.company,
      industry: client.industry,
      lifetimeRevenueCents: lifetimeRevenue,
      _count: client._count,
      tags: client.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
        color: t.tag.color,
      })),
    };
  });

  // Fetch all tags for filter pills
  const tagsResult = await getClientTags();
  const allTags = tagsResult.success ? tagsResult.data : [];

  // Get walkthrough preference
  const walkthroughResult = await getWalkthroughPreference("clients");
  const walkthroughState = walkthroughResult.success && walkthroughResult.data
    ? walkthroughResult.data.state
    : "open";

  return (
    <div className="space-y-6" data-element="clients-page">
      {/* Page Walkthrough */}
      <WalkthroughWrapper
        pageId="clients"
        initialState={walkthroughState}
      />

      <ClientsPageClient
        clients={clientsWithTags}
        searchQuery={searchQuery}
        allTags={allTags}
        activeTagId={tagFilter}
      />
    </div>
  );
}
