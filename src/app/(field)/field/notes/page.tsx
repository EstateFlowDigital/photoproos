export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { NotesClient } from "./notes-client";
import { getFieldNotes, getTodaysBookings } from "@/lib/actions/field-operations";

export const metadata: Metadata = {
  title: "Notes | Field App",
  description: "Quick notes and observations from the field",
};

export default async function NotesPage() {
  const [notesResult, bookingsResult] = await Promise.all([
    getFieldNotes(),
    getTodaysBookings(),
  ]);

  const notes = notesResult.success ? notesResult.data : [];
  const todaysBookings = bookingsResult.success ? bookingsResult.data : [];

  return (
    <div data-element="field-notes-page">
      <NotesClient notes={notes || []} todaysBookings={todaysBookings || []} />
    </div>
  );
}
