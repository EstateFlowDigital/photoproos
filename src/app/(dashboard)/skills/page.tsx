import { redirect } from "next/navigation";

// Skills are now consolidated into the simplified Progress page
export default function SkillsRedirect() {
  redirect("/progress");
}
