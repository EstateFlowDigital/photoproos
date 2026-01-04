export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getContract } from "@/lib/actions/contracts";
import { ContractEditClient } from "./contract-edit-client";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractEditPage({ params }: PageProps) {
  const { id } = await params;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const contract = await getContract(id);

  if (!contract) {
    notFound();
  }

  // Can't edit signed contracts
  if (contract.status === "signed") {
    redirect(`/contracts/${id}`);
  }

  // Get clients for dropdown
  const clients = await prisma.client.findMany({
    where: { organizationId: auth.organizationId },
    select: {
      id: true,
      fullName: true,
      company: true,
      email: true,
    },
    orderBy: { fullName: "asc" },
  });

  // Get templates
  const templates = await prisma.contractTemplate.findMany({
    where: { organizationId: auth.organizationId },
    select: {
      id: true,
      name: true,
      description: true,
      content: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <ContractEditClient
      contract={contract}
      clients={clients}
      templates={templates}
    />
  );
}
