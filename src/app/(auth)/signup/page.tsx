import { redirect } from "next/navigation";

export default function SignupRedirectPage() {
  // This page immediately redirects; no content is rendered
  redirect("/sign-up");
}
