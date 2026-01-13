import { redirect } from "next/navigation";

// Leaderboard is now consolidated into the simplified Progress page
export default function LeaderboardRedirect() {
  redirect("/progress");
}
