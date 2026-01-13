"use client";

import { useState } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingData {
  overview: {
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    avgValue: number;
    conversionRate: number;
    changeFromLastPeriod: number;
  };
  byMonth: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
  byService: {
    name: string;
    count: number;
    percentage: number;
    revenue: number;
  }[];
  byLeadSource: {
    source: string;
    leads: number;
    bookings: number;
    conversionRate: number;
  }[];
  bySeason: {
    season: string;
    bookings: number;
    avgValue: number;
  }[];
}

// Mock data
const MOCK_DATA: BookingData = {
  overview: {
    totalBookings: 156,
    completedBookings: 132,
    pendingBookings: 18,
    cancelledBookings: 6,
    avgValue: 485,
    conversionRate: 42.5,
    changeFromLastPeriod: 12.3,
  },
  byMonth: [
    { month: "Jul", bookings: 22, revenue: 9850 },
    { month: "Aug", bookings: 28, revenue: 13200 },
    { month: "Sep", bookings: 24, revenue: 11400 },
    { month: "Oct", bookings: 31, revenue: 15500 },
    { month: "Nov", bookings: 26, revenue: 12800 },
    { month: "Dec", bookings: 25, revenue: 12400 },
  ],
  byService: [
    { name: "Portrait Sessions", count: 48, percentage: 30.8, revenue: 24000 },
    { name: "Real Estate", count: 42, percentage: 26.9, revenue: 14700 },
    { name: "Events", count: 28, percentage: 17.9, revenue: 22400 },
    { name: "Commercial", count: 22, percentage: 14.1, revenue: 19800 },
    { name: "Headshots", count: 16, percentage: 10.3, revenue: 6400 },
  ],
  byLeadSource: [
    { source: "Website", leads: 145, bookings: 68, conversionRate: 46.9 },
    { source: "Referrals", leads: 82, bookings: 52, conversionRate: 63.4 },
    { source: "Instagram", leads: 68, bookings: 22, conversionRate: 32.4 },
    { source: "Google Ads", leads: 42, bookings: 10, conversionRate: 23.8 },
    { source: "Other", leads: 30, bookings: 4, conversionRate: 13.3 },
  ],
  bySeason: [
    { season: "Spring", bookings: 38, avgValue: 420 },
    { season: "Summer", bookings: 52, avgValue: 510 },
    { season: "Fall", bookings: 45, avgValue: 495 },
    { season: "Winter", bookings: 21, avgValue: 380 },
  ],
};

const PERIODS = [
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 6 Months", value: "6months" },
  { label: "Year to Date", value: "ytd" },
  { label: "Last 12 Months", value: "12months" },
];

export function BookingsReportClient() {
  const [period, setPeriod] = useState("6months");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const data = MOCK_DATA;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedPeriod = PERIODS.find((p) => p.value === period) || PERIODS[1];
  const maxMonthlyBookings = Math.max(...data.byMonth.map((m) => m.bookings));

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
            <p className="text-sm text-foreground-muted">Total Bookings</p>
            <Calendar className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.overview.totalBookings}</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUp className="h-3 w-3 text-[var(--success)]" />
            <span className="text-[var(--success)]">+{data.overview.changeFromLastPeriod}%</span>
            <span className="text-foreground-muted">vs last period</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Avg. Booking Value</p>
            <TrendingUp className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(data.overview.avgValue)}</p>
          <p className="mt-1 text-sm text-foreground-muted">Per booking</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Conversion Rate</p>
            <Target className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{data.overview.conversionRate}%</p>
          <p className="mt-1 text-sm text-foreground-muted">Lead to booking</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Cancellation Rate</p>
            <XCircle className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {((data.overview.cancelledBookings / data.overview.totalBookings) * 100).toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-foreground-muted">{data.overview.cancelledBookings} cancelled</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Booking Status</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-lg bg-[var(--success)]/10 p-4">
            <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
            <div>
              <p className="text-2xl font-bold text-foreground">{data.overview.completedBookings}</p>
              <p className="text-sm text-foreground-muted">Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-[var(--warning)]/10 p-4">
            <Clock className="h-8 w-8 text-[var(--warning)]" />
            <div>
              <p className="text-2xl font-bold text-foreground">{data.overview.pendingBookings}</p>
              <p className="text-sm text-foreground-muted">Pending</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-[var(--error)]/10 p-4">
            <XCircle className="h-8 w-8 text-[var(--error)]" />
            <div>
              <p className="text-2xl font-bold text-foreground">{data.overview.cancelledBookings}</p>
              <p className="text-sm text-foreground-muted">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-foreground mb-6">Monthly Booking Trend</h3>
        <div className="space-y-4">
          {data.byMonth.map((month) => (
            <div key={month.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground w-12">{month.month}</span>
                <div className="flex items-center gap-4 text-foreground-muted">
                  <span>{month.bookings} bookings</span>
                  <span className="text-[var(--success)]">{formatCurrency(month.revenue)}</span>
                </div>
              </div>
              <div className="h-3 rounded-full bg-[var(--background-tertiary)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${(month.bookings / maxMonthlyBookings) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service & Lead Source Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Service */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Bookings by Service</h3>
          <div className="space-y-4">
            {data.byService.map((service) => (
              <div key={service.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{service.name}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-foreground-muted">{service.count}</span>
                    <span className="text-[var(--success)]">{formatCurrency(service.revenue)}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[var(--background-tertiary)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${service.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Lead Source */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Conversion by Lead Source</h3>
          <div className="space-y-3">
            {data.byLeadSource.map((source) => (
              <div
                key={source.source}
                className="flex items-center justify-between py-2 border-b border-[var(--card-border)] last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{source.source}</p>
                  <p className="text-xs text-foreground-muted">
                    {source.bookings} of {source.leads} leads
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    source.conversionRate >= 50 ? "text-[var(--success)]" :
                    source.conversionRate >= 30 ? "text-[var(--warning)]" : "text-foreground"
                  }`}>
                    {source.conversionRate}%
                  </p>
                  <p className="text-xs text-foreground-muted">conversion</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasonal Pattern */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Seasonal Patterns</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          {data.bySeason.map((season) => (
            <div key={season.season} className="rounded-lg bg-[var(--background-tertiary)] p-4 text-center">
              <p className="text-sm font-medium text-foreground-muted">{season.season}</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{season.bookings}</p>
              <p className="mt-1 text-sm text-foreground-muted">bookings</p>
              <p className="mt-2 text-sm text-[var(--success)]">
                Avg. {formatCurrency(season.avgValue)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-foreground-muted">
          Summer shows the highest booking volume and value. Consider promotional campaigns for winter.
        </p>
      </div>
    </div>
  );
}
