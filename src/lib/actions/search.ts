"use server";

import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";

export interface SearchResult {
  id: string;
  type: "client" | "gallery" | "property" | "service" | "invoice" | "booking";
  title: string;
  subtitle?: string;
  href: string;
}

export interface SearchResults {
  clients: SearchResult[];
  galleries: SearchResult[];
  properties: SearchResult[];
  services: SearchResult[];
  invoices: SearchResult[];
  bookings: SearchResult[];
}

export async function globalSearch(query: string): Promise<SearchResults> {
  const auth = await getAuthContext();
  if (!auth) {
    return {
      clients: [],
      galleries: [],
      properties: [],
      services: [],
      invoices: [],
      bookings: [],
    };
  }

  const searchTerm = query.trim().toLowerCase();
  if (!searchTerm) {
    return {
      clients: [],
      galleries: [],
      properties: [],
      services: [],
      invoices: [],
      bookings: [],
    };
  }

  const [clients, galleries, properties, services, invoices, bookings] = await Promise.all([
    // Search clients
    prisma.client.findMany({
      where: {
        organizationId: auth.organizationId,
        OR: [
          { fullName: { contains: searchTerm, mode: "insensitive" } },
          { company: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        company: true,
        email: true,
      },
      take: 5,
    }),

    // Search galleries (projects)
    prisma.project.findMany({
      where: {
        organizationId: auth.organizationId,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { client: { fullName: { contains: searchTerm, mode: "insensitive" } } },
          { client: { company: { contains: searchTerm, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        name: true,
        client: {
          select: { fullName: true, company: true },
        },
      },
      take: 5,
    }),

    // Search properties
    prisma.propertyWebsite.findMany({
      where: {
        project: { organizationId: auth.organizationId },
        OR: [
          { address: { contains: searchTerm, mode: "insensitive" } },
          { city: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        address: true,
        city: true,
        state: true,
      },
      take: 5,
    }),

    // Search services
    prisma.service.findMany({
      where: {
        organizationId: auth.organizationId,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
      take: 5,
    }),

    // Search invoices
    prisma.invoice.findMany({
      where: {
        organizationId: auth.organizationId,
        OR: [
          { invoiceNumber: { contains: searchTerm, mode: "insensitive" } },
          { client: { fullName: { contains: searchTerm, mode: "insensitive" } } },
          { client: { company: { contains: searchTerm, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        invoiceNumber: true,
        client: {
          select: { fullName: true, company: true },
        },
      },
      take: 5,
    }),

    // Search bookings
    prisma.booking.findMany({
      where: {
        organizationId: auth.organizationId,
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { client: { fullName: { contains: searchTerm, mode: "insensitive" } } },
          { client: { company: { contains: searchTerm, mode: "insensitive" } } },
          { clientName: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        client: {
          select: { fullName: true, company: true },
        },
        clientName: true,
      },
      take: 5,
    }),
  ]);

  return {
    clients: clients.map((c) => ({
      id: c.id,
      type: "client" as const,
      title: c.fullName || c.email,
      subtitle: c.company || undefined,
      href: `/clients/${c.id}`,
    })),
    galleries: galleries.map((g) => ({
      id: g.id,
      type: "gallery" as const,
      title: g.name,
      subtitle: g.client?.company || g.client?.fullName || undefined,
      href: `/galleries/${g.id}`,
    })),
    properties: properties.map((p) => ({
      id: p.id,
      type: "property" as const,
      title: p.address || "Property",
      subtitle: p.city && p.state ? `${p.city}, ${p.state}` : undefined,
      href: `/properties/${p.id}`,
    })),
    services: services.map((s) => ({
      id: s.id,
      type: "service" as const,
      title: s.name,
      subtitle: s.category || undefined,
      href: `/services/${s.id}`,
    })),
    invoices: invoices.map((i) => ({
      id: i.id,
      type: "invoice" as const,
      title: `Invoice #${i.invoiceNumber}`,
      subtitle: i.client?.company || i.client?.fullName || undefined,
      href: `/invoices/${i.id}`,
    })),
    bookings: bookings.map((b) => ({
      id: b.id,
      type: "booking" as const,
      title: b.title,
      subtitle: b.client?.company || b.client?.fullName || b.clientName || undefined,
      href: `/scheduling/${b.id}`,
    })),
  };
}
