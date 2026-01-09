/**
 * Roadmap Page
 *
 * Displays upcoming features and improvements for the platform.
 * Organized by category and expected release timeframe.
 */

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";
import { RoadmapClient } from "./roadmap-client";

export const metadata = {
  title: "Roadmap | Settings",
  description: "Explore upcoming features and improvements",
};

export default function RoadmapPage() {
  return (
    <div data-element="settings-roadmap-page" className="space-y-6">
      <PageHeader
        title="Roadmap"
        subtitle="Explore upcoming features and improvements we're building for you"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <RoadmapClient />
    </div>
  );
}
