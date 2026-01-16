"use server";

import { fail, success, type ActionResult } from "@/lib/types/action-result";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { nanoid } from "nanoid";

interface CreateProjectBundleInput {
  // Client
  clientMode: "existing" | "new";
  clientId?: string;
  newClient?: {
    fullName: string;
    email: string;
    phone?: string;
    company?: string;
  };

  // Services
  services: {
    serviceId: string;
    isPrimary: boolean;
    priceCentsOverride?: number | null;
  }[];

  // Gallery
  galleryName: string;
  galleryDescription?: string;
  galleryPassword?: string;

  // Booking (optional)
  createBooking: boolean;
  scheduledDate?: Date;
  scheduledEndDate?: Date;
  bookingTypeId?: string;
  locationId?: string;
  bookingNotes?: string;

  // Invoice (optional)
  createInvoice: boolean;
  requirePaymentFirst: boolean;
  invoiceNotes?: string;
}

interface CreateProjectBundleResult {
  clientId: string;
  galleryId: string;
  bookingId?: string;
  invoiceId?: string;
}

function generateSlug(): string {
  return nanoid(10);
}

export async function createProjectBundle(
  input: CreateProjectBundleInput
): Promise<ActionResult<CreateProjectBundleResult>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    // Validate required fields
    if (!input.galleryName?.trim()) {
      return fail("Gallery name is required");
    }

    if (input.services.length === 0) {
      return fail("At least one service is required");
    }

    if (input.clientMode === "new" && !input.newClient?.email) {
      return fail("Client email is required");
    }

    if (input.clientMode === "existing" && !input.clientId) {
      return fail("Please select a client");
    }

    // Calculate total price from services
    let totalPriceCents = 0;
    if (input.services.length > 0) {
      const serviceIds = input.services.map((s) => s.serviceId);
      const dbServices = await prisma.service.findMany({
        where: {
          id: { in: serviceIds },
          organizationId: auth.organizationId,
        },
        select: { id: true, priceCents: true },
      });

      for (const svc of input.services) {
        const dbSvc = dbServices.find((s) => s.id === svc.serviceId);
        if (dbSvc) {
          totalPriceCents += svc.priceCentsOverride ?? dbSvc.priceCents;
        }
      }
    }

    // Execute everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create or get client
      let clientId: string;

      if (input.clientMode === "new" && input.newClient) {
        // Check if client with this email already exists
        const existingClient = await tx.client.findFirst({
          where: {
            organizationId: auth.organizationId,
            email: input.newClient.email.toLowerCase(),
          },
        });

        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const newClient = await tx.client.create({
            data: {
              organizationId: auth.organizationId,
              email: input.newClient.email.toLowerCase(),
              fullName: input.newClient.fullName,
              phone: input.newClient.phone || null,
              company: input.newClient.company || null,
              source: "manual",
            },
          });
          clientId = newClient.id;
        }
      } else {
        clientId = input.clientId!;
      }

      // Step 2: Create gallery (project)
      const slug = generateSlug();
      const gallery = await tx.project.create({
        data: {
          organizationId: auth.organizationId,
          clientId,
          name: input.galleryName.trim(),
          description: input.galleryDescription?.trim() || null,
          status: "draft",
          priceCents: totalPriceCents,
          currency: "USD",
          password: input.galleryPassword || null,
          allowDownloads: true,
          showWatermark: false,
        },
      });

      // Step 3: Create ProjectService records
      if (input.services.length > 0) {
        await tx.projectService.createMany({
          data: input.services.map((service) => ({
            projectId: gallery.id,
            serviceId: service.serviceId,
            isPrimary: service.isPrimary,
            priceCentsOverride: service.priceCentsOverride ?? null,
          })),
        });
      }

      // Step 4: Create delivery link
      await tx.deliveryLink.create({
        data: {
          projectId: gallery.id,
          slug,
          isActive: true,
        },
      });

      // Step 5: Create booking if requested
      let bookingId: string | undefined;
      if (input.createBooking && input.scheduledDate) {
        const booking = await tx.booking.create({
          data: {
            organizationId: auth.organizationId,
            clientId,
            title: input.galleryName.trim(),
            startTime: input.scheduledDate,
            endTime: input.scheduledEndDate || new Date(input.scheduledDate.getTime() + 60 * 60 * 1000),
            status: "pending",
            bookingTypeId: input.bookingTypeId || null,
            locationId: input.locationId || null,
            notes: input.bookingNotes || null,
          },
        });
        bookingId = booking.id;
      }

      // Step 6: Create invoice if requested
      let invoiceId: string | undefined;
      if (input.createInvoice && totalPriceCents > 0) {
        const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
        const invoice = await tx.invoice.create({
          data: {
            organizationId: auth.organizationId,
            clientId,
            invoiceNumber,
            status: "draft",
            totalCents: totalPriceCents,
            currency: "USD",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            notes: input.invoiceNotes || null,
          },
        });
        invoiceId = invoice.id;
      }

      return {
        clientId,
        galleryId: gallery.id,
        bookingId,
        invoiceId,
      };
    });

    revalidatePath("/galleries");
    revalidatePath("/clients");
    revalidatePath("/scheduling");
    revalidatePath("/payments");

    return success(result);
  } catch (error) {
    console.error("Error creating project bundle:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create project");
  }
}

// Helper to get data needed for the wizard
export async function getWizardData() {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return null;
    }

    const [clients, services, locations, bookingTypes] = await Promise.all([
      prisma.client.findMany({
        where: { organizationId: auth.organizationId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          company: true,
        },
        orderBy: { fullName: "asc" },
      }),
      prisma.service.findMany({
        where: {
          organizationId: auth.organizationId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          priceCents: true,
          duration: true,
          deliverables: true,
          isDefault: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.location.findMany({
        where: { organizationId: auth.organizationId },
        select: {
          id: true,
          formattedAddress: true,
          city: true,
          state: true,
        },
        orderBy: { formattedAddress: "asc" },
      }),
      prisma.bookingType.findMany({
        where: {
          organizationId: auth.organizationId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          color: true,
          durationMinutes: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return { clients, services, locations, bookingTypes };
  } catch (error) {
    console.error("Error fetching wizard data:", error);
    return null;
  }
}
