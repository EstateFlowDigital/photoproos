export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ContractFormClient } from "./contract-form-client";

export default async function NewContractPage() {
  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
      </div>
    );
  }

  // Fetch clients and templates in parallel
  const [clients, templates] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        fullName: true,
        company: true,
        email: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.contractTemplate.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Contracts", href: "/contracts" },
          { label: "New Contract" },
        ]}
      />

      <PageHeader
        title="Create Contract"
        subtitle="Create a new contract from scratch or use a template"
      />

      <ContractFormClient clients={clients} templates={templates} />
    </div>
  );
}
