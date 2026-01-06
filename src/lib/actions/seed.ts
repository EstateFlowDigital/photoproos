"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import {
  ServiceCategory,
  ActivityType,
  NotificationType,
  EquipmentCategory,
  AvailabilityBlockType,
  TaskStatus,
  TaskPriority,
} from "@prisma/client";
import { ok, fail, type ActionResult } from "@/lib/types/action-result";

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
            category: service.category as ServiceCategory,
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
            source: client.source,
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

    // 10. Create Activity Log entries
    const activityTypes = [
      { type: "gallery_created", description: (name: string) => `Created gallery "${name}"` },
      { type: "gallery_delivered", description: (name: string) => `Delivered gallery "${name}" to client` },
      { type: "client_added", description: (name: string) => `Added new client: ${name}` },
      { type: "booking_created", description: (name: string) => `New booking created: ${name}` },
      { type: "booking_confirmed", description: (name: string) => `Booking confirmed: ${name}` },
      { type: "payment_received", description: (name: string) => `Payment received: ${name}` },
      { type: "invoice_sent", description: (name: string) => `Invoice sent: ${name}` },
      { type: "contract_signed", description: (name: string) => `Contract signed: ${name}` },
    ] as const;

    let activityLogs = 0;
    for (let i = 0; i < 10; i++) {
      const activityType = activityTypes[i % activityTypes.length];
      const client = createdClients[i % createdClients.length];
      const project = PROJECT_NAMES[i % PROJECT_NAMES.length];

      let descriptionArg: string;
      const clientName = client.fullName || "Unknown Client";
      if (activityType.type.includes("client")) {
        descriptionArg = clientName;
      } else if (activityType.type.includes("gallery")) {
        descriptionArg = project;
      } else {
        descriptionArg = clientName;
      }

      await prisma.activityLog.create({
        data: {
          organizationId,
          userId,
          type: activityType.type as ActivityType,
          description: activityType.description(descriptionArg),
          createdAt: new Date(Date.now() - i * 4 * 60 * 60 * 1000), // Spread over 40 hours
        },
      });
      activityLogs++;
    }
    counts.activityLogs = activityLogs;

    // 11. Create Notifications
    const notificationTypes = [
      { type: "payment_received", title: "Payment received", message: (client: string, amount: string) => `${client} paid ${amount}` },
      { type: "gallery_viewed", title: "Gallery viewed", message: (client: string, gallery: string) => `${client} viewed "${gallery}"` },
      { type: "contract_signed", title: "Contract signed", message: (client: string) => `${client} signed the photography agreement` },
      { type: "booking_confirmed", title: "Booking confirmed", message: (client: string, service: string) => `${service} confirmed for ${client}` },
      { type: "invoice_overdue", title: "Invoice overdue", message: (client: string, invoice: string) => `Invoice ${invoice} for ${client} is overdue` },
    ] as const;

    let notifications = 0;
    for (let i = 0; i < 8; i++) {
      const notifType = notificationTypes[i % notificationTypes.length];
      const client = createdClients[i % createdClients.length];
      const service = createdServices[i % createdServices.length];
      const project = PROJECT_NAMES[i % PROJECT_NAMES.length];
      const isUnread = i < 3; // First 3 notifications are unread
      const clientName = client.fullName || "Unknown Client";

      let message: string;
      switch (notifType.type) {
        case "payment_received":
          message = notifType.message(clientName, `$${(service.priceCents / 100).toFixed(0)}`);
          break;
        case "gallery_viewed":
          message = notifType.message(clientName, project);
          break;
        case "contract_signed":
          message = notifType.message(clientName);
          break;
        case "booking_confirmed":
          message = notifType.message(clientName, service.name);
          break;
        case "invoice_overdue":
          message = notifType.message(clientName, `INV-${1000 + i}`);
          break;
        default:
          message = `Notification for ${clientName}`;
      }

      await prisma.notification.create({
        data: {
          organizationId,
          type: notifType.type as NotificationType,
          title: notifType.title,
          message,
          read: !isUnread,
          readAt: isUnread ? null : new Date(Date.now() - i * 2 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - i * 3 * 60 * 60 * 1000), // Spread over 24 hours
        },
      });
      notifications++;
    }
    counts.notifications = notifications;

    // 12. Create Property Websites with Leads and Analytics
    const allProjects = await prisma.project.findMany({
      where: { organizationId },
      take: 4,
      select: { id: true, name: true },
    });

    let propertyWebsites = 0;
    let propertyLeads = 0;
    let propertyAnalyticsCount = 0;

    for (let i = 0; i < Math.min(allProjects.length, 4); i++) {
      const project = allProjects[i];
      const address = PROPERTY_ADDRESSES[i % PROPERTY_ADDRESSES.length];
      const slug = `${address.city.toLowerCase().replace(/\s/g, "-")}-${address.address.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}-${Date.now()}-${i}`;

      // Check if website already exists for this project
      const existingWebsite = await prisma.propertyWebsite.findUnique({
        where: { projectId: project.id },
      });

      if (!existingWebsite) {
        const propertyWebsite = await prisma.propertyWebsite.create({
          data: {
            projectId: project.id,
            address: address.address,
            city: address.city,
            state: address.state,
            zipCode: address.zip,
            price: (500000 + Math.floor(Math.random() * 2000000)) * 100, // $500k-$2.5M in cents
            beds: Math.floor(Math.random() * 4) + 2,
            baths: Math.floor(Math.random() * 3) + 1.5,
            sqft: Math.floor(Math.random() * 3000) + 1500,
            yearBuilt: Math.floor(Math.random() * 30) + 1990,
            propertyType: "single_family",
            headline: `Stunning ${project.name}`,
            description: `Beautiful property featuring modern amenities and breathtaking views. This ${address.address} home offers the perfect blend of luxury and comfort.`,
            features: ["Hardwood Floors", "Gourmet Kitchen", "Private Pool", "Mountain Views", "Smart Home"],
            template: "modern",
            isPublished: i < 3, // First 3 are published
            slug,
            viewCount: Math.floor(Math.random() * 500) + 50,
          },
        });
        propertyWebsites++;

        // Create leads for this property
        const leadNames = [
          { name: "John Buyer", email: "john.buyer@email.com", phone: "(555) 111-2222" },
          { name: "Lisa Home", email: "lisa.home@email.com", phone: "(555) 333-4444" },
          { name: "Mike Investor", email: "mike.investor@email.com", phone: "(555) 555-6666" },
        ];

        const temperatures = ["hot", "warm", "cold"] as const;
        const leadStatuses = ["new", "contacted", "qualified", "closed"] as const;

        for (let j = 0; j < leadNames.length; j++) {
          const lead = leadNames[j];
          await prisma.propertyLead.create({
            data: {
              propertyWebsiteId: propertyWebsite.id,
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              message: `I'm interested in the property at ${address.address}. Please contact me with more information.`,
              source: ["website", "social", "email"][j % 3],
              status: leadStatuses[j % leadStatuses.length],
              score: Math.floor(Math.random() * 60) + 40,
              temperature: temperatures[j % temperatures.length],
              pageViews: Math.floor(Math.random() * 20) + 5,
              photoViews: Math.floor(Math.random() * 50) + 10,
              tourClicks: Math.floor(Math.random() * 5),
              totalTimeSeconds: Math.floor(Math.random() * 600) + 60,
              lastActivityAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            },
          });
          propertyLeads++;
        }

        // Create analytics for last 7 days
        for (let day = 0; day < 7; day++) {
          const date = new Date();
          date.setDate(date.getDate() - day);
          date.setHours(0, 0, 0, 0);

          await prisma.propertyAnalytics.create({
            data: {
              propertyWebsiteId: propertyWebsite.id,
              date,
              pageViews: Math.floor(Math.random() * 100) + 10,
              uniqueVisitors: Math.floor(Math.random() * 50) + 5,
              avgTimeOnPage: Math.floor(Math.random() * 180) + 30,
              tourClicks: Math.floor(Math.random() * 10),
              photoViews: Math.floor(Math.random() * 200) + 20,
              socialShares: Math.floor(Math.random() * 5),
              directTraffic: Math.floor(Math.random() * 30) + 5,
              socialTraffic: Math.floor(Math.random() * 20) + 2,
              emailTraffic: Math.floor(Math.random() * 15) + 1,
              searchTraffic: Math.floor(Math.random() * 25) + 3,
              mobileViews: Math.floor(Math.random() * 40) + 10,
              desktopViews: Math.floor(Math.random() * 50) + 15,
              tabletViews: Math.floor(Math.random() * 10) + 2,
            },
          });
          propertyAnalyticsCount++;
        }
      }
    }
    counts.propertyWebsites = propertyWebsites;
    counts.propertyLeads = propertyLeads;
    counts.propertyAnalytics = propertyAnalyticsCount;

    // 13. Create Assets (sample photos for galleries)
    const SAMPLE_PHOTO_URLS = [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
    ];

    let assets = 0;
    for (const project of allProjects) {
      const existingAssets = await prisma.asset.count({
        where: { projectId: project.id },
      });

      if (existingAssets === 0) {
        const numPhotos = Math.floor(Math.random() * 5) + 4; // 4-8 photos per gallery
        for (let i = 0; i < numPhotos; i++) {
          await prisma.asset.create({
            data: {
              projectId: project.id,
              filename: `photo_${i + 1}.jpg`,
              originalUrl: SAMPLE_PHOTO_URLS[i % SAMPLE_PHOTO_URLS.length],
              thumbnailUrl: SAMPLE_PHOTO_URLS[i % SAMPLE_PHOTO_URLS.length].replace("w=1200", "w=300"),
              mediumUrl: SAMPLE_PHOTO_URLS[i % SAMPLE_PHOTO_URLS.length].replace("w=1200", "w=600"),
              mimeType: "image/jpeg",
              sizeBytes: Math.floor(Math.random() * 5000000) + 1000000, // 1-6MB
              width: 1200,
              height: 800,
              sortOrder: i,
            },
          });
          assets++;
        }
      }
    }
    counts.assets = assets;

    // 14. Create Payments for invoices
    const paidInvoices = await prisma.invoice.findMany({
      where: { organizationId, status: "paid" },
      include: { client: true },
      take: 3,
    });

    let payments = 0;
    for (const invoice of paidInvoices) {
      const existingPayment = await prisma.payment.findFirst({
        where: { invoiceId: invoice.id },
      });

      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            organizationId,
            invoiceId: invoice.id,
            clientId: invoice.clientId,
            amountCents: invoice.totalCents,
            currency: "USD",
            status: "paid",
            clientEmail: invoice.clientEmail,
            clientName: invoice.clientName,
            description: `Payment for Invoice ${invoice.invoiceNumber}`,
            paidAt: invoice.paidAt || new Date(),
          },
        });
        payments++;
      }
    }
    counts.payments = payments;

    // 15. Create Equipment
    const SAMPLE_EQUIPMENT = [
      { name: "Canon EOS R5", category: "camera", description: "45MP Full-Frame Mirrorless Camera", serial: "CN-R5-001", value: 389900 },
      { name: "Canon RF 24-70mm f/2.8L", category: "lens", description: "Professional zoom lens", serial: "CN-RF-002", value: 229900 },
      { name: "Canon RF 15-35mm f/2.8L", category: "lens", description: "Wide-angle zoom lens", serial: "CN-RF-003", value: 219900 },
      { name: "DJI Mavic 3 Pro", category: "drone", description: "Professional drone with Hasselblad camera", serial: "DJI-M3-001", value: 219900 },
      { name: "Godox AD600 Pro", category: "lighting", description: "600W Outdoor Flash", serial: "GX-AD-001", value: 89900 },
      { name: "Manfrotto 055 Tripod", category: "tripod", description: "Professional carbon fiber tripod", serial: "MF-055-001", value: 39900 },
    ];

    let equipmentCount = 0;
    for (const equip of SAMPLE_EQUIPMENT) {
      const existing = await prisma.equipment.findFirst({
        where: { organizationId, name: equip.name },
      });

      if (!existing) {
        await prisma.equipment.create({
          data: {
            organizationId,
            name: equip.name,
            category: equip.category as EquipmentCategory,
            description: equip.description,
            serialNumber: equip.serial,
            valueCents: equip.value,
            purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          },
        });
        equipmentCount++;
      }
    }
    counts.equipment = equipmentCount;

    // 16. Create Availability Blocks
    const AVAILABILITY_BLOCKS = [
      { title: "Holiday Break", blockType: "holiday", daysAhead: 30, duration: 7 },
      { title: "Equipment Maintenance", blockType: "maintenance", daysAhead: 14, duration: 1 },
      { title: "Personal Day", blockType: "personal", daysAhead: 7, duration: 1 },
      { title: "Vacation", blockType: "time_off", daysAhead: 45, duration: 5 },
    ];

    let availabilityBlocks = 0;
    for (const block of AVAILABILITY_BLOCKS) {
      const startDate = new Date(Date.now() + block.daysAhead * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate.getTime() + block.duration * 24 * 60 * 60 * 1000);

      const existing = await prisma.availabilityBlock.findFirst({
        where: { organizationId, title: block.title },
      });

      if (!existing) {
        await prisma.availabilityBlock.create({
          data: {
            organizationId,
            userId: null, // Org-wide block
            title: block.title,
            blockType: block.blockType as AvailabilityBlockType,
            startDate,
            endDate,
            allDay: true,
          },
        });
        availabilityBlocks++;
      }
    }
    counts.availabilityBlocks = availabilityBlocks;

    // 17. Create Task Board, Columns, and Tasks
    let taskBoard = await prisma.taskBoard.findFirst({
      where: { organizationId, name: "Main Board" },
    });

    if (!taskBoard) {
      taskBoard = await prisma.taskBoard.create({
        data: {
          organizationId,
          name: "Main Board",
          description: "Primary task board for managing projects and work",
          color: "#3b82f6",
          isDefault: true,
        },
      });
    }
    counts.taskBoards = 1;

    // Create columns
    const COLUMNS = [
      { name: "To Do", color: "#6b7280", position: 0 },
      { name: "In Progress", color: "#3b82f6", position: 1 },
      { name: "Review", color: "#f59e0b", position: 2 },
      { name: "Done", color: "#22c55e", position: 3 },
    ];

    const createdColumns: { id: string; name: string }[] = [];
    for (const col of COLUMNS) {
      let column = await prisma.taskColumn.findFirst({
        where: { boardId: taskBoard.id, name: col.name },
      });

      if (!column) {
        column = await prisma.taskColumn.create({
          data: {
            boardId: taskBoard.id,
            name: col.name,
            color: col.color,
            position: col.position,
          },
        });
      }
      createdColumns.push({ id: column.id, name: column.name });
    }
    counts.taskColumns = createdColumns.length;

    // Create tasks
    const SAMPLE_TASKS = [
      { title: "Edit photos for Oceanfront Estate", priority: "high", status: "in_progress", column: "In Progress" },
      { title: "Send invoice to Sarah Mitchell", priority: "urgent", status: "todo", column: "To Do" },
      { title: "Schedule drone flight for Downtown Penthouse", priority: "medium", status: "todo", column: "To Do" },
      { title: "Review contract with TechCorp", priority: "high", status: "in_review", column: "Review" },
      { title: "Upload final gallery for Historic Brownstone", priority: "medium", status: "in_progress", column: "In Progress" },
      { title: "Follow up with Emily Rodriguez", priority: "low", status: "todo", column: "To Do" },
      { title: "Order new lighting equipment", priority: "low", status: "completed", column: "Done" },
      { title: "Update portfolio website", priority: "medium", status: "completed", column: "Done" },
    ];

    let taskCount = 0;
    for (const task of SAMPLE_TASKS) {
      const column = createdColumns.find((c) => c.name === task.column);
      if (!column) continue;

      const existing = await prisma.task.findFirst({
        where: { organizationId, title: task.title },
      });

      if (!existing) {
        const client = createdClients[Math.floor(Math.random() * createdClients.length)];
        const project = allProjects[Math.floor(Math.random() * allProjects.length)];

        await prisma.task.create({
          data: {
            organizationId,
            boardId: taskBoard.id,
            columnId: column.id,
            title: task.title,
            description: `Task related to ${project?.name || "general work"}`,
            status: task.status as TaskStatus,
            priority: task.priority as TaskPriority,
            position: taskCount,
            clientId: client?.id,
            projectId: project?.id,
            dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
            tags: ["photography", "client-work"],
          },
        });
        taskCount++;
      }
    }
    counts.tasks = taskCount;

    // Revalidate all paths
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    revalidatePath("/projects");
    revalidatePath("/scheduling");
    revalidatePath("/invoices");
    revalidatePath("/contracts");
    revalidatePath("/services");
    revalidatePath("/properties");
    revalidatePath("/galleries");

    return {
      success: true,
      data: { counts },
    };
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to seed database");
  }
}

/**
 * Clears all seeded data (for testing/reset purposes)
 */
export async function clearSeededData(): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Delete in reverse order of dependencies

    // Task management
    await prisma.taskComment.deleteMany({
      where: { task: { organizationId } },
    });
    await prisma.taskSubtask.deleteMany({
      where: { task: { organizationId } },
    });
    await prisma.task.deleteMany({ where: { organizationId } });
    await prisma.taskColumn.deleteMany({
      where: { board: { organizationId } },
    });
    await prisma.taskBoard.deleteMany({ where: { organizationId } });

    // Availability
    await prisma.availabilityBlock.deleteMany({ where: { organizationId } });

    // Equipment
    await prisma.userEquipment.deleteMany({
      where: { equipment: { organizationId } },
    });
    await prisma.serviceEquipmentRequirement.deleteMany({
      where: { equipment: { organizationId } },
    });
    await prisma.equipment.deleteMany({ where: { organizationId } });

    // Payments
    await prisma.payment.deleteMany({ where: { organizationId } });

    // Property websites and related
    await prisma.propertyLead.deleteMany({
      where: { propertyWebsite: { project: { organizationId } } },
    });
    await prisma.propertyAnalytics.deleteMany({
      where: { propertyWebsite: { project: { organizationId } } },
    });
    await prisma.marketingAsset.deleteMany({
      where: { propertyWebsite: { project: { organizationId } } },
    });
    await prisma.propertyWebsite.deleteMany({
      where: { project: { organizationId } },
    });

    // Notifications and activity
    await prisma.notification.deleteMany({ where: { organizationId } });
    await prisma.activityLog.deleteMany({ where: { organizationId } });

    // Contracts
    await prisma.contractSignature.deleteMany({
      where: { contract: { organizationId } },
    });
    await prisma.contractAuditLog.deleteMany({
      where: { contract: { organizationId } },
    });
    await prisma.contractSigner.deleteMany({
      where: { contract: { organizationId } },
    });
    await prisma.contract.deleteMany({ where: { organizationId } });
    await prisma.contractTemplate.deleteMany({ where: { organizationId } });

    // Invoices
    await prisma.invoiceLineItem.deleteMany({
      where: { invoice: { organizationId } },
    });
    await prisma.invoice.deleteMany({ where: { organizationId } });

    // Bookings
    await prisma.bookingReminder.deleteMany({
      where: { booking: { organizationId } },
    });
    await prisma.booking.deleteMany({ where: { organizationId } });

    // Projects/Galleries and assets
    await prisma.galleryFavorite.deleteMany({
      where: { project: { organizationId } },
    });
    await prisma.galleryComment.deleteMany({
      where: { project: { organizationId } },
    });
    await prisma.deliveryLink.deleteMany({
      where: { project: { organizationId } },
    });
    await prisma.asset.deleteMany({
      where: { project: { organizationId } },
    });
    await prisma.project.deleteMany({ where: { organizationId } });

    // Clients
    await prisma.clientCommunication.deleteMany({
      where: { client: { organizationId } },
    });
    await prisma.clientTagAssignment.deleteMany({
      where: { client: { organizationId } },
    });
    await prisma.clientSession.deleteMany({
      where: { client: { organizationId } },
    });
    await prisma.client.deleteMany({ where: { organizationId } });
    await prisma.clientTag.deleteMany({ where: { organizationId } });

    // Services
    await prisma.userServiceCapability.deleteMany({
      where: { service: { organizationId } },
    });
    await prisma.service.deleteMany({ where: { organizationId } });

    revalidatePath("/");

    return ok();
  } catch (error) {
    console.error("[Seed] Error clearing data:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to clear data");
  }
}
