"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Sample data for seeding
const SAMPLE_CLIENTS = [
  { fullName: "Sarah Mitchell", email: "sarah.mitchell@email.com", phone: "(555) 123-4567", company: "Mitchell Real Estate", source: "referral", isVIP: true },
  { fullName: "James Chen", email: "james.chen@techcorp.com", phone: "(555) 234-5678", company: "TechCorp Industries", source: "website" },
  { fullName: "Emily Rodriguez", email: "emily.r@email.com", phone: "(555) 345-6789", company: null, source: "instagram" },
  { fullName: "Michael Thompson", email: "m.thompson@luxuryhomes.com", phone: "(555) 456-7890", company: "Luxury Homes LLC", source: "referral", isVIP: true },
  { fullName: "Amanda Foster", email: "amanda.foster@email.com", phone: "(555) 567-8901", company: "Foster Events", source: "google" },
  { fullName: "David Park", email: "david.park@startup.io", phone: "(555) 678-9012", company: "Startup.io", source: "linkedin" },
  { fullName: "Jessica Williams", email: "jwilliams@email.com", phone: "(555) 789-0123", company: null, source: "referral" },
  { fullName: "Robert Martinez", email: "robert.m@realty.com", phone: "(555) 890-1234", company: "Premier Realty", source: "website" },
];

const SAMPLE_TAGS = [
  { name: "VIP", color: "#f59e0b" },
  { name: "Repeat Client", color: "#10b981" },
  { name: "Real Estate", color: "#3b82f6" },
  { name: "Commercial", color: "#8b5cf6" },
  { name: "Events", color: "#ec4899" },
  { name: "High Priority", color: "#ef4444" },
  { name: "Referral Source", color: "#06b6d4" },
];

const SAMPLE_SERVICES = [
  { name: "Interior Photography Package", description: "Full interior photo session with professional editing", basePrice: 35000, category: "real_estate" },
  { name: "Exterior & Drone Package", description: "Exterior shots plus aerial drone photography", basePrice: 45000, category: "real_estate" },
  { name: "Twilight Photography", description: "Golden hour and twilight exterior shots", basePrice: 25000, category: "real_estate" },
  { name: "Portrait Session", description: "Professional headshots and portraits", basePrice: 30000, category: "portrait" },
  { name: "Event Coverage", description: "Full event photography with editing", basePrice: 50000, category: "event" },
  { name: "Product Photography", description: "E-commerce product shots with white background", basePrice: 20000, category: "product" },
];

const PROPERTY_ADDRESSES = [
  { address: "123 Ocean View Drive", city: "Malibu", state: "CA", zip: "90265" },
  { address: "456 Sunset Boulevard", city: "Los Angeles", state: "CA", zip: "90028" },
  { address: "789 Park Avenue", city: "New York", state: "NY", zip: "10021" },
  { address: "321 Lake Shore Drive", city: "Chicago", state: "IL", zip: "60611" },
  { address: "555 Palm Beach Road", city: "Miami", state: "FL", zip: "33139" },
];

const PROJECT_NAMES = [
  "Luxury Oceanfront Estate",
  "Downtown Penthouse Suite",
  "Modern Hillside Villa",
  "Historic Brownstone Renovation",
  "Beachfront Condo Complex",
  "Corporate Headquarters",
  "Wedding at The Grand Ballroom",
  "Tech Startup Office Space",
];

const COMMUNICATION_SUBJECTS = [
  "Booking confirmation",
  "Photo delivery ready",
  "Invoice reminder",
  "Scheduling follow-up",
  "Thank you for your business",
  "Property access details",
  "Revision request",
  "Contract for review",
];

/**
 * Seeds the database with sample data for testing
 */
export async function seedDatabase(): Promise<ActionResult<{ counts: Record<string, number> }>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const counts: Record<string, number> = {};

    // 1. Create Tags
    const createdTags = await Promise.all(
      SAMPLE_TAGS.map((tag) =>
        prisma.clientTag.upsert({
          where: {
            organizationId_name: { organizationId, name: tag.name },
          },
          update: {},
          create: {
            organizationId,
            name: tag.name,
            color: tag.color,
          },
        })
      )
    );
    counts.tags = createdTags.length;

    // 2. Create Services
    const createdServices: { id: string; name: string; priceCents: number }[] = [];
    for (const service of SAMPLE_SERVICES) {
      const existing = await prisma.service.findFirst({
        where: { organizationId, name: service.name },
        select: { id: true, name: true, priceCents: true },
      });
      if (existing) {
        createdServices.push(existing);
      } else {
        const created = await prisma.service.create({
          data: {
            organizationId,
            name: service.name,
            description: service.description,
            priceCents: service.basePrice,
            category: service.category as any,
            isActive: true,
          },
          select: { id: true, name: true, priceCents: true },
        });
        createdServices.push(created);
      }
    }
    counts.services = createdServices.length;

    // 3. Create Clients
    const createdClients = await Promise.all(
      SAMPLE_CLIENTS.map(async (client, index) => {
        const existingClient = await prisma.client.findFirst({
          where: { organizationId, email: client.email },
        });

        if (existingClient) return existingClient;

        return prisma.client.create({
          data: {
            organizationId,
            fullName: client.fullName,
            email: client.email,
            phone: client.phone,
            company: client.company,
            source: client.source as any,
            isVIP: client.isVIP || false,
            notes: `Sample client created for testing. Original source: ${client.source}`,
            lastActivityAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          },
        });
      })
    );
    counts.clients = createdClients.length;

    // 4. Assign random tags to clients
    let tagAssignments = 0;
    for (const client of createdClients) {
      const numTags = Math.floor(Math.random() * 3) + 1; // 1-3 tags per client
      const shuffledTags = [...createdTags].sort(() => Math.random() - 0.5).slice(0, numTags);

      for (const tag of shuffledTags) {
        await prisma.clientTagAssignment.upsert({
          where: {
            clientId_tagId: { clientId: client.id, tagId: tag.id },
          },
          update: {},
          create: {
            clientId: client.id,
            tagId: tag.id,
          },
        });
        tagAssignments++;
      }
    }
    counts.tagAssignments = tagAssignments;

    // 5. Create Communications for clients
    let communications = 0;
    for (const client of createdClients) {
      const numComms = Math.floor(Math.random() * 5) + 2; // 2-6 communications per client

      for (let i = 0; i < numComms; i++) {
        const types = ["email", "call", "meeting", "note"] as const;
        const directions = ["inbound", "outbound", "internal"] as const;
        const type = types[Math.floor(Math.random() * types.length)];
        const direction = type === "note" ? "internal" : directions[Math.floor(Math.random() * 2)];

        await prisma.clientCommunication.create({
          data: {
            clientId: client.id,
            type,
            direction,
            subject: COMMUNICATION_SUBJECTS[Math.floor(Math.random() * COMMUNICATION_SUBJECTS.length)],
            content: `Sample ${type} content for testing purposes.`,
            createdById: userId,
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date in last 60 days
          },
        });
        communications++;
      }
    }
    counts.communications = communications;

    // 6. Create Projects (Projects serve as galleries)
    const projectStatuses = ["draft", "pending", "delivered", "archived"] as const;
    let projects = 0;

    for (let i = 0; i < Math.min(PROJECT_NAMES.length, createdClients.length); i++) {
      const client = createdClients[i];
      const status = projectStatuses[Math.floor(Math.random() * projectStatuses.length)];
      const service = createdServices[Math.floor(Math.random() * createdServices.length)];

      await prisma.project.create({
        data: {
          organizationId,
          clientId: client.id,
          serviceId: service.id,
          name: PROJECT_NAMES[i],
          status,
          description: `Sample project for ${client.fullName}`,
          priceCents: service.priceCents || 35000,
          allowDownloads: true,
          // Set delivery date for delivered/archived projects
          ...(status === "delivered" || status === "archived"
            ? { deliveredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) }
            : {}),
        },
      });
      projects++;
    }
    counts.projects = projects;

    // 7. Create Bookings
    let bookings = 0;
    const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;

    for (let i = 0; i < 6; i++) {
      const client = createdClients[i % createdClients.length];
      const service = createdServices[i % createdServices.length];
      const startTime = new Date(Date.now() + (i - 3) * 7 * 24 * 60 * 60 * 1000); // Spread across weeks

      await prisma.booking.create({
        data: {
          organizationId,
          clientId: client.id,
          serviceId: service.id,
          title: `${service.name} - ${client.fullName}`,
          startTime,
          endTime: new Date(startTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours
          status: bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
          location: PROPERTY_ADDRESSES[i % PROPERTY_ADDRESSES.length].address,
          notes: `Booking for ${service.name}`,
        },
      });
      bookings++;
    }
    counts.bookings = bookings;

    // 8. Create Invoices
    let invoices = 0;
    const invoiceStatuses = ["draft", "sent", "paid", "overdue"] as const;

    for (let i = 0; i < 5; i++) {
      const client = createdClients[i];
      const service = createdServices[i % createdServices.length];
      const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
      const subtotalCents = service.priceCents;
      const taxCents = Math.round(subtotalCents * 0.08);
      const totalCents = subtotalCents + taxCents;

      await prisma.invoice.create({
        data: {
          organizationId,
          clientId: client.id,
          invoiceNumber: `INV-${String(1000 + i).padStart(4, "0")}`,
          status,
          subtotalCents,
          taxCents,
          totalCents,
          dueDate: new Date(Date.now() + (status === "overdue" ? -7 : 30) * 24 * 60 * 60 * 1000),
          paidAt: status === "paid" ? new Date() : null,
          clientName: client.fullName,
          clientEmail: client.email,
          lineItems: {
            create: {
              description: service.name,
              quantity: 1,
              unitCents: service.priceCents,
              totalCents: service.priceCents,
            },
          },
        },
      });
      invoices++;
    }
    counts.invoices = invoices;

    // 9. Create Contract Templates and Contracts
    let contractTemplate = await prisma.contractTemplate.findFirst({
      where: { organizationId, name: "Standard Photography Agreement" },
    });

    if (!contractTemplate) {
      contractTemplate = await prisma.contractTemplate.create({
        data: {
          organizationId,
          name: "Standard Photography Agreement",
          description: "Standard contract for photography services",
          content: `# Photography Services Agreement

This Photography Services Agreement ("Agreement") is entered into between the Photographer and the Client.

## Services
The Photographer agrees to provide professional photography services as described in the project scope.

## Payment Terms
- 50% deposit required to secure booking
- Remaining balance due upon delivery of final images

## Image Rights
The Photographer retains copyright to all images. The Client receives a license for personal and commercial use.

## Cancellation Policy
- Cancellations made 7+ days before: Full refund minus deposit
- Cancellations made within 7 days: No refund

## Signature
By signing below, both parties agree to the terms outlined in this agreement.`,
        },
      });
    }
    counts.contractTemplates = 1;

    // Create sample contracts
    let contracts = 0;
    const contractStatuses = ["draft", "sent", "signed", "expired"] as const;

    for (let i = 0; i < 4; i++) {
      const client = createdClients[i];
      const status = contractStatuses[i];
      const signingToken = `sign_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      await prisma.contract.create({
        data: {
          organizationId,
          templateId: contractTemplate.id,
          clientId: client.id,
          name: `Photography Agreement - ${client.fullName}`,
          content: contractTemplate.content || "",
          status,
          sentAt: status !== "draft" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          signers: {
            create: {
              name: client.fullName,
              email: client.email,
              signingToken,
              tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              sortOrder: 0,
              signedAt: status === "signed" ? new Date() : null,
            },
          },
        },
      });
      contracts++;
    }
    counts.contracts = contracts;

    // Revalidate all paths
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    revalidatePath("/projects");
    revalidatePath("/scheduling");
    revalidatePath("/invoices");
    revalidatePath("/contracts");
    revalidatePath("/services");

    return {
      success: true,
      data: { counts },
    };
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to seed database" };
  }
}

/**
 * Clears all seeded data (for testing/reset purposes)
 */
export async function clearSeededData(): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Delete in reverse order of dependencies
    await prisma.contractSigner.deleteMany({
      where: { contract: { organizationId } },
    });
    await prisma.contract.deleteMany({ where: { organizationId } });
    await prisma.contractTemplate.deleteMany({ where: { organizationId } });
    await prisma.invoiceLineItem.deleteMany({
      where: { invoice: { organizationId } },
    });
    await prisma.invoice.deleteMany({ where: { organizationId } });
    await prisma.booking.deleteMany({ where: { organizationId } });
    await prisma.asset.deleteMany({
      where: { project: { organizationId } },
    });
    await prisma.project.deleteMany({ where: { organizationId } });
    await prisma.clientCommunication.deleteMany({
      where: { client: { organizationId } },
    });
    await prisma.clientTagAssignment.deleteMany({
      where: { client: { organizationId } },
    });
    await prisma.client.deleteMany({ where: { organizationId } });
    await prisma.clientTag.deleteMany({ where: { organizationId } });
    await prisma.service.deleteMany({ where: { organizationId } });

    revalidatePath("/");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Seed] Error clearing data:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to clear data" };
  }
}
