import { redirect } from "next/navigation";

// Redirect to consolidated services page
export default function NewGalleryServicePage() {
  redirect("/services/new");
}
