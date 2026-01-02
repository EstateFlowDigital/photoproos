export const dynamic = "force-dynamic";

import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { getProjectsWithoutPropertyWebsite } from "@/lib/actions/property-websites";
import { NewPropertyWebsiteClient } from "./new-property-website-client";

export default async function NewPropertyWebsitePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const projects = await getProjectsWithoutPropertyWebsite(auth.organizationId);

  return <NewPropertyWebsiteClient projects={projects} />;
}
