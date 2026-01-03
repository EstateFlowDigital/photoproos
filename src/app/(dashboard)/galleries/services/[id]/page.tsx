import { redirect } from "next/navigation";

interface EditGalleryServicePageProps {
  params: Promise<{ id: string }>;
}

// Redirect to consolidated services page
export default async function EditGalleryServicePage({ params }: EditGalleryServicePageProps) {
  const { id } = await params;
  redirect(`/services/${id}`);
}
