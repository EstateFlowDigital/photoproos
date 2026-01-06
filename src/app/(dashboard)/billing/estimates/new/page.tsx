import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { EstimateForm } from "./estimate-form";
import Link from "next/link";

export default async function NewEstimatePage() {
  const organizationId = await requireOrganizationId();

  const [clients, services] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId },
      select: {
        id: true,
        fullName: true,
        company: true,
        email: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.service.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        name: true,
        priceCents: true,
        description: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="New Estimate"
        description="Create a quote for your client"
        breadcrumbs={[
          { label: "Billing", href: "/billing" },
          { label: "Estimates", href: "/billing/estimates" },
          { label: "New Estimate" },
        ]}
      />

      <div className="mx-auto w-full max-w-3xl">
        <EstimateForm clients={clients} services={services} />
      </div>
    </div>
  );
}
