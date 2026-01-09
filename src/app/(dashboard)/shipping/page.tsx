export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ShippingPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="shipping-page" className="space-y-6">
      <PageHeader
        title="Shipping"
        subtitle="Manage shipments and tracking"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create shipping labels, track packages, and manage delivery notifications.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Shipping label creation (USPS, UPS, FedEx)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Package tracking integration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Delivery notifications to clients</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Shipping rate calculator</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Address validation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Shipping cost tracking and reports</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/fulfillment" className="btn btn-secondary text-sm">Fulfillment</a>
          <a href="/prints" className="btn btn-secondary text-sm">Prints</a>
          <a href="/products" className="btn btn-secondary text-sm">Products</a>
        </div>
      </div>
    </div>
  );
}
