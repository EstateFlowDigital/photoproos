export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { TerritoriesClient } from "./territories-client";
import { getTerritories } from "@/lib/actions/territories";
import { getServices } from "@/lib/actions/services";

export const metadata: Metadata = {
  title: "Service Territories | Settings",
  description: "Manage service areas with zone-based pricing",
};

export default async function TerritoriesPage() {
  const [territoriesResult, services] = await Promise.all([
    getTerritories(),
    getServices(),
  ]);

  const territories = territoriesResult.success ? territoriesResult.data : [];
  const mappedServices = (services || []).map((s) => ({ id: s.id, name: s.name }));

  return (
    <TerritoriesClient
      initialTerritories={territories || []}
      services={mappedServices}
    />
  );
}
