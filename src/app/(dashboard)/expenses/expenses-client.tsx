"use client";

import { useState } from "react";
import {
  Receipt,
  DollarSign,
  TrendingDown,
  Wallet,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Upload,
  Eye,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ExpenseCategory = "equipment" | "software" | "travel" | "marketing" | "office" | "insurance" | "other";

interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  vendor: string;
  date: string;
  receiptUrl: string | null;
  isDeductible: boolean;
  projectId: string | null;
  projectName: string | null;
  notes: string;
}

const MOCK_EXPENSES: Expense[] = [
  {
    id: "1",
    description: "Adobe Creative Cloud Annual",
    category: "software",
    amount: 599.88,
    vendor: "Adobe",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    receiptUrl: "/receipts/adobe.pdf",
    isDeductible: true,
    projectId: null,
    projectName: null,
    notes: "Annual subscription renewal",
  },
  {
    id: "2",
    description: "Sony 24-70mm GM II Lens",
    category: "equipment",
    amount: 2298,
    vendor: "B&H Photo",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    receiptUrl: "/receipts/lens.pdf",
    isDeductible: true,
    projectId: null,
    projectName: null,
    notes: "Upgrade from previous version",
  },
  {
    id: "3",
    description: "Gas - Client Location",
    category: "travel",
    amount: 45.5,
    vendor: "Shell",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    receiptUrl: null,
    isDeductible: true,
    projectId: "p1",
    projectName: "Johnson Wedding",
    notes: "Travel to venue for site visit",
  },
  {
    id: "4",
    description: "Instagram Ads - March",
    category: "marketing",
    amount: 250,
    vendor: "Meta",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    receiptUrl: "/receipts/meta.pdf",
    isDeductible: true,
    projectId: null,
    projectName: null,
    notes: "Monthly ad spend",
  },
  {
    id: "5",
    description: "Office Supplies",
    category: "office",
    amount: 127.45,
    vendor: "Staples",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    receiptUrl: null,
    isDeductible: true,
    projectId: null,
    projectName: null,
    notes: "Printer paper, ink, folders",
  },
  {
    id: "6",
    description: "Business Insurance Premium",
    category: "insurance",
    amount: 450,
    vendor: "State Farm",
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    receiptUrl: "/receipts/insurance.pdf",
    isDeductible: true,
    projectId: null,
    projectName: null,
    notes: "Quarterly premium",
  },
];

const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; color: string; bg: string }> = {
  equipment: { label: "Equipment", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  software: { label: "Software", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  travel: { label: "Travel", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  marketing: { label: "Marketing", color: "text-[var(--secondary)]", bg: "bg-[var(--secondary)]/10" },
  office: { label: "Office", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  insurance: { label: "Insurance", color: "text-[var(--ai)]", bg: "bg-[var(--ai)]/10" },
  other: { label: "Other", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

export function ExpensesClient() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    showToast("Expense deleted", "success");
    setOpenMenuId(null);
  };

  // Calculate stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthExpenses = expenses.filter(
    (e) => new Date(e.date) >= thisMonth
  );
  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthEnd = new Date(thisMonth);
  lastMonthEnd.setDate(0);
  const lastMonthExpenses = expenses.filter(
    (e) => new Date(e.date) >= lastMonth && new Date(e.date) <= lastMonthEnd
  );

  const stats = {
    totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    thisMonth: thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0),
    lastMonth: lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0),
    deductible: expenses.filter((e) => e.isDeductible).reduce((sum, e) => sum + e.amount, 0),
  };

  const monthChange = stats.lastMonth > 0
    ? Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Expenses</p>
            <Receipt className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(stats.totalExpenses)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">This Month</p>
            <Wallet className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{formatCurrency(stats.thisMonth)}</p>
          {monthChange !== 0 && (
            <p className={`text-xs mt-1 ${monthChange > 0 ? "text-[var(--error)]" : "text-[var(--success)]"}`}>
              {monthChange > 0 ? "+" : ""}{monthChange}% vs last month
            </p>
          )}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Last Month</p>
            <TrendingDown className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{formatCurrency(stats.lastMonth)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Tax Deductible</p>
            <DollarSign className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(stats.deductible)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="card p-12 text-center">
          <Receipt className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No expenses found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first expense to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => {
            const categoryConfig = CATEGORY_CONFIG[expense.category];

            return (
              <div key={expense.id} className="card p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${categoryConfig.bg}`}>
                      <Receipt className={`h-5 w-5 ${categoryConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground truncate">{expense.description}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryConfig.bg} ${categoryConfig.color}`}>
                          {categoryConfig.label}
                        </span>
                        {expense.isDeductible && (
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--success)]/10 text-[var(--success)]">
                            Deductible
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-foreground-muted">
                        <span>{expense.vendor}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(expense.date)}
                        </span>
                        {expense.projectName && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {expense.projectName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{formatCurrency(expense.amount)}</p>
                      {expense.receiptUrl && (
                        <span className="text-xs text-[var(--success)]">Receipt attached</span>
                      )}
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === expense.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          {expense.receiptUrl && (
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                              <Eye className="h-4 w-4" />
                              View Receipt
                            </button>
                          )}
                          {!expense.receiptUrl && (
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                              <Upload className="h-4 w-4" />
                              Add Receipt
                            </button>
                          )}
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
