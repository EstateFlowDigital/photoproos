import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collaborative Editing | CMS Admin",
  description: "Test real-time collaborative editing features.",
};

export const dynamic = "force-dynamic";

import { CollaborationPageClient } from "./collaboration-client";
import { auth } from "@clerk/nextjs/server";

export default async function CollaborationPage() {
  const { userId } = await auth();

  return (
    <CollaborationPageClient
      userId={userId || "demo-user"}
    />
  );
}
