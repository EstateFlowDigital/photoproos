export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { UploadClient } from "./upload-client";
import { getTodaysBookings } from "@/lib/actions/field-operations";
import { getGalleries } from "@/lib/actions/galleries";

export const metadata: Metadata = {
  title: "Upload | Field App",
  description: "Quick photo upload from the field",
};

export default async function UploadPage() {
  const [bookingsResult, galleriesResult] = await Promise.all([
    getTodaysBookings(),
    getGalleries({ status: "draft" }),
  ]);

  const todaysBookings = bookingsResult.success ? bookingsResult.data : [];
  const galleries = galleriesResult.success
    ? galleriesResult.data?.map((g) => ({
        id: g.id,
        name: g.name,
        photoCount: g.photoCount || 0,
      }))
    : [];

  return (
    <div data-element="field-upload-page">
      <UploadClient
        todaysBookings={todaysBookings || []}
        galleries={galleries || []}
      />
    </div>
  );
}
