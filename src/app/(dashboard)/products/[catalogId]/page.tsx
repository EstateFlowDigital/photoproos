import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getProductCatalog } from "@/lib/actions/products";
import { CatalogClient } from "./catalog-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ catalogId: string }>;
}

export default async function CatalogPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const { catalogId } = await params;
  const catalog = await getProductCatalog(catalogId);

  if (!catalog) {
    notFound();
  }

  return <CatalogClient catalog={catalog} />;
}
