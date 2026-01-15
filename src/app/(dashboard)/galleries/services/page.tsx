import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Gallery Services | PhotoProOS",
  description: "Manage services linked to galleries.",
};

// Redirect to consolidated services page
export default function GalleryServicesPage() {
  redirect("/services");
}
