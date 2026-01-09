export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/clerk";
import { getPendingTimeOffRequests, getTimeOffRequests } from "@/lib/actions/availability";
import { TimeOffPageClient } from "./time-off-page-client";

export default async function TimeOffPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch pending requests (for admin approval) and all requests
  const [pendingResult, allRequestsResult] = await Promise.all([
    getPendingTimeOffRequests(),
    getTimeOffRequests(),
  ]);

  const pendingRequests = pendingResult.success ? pendingResult.data : [];
  const allRequests = allRequestsResult.success ? allRequestsResult.data : [];

  return (
    <div data-element="scheduling-time-off-page">
    <TimeOffPageClient
      pendingRequests={pendingRequests}
      allRequests={allRequests}
      currentUserId={auth.userId}
    />
    </div>
  );
}
