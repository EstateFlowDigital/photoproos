"use client";

import * as React from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserPlus,
  RefreshCw,
  MapPin,
  Star,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientMetric {
  id: string;
  name: string;
  email: string;
  lifetimeValue: number;
  bookings: number;
  firstBooking: string;
  lastBooking: string;
  referralSource: string;
  status: "active" | "inactive" | "churned";
}

interface AcquisitionSource {
  source: string;
  clients: number;
  revenue: number;
  percentage: number;
}

interface GeoData {
  location: string;
  clients: number;
  percentage: number;
}

const mockClients: ClientMetric[] = [
  { id: "1", name: "Anderson Family", email: "anderson@email.com", lifetimeValue: 12500, bookings: 8, firstBooking: "2022-03-15", lastBooking: "2024-01-15", referralSource: "Referral", status: "active" },
  { id: "2", name: "TechCorp Inc", email: "events@techcorp.com", lifetimeValue: 9800, bookings: 12, firstBooking: "2023-01-10", lastBooking: "2024-01-20", referralSource: "Google", status: "active" },
  { id: "3", name: "Sarah Chen", email: "sarah@email.com", lifetimeValue: 7200, bookings: 5, firstBooking: "2022-08-20", lastBooking: "2024-01-05", referralSource: "Instagram", status: "active" },
  { id: "4", name: "Johnson Realty", email: "photos@johnson.com", lifetimeValue: 6400, bookings: 24, firstBooking: "2023-04-01", lastBooking: "2024-01-22", referralSource: "Website", status: "active" },
  { id: "5", name: "Emily Davis", email: "emily@email.com", lifetimeValue: 4800, bookings: 3, firstBooking: "2023-06-15", lastBooking: "2023-11-10", referralSource: "Facebook", status: "inactive" },
];

const mockAcquisitionSources: AcquisitionSource[] = [
  { source: "Referrals", clients: 45, revenue: 68000, percentage: 35 },
  { source: "Google Search", clients: 32, revenue: 42000, percentage: 25 },
  { source: "Instagram", clients: 28, revenue: 35000, percentage: 22 },
  { source: "Website Direct", clients: 15, revenue: 18000, percentage: 12 },
  { source: "Facebook", clients: 8, revenue: 9500, percentage: 6 },
];

const mockGeoData: GeoData[] = [
  { location: "San Francisco, CA", clients: 42, percentage: 33 },
  { location: "Oakland, CA", clients: 28, percentage: 22 },
  { location: "San Jose, CA", clients: 22, percentage: 17 },
  { location: "Palo Alto, CA", clients: 18, percentage: 14 },
  { location: "Berkeley, CA", clients: 18, percentage: 14 },
];

const statusConfig = {
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  inactive: { label: "Inactive", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  churned: { label: "Churned", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
};

export function ClientsReportClient() {
  const { toast } = useToast();

  const totalClients = mockClients.length;
  const avgLifetimeValue = Math.round(mockClients.reduce((acc, c) => acc + c.lifetimeValue, 0) / totalClients);
  const repeatRate = Math.round((mockClients.filter(c => c.bookings > 1).length / totalClients) * 100);
  const activeClients = mockClients.filter(c => c.status === "active").length;

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
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Clients</p>
              <p className="text-2xl font-semibold">{totalClients}</p>
              <p className="text-xs text-[var(--success)] flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +15 this quarter
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--primary)]/10">
              <Users className="w-6 h-6 text-[var(--primary)]" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Avg Lifetime Value</p>
              <p className="text-2xl font-semibold">{formatCurrency(avgLifetimeValue)}</p>
              <p className="text-xs text-[var(--success)] flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +8% vs last year
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
              <p className="text-sm text-[var(--foreground-muted)]">Repeat Rate</p>
              <p className="text-2xl font-semibold">{repeatRate}%</p>
              <p className="text-xs text-[var(--success)] flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +5% vs last year
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--warning)]/10">
              <RefreshCw className="w-6 h-6 text-[var(--warning)]" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Active Clients</p>
              <p className="text-2xl font-semibold">{activeClients}</p>
              <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-1 mt-1">
                {Math.round((activeClients / totalClients) * 100)}% of total
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--info)]/10">
              <UserPlus className="w-6 h-6 text-[var(--info)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => toast({ title: "Export", description: "Generating client report..." })}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--background-elevated)] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acquisition Sources */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Client Acquisition Sources</h3>
          <div className="space-y-4">
            {mockAcquisitionSources.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{source.source}</span>
                  <span className="text-sm text-[var(--foreground-muted)]">{source.clients} clients</span>
                </div>
                <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full"
                    style={{ width: source.percentage + "%" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[var(--foreground-muted)]">{source.percentage}% of clients</span>
                  <span className="text-xs font-medium">{formatCurrency(source.revenue)} revenue</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {mockGeoData.map((geo, index) => (
              <div key={geo.location} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--foreground-muted)]" />
                      {geo.location}
                    </span>
                    <span className="text-sm">{geo.clients} clients</span>
                  </div>
                  <div className="h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-[var(--info)] rounded-full"
                      style={{ width: geo.percentage + "%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clients by LTV */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Top Clients by Lifetime Value</h3>
          <button className="text-sm text-[var(--primary)] hover:underline">View All Clients</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 text-sm font-medium text-[var(--foreground-muted)]">Client</th>
                <th className="text-right py-3 text-sm font-medium text-[var(--foreground-muted)]">Lifetime Value</th>
                <th className="text-right py-3 text-sm font-medium text-[var(--foreground-muted)]">Bookings</th>
                <th className="text-left py-3 text-sm font-medium text-[var(--foreground-muted)]">Source</th>
                <th className="text-left py-3 text-sm font-medium text-[var(--foreground-muted)]">Status</th>
                <th className="text-right py-3 text-sm font-medium text-[var(--foreground-muted)]">Last Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {mockClients.map((client) => {
                const status = statusConfig[client.status];
                return (
                  <tr key={client.id} className="hover:bg-[var(--background-tertiary)] transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{client.email}</p>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold">{formatCurrency(client.lifetimeValue)}</td>
                    <td className="py-3 text-right">{client.bookings}</td>
                    <td className="py-3">{client.referralSource}</td>
                    <td className="py-3">
                      <span className={"inline-flex px-2 py-1 rounded-full text-xs font-medium " + status.color + " " + status.bg}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[var(--foreground-muted)]">{formatDate(client.lastBooking)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
