export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function PricingPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Calculator"
        subtitle="Build and share pricing quotes"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🧮</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Interactive pricing calculator for clients and customizable price lists.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Interactive pricing calculator</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Package and add-on selections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>PDF price list generation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Shareable pricing links</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Client-specific pricing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Seasonal pricing variations</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/services" className="btn btn-secondary text-sm">Services</a>
          <a href="/products" className="btn btn-secondary text-sm">Products</a>
          <a href="/invoices" className="btn btn-secondary text-sm">Invoices</a>
        </div>
      </div>
    </div>
  );
}
