"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Download,
  Calendar,
  ChevronDown,
  FileText,
  CreditCard,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfitLossData {
  revenue: {
    total: number;
    byCategory: { name: string; amount: number; percentage: number }[];
    byMonth: { month: string; amount: number }[];
  };
  expenses: {
    total: number;
    byCategory: { name: string; amount: number; percentage: number }[];
    byMonth: { month: string; amount: number }[];
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  comparison: {
    previousPeriod: { revenue: number; expenses: number; profit: number };
    changes: { revenue: number; expenses: number; profit: number };
  };
}

// Mock data - in production would come from server
const MOCK_DATA: ProfitLossData = {
  revenue: {
    total: 87500,
    byCategory: [
      { name: "Photo Sessions", amount: 45000, percentage: 51.4 },
      { name: "Print Sales", amount: 18500, percentage: 21.1 },
      { name: "Gallery Sales", amount: 12000, percentage: 13.7 },
      { name: "Video Services", amount: 8000, percentage: 9.1 },
      { name: "Retouching", amount: 4000, percentage: 4.6 },
    ],
    byMonth: [
      { month: "Jul", amount: 12500 },
      { month: "Aug", amount: 15200 },
      { month: "Sep", amount: 11800 },
      { month: "Oct", amount: 14500 },
      { month: "Nov", amount: 16000 },
      { month: "Dec", amount: 17500 },
    ],
  },
  expenses: {
    total: 32400,
    byCategory: [
      { name: "Equipment", amount: 8500, percentage: 26.2 },
      { name: "Software/SaaS", amount: 4200, percentage: 13.0 },
      { name: "Marketing", amount: 5500, percentage: 17.0 },
      { name: "Insurance", amount: 3000, percentage: 9.3 },
      { name: "Travel", amount: 4800, percentage: 14.8 },
      { name: "Education", amount: 2400, percentage: 7.4 },
      { name: "Office Supplies", amount: 1800, percentage: 5.6 },
      { name: "Other", amount: 2200, percentage: 6.8 },
    ],
    byMonth: [
      { month: "Jul", amount: 4800 },
      { month: "Aug", amount: 5200 },
      { month: "Sep", amount: 4600 },
      { month: "Oct", amount: 5800 },
      { month: "Nov", amount: 6200 },
      { month: "Dec", amount: 5800 },
    ],
  },
  profit: {
    gross: 55100,
    net: 46585,
    margin: 53.2,
  },
  comparison: {
    previousPeriod: { revenue: 72000, expenses: 28500, profit: 43500 },
    changes: { revenue: 21.5, expenses: 13.7, profit: 7.1 },
  },
};

const PERIODS = [
  { label: "This Month", value: "month" },
  { label: "This Quarter", value: "quarter" },
  { label: "Year to Date", value: "ytd" },
  { label: "Last 12 Months", value: "12months" },
  { label: "Last Year", value: "lastyear" },
];

export function ProfitLossClient() {
  const [period, setPeriod] = useState("12months");
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

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const selectedPeriod = PERIODS.find((p) => p.value === period) || PERIODS[3];

  // Calculate max value for chart bars
  const maxMonthlyValue = Math.max(
    ...data.revenue.byMonth.map((m) => m.amount),
    ...data.expenses.byMonth.map((m) => m.amount)
  );

  return (
    <div className="space-y-6">
      {/* Period Selector and Actions */}
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Revenue</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <TrendingUp className="h-4 w-4 text-[var(--success)]" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(data.revenue.total)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUp className="h-3 w-3 text-[var(--success)]" />
            <span className="text-[var(--success)]">
              {formatPercentage(data.comparison.changes.revenue)}
            </span>
            <span className="text-foreground-muted">vs last period</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Expenses</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--error)]/10">
              <CreditCard className="h-4 w-4 text-[var(--error)]" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(data.expenses.total)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUp className="h-3 w-3 text-[var(--warning)]" />
            <span className="text-[var(--warning)]">
              {formatPercentage(data.comparison.changes.expenses)}
            </span>
            <span className="text-foreground-muted">vs last period</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Net Profit</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <DollarSign className="h-4 w-4 text-[var(--primary)]" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(data.profit.net)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUp className="h-3 w-3 text-[var(--success)]" />
            <span className="text-[var(--success)]">
              {formatPercentage(data.comparison.changes.profit)}
            </span>
            <span className="text-foreground-muted">vs last period</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Profit Margin</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <Receipt className="h-4 w-4 text-[var(--success)]" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.profit.margin}%</p>
          <p className="mt-1 text-sm text-foreground-muted">After all expenses</p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-foreground mb-6">Revenue vs Expenses</h3>
        <div className="space-y-4">
          {data.revenue.byMonth.map((month, index) => {
            const expense = data.expenses.byMonth[index];
            const revenueWidth = (month.amount / maxMonthlyValue) * 100;
            const expenseWidth = (expense.amount / maxMonthlyValue) * 100;
            const profit = month.amount - expense.amount;

            return (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground w-12">{month.month}</span>
                  <div className="flex items-center gap-4 text-xs text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                      {formatCurrency(month.amount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[var(--error)]" />
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className={profit >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}>
                      {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-[var(--background-tertiary)]">
                    <div
                      className="h-full rounded-full bg-[var(--success)]"
                      style={{ width: `${revenueWidth}%` }}
                    />
                  </div>
                  <div className="h-2 rounded-full bg-[var(--background-tertiary)]">
                    <div
                      className="h-full rounded-full bg-[var(--error)]"
                      style={{ width: `${expenseWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-foreground-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            Revenue
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--error)]" />
            Expenses
          </span>
        </div>
      </div>

      {/* Revenue and Expenses Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Breakdown */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-foreground">Revenue by Category</h3>
            <span className="text-sm text-foreground-muted">{formatCurrency(data.revenue.total)}</span>
          </div>
          <div className="space-y-4">
            {data.revenue.byCategory.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{category.name}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-foreground-muted">{category.percentage}%</span>
                    <span className="font-medium text-foreground">{formatCurrency(category.amount)}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[var(--background-tertiary)]">
                  <div
                    className="h-full rounded-full bg-[var(--success)]"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-foreground">Expenses by Category</h3>
            <span className="text-sm text-foreground-muted">{formatCurrency(data.expenses.total)}</span>
          </div>
          <div className="space-y-4">
            {data.expenses.byCategory.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{category.name}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-foreground-muted">{category.percentage}%</span>
                    <span className="font-medium text-foreground">{formatCurrency(category.amount)}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[var(--background-tertiary)]">
                  <div
                    className="h-full rounded-full bg-[var(--error)]"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profit Summary */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-foreground mb-6">Profit Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--card-border)]">
            <span className="text-foreground">Total Revenue</span>
            <span className="font-semibold text-[var(--success)]">{formatCurrency(data.revenue.total)}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--card-border)]">
            <span className="text-foreground">Total Expenses</span>
            <span className="font-semibold text-[var(--error)]">-{formatCurrency(data.expenses.total)}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--card-border)]">
            <span className="text-foreground">Gross Profit</span>
            <span className="font-semibold text-foreground">{formatCurrency(data.profit.gross)}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--card-border)]">
            <span className="text-foreground-muted">Estimated Taxes (~15%)</span>
            <span className="text-foreground-muted">-{formatCurrency(data.profit.gross * 0.15)}</span>
          </div>
          <div className="flex items-center justify-between py-3 bg-[var(--success)]/10 rounded-lg px-4">
            <span className="font-semibold text-foreground">Net Profit</span>
            <span className="text-xl font-bold text-[var(--success)]">{formatCurrency(data.profit.net)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
