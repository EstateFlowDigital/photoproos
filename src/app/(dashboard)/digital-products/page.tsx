export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function DigitalProductsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="digital-products-page">
      <PageHeader
        title="Digital Products"
        subtitle="Sell presets, guides, and digital downloads"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">💾</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create and sell Lightroom presets, LUTs, guides, and other digital products.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Sell Lightroom presets and LUTs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>PDF guides and educational resources</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Secure download delivery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>License key generation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Bundle products together</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Sales analytics and reporting</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/products" className="btn btn-secondary text-sm">Products</a>
          <a href="/courses" className="btn btn-secondary text-sm">Courses</a>
          <a href="/invoices" className="btn btn-secondary text-sm">Invoices</a>
        </div>
      </div>
    </div>
  );
}
