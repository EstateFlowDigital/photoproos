export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { ChecklistClient } from "./checklist-client";
import { getTodaysBookings } from "@/lib/actions/field-operations";

export const metadata: Metadata = {
  title: "Checklist | Field App",
  description: "Shoot checklist and task tracking",
};

export default async function ChecklistPage() {
  const bookingsResult = await getTodaysBookings();
  const todaysBookings = bookingsResult.success ? bookingsResult.data : [];

  return (
    <div data-element="field-checklist-page">
      <ChecklistClient todaysBookings={todaysBookings || []} />
    </div>
  );
}
