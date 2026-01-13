import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { listProductCatalogs } from "@/lib/actions/products";
import { ProductsClient } from "./products-client";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [catalogs, walkthroughPreferenceResult] = await Promise.all([
    listProductCatalogs(),
    getWalkthroughPreference("products"),
  ]);

  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div data-element="products-page" className="space-y-6">
      <WalkthroughWrapper pageId="products" initialState={walkthroughState} />
      <ProductsClient catalogs={catalogs} />
    </div>
  );
}
