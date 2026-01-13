"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  Camera,
  Clock,
  Target,
  Award,
  BarChart3,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Benchmark {
  id: string;
  metric: string;
  category: "revenue" | "clients" | "operations" | "marketing";
  yourValue: number;
  industryAvg: number;
  topPerformers: number;
  unit: "currency" | "percentage" | "number" | "days";
  trend: "up" | "down" | "stable";
  trendValue: number;
  description: string;
}

const mockBenchmarks: Benchmark[] = [
  {
    id: "1",
    metric: "Average Booking Value",
    category: "revenue",
    yourValue: 2850,
    industryAvg: 2200,
    topPerformers: 4500,
    unit: "currency",
    trend: "up",
    trendValue: 12,
    description: "Average revenue per client booking",
  },
  {
    id: "2",
    metric: "Client Retention Rate",
    category: "clients",
    yourValue: 68,
    industryAvg: 45,
    topPerformers: 75,
    unit: "percentage",
    trend: "up",
    trendValue: 8,
    description: "Percentage of repeat clients",
  },
  {
    id: "3",
    metric: "Booking Lead Time",
    category: "operations",
    yourValue: 21,
    industryAvg: 14,
    topPerformers: 30,
    unit: "days",
    trend: "stable",
    trendValue: 0,
    description: "Average days between inquiry and session",
  },
  {
    id: "4",
    metric: "Inquiry Conversion Rate",
    category: "marketing",
    yourValue: 42,
    industryAvg: 35,
    topPerformers: 55,
    unit: "percentage",
    trend: "up",
    trendValue: 5,
    description: "Percentage of inquiries converted to bookings",
  },
  {
    id: "5",
    metric: "Gallery Delivery Time",
    category: "operations",
    yourValue: 12,
    industryAvg: 14,
    topPerformers: 7,
    unit: "days",
    trend: "down",
    trendValue: 3,
    description: "Average days to deliver final gallery",
  },
  {
    id: "6",
    metric: "Monthly Revenue",
    category: "revenue",
    yourValue: 18500,
    industryAvg: 12000,
    topPerformers: 35000,
    unit: "currency",
    trend: "up",
    trendValue: 15,
    description: "Average monthly revenue",
  },
  {
    id: "7",
    metric: "Social Media Engagement",
    category: "marketing",
    yourValue: 4.2,
    industryAvg: 2.8,
    topPerformers: 6.5,
    unit: "percentage",
    trend: "up",
    trendValue: 0.8,
    description: "Average engagement rate across platforms",
  },
  {
    id: "8",
    metric: "Active Clients",
    category: "clients",
    yourValue: 45,
    industryAvg: 30,
    topPerformers: 80,
    unit: "number",
    trend: "stable",
    trendValue: 2,
    description: "Clients with activity in last 90 days",
  },
];

const categoryConfig = {
  revenue: { label: "Revenue", icon: DollarSign, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  clients: { label: "Clients", icon: Users, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  operations: { label: "Operations", icon: Clock, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  marketing: { label: "Marketing", icon: Target, color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
};

export function BenchmarksClient() {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  const filteredBenchmarks = mockBenchmarks.filter((benchmark) => {
    return categoryFilter === "all" || benchmark.category === categoryFilter;
  });

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case "currency":
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
      case "percentage":
        return value + "%";
      case "days":
        return value + " days";
      default:
        return value.toLocaleString();
    }
  };

  const getPerformanceLevel = (yourValue: number, industryAvg: number, topPerformers: number) => {
    const percentage = ((yourValue - industryAvg) / (topPerformers - industryAvg)) * 100;
    if (percentage >= 80) return { label: "Excellent", color: "text-[var(--success)]" };
    if (percentage >= 50) return { label: "Above Average", color: "text-[var(--primary)]" };
    if (percentage >= 0) return { label: "Average", color: "text-[var(--warning)]" };
    return { label: "Below Average", color: "text-[var(--error)]" };
  };

  const overallScore = Math.round(
    mockBenchmarks.reduce((acc, b) => {
      const percentage = Math.min(100, Math.max(0, ((b.yourValue - b.industryAvg) / (b.topPerformers - b.industryAvg)) * 100));
      return acc + percentage;
    }, 0) / mockBenchmarks.length
  );

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Your Performance Score</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Compared to industry averages and top performers in your category
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="var(--background-tertiary)" strokeWidth="8" fill="none" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="var(--primary)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={overallScore * 2.51 + " 251"}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{overallScore}</span>
                </div>
              </div>
              <p className="text-sm text-[var(--foreground-muted)] mt-2">Overall Score</p>
            </div>
            <div className="hidden md:block h-20 w-px bg-[var(--border)]" />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-[var(--success)]">
                  {mockBenchmarks.filter((b) => b.yourValue >= b.industryAvg).length}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">Above Average</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-[var(--warning)]">
                  {mockBenchmarks.filter((b) => b.yourValue < b.industryAvg).length}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">Below Average</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter("all")}
          className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + (
            categoryFilter === "all"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-elevated)] hover:bg-[var(--background-tertiary)]"
          )}
        >
          All Categories
        </button>
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors " + (
                categoryFilter === key
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-elevated)] hover:bg-[var(--background-tertiary)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Benchmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBenchmarks.map((benchmark) => {
          const category = categoryConfig[benchmark.category];
          const CategoryIcon = category.icon;
          const performance = getPerformanceLevel(benchmark.yourValue, benchmark.industryAvg, benchmark.topPerformers);
          const progressPercentage = Math.min(100, Math.max(0, ((benchmark.yourValue - benchmark.industryAvg) / (benchmark.topPerformers - benchmark.industryAvg)) * 100 + 50));

          return (
            <div key={benchmark.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={"p-2 rounded-lg " + category.bg}>
                    <CategoryIcon className={"w-4 h-4 " + category.color} />
                  </div>
                  <div>
                    <h3 className="font-medium">{benchmark.metric}</h3>
                    <p className="text-xs text-[var(--foreground-muted)]">{benchmark.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toast({ title: benchmark.metric, description: "Detailed analysis coming soon..." })}
                  className="p-1 hover:bg-[var(--background-elevated)] rounded transition-colors"
                >
                  <Info className="w-4 h-4 text-[var(--foreground-muted)]" />
                </button>
              </div>

              {/* Your Value */}
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-3xl font-bold">{formatValue(benchmark.yourValue, benchmark.unit)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {benchmark.trend === "up" && <TrendingUp className="w-4 h-4 text-[var(--success)]" />}
                    {benchmark.trend === "down" && <TrendingDown className="w-4 h-4 text-[var(--error)]" />}
                    {benchmark.trend === "stable" && <Minus className="w-4 h-4 text-[var(--foreground-muted)]" />}
                    <span className={"text-sm " + (
                      benchmark.trend === "up" ? "text-[var(--success)]" :
                      benchmark.trend === "down" ? "text-[var(--error)]" :
                      "text-[var(--foreground-muted)]"
                    )}>
                      {benchmark.trendValue > 0 ? "+" : ""}{benchmark.trendValue}{benchmark.unit === "percentage" ? "%" : ""} vs last month
                    </span>
                  </div>
                </div>
                <span className={"text-sm font-medium " + performance.color}>{performance.label}</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--error)] via-[var(--warning)] to-[var(--success)] rounded-full transition-all duration-500"
                    style={{ width: progressPercentage + "%" }}
                  />
                </div>
              </div>

              {/* Comparison */}
              <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                <div>
                  <p>Industry Avg</p>
                  <p className="font-medium text-[var(--foreground)]">{formatValue(benchmark.industryAvg, benchmark.unit)}</p>
                </div>
                <div className="text-right">
                  <p>Top Performers</p>
                  <p className="font-medium text-[var(--foreground)]">{formatValue(benchmark.topPerformers, benchmark.unit)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBenchmarks.length === 0 && (
        <div className="card p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
          <h3 className="text-lg font-medium mb-2">No benchmarks found</h3>
          <p className="text-[var(--foreground-muted)]">Select a different category to see relevant benchmarks</p>
        </div>
      )}
    </div>
  );
}
