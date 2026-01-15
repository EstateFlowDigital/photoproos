import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timesheets | PhotoProOS",
  description: "Track work hours and billable time.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { TimesheetsClient } from "./timesheets-client";
import { prisma } from "@/lib/db";

async function getProjects(organizationId: string) {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    include: {
      client: {
        select: { fullName: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.title,
    clientName: p.client?.fullName || "No client",
  }));
}

export default async function TimesheetsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const projects = await getProjects(auth.organizationId);

  return (
    <div className="space-y-6" data-element="timesheets-page">
      <PageHeader
        title="Timesheets"
        subtitle="Track team hours and project time"
      />

      <TimesheetsClient projects={projects} />
    </div>
  );
}
