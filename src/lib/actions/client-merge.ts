"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { getAuthContext } from "@/lib/auth/clerk";
import { logActivity } from "@/lib/utils/activity";
import type { ActionResult } from "@/lib/types/action-result";

export interface DuplicateGroup {
  matchType: "email" | "phone" | "name";
  confidence: "high" | "medium" | "low";
  clients: Array<{
    id: string;
    email: string;
    fullName: string | null;
    company: string | null;
    phone: string | null;
    projectCount: number;
    invoiceCount: number;
    lifetimeRevenueCents: number;
    createdAt: Date;
  }>;
}

/**
 * Find potential duplicate clients based on email, phone, or name similarity
 */
export async function findDuplicateClients(): Promise<ActionResult<{
  duplicates: DuplicateGroup[];
  totalPotentialDuplicates: number;
}>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get all clients with their related counts
    const clients = await prisma.client.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        fullName: true,
        company: true,
        phone: true,
        lifetimeRevenueCents: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const duplicates: DuplicateGroup[] = [];
    const processedEmails = new Set<string>();
    const processedPhones = new Set<string>();
    const processedNames = new Set<string>();

    // Group by exact email match (high confidence)
    const emailGroups = new Map<string, typeof clients>();
    for (const client of clients) {
      const normalizedEmail = client.email.toLowerCase().trim();
      if (!emailGroups.has(normalizedEmail)) {
        emailGroups.set(normalizedEmail, []);
      }
      emailGroups.get(normalizedEmail)!.push(client);
    }

    for (const [email, group] of emailGroups) {
      if (group.length > 1 && !processedEmails.has(email)) {
        processedEmails.add(email);
        group.forEach((c) => processedEmails.add(c.email.toLowerCase().trim()));

        duplicates.push({
          matchType: "email",
          confidence: "high",
          clients: group.map((c) => ({
            id: c.id,
            email: c.email,
            fullName: c.fullName,
            company: c.company,
            phone: c.phone,
            projectCount: c._count.projects,
            invoiceCount: c._count.invoices,
            lifetimeRevenueCents: c.lifetimeRevenueCents,
            createdAt: c.createdAt,
          })),
        });
      }
    }

    // Group by phone match (high confidence if exact match)
    const phoneGroups = new Map<string, typeof clients>();
    for (const client of clients) {
      if (client.phone) {
        // Normalize phone: remove all non-digits
        const normalizedPhone = client.phone.replace(/\D/g, "");
        if (normalizedPhone.length >= 10) {
          // Use last 10 digits for comparison
          const key = normalizedPhone.slice(-10);
          if (!phoneGroups.has(key)) {
            phoneGroups.set(key, []);
          }
          phoneGroups.get(key)!.push(client);
        }
      }
    }

    for (const [phone, group] of phoneGroups) {
      if (group.length > 1 && !processedPhones.has(phone)) {
        // Skip if these clients are already in email duplicates
        const allInEmailDuplicates = group.every((c) =>
          processedEmails.has(c.email.toLowerCase().trim())
        );
        if (allInEmailDuplicates) continue;

        processedPhones.add(phone);

        duplicates.push({
          matchType: "phone",
          confidence: "high",
          clients: group.map((c) => ({
            id: c.id,
            email: c.email,
            fullName: c.fullName,
            company: c.company,
            phone: c.phone,
            projectCount: c._count.projects,
            invoiceCount: c._count.invoices,
            lifetimeRevenueCents: c.lifetimeRevenueCents,
            createdAt: c.createdAt,
          })),
        });
      }
    }

    // Group by name similarity (medium confidence)
    const nameGroups = new Map<string, typeof clients>();
    for (const client of clients) {
      if (client.fullName) {
        const normalizedName = client.fullName.toLowerCase().trim();
        if (!nameGroups.has(normalizedName)) {
          nameGroups.set(normalizedName, []);
        }
        nameGroups.get(normalizedName)!.push(client);
      }
    }

    for (const [name, group] of nameGroups) {
      if (group.length > 1 && !processedNames.has(name)) {
        // Skip if these clients are already in email or phone duplicates
        const allProcessed = group.every(
          (c) =>
            processedEmails.has(c.email.toLowerCase().trim()) ||
            (c.phone && processedPhones.has(c.phone.replace(/\D/g, "").slice(-10)))
        );
        if (allProcessed) continue;

        processedNames.add(name);

        duplicates.push({
          matchType: "name",
          confidence: "medium",
          clients: group.map((c) => ({
            id: c.id,
            email: c.email,
            fullName: c.fullName,
            company: c.company,
            phone: c.phone,
            projectCount: c._count.projects,
            invoiceCount: c._count.invoices,
            lifetimeRevenueCents: c.lifetimeRevenueCents,
            createdAt: c.createdAt,
          })),
        });
      }
    }

    // Sort by confidence and number of duplicates
    duplicates.sort((a, b) => {
      const confidenceOrder = { high: 0, medium: 1, low: 2 };
      if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
        return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
      }
      return b.clients.length - a.clients.length;
    });

    const totalPotentialDuplicates = duplicates.reduce(
      (sum, group) => sum + group.clients.length - 1,
      0
    );

    return { success: true, data: { duplicates, totalPotentialDuplicates } };
  } catch (error) {
    console.error("Error finding duplicate clients:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to find duplicates" };
  }
}

/**
 * Get detailed comparison of two clients before merging
 */
export async function getClientMergePreview(
  primaryClientId: string,
  secondaryClientId: string
): Promise<ActionResult<{
  primary: {
    id: string;
    email: string;
    fullName: string | null;
    company: string | null;
    phone: string | null;
    projectCount: number;
    bookingCount: number;
    invoiceCount: number;
    contractCount: number;
    taskCount: number;
    lifetimeRevenueCents: number;
  };
  secondary: {
    id: string;
    email: string;
    fullName: string | null;
    company: string | null;
    phone: string | null;
    projectCount: number;
    bookingCount: number;
    invoiceCount: number;
    contractCount: number;
    taskCount: number;
    lifetimeRevenueCents: number;
  };
  recordsToTransfer: {
    projects: number;
    bookings: number;
    invoices: number;
    contracts: number;
    tasks: number;
    orders: number;
    questionnaires: number;
  };
}>> {
  try {
    const organizationId = await requireOrganizationId();

    const [primary, secondary] = await Promise.all([
      prisma.client.findFirst({
        where: { id: primaryClientId, organizationId },
        include: {
          _count: {
            select: {
              projects: true,
              bookings: true,
              invoices: true,
              contracts: true,
              tasks: true,
              orders: true,
              questionnaires: true,
            },
          },
        },
      }),
      prisma.client.findFirst({
        where: { id: secondaryClientId, organizationId },
        include: {
          _count: {
            select: {
              projects: true,
              bookings: true,
              invoices: true,
              contracts: true,
              tasks: true,
              orders: true,
              questionnaires: true,
            },
          },
        },
      }),
    ]);

    if (!primary || !secondary) {
      return { success: false, error: "One or both clients not found" };
    }

    if (primaryClientId === secondaryClientId) {
      return { success: false, error: "Cannot merge a client with itself" };
    }

    return {
      success: true,
      data: {
        primary: {
          id: primary.id,
          email: primary.email,
          fullName: primary.fullName,
          company: primary.company,
          phone: primary.phone,
          projectCount: primary._count.projects,
          bookingCount: primary._count.bookings,
          invoiceCount: primary._count.invoices,
          contractCount: primary._count.contracts,
          taskCount: primary._count.tasks,
          lifetimeRevenueCents: primary.lifetimeRevenueCents,
        },
        secondary: {
          id: secondary.id,
          email: secondary.email,
          fullName: secondary.fullName,
          company: secondary.company,
          phone: secondary.phone,
          projectCount: secondary._count.projects,
          bookingCount: secondary._count.bookings,
          invoiceCount: secondary._count.invoices,
          contractCount: secondary._count.contracts,
          taskCount: secondary._count.tasks,
          lifetimeRevenueCents: secondary.lifetimeRevenueCents,
        },
        recordsToTransfer: {
          projects: secondary._count.projects,
          bookings: secondary._count.bookings,
          invoices: secondary._count.invoices,
          contracts: secondary._count.contracts,
          tasks: secondary._count.tasks,
          orders: secondary._count.orders,
          questionnaires: secondary._count.questionnaires,
        },
      },
    };
  } catch (error) {
    console.error("Error getting merge preview:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get merge preview" };
  }
}

/**
 * Merge two clients - transfer all records from secondary to primary, then delete secondary
 */
export async function mergeClients(
  primaryClientId: string,
  secondaryClientId: string,
  options?: {
    keepSecondaryEmail?: boolean; // Add secondary email to notes
    keepSecondaryPhone?: boolean; // Add secondary phone to notes
  }
): Promise<ActionResult<{
  recordsTransferred: {
    projects: number;
    bookings: number;
    invoices: number;
    contracts: number;
    tasks: number;
    orders: number;
    questionnaires: number;
    payments: number;
    communications: number;
  };
}>> {
  try {
    const organizationId = await requireOrganizationId();
    const auth = await getAuthContext();

    // Verify both clients exist and belong to this organization
    const [primary, secondary] = await Promise.all([
      prisma.client.findFirst({
        where: { id: primaryClientId, organizationId },
      }),
      prisma.client.findFirst({
        where: { id: secondaryClientId, organizationId },
      }),
    ]);

    if (!primary || !secondary) {
      return { success: false, error: "One or both clients not found" };
    }

    if (primaryClientId === secondaryClientId) {
      return { success: false, error: "Cannot merge a client with itself" };
    }

    // Build notes update if keeping secondary info
    const additionalNotes: string[] = [];
    if (options?.keepSecondaryEmail && secondary.email !== primary.email) {
      additionalNotes.push(`Previous email: ${secondary.email}`);
    }
    if (options?.keepSecondaryPhone && secondary.phone && secondary.phone !== primary.phone) {
      additionalNotes.push(`Previous phone: ${secondary.phone}`);
    }

    const recordsTransferred = {
      projects: 0,
      bookings: 0,
      invoices: 0,
      contracts: 0,
      tasks: 0,
      orders: 0,
      questionnaires: 0,
      payments: 0,
      communications: 0,
    };

    // Perform merge in a transaction
    await prisma.$transaction(async (tx) => {
      // Transfer projects
      const projectsResult = await tx.project.updateMany({
        where: { clientId: secondaryClientId },
        data: { clientId: primaryClientId },
      });
      recordsTransferred.projects = projectsResult.count;

      // Transfer bookings
      const bookingsResult = await tx.booking.updateMany({
        where: { clientId: secondaryClientId },
        data: { clientId: primaryClientId },
      });
      recordsTransferred.bookings = bookingsResult.count;

      // Transfer invoices
      const invoicesResult = await tx.invoice.updateMany({
        where: { clientId: secondaryClientId },
        data: { clientId: primaryClientId },
      });
      recordsTransferred.invoices = invoicesResult.count;

      // Transfer contracts
      const contractsResult = await tx.contract.updateMany({
        where: { clientId: secondaryClientId },
        data: { clientId: primaryClientId },
      });
      recordsTransferred.contracts = contractsResult.count;

      // Transfer tasks
      const tasksResult = await tx.task.updateMany({
        where: { clientId: secondaryClientId },
        data: { clientId: primaryClientId },
      });
      recordsTransferred.tasks = tasksResult.count;

      // Transfer orders
      const ordersResult = await tx.order.updateMany({
        where: { clientId: secondaryClientId },
        data: { clientId: primaryClientId },
      });
      recordsTransferred.orders = ordersResult.count;

      // Transfer questionnaires
      const questionnairesResult = await tx.clientQuestionnaire.updateMany({
        where: { clientId: secondaryClientId },
        data: { clientId: primaryClientId },
      });
      recordsTransferred.questionnaires = questionnairesResult.count;

      // Transfer payments
      const paymentsResult = await tx.payment.updateMany({
        where: { clientId: secondaryClientId },
        data: { clientId: primaryClientId },
      });
      recordsTransferred.payments = paymentsResult.count;

      // Transfer communications
      const communicationsResult = await tx.clientCommunication.updateMany({
        where: { clientId: secondaryClientId },
        data: { clientId: primaryClientId },
      });
      recordsTransferred.communications = communicationsResult.count;

      // Update primary client metrics
      const newTotalProjects = primary.totalProjects + secondary.totalProjects;
      const newRevenue = primary.lifetimeRevenueCents + secondary.lifetimeRevenueCents;
      const newNotes = primary.notes
        ? additionalNotes.length > 0
          ? `${primary.notes}\n\n--- Merged from ${secondary.email} ---\n${additionalNotes.join("\n")}`
          : primary.notes
        : additionalNotes.length > 0
          ? `--- Merged from ${secondary.email} ---\n${additionalNotes.join("\n")}`
          : null;

      await tx.client.update({
        where: { id: primaryClientId },
        data: {
          totalProjects: newTotalProjects,
          lifetimeRevenueCents: newRevenue,
          notes: newNotes,
          // Use secondary's phone if primary doesn't have one
          phone: primary.phone || secondary.phone,
          // Use secondary's company if primary doesn't have one
          company: primary.company || secondary.company,
          // Use secondary's full name if primary doesn't have one
          fullName: primary.fullName || secondary.fullName,
        },
      });

      // Delete the secondary client (cascades will handle tag assignments, sessions)
      await tx.client.delete({
        where: { id: secondaryClientId },
      });
    });

    // Log the merge activity
    await logActivity({
      organizationId,
      type: "client_updated",
      description: `Merged client "${secondary.email}" into "${primary.email}"`,
      userId: auth?.userId,
      clientId: primaryClientId,
      metadata: {
        mergedFrom: secondary.email,
        mergedTo: primary.email,
        recordsTransferred,
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${primaryClientId}`);

    return { success: true, data: { recordsTransferred } };
  } catch (error) {
    console.error("Error merging clients:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to merge clients" };
  }
}

/**
 * Get count of potential duplicates for the organization
 */
export async function getDuplicateCount(): Promise<ActionResult<{
  count: number;
  highConfidence: number;
  mediumConfidence: number;
}>> {
  try {
    const result = await findDuplicateClients();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const highConfidence = result.data.duplicates.filter(
      (d) => d.confidence === "high"
    ).length;
    const mediumConfidence = result.data.duplicates.filter(
      (d) => d.confidence === "medium"
    ).length;

    return {
      success: true,
      data: {
        count: result.data.totalPotentialDuplicates,
        highConfidence,
        mediumConfidence,
      },
    };
  } catch (error) {
    console.error("Error getting duplicate count:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get duplicate count" };
  }
}
