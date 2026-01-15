import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | PhotoProOS",
  description: "View and manage your account notifications and alerts.",
};

export const dynamic = "force-dynamic";

import { getNotifications } from "@/lib/actions/notifications";
import { getActivityLogs } from "@/lib/actions/activity";
import { NotificationsPageClient } from "./notifications-page-client";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/clerk";

export default async function NotificationsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch both notifications and activity logs
  const [notificationsResult, activityResult] = await Promise.all([
    getNotifications(100), // Get more notifications for the full page
    getActivityLogs(100),
  ]);

  const notifications = notificationsResult.success
    ? notificationsResult.data.notifications
    : [];
  const unreadCount = notificationsResult.success
    ? notificationsResult.data.unreadCount
    : 0;
  const activities = activityResult.success
    ? activityResult.data.activities
    : [];

  return (
    <div data-element="notifications-page">
      <NotificationsPageClient
        notifications={notifications}
        unreadCount={unreadCount}
        activities={activities}
      />
    </div>
  );
}
