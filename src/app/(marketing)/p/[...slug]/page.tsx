import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { PageRenderer } from "@/components/cms/component-renderers";
import { PreviewToolbar } from "@/components/cms/preview-toolbar";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Fetch a published marketing page by slug
 * Supports preview mode via cookie
 */
async function getPublishedPage(slugParts: string[]) {
  const slug = slugParts.join("/");
  const cookieStore = await cookies();
  const isPreview = cookieStore.get("cms_preview_mode")?.value === "true";

  const page = await prisma.marketingPage.findUnique({
    where: { slug },
  });

  if (!page) {
    return null;
  }

  // In preview mode, use draft content if available
  // In production, only show published pages
  if (!isPreview && page.status !== "published") {
    return null;
  }

  // For preview mode, prefer draft content if it exists
  const content = isPreview && page.hasDraft && page.draftContent
    ? page.draftContent
    : page.content;

  return {
    page,
    content,
    isPreview,
    hasDraft: page.hasDraft,
  };
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: slugParts } = await params;
  const result = await getPublishedPage(slugParts);

  if (!result) {
    return { title: "Page Not Found" };
  }

  const { page } = result;

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
  };
}

/**
 * CMS Page Route
 *
 * Renders marketing pages built with the page builder.
 * - Checks layoutMode to determine rendering strategy
 * - Supports preview mode for draft content
 * - Falls back to 404 for unpublished pages (unless in preview)
 */
export default async function CMSPage({ params }: PageProps) {
  const { slug: slugParts } = await params;
  const result = await getPublishedPage(slugParts);

  if (!result) {
    notFound();
  }

  const { page, isPreview, hasDraft } = result;

  // Check if this page uses the component page builder
  if (page.layoutMode === "components") {
    const components = (page.components as PageComponentInstance[]) || [];

    return (
      <main className="min-h-screen bg-background">
        {/* Preview Mode Toolbar */}
        <PreviewToolbar
          isPreview={isPreview}
          hasDraft={hasDraft}
          pageSlug={page.slug}
        />

        {/* Render page components */}
        <PageRenderer components={components} />
      </main>
    );
  }

  // For structured layout mode, render based on page type
  // This is a fallback for pages that haven't migrated to the page builder
  return (
    <main className="min-h-screen bg-background">
      {/* Preview Mode Toolbar */}
      <PreviewToolbar
        isPreview={isPreview}
        hasDraft={hasDraft}
        pageSlug={page.slug}
      />

      {/* Fallback: Show message that page needs migration */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
        <p className="text-[var(--foreground-muted)]">
          This page uses structured content mode.
          <br />
          Use the Page Builder to add components.
        </p>
      </div>
    </main>
  );
}
