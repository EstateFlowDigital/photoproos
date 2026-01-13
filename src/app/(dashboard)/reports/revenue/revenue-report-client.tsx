"use client";

import * as React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RevenueData {
  period: string;
  revenue: number;
  bookings: number;
  avgOrderValue: number;
  change: number;
}

interface ServiceRevenue {
  service: string;
  revenue: number;
  bookings: number;
  percentage: number;
}

interface TopClient {
  name: string;
  revenue: number;
  bookings: number;
  lastBooking: string;
}

const mockMonthlyData: RevenueData[] = [
  { period: "Jan 2024", revenue: 18500, bookings: 12, avgOrderValue: 1542, change: 15 },
  { period: "Dec 2023", revenue: 16100, bookings: 10, avgOrderValue: 1610, change: 8 },
  { period: "Nov 2023", revenue: 14900, bookings: 11, avgOrderValue: 1355, change: -5 },
  { period: "Oct 2023", revenue: 15700, bookings: 9, avgOrderValue: 1744, change: 12 },
  { period: "Sep 2023", revenue: 14000, bookings: 8, avgOrderValue: 1750, change: 3 },
  { period: "Aug 2023", revenue: 13600, bookings: 10, avgOrderValue: 1360, change: -2 },
];

const mockServiceRevenue: ServiceRevenue[] = [
  { service: "Wedding Photography", revenue: 45000, bookings: 15, percentage: 38 },
  { service: "Portrait Sessions", revenue: 28000, bookings: 42, percentage: 24 },
  { service: "Corporate Events", revenue: 22000, bookings: 8, percentage: 19 },
  { service: "Product Photography", revenue: 12000, bookings: 24, percentage: 10 },
  { service: "Real Estate", revenue: 10600, bookings: 35, percentage: 9 },
];

const mockTopClients: TopClient[] = [
  { name: "Anderson Family", revenue: 8500, bookings: 4, lastBooking: "2024-01-15" },
  { name: "TechCorp Inc", revenue: 7200, bookings: 6, lastBooking: "2024-01-20" },
  { name: "Sarah & James", revenue: 6800, bookings: 2, lastBooking: "2024-01-10" },
  { name: "Johnson Realty", revenue: 5400, bookings: 18, lastBooking: "2024-01-22" },
  { name: "Emily Chen", revenue: 4200, bookings: 3, lastBooking: "2024-01-18" },
];

export function RevenueReportClient() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = React.useState("6m");

  const totalRevenue = mockMonthlyData.reduce((acc, m) => acc + m.revenue, 0);
  const totalBookings = mockMonthlyData.reduce((acc, m) => acc + m.bookings, 0);
  const avgOrderValue = Math.round(totalRevenue / totalBookings);
  const avgMonthlyRevenue = Math.round(totalRevenue / mockMonthlyData.length);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const maxRevenue = Math.max(...mockMonthlyData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Revenue</p>
              <p className="text-2xl font-semibold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-[var(--success)] flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +12% vs previous period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--success)]/10">
              <DollarSign className="w-6 h-6 text-[var(--success)]" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Bookings</p>
              <p className="text-2xl font-semibold">{totalBookings}</p>
              <p className="text-xs text-[var(--success)] flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +8% vs previous period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--primary)]/10">
              <Calendar className="w-6 h-6 text-[var(--primary)]" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Avg Order Value</p>
              <p className="text-2xl font-semibold">{formatCurrency(avgOrderValue)}</p>
              <p className="text-xs text-[var(--error)] flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                -3% vs previous period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--warning)]/10">
              <Package className="w-6 h-6 text-[var(--warning)]" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Avg Monthly Revenue</p>
              <p className="text-2xl font-semibold">{formatCurrency(avgMonthlyRevenue)}</p>
              <p className="text-xs text-[var(--success)] flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +5% vs previous period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--info)]/10">
              <TrendingUp className="w-6 h-6 text-[var(--info)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {["1m", "3m", "6m", "1y", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={"px-3 py-1.5 rounded-lg text-sm font-medium transition-colors " + (
                dateRange === range
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-elevated)] hover:bg-[var(--background-tertiary)]"
              )}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => toast({ title: "Export", description: "Generating revenue report..." })}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--background-elevated)] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold mb-4">Monthly Revenue Trend</h3>
          <div className="space-y-3">
            {mockMonthlyData.map((data) => (
              <div key={data.period} className="flex items-center gap-4">
                <span className="text-sm text-[var(--foreground-muted)] w-20">{data.period}</span>
                <div className="flex-1">
                  <div className="h-8 bg-[var(--background-tertiary)] rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/70 rounded flex items-center justify-end pr-2"
                      style={{ width: (data.revenue / maxRevenue * 100) + "%" }}
                    >
                      <span className="text-xs font-medium text-white">{formatCurrency(data.revenue)}</span>
                    </div>
                  </div>
                </div>
                <span className={"text-sm font-medium w-16 text-right " + (data.change >= 0 ? "text-[var(--success)]" : "text-[var(--error)]")}>
                  {data.change >= 0 ? "+" : ""}{data.change}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Service */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Revenue by Service</h3>
          <div className="space-y-4">
            {mockServiceRevenue.map((service) => (
              <div key={service.service}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{service.service}</span>
                  <span className="text-sm font-medium">{formatCurrency(service.revenue)}</span>
                </div>
                <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full"
                    style={{ width: service.percentage + "%" }}
                  />
                </div>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">{service.bookings} bookings ({service.percentage}%)</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Top Clients by Revenue</h3>
          <button className="text-sm text-[var(--primary)] hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 text-sm font-medium text-[var(--foreground-muted)]">Client</th>
                <th className="text-right py-3 text-sm font-medium text-[var(--foreground-muted)]">Revenue</th>
                <th className="text-right py-3 text-sm font-medium text-[var(--foreground-muted)]">Bookings</th>
                <th className="text-right py-3 text-sm font-medium text-[var(--foreground-muted)]">Last Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {mockTopClients.map((client, index) => (
                <tr key={client.name} className="hover:bg-[var(--background-tertiary)] transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-semibold">{formatCurrency(client.revenue)}</td>
                  <td className="py-3 text-right">{client.bookings}</td>
                  <td className="py-3 text-right text-[var(--foreground-muted)]">{formatDate(client.lastBooking)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
