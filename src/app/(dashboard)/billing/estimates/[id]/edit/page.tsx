import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { notFound, redirect } from "next/navigation";
import { EditEstimateForm } from "./edit-estimate-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEstimatePage({ params }: Props) {
  const { id } = await params;
  const organizationId = await requireOrganizationId();

  const [estimate, clients, services] = await Promise.all([
    prisma.estimate.findFirst({
      where: { id, organizationId },
      include: {
        lineItems: { orderBy: { sortOrder: "asc" } },
        client: { select: { id: true, fullName: true, email: true } },
      },
    }),
    prisma.client.findMany({
      where: { organizationId },
      select: { id: true, fullName: true, company: true, email: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.service.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, priceCents: true, description: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!estimate) {
    notFound();
  }

  if (estimate.status !== "draft") {
    redirect(`/billing/estimates/${id}`);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={`Edit ${estimate.estimateNumber}`}
        description="Update estimate details"
        breadcrumbs={[
          { label: "Billing", href: "/billing" },
          { label: "Estimates", href: "/billing/estimates" },
          { label: estimate.estimateNumber, href: `/billing/estimates/${id}` },
          { label: "Edit" },
        ]}
      />

      <div className="mx-auto w-full max-w-3xl">
        <EditEstimateForm estimate={estimate} clients={clients} services={services} />
      </div>
    </div>
  );
}
