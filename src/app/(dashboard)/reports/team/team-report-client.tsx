"use client";

import { useState } from "react";
import {
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  ChevronDown,
  Download,
  Star,
  Camera,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bookings: number;
  revenue: number;
  hoursWorked: number;
  utilizationRate: number;
  avgRating: number;
  completionRate: number;
}

interface TeamData {
  overview: {
    totalMembers: number;
    avgUtilization: number;
    totalRevenue: number;
    totalHours: number;
  };
  members: TeamMember[];
  workloadDistribution: {
    name: string;
    bookings: number;
    percentage: number;
  }[];
}

// Mock data
const MOCK_DATA: TeamData = {
  overview: {
    totalMembers: 5,
    avgUtilization: 72,
    totalRevenue: 87500,
    totalHours: 1420,
  },
  members: [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Lead Photographer",
      avatar: "SJ",
      bookings: 48,
      revenue: 32500,
      hoursWorked: 380,
      utilizationRate: 85,
      avgRating: 4.9,
      completionRate: 98,
    },
    {
      id: "2",
      name: "Mike Chen",
      role: "Photographer",
      avatar: "MC",
      bookings: 35,
      revenue: 22800,
      hoursWorked: 320,
      utilizationRate: 75,
      avgRating: 4.7,
      completionRate: 95,
    },
    {
      id: "3",
      name: "Emily Davis",
      role: "Photographer",
      avatar: "ED",
      bookings: 32,
      revenue: 18200,
      hoursWorked: 290,
      utilizationRate: 68,
      avgRating: 4.8,
      completionRate: 97,
    },
    {
      id: "4",
      name: "James Wilson",
      role: "Associate",
      avatar: "JW",
      bookings: 24,
      revenue: 9500,
      hoursWorked: 240,
      utilizationRate: 62,
      avgRating: 4.6,
      completionRate: 92,
    },
    {
      id: "5",
      name: "Lisa Park",
      role: "Editor",
      avatar: "LP",
      bookings: 17,
      revenue: 4500,
      hoursWorked: 190,
      utilizationRate: 70,
      avgRating: 4.9,
      completionRate: 100,
    },
  ],
  workloadDistribution: [
    { name: "Sarah Johnson", bookings: 48, percentage: 30.8 },
    { name: "Mike Chen", bookings: 35, percentage: 22.4 },
    { name: "Emily Davis", bookings: 32, percentage: 20.5 },
    { name: "James Wilson", bookings: 24, percentage: 15.4 },
    { name: "Lisa Park", bookings: 17, percentage: 10.9 },
  ],
};

const PERIODS = [
  { label: "This Month", value: "month" },
  { label: "This Quarter", value: "quarter" },
  { label: "Year to Date", value: "ytd" },
  { label: "Last 12 Months", value: "12months" },
];

export function TeamReportClient() {
  const [period, setPeriod] = useState("12months");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<"revenue" | "bookings" | "utilization">("revenue");
  const data = MOCK_DATA;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedPeriod = PERIODS.find((p) => p.value === period) || PERIODS[3];

  const sortedMembers = [...data.members].sort((a, b) => {
    if (sortBy === "revenue") return b.revenue - a.revenue;
    if (sortBy === "bookings") return b.bookings - a.bookings;
    return b.utilizationRate - a.utilizationRate;
  });

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
          >
            <Calendar className="h-4 w-4 text-foreground-muted" />
            {selectedPeriod.label}
            <ChevronDown className="h-4 w-4 text-foreground-muted" />
          </button>
          {showPeriodDropdown && (
            <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setPeriod(p.value);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--background-hover)] ${
                    p.value === period ? "text-[var(--primary)]" : "text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Export Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Team Members</p>
            <Users className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.overview.totalMembers}</p>
          <p className="mt-1 text-sm text-foreground-muted">Active photographers</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Avg Utilization</p>
            <BarChart3 className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.overview.avgUtilization}%</p>
          <p className="mt-1 text-sm text-foreground-muted">Team capacity used</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Team Revenue</p>
            <DollarSign className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">
            {formatCurrency(data.overview.totalRevenue)}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            {formatCurrency(data.overview.totalRevenue / data.overview.totalMembers)} per member
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Hours</p>
            <Clock className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.overview.totalHours.toLocaleString()}</p>
          <p className="mt-1 text-sm text-foreground-muted">Billable hours logged</p>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="card">
        <div className="p-6 border-b border-[var(--card-border)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Team Performance</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground-muted">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "revenue" | "bookings" | "utilization")}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-1.5 text-sm text-foreground"
              >
                <option value="revenue">Revenue</option>
                <option value="bookings">Bookings</option>
                <option value="utilization">Utilization</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {sortedMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[var(--background-hover)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-medium text-sm">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-foreground-muted">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-foreground-muted" />
                      <span className="font-medium text-foreground">{member.bookings}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-[var(--success)]">{formatCurrency(member.revenue)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">{member.hoursWorked}h</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-[var(--background-tertiary)]">
                        <div
                          className={`h-full rounded-full ${
                            member.utilizationRate >= 80 ? "bg-[var(--success)]" :
                            member.utilizationRate >= 60 ? "bg-[var(--warning)]" : "bg-[var(--error)]"
                          }`}
                          style={{ width: `${member.utilizationRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground">{member.utilizationRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[var(--warning)] fill-[var(--warning)]" />
                      <span className="font-medium text-foreground">{member.avgRating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workload Distribution */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-foreground mb-6">Workload Distribution</h3>
        <div className="space-y-4">
          {data.workloadDistribution.map((member) => (
            <div key={member.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{member.name}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground-muted">{member.percentage}%</span>
                  <span className="font-medium text-foreground">{member.bookings} bookings</span>
                </div>
              </div>
              <div className="h-3 rounded-full bg-[var(--background-tertiary)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${member.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-foreground-muted">
          Workload is fairly balanced. Consider assigning more to underutilized team members.
        </p>
      </div>
    </div>
  );
}
