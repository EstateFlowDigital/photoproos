export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPropertyWebsiteById } from "@/lib/actions/property-websites";
import { PropertyEditForm } from "./property-edit-form";

interface PropertyEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyEditPage({ params }: PropertyEditPageProps) {
  const { id } = await params;
  const website = await getPropertyWebsiteById(id);

  if (!website) {
    notFound();
  }

  return (
    <div data-element="properties-edit-page">
      <PropertyEditForm website={website} />
    </div>
  );
}
