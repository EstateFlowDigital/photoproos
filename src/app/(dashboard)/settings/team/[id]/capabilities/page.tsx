export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getUserServiceCapabilities } from "@/lib/actions/team-capabilities";
import { getEquipmentList, getUserEquipment } from "@/lib/actions/equipment";
import { CapabilitiesForm } from "./capabilities-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamMemberCapabilitiesPage({ params }: PageProps) {
  const { id } = await params;

  // Get user with membership info
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          organization: {
            include: {
              services: {
                where: { isActive: true },
                orderBy: { name: "asc" },
              },
            },
          },
        },
      },
      homeBaseLocation: true,
    },
  });

  if (!user || user.memberships.length === 0) {
    notFound();
  }

  const organization = user.memberships[0].organization;

  // Get user's current capabilities and equipment
  const [capabilities, userEquipment, allEquipment] = await Promise.all([
    getUserServiceCapabilities(id),
    getUserEquipment(id),
    getEquipmentList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.fullName || user.email}'s Capabilities`}
        subtitle="Manage service skills and equipment assignments"
        actions={
          <Link
            href="/settings/team"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Team
          </Link>
        }
      />

      <CapabilitiesForm
        userId={id}
        userName={user.fullName || user.email}
        userAvatar={user.avatarUrl}
        services={organization.services}
        capabilities={capabilities}
        userEquipment={userEquipment}
        allEquipment={allEquipment}
        homeBaseLocation={user.homeBaseLocation}
      />
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}
