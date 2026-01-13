import { redirect } from "next/navigation";

// Quests are now consolidated into the simplified Progress page
export default function QuestsRedirect() {
  redirect("/progress");
}
