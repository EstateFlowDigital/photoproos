export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SecuritySettingsClient } from "./security-settings-client";

export default async function SecuritySettingsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Build user data from auth context
  const user = {
    email: auth.user?.emailAddresses?.[0]?.emailAddress || "user@example.com",
    createdAt: auth.user?.createdAt?.toISOString() || new Date().toISOString(),
    lastSignInAt: auth.user?.lastSignInAt?.toISOString() || null,
    twoFactorEnabled: false, // Clerk handles this separately
  };

  return (
    <div data-element="settings-security-page" className="space-y-6">
      <PageHeader
        title="Security Settings"
        subtitle="Manage account security and access"
        backHref="/settings"
      />

      <SecuritySettingsClient user={user} />
    </div>
  );
}
