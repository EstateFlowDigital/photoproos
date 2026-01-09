import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { listProductCatalogs } from "@/lib/actions/products";
import { ProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const catalogs = await listProductCatalogs();

  return (
    <div data-element="products-page">
      <ProductsClient catalogs={catalogs} />
    </div>
  );
}
