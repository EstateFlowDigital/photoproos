"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  FileText,
  BarChart3,
  PieChart,
  Download,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  metrics: {
    label: string;
    value: string;
    change: number;
  }[];
}

const reportCards: ReportCard[] = [
  {
    id: "revenue",
    title: "Revenue Reports",
    description: "Income by service, client, and time period",
    icon: DollarSign,
    href: "/reports/revenue",
    metrics: [
      { label: "This Month", value: "$24,580", change: 12.5 },
      { label: "This Year", value: "$187,400", change: 8.2 },
    ],
  },
  {
    id: "clients",
    title: "Client Reports",
    description: "Acquisition, retention, and lifetime value",
    icon: Users,
    href: "/reports/clients",
    metrics: [
      { label: "New Clients", value: "18", change: 5.0 },
      { label: "Retention Rate", value: "87%", change: 2.1 },
    ],
  },
  {
    id: "bookings",
    title: "Booking Reports",
    description: "Session types, peak times, and utilization",
    icon: Calendar,
    href: "/reports/bookings",
    metrics: [
      { label: "Sessions", value: "42", change: 15.0 },
      { label: "Utilization", value: "78%", change: 4.3 },
    ],
  },
  {
    id: "profit-loss",
    title: "Profit & Loss",
    description: "Income, expenses, and profitability",
    icon: BarChart3,
    href: "/reports/profit-loss",
    metrics: [
      { label: "Net Profit", value: "$18,240", change: 9.8 },
      { label: "Margin", value: "74%", change: 1.2 },
    ],
  },
];

const quickStats = [
  { label: "Total Revenue", value: "$24,580", change: 12.5, icon: DollarSign },
  { label: "Active Clients", value: "156", change: 8.0, icon: Users },
  { label: "Bookings", value: "42", change: 15.0, icon: Calendar },
  { label: "Avg Invoice", value: "$585", change: -2.3, icon: FileText },
];

export function ReportsClient() {
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({
      title: "Exporting Report",
      description: `Generating ${format} export...`,
    });
  };

  const handleViewReport = (report: ReportCard) => {
    toast({
      title: "Opening Report",
      description: `Loading ${report.title}...`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <div
              key={stat.label}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                  <Icon className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? "text-[var(--success)]" : "text-[var(--error)]"
                }`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{stat.value}</p>
              <p className="text-sm text-[var(--foreground-muted)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Export Actions */}
      <div className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
        <div>
          <h3 className="font-medium text-[var(--foreground)]">Export Reports</h3>
          <p className="text-sm text-[var(--foreground-muted)]">Download your data in various formats</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("PDF")}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={() => handleExport("CSV")}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={() => handleExport("Excel")}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {reportCards.map((report) => {
          const Icon = report.icon;

          return (
            <div
              key={report.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 hover:border-[var(--primary)]/30 transition-colors cursor-pointer"
              onClick={() => handleViewReport(report)}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                  <Icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--foreground-muted)]" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{report.title}</h3>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">{report.description}</p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {report.metrics.map((metric) => {
                  const isPositive = metric.change >= 0;

                  return (
                    <div key={metric.label} className="rounded-lg bg-[var(--background-secondary)] p-3">
                      <p className="text-lg font-semibold text-[var(--foreground)]">{metric.value}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[var(--foreground-muted)]">{metric.label}</p>
                        <span className={`flex items-center gap-0.5 text-xs font-medium ${
                          isPositive ? "text-[var(--success)]" : "text-[var(--error)]"
                        }`}>
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[var(--foreground)]">Revenue Trend</h3>
            <select className="rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)]">
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex h-48 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">Revenue chart visualization</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[var(--foreground)]">Revenue by Service</h3>
            <select className="rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)]">
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex h-48 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
            <div className="text-center">
              <PieChart className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">Service breakdown chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
