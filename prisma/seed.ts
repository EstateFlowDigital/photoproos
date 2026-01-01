import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ClientIndustry, ProjectStatus, PaymentStatus, BookingStatus, InvoiceStatus, ContractStatus, ActivityType, PlanName, MemberRole } from "@prisma/client";

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate random ID
function generateSlug(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.usageMeter.deleteMany();
  await prisma.onboardingProgress.deleteMany();
  await prisma.contractAuditLog.deleteMany();
  await prisma.contractSigner.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.contractTemplate.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.bookingReminder.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.bookingType.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.galleryComment.deleteMany();
  await prisma.galleryFavorite.deleteMany();
  await prisma.deliveryLink.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.project.deleteMany();
  await prisma.clientSession.deleteMany();
  await prisma.client.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Creating organizations...");

  // Create 3 organizations with different plan tiers
  const orgs = await Promise.all([
    prisma.organization.create({
      data: {
        name: "Premier Photography Studio",
        slug: "premier-photography",
        plan: PlanName.studio,
        primaryColor: "#3b82f6",
        secondaryColor: "#8b5cf6",
        timezone: "America/New_York",
        currency: "USD",
        stripeConnectOnboarded: true,
      },
    }),
    prisma.organization.create({
      data: {
        name: "Urban Lens Co",
        slug: "urban-lens",
        plan: PlanName.pro,
        primaryColor: "#10b981",
        secondaryColor: "#14b8a6",
        timezone: "America/Los_Angeles",
        currency: "USD",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Freelance Photos",
        slug: "freelance-photos",
        plan: PlanName.free,
        timezone: "America/Chicago",
        currency: "USD",
      },
    }),
  ]);

  console.log("Creating users...");

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        clerkUserId: "user_demo_001",
        email: "alex@premierphotography.com",
        fullName: "Alex Thompson",
        phone: "+1 (555) 123-4567",
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: "user_demo_002",
        email: "sarah@premierphotography.com",
        fullName: "Sarah Mitchell",
        phone: "+1 (555) 234-5678",
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: "user_demo_003",
        email: "mike@urbanlens.co",
        fullName: "Mike Chen",
        phone: "+1 (555) 345-6789",
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: "user_demo_004",
        email: "emma@freelancephotos.com",
        fullName: "Emma Rodriguez",
        phone: "+1 (555) 456-7890",
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: "user_demo_005",
        email: "david@premierphotography.com",
        fullName: "David Kim",
        phone: "+1 (555) 567-8901",
      },
    }),
  ]);

  console.log("Creating organization memberships...");

  // Create memberships
  await Promise.all([
    prisma.organizationMember.create({
      data: { organizationId: orgs[0].id, userId: users[0].id, role: MemberRole.owner },
    }),
    prisma.organizationMember.create({
      data: { organizationId: orgs[0].id, userId: users[1].id, role: MemberRole.admin },
    }),
    prisma.organizationMember.create({
      data: { organizationId: orgs[0].id, userId: users[4].id, role: MemberRole.member },
    }),
    prisma.organizationMember.create({
      data: { organizationId: orgs[1].id, userId: users[2].id, role: MemberRole.owner },
    }),
    prisma.organizationMember.create({
      data: { organizationId: orgs[2].id, userId: users[3].id, role: MemberRole.owner },
    }),
  ]);

  console.log("Creating clients...");

  // Clients for Premier Photography (main demo org) - matching hero demo
  const clientsData = [
    { fullName: "Premier Realty", company: "Premier Realty Group", email: "contact@premierrealty.com", industry: ClientIndustry.real_estate, revenue: 425000, projects: 12 },
    { fullName: "Tech Solutions Inc", company: "Tech Solutions Inc", email: "photos@techsolutions.com", industry: ClientIndustry.commercial, revenue: 218000, projects: 8 },
    { fullName: "Bella Cucina", company: "Bella Cucina Restaurant", email: "marketing@bellacucina.com", industry: ClientIndustry.food_hospitality, revenue: 189000, projects: 6 },
    { fullName: "Design Studio Pro", company: "Design Studio Pro", email: "hello@designstudiopro.com", industry: ClientIndustry.architecture, revenue: 342000, projects: 9 },
    { fullName: "Sarah M.", company: null, email: "sarah.martinez@email.com", industry: ClientIndustry.wedding, revenue: 450000, projects: 1 },
    { fullName: "Berkshire Properties", company: "Berkshire Properties LLC", email: "listings@berkshireprops.com", industry: ClientIndustry.real_estate, revenue: 156000, projects: 5 },
    { fullName: "James & Emily", company: null, email: "jamesandemily@gmail.com", industry: ClientIndustry.wedding, revenue: 385000, projects: 1 },
    { fullName: "Luxe Interiors", company: "Luxe Interiors Design", email: "projects@luxeinteriors.com", industry: ClientIndustry.architecture, revenue: 278000, projects: 7 },
    { fullName: "Corporate Dynamics", company: "Corporate Dynamics Inc", email: "hr@corporatedynamics.com", industry: ClientIndustry.headshots, revenue: 124000, projects: 4 },
    { fullName: "The Modern Table", company: "The Modern Table Restaurant", email: "info@themoderntable.com", industry: ClientIndustry.food_hospitality, revenue: 98000, projects: 3 },
    { fullName: "Summit Real Estate", company: "Summit Real Estate Group", email: "photos@summitrealestate.com", industry: ClientIndustry.real_estate, revenue: 312000, projects: 10 },
    { fullName: "Michael & Lisa", company: null, email: "michaelandlisa2025@gmail.com", industry: ClientIndustry.wedding, revenue: 520000, projects: 1 },
    { fullName: "Artisan Bread Co", company: "Artisan Bread Company", email: "marketing@artisanbread.com", industry: ClientIndustry.food_hospitality, revenue: 67000, projects: 2 },
    { fullName: "Metro Developments", company: "Metro Developments LLC", email: "marketing@metrodev.com", industry: ClientIndustry.architecture, revenue: 445000, projects: 11 },
    { fullName: "Rachel Thompson", company: "Thompson Photography", email: "rachel@thompson-photo.com", industry: ClientIndustry.portrait, revenue: 89000, projects: 3 },
  ];

  const clients = await Promise.all(
    clientsData.map((client) =>
      prisma.client.create({
        data: {
          organizationId: orgs[0].id,
          email: client.email,
          fullName: client.fullName,
          company: client.company,
          industry: client.industry,
          lifetimeRevenueCents: client.revenue,
          totalProjects: client.projects,
        },
      })
    )
  );

  console.log("Creating projects/galleries...");

  // Projects for Premier Photography
  const projectsData = [
    { name: "Downtown Luxury Listing", client: 0, status: ProjectStatus.delivered, price: 45000, views: 342, downloads: 156 },
    { name: "Oceanfront Villa", client: 0, status: ProjectStatus.delivered, price: 52000, views: 278, downloads: 89 },
    { name: "Tech Solutions Headshots", client: 1, status: ProjectStatus.delivered, price: 28000, views: 145, downloads: 45 },
    { name: "Annual Report Photos", client: 1, status: ProjectStatus.pending, price: 35000, views: 0, downloads: 0 },
    { name: "Restaurant Interior", client: 2, status: ProjectStatus.delivered, price: 38000, views: 423, downloads: 178 },
    { name: "Menu Photography", client: 2, status: ProjectStatus.pending, price: 22000, views: 12, downloads: 0 },
    { name: "Penthouse Renovation", client: 3, status: ProjectStatus.delivered, price: 67000, views: 512, downloads: 234 },
    { name: "Office Space Design", client: 3, status: ProjectStatus.draft, price: 45000, views: 0, downloads: 0 },
    { name: "Martinez Wedding", client: 4, status: ProjectStatus.delivered, price: 450000, views: 1234, downloads: 892 },
    { name: "Berkshire Condo Tour", client: 5, status: ProjectStatus.delivered, price: 32000, views: 187, downloads: 67 },
    { name: "Commercial Plaza", client: 5, status: ProjectStatus.pending, price: 48000, views: 23, downloads: 0 },
    { name: "James & Emily Wedding", client: 6, status: ProjectStatus.delivered, price: 385000, views: 2145, downloads: 1567 },
    { name: "Boutique Hotel Suite", client: 7, status: ProjectStatus.delivered, price: 54000, views: 634, downloads: 289 },
    { name: "Luxury Apartment", client: 7, status: ProjectStatus.pending, price: 41000, views: 45, downloads: 0 },
    { name: "Executive Headshots Q4", client: 8, status: ProjectStatus.delivered, price: 18000, views: 89, downloads: 32 },
    { name: "Team Photos 2024", client: 8, status: ProjectStatus.delivered, price: 24000, views: 156, downloads: 78 },
    { name: "Restaurant Grand Opening", client: 9, status: ProjectStatus.delivered, price: 35000, views: 567, downloads: 234 },
    { name: "Summit Office Complex", client: 10, status: ProjectStatus.delivered, price: 78000, views: 423, downloads: 156 },
    { name: "Hillside Estates", client: 10, status: ProjectStatus.pending, price: 56000, views: 34, downloads: 0 },
    { name: "Michael & Lisa Wedding", client: 11, status: ProjectStatus.delivered, price: 520000, views: 3456, downloads: 2345 },
    { name: "Bakery Product Shots", client: 12, status: ProjectStatus.delivered, price: 28000, views: 234, downloads: 89 },
    { name: "Metro Tower Launch", client: 13, status: ProjectStatus.delivered, price: 89000, views: 678, downloads: 345 },
    { name: "Mixed-Use Development", client: 13, status: ProjectStatus.draft, price: 72000, views: 0, downloads: 0 },
    { name: "Family Portrait Session", client: 14, status: ProjectStatus.delivered, price: 45000, views: 234, downloads: 123 },
    { name: "Senior Portraits", client: 14, status: ProjectStatus.delivered, price: 22000, views: 189, downloads: 67 },
  ];

  const projects = await Promise.all(
    projectsData.map((project, index) =>
      prisma.project.create({
        data: {
          organizationId: orgs[0].id,
          clientId: clients[project.client].id,
          name: project.name,
          status: project.status,
          priceCents: project.price,
          viewCount: project.views,
          downloadCount: project.downloads,
          deliveredAt: project.status === ProjectStatus.delivered ? randomDate(new Date("2024-01-01"), new Date()) : null,
          createdAt: randomDate(new Date("2024-01-01"), new Date()),
        },
      })
    )
  );

  console.log("Creating delivery links...");

  // Create delivery links for delivered projects
  const deliveredProjects = projects.filter((_, i) => projectsData[i].status === ProjectStatus.delivered);
  await Promise.all(
    deliveredProjects.map((project) =>
      prisma.deliveryLink.create({
        data: {
          projectId: project.id,
          slug: generateSlug(12),
          isActive: true,
          viewCount: Math.floor(Math.random() * 500),
        },
      })
    )
  );

  console.log("Creating payments...");

  // Create payments
  const paymentsData = [
    { project: 0, status: PaymentStatus.paid, clientName: "Premier Realty" },
    { project: 1, status: PaymentStatus.paid, clientName: "Premier Realty" },
    { project: 2, status: PaymentStatus.paid, clientName: "Tech Solutions Inc" },
    { project: 3, status: PaymentStatus.pending, clientName: "Tech Solutions Inc" },
    { project: 4, status: PaymentStatus.paid, clientName: "Bella Cucina" },
    { project: 5, status: PaymentStatus.pending, clientName: "Bella Cucina" },
    { project: 6, status: PaymentStatus.paid, clientName: "Design Studio Pro" },
    { project: 8, status: PaymentStatus.paid, clientName: "Sarah M." },
    { project: 9, status: PaymentStatus.paid, clientName: "Berkshire Properties" },
    { project: 10, status: PaymentStatus.overdue, clientName: "Berkshire Properties" },
    { project: 11, status: PaymentStatus.paid, clientName: "James & Emily" },
    { project: 12, status: PaymentStatus.paid, clientName: "Luxe Interiors" },
    { project: 13, status: PaymentStatus.pending, clientName: "Luxe Interiors" },
    { project: 14, status: PaymentStatus.paid, clientName: "Corporate Dynamics" },
    { project: 15, status: PaymentStatus.paid, clientName: "Corporate Dynamics" },
    { project: 16, status: PaymentStatus.paid, clientName: "The Modern Table" },
    { project: 17, status: PaymentStatus.paid, clientName: "Summit Real Estate" },
    { project: 18, status: PaymentStatus.pending, clientName: "Summit Real Estate" },
    { project: 19, status: PaymentStatus.paid, clientName: "Michael & Lisa" },
    { project: 20, status: PaymentStatus.paid, clientName: "Artisan Bread Co" },
    { project: 21, status: PaymentStatus.paid, clientName: "Metro Developments" },
    { project: 23, status: PaymentStatus.paid, clientName: "Rachel Thompson" },
    { project: 24, status: PaymentStatus.paid, clientName: "Rachel Thompson" },
  ];

  await Promise.all(
    paymentsData.map((payment) =>
      prisma.payment.create({
        data: {
          organizationId: orgs[0].id,
          projectId: projects[payment.project].id,
          amountCents: projectsData[payment.project].price,
          status: payment.status,
          clientName: payment.clientName,
          clientEmail: clientsData[projectsData[payment.project].client].email,
          paidAt: payment.status === PaymentStatus.paid ? randomDate(new Date("2024-01-01"), new Date()) : null,
          createdAt: randomDate(new Date("2024-01-01"), new Date()),
        },
      })
    )
  );

  console.log("Creating booking types...");

  // Create booking types
  const bookingTypes = await Promise.all([
    prisma.bookingType.create({
      data: {
        organizationId: orgs[0].id,
        name: "Real Estate Photography",
        description: "Professional real estate photography session",
        durationMinutes: 120,
        priceCents: 35000,
        color: "#3b82f6",
      },
    }),
    prisma.bookingType.create({
      data: {
        organizationId: orgs[0].id,
        name: "Wedding Consultation",
        description: "Initial wedding photography consultation",
        durationMinutes: 60,
        priceCents: 0,
        color: "#ec4899",
      },
    }),
    prisma.bookingType.create({
      data: {
        organizationId: orgs[0].id,
        name: "Corporate Headshots",
        description: "Professional headshot session",
        durationMinutes: 30,
        priceCents: 15000,
        color: "#8b5cf6",
      },
    }),
    prisma.bookingType.create({
      data: {
        organizationId: orgs[0].id,
        name: "Food Photography",
        description: "Restaurant and food photography session",
        durationMinutes: 180,
        priceCents: 45000,
        color: "#f97316",
      },
    }),
  ]);

  console.log("Creating bookings...");

  // Create bookings
  const now = new Date();
  const bookingsData = [
    { type: 0, client: 0, title: "Downtown Penthouse Shoot", status: BookingStatus.confirmed, daysFromNow: 2 },
    { type: 0, client: 5, title: "Luxury Condo Tour", status: BookingStatus.confirmed, daysFromNow: 4 },
    { type: 1, client: null, title: "Wedding Consultation - Johnson", status: BookingStatus.pending, daysFromNow: 5, name: "Tom & Jessica Johnson", email: "tjohnson@email.com" },
    { type: 2, client: 1, title: "Executive Team Headshots", status: BookingStatus.confirmed, daysFromNow: 7 },
    { type: 3, client: 2, title: "New Menu Photography", status: BookingStatus.confirmed, daysFromNow: 8 },
    { type: 0, client: 10, title: "Commercial Property Tour", status: BookingStatus.pending, daysFromNow: 10 },
    { type: 2, client: 8, title: "New Hire Headshots", status: BookingStatus.confirmed, daysFromNow: 12 },
    { type: 1, client: null, title: "Wedding Consultation - Chen", status: BookingStatus.confirmed, daysFromNow: 3, name: "David & Ming Chen", email: "dchen@email.com" },
    { type: 0, client: 0, title: "Beachfront Property", status: BookingStatus.completed, daysFromNow: -5 },
    { type: 2, client: 1, title: "Marketing Team Photos", status: BookingStatus.completed, daysFromNow: -10 },
    { type: 3, client: 9, title: "Grand Opening Coverage", status: BookingStatus.completed, daysFromNow: -15 },
    { type: 0, client: 13, title: "Office Building Exterior", status: BookingStatus.completed, daysFromNow: -20 },
  ];

  await Promise.all(
    bookingsData.map((booking) => {
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + booking.daysFromNow);
      startTime.setHours(10, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + bookingTypes[booking.type].durationMinutes);

      return prisma.booking.create({
        data: {
          organizationId: orgs[0].id,
          clientId: booking.client !== null ? clients[booking.client].id : null,
          bookingTypeId: bookingTypes[booking.type].id,
          title: booking.title,
          status: booking.status,
          startTime,
          endTime,
          clientName: booking.name || (booking.client !== null ? clientsData[booking.client].fullName : null),
          clientEmail: booking.email || (booking.client !== null ? clientsData[booking.client].email : null),
          location: booking.type === 0 ? "On-site" : "Studio",
        },
      });
    })
  );

  console.log("Creating invoices...");

  // Create invoices
  const invoicesData = [
    { client: 0, number: "INV-2024-001", status: InvoiceStatus.paid, total: 97000 },
    { client: 1, number: "INV-2024-002", status: InvoiceStatus.paid, total: 63000 },
    { client: 2, number: "INV-2024-003", status: InvoiceStatus.sent, total: 60000 },
    { client: 3, number: "INV-2024-004", status: InvoiceStatus.paid, total: 112000 },
    { client: 4, number: "INV-2024-005", status: InvoiceStatus.paid, total: 450000 },
    { client: 5, number: "INV-2024-006", status: InvoiceStatus.overdue, total: 80000 },
    { client: 6, number: "INV-2024-007", status: InvoiceStatus.paid, total: 385000 },
    { client: 7, number: "INV-2024-008", status: InvoiceStatus.sent, total: 95000 },
    { client: 10, number: "INV-2024-009", status: InvoiceStatus.draft, total: 134000 },
    { client: 13, number: "INV-2024-010", status: InvoiceStatus.paid, total: 161000 },
  ];

  const invoices = await Promise.all(
    invoicesData.map((invoice) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      return prisma.invoice.create({
        data: {
          organizationId: orgs[0].id,
          clientId: clients[invoice.client].id,
          invoiceNumber: invoice.number,
          status: invoice.status,
          subtotalCents: invoice.total,
          totalCents: invoice.total,
          dueDate,
          clientName: clientsData[invoice.client].fullName,
          clientEmail: clientsData[invoice.client].email,
          paidAt: invoice.status === InvoiceStatus.paid ? randomDate(new Date("2024-01-01"), new Date()) : null,
        },
      });
    })
  );

  // Create line items for invoices
  await Promise.all(
    invoices.map((invoice, i) =>
      prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          description: "Photography Services",
          quantity: 1,
          unitCents: invoicesData[i].total,
          totalCents: invoicesData[i].total,
        },
      })
    )
  );

  console.log("Creating contract templates...");

  // Create contract templates
  const templates = await Promise.all([
    prisma.contractTemplate.create({
      data: {
        organizationId: orgs[0].id,
        name: "Standard Photography Agreement",
        description: "General photography services agreement",
        content: `# Photography Services Agreement

This Photography Services Agreement ("Agreement") is entered into between Premier Photography Studio ("Photographer") and {client_name} ("Client").

## 1. Services
The Photographer agrees to provide photography services as described in the attached project scope.

## 2. Compensation
Client agrees to pay the total amount of {project_price} for the services described.

## 3. Delivery
Photographer will deliver final images within {delivery_days} days of the session date.

## 4. Usage Rights
Client receives a license to use the delivered images for personal and commercial purposes.

## 5. Cancellation
Either party may cancel with 48 hours notice. Deposits are non-refundable.

Signed on {date}`,
        isDefault: true,
      },
    }),
    prisma.contractTemplate.create({
      data: {
        organizationId: orgs[0].id,
        name: "Wedding Photography Contract",
        description: "Comprehensive wedding photography agreement",
        content: `# Wedding Photography Contract

This Wedding Photography Contract is between Premier Photography Studio and {client_name}.

## Event Details
- Date: {wedding_date}
- Venue: {venue}
- Start Time: {start_time}

## Package Details
{package_description}

## Terms and Conditions
1. A 50% deposit is required to secure the date
2. Final payment is due 2 weeks before the wedding
3. Photographer will provide {hours} hours of coverage
4. Final gallery will be delivered within 6 weeks

## Cancellation Policy
Cancellations more than 90 days before receive 50% refund.
Cancellations within 90 days are non-refundable.`,
        isDefault: false,
      },
    }),
  ]);

  console.log("Creating contracts...");

  // Create contracts
  const contractsData = [
    { client: 4, template: 1, name: "Martinez Wedding Contract", status: ContractStatus.signed },
    { client: 6, template: 1, name: "James & Emily Wedding Contract", status: ContractStatus.signed },
    { client: 11, template: 1, name: "Michael & Lisa Wedding Contract", status: ContractStatus.signed },
    { client: 0, template: 0, name: "Premier Realty 2024 Agreement", status: ContractStatus.signed },
    { client: 13, template: 0, name: "Metro Tower Photography Agreement", status: ContractStatus.sent },
  ];

  await Promise.all(
    contractsData.map((contract) =>
      prisma.contract.create({
        data: {
          organizationId: orgs[0].id,
          clientId: clients[contract.client].id,
          templateId: templates[contract.template].id,
          name: contract.name,
          content: templates[contract.template].content,
          status: contract.status,
          signedAt: contract.status === ContractStatus.signed ? randomDate(new Date("2024-01-01"), new Date()) : null,
          sentAt: randomDate(new Date("2024-01-01"), new Date()),
        },
      })
    )
  );

  console.log("Creating activity logs...");

  // Create activity logs (most recent activities)
  const activities: { type: ActivityType; description: string; projectId?: string; clientId?: string }[] = [
    { type: ActivityType.payment_received, description: "Payment of $4,500 received from Sarah M.", projectId: projects[8].id },
    { type: ActivityType.gallery_delivered, description: "Martinez Wedding gallery delivered", projectId: projects[8].id },
    { type: ActivityType.gallery_viewed, description: "Premier Realty viewed Downtown Luxury Listing", projectId: projects[0].id },
    { type: ActivityType.client_added, description: "New client added: Rachel Thompson", clientId: clients[14].id },
    { type: ActivityType.booking_confirmed, description: "Booking confirmed: Downtown Penthouse Shoot" },
    { type: ActivityType.payment_received, description: "Payment of $3,850 received from James & Emily", projectId: projects[11].id },
    { type: ActivityType.contract_signed, description: "Contract signed by Michael & Lisa" },
    { type: ActivityType.invoice_sent, description: "Invoice INV-2024-003 sent to Bella Cucina" },
    { type: ActivityType.gallery_created, description: "New gallery created: Mixed-Use Development", projectId: projects[22].id },
    { type: ActivityType.file_uploaded, description: "48 photos uploaded to Metro Tower Launch", projectId: projects[21].id },
  ];

  for (let i = 0; i < activities.length; i++) {
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - i * 2);

    await prisma.activityLog.create({
      data: {
        organizationId: orgs[0].id,
        userId: users[0].id,
        type: activities[i].type,
        description: activities[i].description,
        projectId: activities[i].projectId,
        clientId: activities[i].clientId,
        createdAt,
      },
    });
  }

  console.log("Creating notifications...");

  // Create notifications
  const notifications = [
    { type: "payment_received" as const, title: "Payment Received", message: "Sarah M. paid $4,500 for Martinez Wedding gallery" },
    { type: "gallery_viewed" as const, title: "Gallery Viewed", message: "Premier Realty viewed Downtown Luxury Listing" },
    { type: "booking_confirmed" as const, title: "Booking Confirmed", message: "Downtown Penthouse Shoot confirmed for Jan 15" },
    { type: "contract_signed" as const, title: "Contract Signed", message: "Michael & Lisa signed their wedding contract" },
    { type: "invoice_overdue" as const, title: "Invoice Overdue", message: "Invoice INV-2024-006 is 7 days overdue" },
  ];

  for (let i = 0; i < notifications.length; i++) {
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - i * 4);

    await prisma.notification.create({
      data: {
        organizationId: orgs[0].id,
        type: notifications[i].type,
        title: notifications[i].title,
        message: notifications[i].message,
        read: i > 2,
        createdAt,
      },
    });
  }

  console.log("Creating usage meters...");

  // Create usage meters
  const currentMonth = new Date().toISOString().slice(0, 7);
  await prisma.usageMeter.create({
    data: {
      organizationId: orgs[0].id,
      month: currentMonth,
      storageBytes: BigInt(15_000_000_000), // 15 GB
      galleriesCreated: 25,
      emailsSent: 156,
      apiCalls: 2450,
    },
  });

  console.log("Creating onboarding progress...");

  // Create onboarding progress
  await prisma.onboardingProgress.create({
    data: {
      organizationId: orgs[0].id,
      profileComplete: true,
      brandingComplete: true,
      firstGalleryCreated: true,
      stripeConnected: true,
      completedAt: new Date("2024-01-15"),
    },
  });

  console.log("Seed completed!");
  console.log(`
Summary:
- 3 Organizations
- 5 Users
- 15 Clients
- 25 Projects/Galleries
- 23 Payments
- 4 Booking Types
- 12 Bookings
- 10 Invoices
- 2 Contract Templates
- 5 Contracts
- 10 Activity Logs
- 5 Notifications
- 1 Usage Meter
- 1 Onboarding Progress
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
