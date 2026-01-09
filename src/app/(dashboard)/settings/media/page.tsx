export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getVideoSettings, getTourSettings } from "@/lib/actions/media-settings";
import { MediaSettingsClient } from "./media-settings-client";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

export default async function MediaSettingsPage() {
  const [videoResult, tourResult] = await Promise.all([
    getVideoSettings(),
    getTourSettings(),
  ]);

  const videoSettings = videoResult.success ? videoResult.data : null;
  const tourSettings = tourResult.success ? tourResult.data : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Settings"
        subtitle="Configure video hosting and 3D tour providers for your galleries"
        actions={
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <MediaSettingsClient
        initialVideoSettings={videoSettings ?? undefined}
        initialTourSettings={tourSettings ?? undefined}
      />
    </div>
  );
}
