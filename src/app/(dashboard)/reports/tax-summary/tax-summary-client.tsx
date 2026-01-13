"use client";

import { useState } from "react";
import {
  Calculator,
  Download,
  Calendar,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FileText,
  Home,
  Car,
  Laptop,
  GraduationCap,
  Shield,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaxData {
  income: {
    gross: number;
    bySource: { name: string; amount: number; has1099: boolean }[];
  };
  deductions: {
    total: number;
    byCategory: { name: string; amount: number; icon: string }[];
  };
  quarterlyTaxes: {
    quarter: string;
    due: string;
    amount: number;
    paid: boolean;
    paidAmount?: number;
  }[];
  summary: {
    grossIncome: number;
    totalDeductions: number;
    netIncome: number;
    selfEmploymentTax: number;
    estimatedIncomeTax: number;
    totalTaxLiability: number;
  };
}

// Mock data - in production would come from server
const MOCK_DATA: TaxData = {
  income: {
    gross: 87500,
    bySource: [
      { name: "Photography Services", amount: 52000, has1099: true },
      { name: "Print & Product Sales", amount: 18500, has1099: false },
      { name: "Workshop Income", amount: 8500, has1099: true },
      { name: "Affiliate Commissions", amount: 4200, has1099: true },
      { name: "Licensing & Stock", amount: 4300, has1099: false },
    ],
  },
  deductions: {
    total: 32400,
    byCategory: [
      { name: "Equipment & Gear", amount: 8500, icon: "laptop" },
      { name: "Software & Subscriptions", amount: 4200, icon: "laptop" },
      { name: "Marketing & Advertising", amount: 5500, icon: "briefcase" },
      { name: "Insurance", amount: 3000, icon: "shield" },
      { name: "Travel & Transportation", amount: 4800, icon: "car" },
      { name: "Education & Training", amount: 2400, icon: "education" },
      { name: "Home Office", amount: 2200, icon: "home" },
      { name: "Other Business Expenses", amount: 1800, icon: "briefcase" },
    ],
  },
  quarterlyTaxes: [
    { quarter: "Q1", due: "April 15, 2024", amount: 3850, paid: true, paidAmount: 3850 },
    { quarter: "Q2", due: "June 17, 2024", amount: 3850, paid: true, paidAmount: 3850 },
    { quarter: "Q3", due: "September 16, 2024", amount: 3850, paid: true, paidAmount: 4000 },
    { quarter: "Q4", due: "January 15, 2025", amount: 3850, paid: false },
  ],
  summary: {
    grossIncome: 87500,
    totalDeductions: 32400,
    netIncome: 55100,
    selfEmploymentTax: 7771,
    estimatedIncomeTax: 7690,
    totalTaxLiability: 15461,
  },
};

const TAX_YEAR = 2024;

const ICON_MAP: Record<string, React.ReactNode> = {
  laptop: <Laptop className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  briefcase: <Briefcase className="h-4 w-4" />,
};

export function TaxSummaryClient() {
  const [year, setYear] = useState(TAX_YEAR);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const data = MOCK_DATA;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPaid = data.quarterlyTaxes
    .filter((q) => q.paid)
    .reduce((sum, q) => sum + (q.paidAmount || 0), 0);
  const totalOwed = data.summary.totalTaxLiability;
  const remaining = totalOwed - totalPaid;

  const total1099Income = data.income.bySource
    .filter((s) => s.has1099)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* Year Selector and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
          >
            <Calendar className="h-4 w-4 text-foreground-muted" />
            Tax Year {year}
            <ChevronDown className="h-4 w-4 text-foreground-muted" />
          </button>
          {showYearDropdown && (
            <div className="absolute left-0 top-full z-10 mt-1 w-36 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
              {[2024, 2023, 2022].map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setYear(y);
                    setShowYearDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--background-hover)] ${
                    y === year ? "text-[var(--primary)]" : "text-foreground"
                  }`}
                >
                  Tax Year {y}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export for Accountant
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Schedule C
          </Button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Gross Income</p>
            <DollarSign className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(data.summary.grossIncome)}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            {formatCurrency(total1099Income)} from 1099s
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Deductions</p>
            <Calculator className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">
            -{formatCurrency(data.summary.totalDeductions)}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            {data.deductions.byCategory.length} categories
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Net Taxable Income</p>
            <FileText className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(data.summary.netIncome)}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">After deductions</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Est. Tax Liability</p>
            {remaining > 0 ? (
              <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(data.summary.totalTaxLiability)}
          </p>
          <p className={`mt-1 text-xs ${remaining > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>
            {remaining > 0 ? `${formatCurrency(remaining)} remaining` : "Fully covered"}
          </p>
        </div>
      </div>

      {/* Quarterly Taxes */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Quarterly Estimated Taxes</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.quarterlyTaxes.map((q) => (
            <div
              key={q.quarter}
              className={`rounded-lg border p-4 ${
                q.paid
                  ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                  : "border-[var(--warning)]/30 bg-[var(--warning)]/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">{q.quarter}</span>
                {q.paid ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
                )}
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(q.amount)}</p>
              <p className="text-xs text-foreground-muted mt-1">Due: {q.due}</p>
              {q.paid && (
                <p className="text-xs text-[var(--success)] mt-1">
                  Paid: {formatCurrency(q.paidAmount || 0)}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--background-tertiary)] p-4">
          <div>
            <span className="text-sm text-foreground-muted">Total Paid: </span>
            <span className="font-semibold text-foreground">{formatCurrency(totalPaid)}</span>
          </div>
          <div>
            <span className="text-sm text-foreground-muted">Remaining: </span>
            <span className={`font-semibold ${remaining > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Income & Deductions Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Sources */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Income by Source</h3>
          <div className="space-y-3">
            {data.income.bySource.map((source) => (
              <div
                key={source.name}
                className="flex items-center justify-between py-2 border-b border-[var(--card-border)] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
                    <DollarSign className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{source.name}</p>
                    {source.has1099 && (
                      <span className="text-xs text-[var(--primary)]">1099 Income</span>
                    )}
                  </div>
                </div>
                <span className="font-medium text-foreground">{formatCurrency(source.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
            <span className="font-semibold text-foreground">Total Gross Income</span>
            <span className="font-bold text-foreground">{formatCurrency(data.income.gross)}</span>
          </div>
        </div>

        {/* Deductions */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Deductions by Category</h3>
          <div className="space-y-3">
            {data.deductions.byCategory.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between py-2 border-b border-[var(--card-border)] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success)]/10 text-[var(--success)]">
                    {ICON_MAP[cat.icon] || <Briefcase className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                </div>
                <span className="font-medium text-[var(--success)]">-{formatCurrency(cat.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
            <span className="font-semibold text-foreground">Total Deductions</span>
            <span className="font-bold text-[var(--success)]">-{formatCurrency(data.deductions.total)}</span>
          </div>
        </div>
      </div>

      {/* Tax Calculation Breakdown */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-foreground mb-6">Tax Calculation Summary</h3>
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
            <span className="text-foreground">Gross Income</span>
            <span className="font-medium text-foreground">{formatCurrency(data.summary.grossIncome)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
            <span className="text-foreground">Total Deductions</span>
            <span className="font-medium text-[var(--success)]">-{formatCurrency(data.summary.totalDeductions)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
            <span className="font-medium text-foreground">Net Taxable Income</span>
            <span className="font-medium text-foreground">{formatCurrency(data.summary.netIncome)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
            <div>
              <span className="text-foreground">Self-Employment Tax</span>
              <span className="text-xs text-foreground-muted ml-2">(15.3% on 92.35%)</span>
            </div>
            <span className="text-foreground">{formatCurrency(data.summary.selfEmploymentTax)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
            <div>
              <span className="text-foreground">Estimated Income Tax</span>
              <span className="text-xs text-foreground-muted ml-2">(based on brackets)</span>
            </div>
            <span className="text-foreground">{formatCurrency(data.summary.estimatedIncomeTax)}</span>
          </div>
          <div className="flex items-center justify-between py-3 bg-[var(--primary)]/10 rounded-lg px-4">
            <span className="font-semibold text-foreground">Total Estimated Tax</span>
            <span className="text-xl font-bold text-[var(--primary)]">{formatCurrency(data.summary.totalTaxLiability)}</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-foreground-muted">
          * This is an estimate. Consult a tax professional for accurate calculations.
        </p>
      </div>
    </div>
  );
}
