export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { OrderPageForm } from "@/components/dashboard/order-page-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderPage } from "@/lib/actions/order-pages";

interface OrderPageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPageDetailPage({ params }: OrderPageDetailPageProps) {
  const { id } = await params;

  const orderPage = await getOrderPage(id);

  if (!orderPage) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Order Page"
        subtitle="Update your order page settings"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/order-pages" className="hover:text-foreground transition-colors">
          Order Pages
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground">{orderPage.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <OrderPageForm
            mode="edit"
            initialData={{
              id: orderPage.id,
              name: orderPage.name,
              slug: orderPage.slug,
              headline: orderPage.headline || "",
              subheadline: orderPage.subheadline || "",
              heroImageUrl: orderPage.heroImageUrl || "",
              logoOverrideUrl: orderPage.logoOverrideUrl || "",
              primaryColor: orderPage.primaryColor || "#3b82f6",
              showPhone: orderPage.showPhone,
              showEmail: orderPage.showEmail,
              customPhone: orderPage.customPhone || "",
              customEmail: orderPage.customEmail || "",
              template: orderPage.template,
              metaTitle: orderPage.metaTitle || "",
              metaDescription: orderPage.metaDescription || "",
              testimonials: orderPage.testimonials || [],
              isPublished: orderPage.isPublished,
              requireLogin: orderPage.requireLogin,
              orderCount: orderPage.orderCount,
              bundleIds: orderPage.bundles.map((b) => b.bundleId),
              serviceIds: orderPage.services.map((s) => s.serviceId),
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{orderPage.orderCount}</p>
                <p className="text-xs text-foreground-muted">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {orderPage.bundles.length + orderPage.services.length}
                </p>
                <p className="text-xs text-foreground-muted">Products</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{orderPage.viewCount}</p>
                <p className="text-xs text-foreground-muted">Page Views</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/order/${orderPage.slug}`}
                target="_blank"
                className="flex items-center gap-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <EyeIcon className="h-4 w-4" />
                View Public Page
              </Link>
              <CopyLinkButton slug={orderPage.slug} />
            </div>
          </div>

          {/* Page Status */}
          <div className={cn(
            "rounded-lg border p-4",
            orderPage.isPublished
              ? "border-[var(--success)]/30 bg-[var(--success)]/10"
              : "border-[var(--warning)]/30 bg-[var(--warning)]/10"
          )}>
            <div className="flex gap-3">
              {orderPage.isPublished ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-[var(--success)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--success)]">Page is Live</p>
                    <p className="text-xs text-[var(--success)]/80 mt-1">
                      Clients can view and order from this page
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ExclamationCircleIcon className="h-5 w-5 text-[var(--warning)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--warning)]">Page is Unpublished</p>
                    <p className="text-xs text-[var(--warning)]/80 mt-1">
                      Publish the page to accept orders
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyLinkButton({ slug }: { slug: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const url = `${window.location.origin}/order/${slug}`;
        navigator.clipboard.writeText(url);
      }}
      className="flex items-center gap-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
    >
      <LinkIcon className="h-4 w-4" />
      Copy Link
    </button>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ExclamationCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
