import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AddonCatalogManager } from "@/components/gallery/addon-catalog-manager";

export const metadata = {
  title: "Gallery Add-ons | Settings",
};

export default async function GalleryAddonsSettingsPage() {
  const { orgId } = await auth();
  if (!orgId) {
    redirect("/sign-in");
  }

  const org = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  if (!org) {
    redirect("/sign-in");
  }

  const addons = await prisma.galleryAddon.findMany({
    where: { organizationId: org.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div data-element="settings-gallery-addons-page" className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Gallery Add-ons
        </h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Configure upsell services that clients can request from their galleries
        </p>
      </div>

      <AddonCatalogManager addons={addons} />
    </div>
  );
}
