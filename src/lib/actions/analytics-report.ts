"use server";

import { fail } from "@/lib/types/action-result";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { AnalyticsReportPdf } from "@/lib/pdf/templates/analytics-report-pdf";
import React from "react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  format,
} from "date-fns";
import { createPdfElement } from "@/lib/pdf/utils";

async function getOrganizationWithDetails(): Promise<{
  id: string;
  name: string;
  primaryColor: string | null;
} | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findFirst({
    where: { clerkOrganizationId: orgId },
    select: { id: true, name: true, publicName: true, primaryColor: true },
  });

  if (!org) return null;

  return {
    id: org.id,
    name: org.publicName || org.name,
    primaryColor: org.primaryColor,
  };
}

/**
 * Generate analytics report PDF
 * Returns base64 encoded PDF for client-side download
 */
export async function generateAnalyticsReportPdf(): Promise<{
  success: boolean;
  pdfBase64?: string;
  filename?: string;
  error?: string;
}> {
  try {
    const org = await getOrganizationWithDetails();
    if (!org) {
      return fail("Organization not found");
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const yearStart = startOfYear(now);

    // Fetch all required data
    const [
      thisMonthRevenue,
      lastMonthRevenue,
      ytdRevenue,
      thisMonthProjects,
      lastMonthProjects,
      newClients,
      totalClients,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      monthlyRevenueData,
      topClientsData,
    ] = await Promise.all([
      // This month revenue
      prisma.payment.aggregate({
        where: {
          organizationId: org.id,
          status: "paid",
          paidAt: { gte: thisMonthStart },
        },
        _sum: { amountCents: true },
      }),
      // Last month revenue
      prisma.payment.aggregate({
        where: {
          organizationId: org.id,
          status: "paid",
          paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { amountCents: true },
      }),
      // YTD revenue
      prisma.payment.aggregate({
        where: {
          organizationId: org.id,
          status: "paid",
          paidAt: { gte: yearStart },
        },
        _sum: { amountCents: true },
      }),
      // This month projects
      prisma.project.count({
        where: {
          organizationId: org.id,
          createdAt: { gte: thisMonthStart },
        },
      }),
      // Last month projects
      prisma.project.count({
        where: {
          organizationId: org.id,
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
      // New clients this month
      prisma.client.count({
        where: {
          organizationId: org.id,
          createdAt: { gte: thisMonthStart },
        },
      }),
      // Total clients
      prisma.client.count({
        where: { organizationId: org.id },
      }),
      // Pending invoices
      prisma.invoice.aggregate({
        where: {
          organizationId: org.id,
          status: "sent",
        },
        _sum: { totalCents: true },
        _count: true,
      }),
      // Overdue invoices
      prisma.invoice.aggregate({
        where: {
          organizationId: org.id,
          status: "overdue",
        },
        _sum: { totalCents: true },
        _count: true,
      }),
      // Paid invoices (this year)
      prisma.invoice.aggregate({
        where: {
          organizationId: org.id,
          status: "paid",
          updatedAt: { gte: yearStart },
        },
        _sum: { totalCents: true },
        _count: true,
      }),
      // Monthly revenue for chart (last 6 months)
      getMonthlyRevenue(org.id),
      // Top clients
      getTopClients(org.id),
    ]);

    // Generate the PDF
    const pdfBuffer = await renderToBuffer(
      createPdfElement(
        React.createElement(AnalyticsReportPdf, {
          businessName: org.name,
          reportDate: format(now, "MMMM d, yyyy"),
          periodLabel: format(now, "MMMM yyyy"),
          thisMonthRevenue: thisMonthRevenue._sum.amountCents || 0,
          lastMonthRevenue: lastMonthRevenue._sum.amountCents || 0,
          ytdRevenue: ytdRevenue._sum.amountCents || 0,
          currency: "USD",
          thisMonthProjects,
          lastMonthProjects,
          newClients,
          totalClients,
          pendingInvoicesCount: pendingInvoices._count || 0,
          pendingInvoicesAmount: pendingInvoices._sum.totalCents || 0,
          overdueInvoicesCount: overdueInvoices._count || 0,
          overdueInvoicesAmount: overdueInvoices._sum.totalCents || 0,
          paidInvoicesCount: paidInvoices._count || 0,
          paidInvoicesAmount: paidInvoices._sum.totalCents || 0,
          monthlyRevenue: monthlyRevenueData,
          topClients: topClientsData,
          accentColor: org.primaryColor || "#3b82f6",
        })
      )
    );

    const filename = `analytics-report-${format(now, "yyyy-MM-dd")}.pdf`;

    return {
      success: true,
      pdfBase64: Buffer.from(pdfBuffer).toString("base64"),
      filename,
    };
  } catch (error) {
    console.error("Error generating analytics report PDF:", error);
    return fail(error instanceof Error ? error.message : "Failed to generate report",);
  }
}

async function getMonthlyRevenue(organizationId: string) {
  const now = new Date();
  const monthlyRevenue: Array<{ month: string; revenue: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));

    const revenue = await prisma.payment.aggregate({
      where: {
        organizationId,
        status: "paid",
        paidAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: { amountCents: true },
    });

    monthlyRevenue.push({
      month: format(monthStart, "MMM"),
      revenue: revenue._sum.amountCents || 0,
    });
  }

  return monthlyRevenue;
}

async function getTopClients(organizationId: string): Promise<
  Array<{
    name: string;
    totalRevenue: number;
    projectCount: number;
  }>
> {
  const clients = await prisma.client.findMany({
    where: { organizationId },
    include: {
      payments: {
        where: { status: "paid" },
        select: { amountCents: true },
      },
      projects: {
        select: { id: true },
      },
    },
    take: 100,
  });

  const clientMetrics = clients
    .map((client) => ({
      name: client.fullName || client.company || client.email,
      totalRevenue: client.payments.reduce((sum, p) => sum + p.amountCents, 0),
      projectCount: client.projects.length,
    }))
    .filter((c) => c.totalRevenue > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  return clientMetrics;
}
