import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";
import { GamificationSettingsClient } from "./gamification-settings-client";

export const metadata = {
  title: "Gamification | Settings",
  description: "Customize your XP, achievements, and rewards experience",
};

export default function GamificationSettingsPage() {
  return (
    <div data-element="settings-gamification-page" className="space-y-6">
      <PageHeader
        title="Gamification"
        subtitle="Customize your XP, achievements, and rewards experience"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <GamificationSettingsClient />
    </div>
  );
}
