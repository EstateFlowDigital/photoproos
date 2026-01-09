export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function PrintsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="prints-page" className="space-y-6">
      <PageHeader
        title="Print Products"
        subtitle="Manage print orders and fulfillment"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🖨️</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Sell prints with automated fulfillment through lab partners.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Multiple print sizes and paper types</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automatic fulfillment through WHCC, Miller&apos;s, Bay Photo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Custom pricing with markup settings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Print preview with color profiles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Drop-shipping directly to clients</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Order tracking and notifications</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/albums" className="btn btn-secondary text-sm">Albums</a>
          <a href="/wall-art" className="btn btn-secondary text-sm">Wall Art</a>
          <a href="/orders" className="btn btn-secondary text-sm">Orders</a>
        </div>
      </div>
    </div>
  );
}
