"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  getProjectPL,
  getProjectExpenses,
  createProjectExpense,
  updateProjectExpense,
  deleteProjectExpense,
  toggleExpensePaidStatus,
  getTeamMembers,
  bulkUpdateExpenseStatus,
  bulkDeleteExpenses,
  bulkCreateExpenses,
  exportExpensesToCSV,
  getReceiptUploadUrl,
  // Recurring templates
  getRecurringTemplates,
  createRecurringTemplate,
  updateRecurringTemplate,
  deleteRecurringTemplate,
  generateExpenseFromTemplate,
  // Approval workflow
  submitExpenseForApproval,
  approveExpense,
  rejectExpense,
  // Budget tracking
  getProjectBudget,
  upsertProjectBudget,
  getProjectBudgetStatus,
  // PDF reports
  generateExpenseReport,
  // Enhanced features
  duplicateExpense,
  getOrganizationMileageRate,
  getExpenseForecast,
  getVendors,
  searchVendors,
  type ProjectPLSummary,
  type CreateExpenseInput,
  type CreateRecurringTemplateInput,
  type CreateBudgetInput,
  type BudgetStatus,
  type ExpenseReportData,
  type ExpenseForecast,
} from "@/lib/actions/project-expenses";
import { getExpenseCategories } from "@/lib/utils/expenses";
import type { ProjectExpense, ExpenseCategory, RecurringExpenseTemplate, ExpenseApprovalStatus, RecurrenceFrequency, ProjectBudget, PaymentMethod, Vendor } from "@prisma/client";

// ============================================================================
// ICONS
// ============================================================================

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 10h8" />
      <path d="M8 14h4" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SortIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function RepeatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function ClipboardCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function SplitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "venmo", label: "Venmo" },
  { value: "zelle", label: "Zelle" },
  { value: "other", label: "Other" },
];

const APPROVAL_STATUSES: { value: ExpenseApprovalStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// Quick-add expense templates for common expenses
const QUICK_TEMPLATES: Array<{
  name: string;
  description: string;
  category: ExpenseCategory;
  icon: string;
  defaultAmount?: number; // in cents
}> = [
  { name: "Gas/Fuel", description: "Vehicle fuel", category: "travel", icon: "⛽" },
  { name: "Parking", description: "Parking fee", category: "travel", icon: "🅿️" },
  { name: "Tolls", description: "Road tolls", category: "travel", icon: "🛣️" },
  { name: "Lunch/Meals", description: "Meal expense", category: "food", icon: "🍽️" },
  { name: "Coffee", description: "Coffee/beverages", category: "food", icon: "☕", defaultAmount: 500 },
  { name: "Office Supplies", description: "Office supplies purchase", category: "supplies", icon: "📎" },
  { name: "Equipment Rental", description: "Equipment rental", category: "equipment", icon: "📷" },
  { name: "Software", description: "Software subscription", category: "software", icon: "💻" },
  { name: "Marketing", description: "Marketing expense", category: "marketing", icon: "📣" },
  { name: "Shipping", description: "Shipping/delivery", category: "other", icon: "📦" },
];

// ============================================================================
// TYPES
// ============================================================================

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FilterState {
  search: string;
  category: ExpenseCategory | "all";
  status: "all" | "paid" | "unpaid";
  dateFrom: string;
  dateTo: string;
  // Advanced filters
  paymentMethod: PaymentMethod | "all";
  billable: "all" | "billable" | "non-billable";
  approvalStatus: ExpenseApprovalStatus | "all";
}

type SortField = "date" | "amount" | "category" | "description";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

// ============================================================================
// CHART COLORS
// ============================================================================

const CHART_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f97316", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#ef4444", // red
  "#6366f1", // indigo
];

// ============================================================================
// PIE CHART COMPONENT
// ============================================================================

interface PieChartProps {
  data: { category: ExpenseCategory; amount: number; count: number }[];
  total: number;
  getCategoryLabel: (cat: ExpenseCategory) => string;
}

function ExpensePieChart({ data, total, getCategoryLabel }: PieChartProps) {
  if (data.length === 0 || total === 0) return null;

  const size = 160;
  const center = size / 2;
  const radius = 60;

  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((item, index) => {
    const percent = item.amount / total;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${center + startX * radius} ${center + startY * radius}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${center + endX * radius} ${center + endY * radius}`,
      `L ${center} ${center}`,
    ].join(" ");

    return {
      path: pathData,
      color: CHART_COLORS[index % CHART_COLORS.length],
      category: item.category,
      percent: Math.round(percent * 100),
      amount: item.amount,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        role="img"
        aria-label="Expense breakdown pie chart"
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          {slices.map((slice, i) => (
            <path
              key={i}
              d={slice.path}
              fill={slice.color}
              className="transition-opacity hover:opacity-80"
            >
              <title>
                {getCategoryLabel(slice.category)}: {slice.percent}%
              </title>
            </path>
          ))}
        </g>
        <circle cx={center} cy={center} r={radius * 0.5} fill="var(--card)" />
      </svg>

      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {slices.map((slice, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-[var(--background-secondary)]"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: slice.color }}
              aria-hidden="true"
            />
            <span className="text-foreground-muted truncate max-w-[100px]">
              {getCategoryLabel(slice.category)}
            </span>
            <span className="font-medium text-foreground">{slice.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

interface ProjectPLPanelProps {
  galleryId: string;
  className?: string;
}

const EXPENSE_CATEGORIES = getExpenseCategories();

export function ProjectPLPanel({ galleryId, className }: ProjectPLPanelProps) {
  const [plSummary, setPlSummary] = useState<ProjectPLSummary | null>(null);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ProjectExpense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    // Advanced filters
    paymentMethod: "all",
    billable: "all",
    approvalStatus: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sort state
  const [sort, setSort] = useState<SortState>({
    field: "date",
    direction: "desc",
  });

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Receipt upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstExpenseRef = useRef<HTMLDivElement>(null);

  // Form state - separate from CreateExpenseInput to handle date as string
  interface FormData {
    description: string;
    category: ExpenseCategory;
    amountCents: number;
    vendor: string;
    isPaid: boolean;
    notes: string;
    teamMemberId: string;
    receiptUrl: string;
    expenseDate: string;
    // Enhanced tracking fields
    isBillable: boolean;
    paymentMethod: PaymentMethod | "";
    taxCents: number;
    mileageDistance: number;
    mileageRateCents: number;
  }

  const [formData, setFormData] = useState<FormData>({
    description: "",
    category: "other",
    amountCents: 0,
    vendor: "",
    isPaid: true,
    notes: "",
    teamMemberId: "",
    receiptUrl: "",
    expenseDate: new Date().toISOString().split("T")[0],
    // Enhanced tracking fields
    isBillable: false,
    paymentMethod: "",
    taxCents: 0,
    mileageDistance: 0,
    mileageRateCents: 0,
  });

  // Vendors state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorSuggestions, setVendorSuggestions] = useState<Vendor[]>([]);
  const [mileageRate, setMileageRate] = useState<number>(67); // Default IRS rate

  // Forecast state
  const [forecast, setForecast] = useState<{ forecasts: ExpenseForecast[]; summary: { totalProjected: number; byMonth: { month: string; amountCents: number }[]; byCategory: { category: ExpenseCategory; amountCents: number }[] }; periodMonths: number } | null>(null);
  const [showForecastModal, setShowForecastModal] = useState(false);

  // Recurring templates state
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringExpenseTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RecurringExpenseTemplate | null>(null);
  const [showApplyTemplateModal, setShowApplyTemplateModal] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    description: "",
    category: "other" as ExpenseCategory,
    amountCents: 0,
    vendor: "",
    frequency: "monthly" as RecurrenceFrequency,
    dayOfWeek: 1,
    dayOfMonth: 1,
    monthOfYear: 1,
  });

  // Budget state
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetFormData, setBudgetFormData] = useState<CreateBudgetInput>({
    totalBudgetCents: 0,
    warningThreshold: 80,
    criticalThreshold: 95,
  });

  // Approval workflow state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingExpenseId, setRejectingExpenseId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // PDF Report state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportDateFrom, setReportDateFrom] = useState("");
  const [reportDateTo, setReportDateTo] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  // Expense split state
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splittingExpense, setSplittingExpense] = useState<ProjectExpense | null>(null);
  const [splitItems, setSplitItems] = useState<Array<{
    category: ExpenseCategory;
    amountCents: number;
    description: string;
  }>>([]);
  const [isSplitting, setIsSplitting] = useState(false);

  // Quick-add templates state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const quickAddRef = useRef<HTMLDivElement>(null);

  // Bulk edit state
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<{
    category: ExpenseCategory | "";
    paymentMethod: PaymentMethod | "";
    isBillable: boolean | null;
    isPaid: boolean | null;
  }>({
    category: "",
    paymentMethod: "",
    isBillable: null,
    isPaid: null,
  });

  // CSV Import state
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<{
    description: string;
    amount: string;
    category: string;
    date: string;
    vendor: string;
    notes: string;
    billable: string;
    paid: string;
  }>({
    description: "",
    amount: "",
    category: "",
    date: "",
    vendor: "",
    notes: "",
    billable: "",
    paid: "",
  });
  const [csvImportStep, setCsvImportStep] = useState<"upload" | "mapping" | "preview" | "importing">("upload");
  const [csvImportError, setCsvImportError] = useState<string | null>(null);
  const [csvPreviewData, setCsvPreviewData] = useState<CreateExpenseInput[]>([]);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Active tab for advanced features
  const [activeAdvancedTab, setActiveAdvancedTab] = useState<"expenses" | "templates" | "budget" | "analytics">("expenses");

  // Load data
  useEffect(() => {
    loadData();
  }, [galleryId]);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [plResult, expensesResult, teamResult, templatesResult, budgetResult, vendorsResult, mileageResult] = await Promise.all([
        getProjectPL(galleryId),
        getProjectExpenses(galleryId),
        getTeamMembers(),
        getRecurringTemplates(),
        getProjectBudgetStatus(galleryId),
        getVendors(),
        getOrganizationMileageRate(),
      ]);

      if (plResult.success) {
        setPlSummary(plResult.data);
      } else {
        setError(plResult.error);
      }

      if (expensesResult.success) {
        setExpenses(expensesResult.data);
      }

      if (teamResult.success) {
        setTeamMembers(teamResult.data);
      }

      if (templatesResult.success) {
        setRecurringTemplates(templatesResult.data);
      }

      if (budgetResult.success) {
        setBudgetStatus(budgetResult.data);
      }

      if (vendorsResult.success) {
        setVendors(vendorsResult.data);
      }

      if (mileageResult.success) {
        setMileageRate(mileageResult.data.rateCents);
      }
    } catch {
      setError("Failed to load P&L data");
    } finally {
      setIsLoading(false);
    }
  }

  // Filtered and sorted expenses
  const filteredAndSortedExpenses = useMemo(() => {
    // First filter
    const filtered = expenses.filter((expense) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDescription = expense.description.toLowerCase().includes(searchLower);
        const matchesVendor = expense.vendor?.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesVendor) return false;
      }

      // Category filter
      if (filters.category !== "all" && expense.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status === "paid" && !expense.isPaid) return false;
      if (filters.status === "unpaid" && expense.isPaid) return false;

      // Date range filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (new Date(expense.expenseDate) < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(expense.expenseDate) > toDate) return false;
      }

      // Advanced filters
      // Payment method filter
      if (filters.paymentMethod !== "all" && expense.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // Billable filter
      if (filters.billable === "billable" && !expense.isBillable) return false;
      if (filters.billable === "non-billable" && expense.isBillable) return false;

      // Approval status filter
      if (filters.approvalStatus !== "all" && expense.approvalStatus !== filters.approvalStatus) {
        return false;
      }

      return true;
    });

    // Then sort
    return filtered.sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;

      switch (sort.field) {
        case "date":
          return direction * (new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime());
        case "amount":
          return direction * (a.amountCents - b.amountCents);
        case "category":
          return direction * a.category.localeCompare(b.category);
        case "description":
          return direction * a.description.localeCompare(b.description);
        default:
          return 0;
      }
    });
  }, [expenses, filters, sort]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    // Advanced filters
    if (filters.paymentMethod !== "all") count++;
    if (filters.billable !== "all") count++;
    if (filters.approvalStatus !== "all") count++;
    return count;
  }, [filters]);

  // Analytics data
  const analyticsData = useMemo(() => {
    if (expenses.length === 0) {
      return {
        categoryBreakdown: [],
        paymentMethodBreakdown: [],
        monthlyTrend: [],
        totalSpent: 0,
        averageExpense: 0,
        topCategory: null,
        billableVsNonBillable: { billable: 0, nonBillable: 0 },
      };
    }

    // Category breakdown
    const categoryMap = new Map<string, number>();
    expenses.forEach((exp) => {
      const current = categoryMap.get(exp.category) || 0;
      categoryMap.set(exp.category, current + exp.amountCents);
    });
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amountCents]) => ({
        name: getCategoryLabel(category as ExpenseCategory),
        value: amountCents / 100,
        category,
      }))
      .sort((a, b) => b.value - a.value);

    // Payment method breakdown
    const paymentMap = new Map<string, number>();
    expenses.forEach((exp) => {
      const method = exp.paymentMethod || "other";
      const current = paymentMap.get(method) || 0;
      paymentMap.set(method, current + exp.amountCents);
    });
    const paymentMethodBreakdown = Array.from(paymentMap.entries())
      .map(([method, amountCents]) => ({
        name: PAYMENT_METHODS.find((m) => m.value === method)?.label || "Other",
        value: amountCents / 100,
        method,
      }))
      .sort((a, b) => b.value - a.value);

    // Monthly trend (group by month)
    const monthMap = new Map<string, number>();
    expenses.forEach((exp) => {
      const date = new Date(exp.expenseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const current = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, current + exp.amountCents);
    });
    const monthlyTrend = Array.from(monthMap.entries())
      .map(([month, amountCents]) => ({
        month,
        label: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        amount: amountCents / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Totals
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amountCents, 0);
    const averageExpense = totalSpent / expenses.length;
    const topCategory = categoryBreakdown[0] || null;

    // Billable vs non-billable
    const billableVsNonBillable = expenses.reduce(
      (acc, exp) => {
        if (exp.isBillable) {
          acc.billable += exp.amountCents;
        } else {
          acc.nonBillable += exp.amountCents;
        }
        return acc;
      },
      { billable: 0, nonBillable: 0 }
    );

    return {
      categoryBreakdown,
      paymentMethodBreakdown,
      monthlyTrend,
      totalSpent,
      averageExpense,
      topCategory,
      billableVsNonBillable,
    };
  }, [expenses]);

  // Chart colors (Dovetail-inspired palette)
  const CHART_COLORS = [
    "#3b82f6", // Primary blue
    "#22c55e", // Success green
    "#f97316", // Warning orange
    "#8b5cf6", // AI purple
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#f59e0b", // Amber
    "#6366f1", // Indigo
    "#84cc16", // Lime
    "#06b6d4", // Cyan
  ];

  function resetForm() {
    setFormData({
      description: "",
      category: "other" as ExpenseCategory,
      amountCents: 0,
      vendor: "",
      isPaid: true,
      notes: "",
      teamMemberId: "",
      receiptUrl: "",
      expenseDate: new Date().toISOString().split("T")[0],
      // Enhanced tracking fields
      isBillable: false,
      paymentMethod: "",
      taxCents: 0,
      mileageDistance: 0,
      mileageRateCents: mileageRate,
    });
    setEditingExpense(null);
  }

  function openAddModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(expense: ProjectExpense) {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      category: expense.category,
      amountCents: expense.amountCents,
      vendor: expense.vendor || "",
      isPaid: expense.isPaid,
      notes: expense.notes || "",
      teamMemberId: expense.teamMemberId || "",
      receiptUrl: expense.receiptUrl || "",
      expenseDate: new Date(expense.expenseDate).toISOString().split("T")[0],
      // Enhanced tracking fields
      isBillable: expense.isBillable,
      paymentMethod: expense.paymentMethod || "",
      taxCents: expense.taxCents || 0,
      mileageDistance: expense.mileageDistance || 0,
      mileageRateCents: expense.mileageRateCents || mileageRate,
    });
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    if (!formData.description || formData.amountCents <= 0) {
      setError("Description and amount are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData: CreateExpenseInput = {
        description: formData.description,
        category: formData.category,
        amountCents: formData.amountCents,
        vendor: formData.vendor || undefined,
        isPaid: formData.isPaid,
        notes: formData.notes || undefined,
        teamMemberId: formData.teamMemberId || undefined,
        receiptUrl: formData.receiptUrl || undefined,
        expenseDate: new Date(formData.expenseDate),
        // Enhanced tracking fields
        isBillable: formData.isBillable,
        paymentMethod: formData.paymentMethod || undefined,
        taxCents: formData.taxCents || undefined,
        mileageDistance: formData.mileageDistance || undefined,
        mileageRateCents: formData.mileageRateCents || undefined,
      };

      if (editingExpense) {
        const result = await updateProjectExpense(editingExpense.id, submitData);
        if (!result.success) {
          setError(result.error);
          return;
        }
      } else {
        const result = await createProjectExpense(galleryId, submitData);
        if (!result.success) {
          setError(result.error);
          return;
        }
      }

      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch {
      setError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(expenseId: string) {
    try {
      const result = await deleteProjectExpense(expenseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDeleteConfirmId(null);
      await loadData();
    } catch {
      setError("Failed to delete expense");
    }
  }

  async function handleTogglePaid(expenseId: string) {
    try {
      const result = await toggleExpensePaidStatus(expenseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      await loadData();
    } catch {
      setError("Failed to update expense");
    }
  }

  // Duplicate expense handler
  async function handleDuplicateExpense(expenseId: string) {
    try {
      const result = await duplicateExpense(expenseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      await loadData();
    } catch {
      setError("Failed to duplicate expense");
    }
  }

  // Load expense forecast
  async function handleLoadForecast() {
    try {
      const result = await getExpenseForecast(galleryId, 3);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setForecast(result.data);
      setShowForecastModal(true);
    } catch {
      setError("Failed to load forecast");
    }
  }

  // Open split expense modal
  function openSplitModal(expense: ProjectExpense) {
    setSplittingExpense(expense);
    // Initialize with two split items, each getting half the amount
    const halfAmount = Math.floor(expense.amountCents / 2);
    setSplitItems([
      {
        category: expense.category as ExpenseCategory,
        amountCents: halfAmount,
        description: expense.description,
      },
      {
        category: "other" as ExpenseCategory,
        amountCents: expense.amountCents - halfAmount,
        description: expense.description,
      },
    ]);
    setShowSplitModal(true);
  }

  // Add a split item
  function addSplitItem() {
    if (!splittingExpense) return;
    setSplitItems([
      ...splitItems,
      {
        category: "other" as ExpenseCategory,
        amountCents: 0,
        description: splittingExpense.description,
      },
    ]);
  }

  // Remove a split item
  function removeSplitItem(index: number) {
    if (splitItems.length <= 2) return; // Minimum 2 items
    setSplitItems(splitItems.filter((_, i) => i !== index));
  }

  // Update a split item
  function updateSplitItem(index: number, field: keyof (typeof splitItems)[0], value: string | number) {
    setSplitItems(
      splitItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  // Calculate remaining amount
  const splitRemainingAmount = useMemo(() => {
    if (!splittingExpense) return 0;
    const allocated = splitItems.reduce((sum, item) => sum + item.amountCents, 0);
    return splittingExpense.amountCents - allocated;
  }, [splittingExpense, splitItems]);

  // Handle split expense submission
  async function handleSplitExpense() {
    if (!splittingExpense) return;
    if (splitRemainingAmount !== 0) {
      setError("Split amounts must equal the original expense amount");
      return;
    }
    if (splitItems.some((item) => item.amountCents <= 0)) {
      setError("All split items must have a positive amount");
      return;
    }

    setIsSplitting(true);
    try {
      // Create new expenses for each split item (except the first one which will update the original)
      const promises = splitItems.slice(1).map((item) =>
        createProjectExpense({
          galleryId,
          description: item.description,
          category: item.category,
          amountCents: item.amountCents,
          vendor: splittingExpense.vendor,
          isPaid: splittingExpense.isPaid,
          notes: `Split from: ${splittingExpense.description}`,
          teamMemberId: splittingExpense.teamMemberId || undefined,
          expenseDate: splittingExpense.expenseDate.toISOString().split("T")[0],
          isBillable: splittingExpense.isBillable || false,
          paymentMethod: splittingExpense.paymentMethod || undefined,
        })
      );

      // Update the original expense with the first split item
      promises.push(
        updateProjectExpense(splittingExpense.id, {
          description: splitItems[0].description,
          category: splitItems[0].category,
          amountCents: splitItems[0].amountCents,
          notes: `Split expense (${splitItems.length} parts)`,
        })
      );

      const results = await Promise.all(promises);
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        setError(`Failed to split expense: ${failed.map((r) => r.error).join(", ")}`);
      } else {
        setShowSplitModal(false);
        setSplittingExpense(null);
        setSplitItems([]);
        await loadData();
      }
    } catch {
      setError("Failed to split expense");
    } finally {
      setIsSplitting(false);
    }
  }

  // Handle quick template selection
  function handleQuickTemplate(template: typeof QUICK_TEMPLATES[0]) {
    setFormData({
      description: template.description,
      category: template.category,
      amountCents: template.defaultAmount || 0,
      vendor: "",
      isPaid: true,
      notes: `Quick add: ${template.name}`,
      teamMemberId: "",
      receiptUrl: "",
      expenseDate: new Date().toISOString().split("T")[0],
      isBillable: false,
      paymentMethod: "",
      taxCents: 0,
      mileageDistance: 0,
      mileageRateCents: mileageRate,
    });
    setShowQuickAdd(false);
    setEditingExpense(null);
    setIsModalOpen(true);
  }

  // Close quick-add dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setShowQuickAdd(false);
      }
    }
    if (showQuickAdd) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showQuickAdd]);

  // Receipt upload handler
  async function handleReceiptUpload(file: File) {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get presigned upload URL
      const urlResult = await getReceiptUploadUrl(galleryId, file.name, file.type);
      if (!urlResult.success) {
        setError(urlResult.error);
        return;
      }

      setUploadProgress(30);

      // Upload file directly to R2
      const uploadResponse = await fetch(urlResult.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      setUploadProgress(100);

      // Set the receipt URL in form data
      setFormData((prev) => ({
        ...prev,
        receiptUrl: urlResult.data.publicUrl,
      }));
    } catch (err) {
      console.error("Receipt upload error:", err);
      setError("Failed to upload receipt");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  // Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredAndSortedExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedExpenses.map((e) => e.id)));
    }
  }, [filteredAndSortedExpenses, selectedIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk operations
  async function handleBulkMarkPaid(isPaid: boolean) {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const result = await bulkUpdateExpenseStatus(Array.from(selectedIds), isPaid);
      if (!result.success) {
        setError(result.error);
        return;
      }
      clearSelection();
      await loadData();
    } catch {
      setError("Failed to update expenses");
    } finally {
      setIsBulkProcessing(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const result = await bulkDeleteExpenses(Array.from(selectedIds));
      if (!result.success) {
        setError(result.error);
        return;
      }
      clearSelection();
      setBulkDeleteConfirm(false);
      await loadData();
    } catch {
      setError("Failed to delete expenses");
    } finally {
      setIsBulkProcessing(false);
    }
  }

  // Bulk edit handler
  function openBulkEditModal() {
    setBulkEditData({
      category: "",
      paymentMethod: "",
      isBillable: null,
      isPaid: null,
    });
    setShowBulkEditModal(true);
  }

  async function handleBulkEdit() {
    if (selectedIds.size === 0) return;

    // Check if any changes were made
    const hasChanges =
      bulkEditData.category !== "" ||
      bulkEditData.paymentMethod !== "" ||
      bulkEditData.isBillable !== null ||
      bulkEditData.isPaid !== null;

    if (!hasChanges) {
      setError("Please select at least one field to update");
      return;
    }

    setIsBulkProcessing(true);
    try {
      // Update each selected expense
      const updatePromises = Array.from(selectedIds).map((id) => {
        const updates: Record<string, unknown> = {};
        if (bulkEditData.category !== "") {
          updates.category = bulkEditData.category;
        }
        if (bulkEditData.paymentMethod !== "") {
          updates.paymentMethod = bulkEditData.paymentMethod;
        }
        if (bulkEditData.isBillable !== null) {
          updates.isBillable = bulkEditData.isBillable;
        }
        if (bulkEditData.isPaid !== null) {
          updates.isPaid = bulkEditData.isPaid;
        }
        return updateProjectExpense(id, updates);
      });

      const results = await Promise.all(updatePromises);
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        setError(`Failed to update ${failed.length} expense(s)`);
      } else {
        setShowBulkEditModal(false);
        clearSelection();
        await loadData();
      }
    } catch {
      setError("Failed to update expenses");
    } finally {
      setIsBulkProcessing(false);
    }
  }

  // CSV Export
  async function handleExportCSV() {
    try {
      const result = await exportExpensesToCSV(galleryId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      // Download the CSV
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export expenses");
    }
  }

  // Clear filters
  function clearFilters() {
    setFilters({
      search: "",
      category: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
      // Advanced filters
      paymentMethod: "all",
      billable: "all",
      approvalStatus: "all",
    });
    setShowAdvancedFilters(false);
  }

  // Sort handler
  function handleSortChange(field: SortField) {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  }

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const getCategoryLabel = (cat: ExpenseCategory) => {
    return EXPENSE_CATEGORIES.find((c) => c.value === cat)?.label || cat;
  };

  const getTeamMemberName = (id: string | null) => {
    if (!id) return null;
    const member = teamMembers.find((m) => m.id === id);
    return member?.name || null;
  };

  // Keyboard navigation for expense list
  const handleExpenseKeyDown = useCallback(
    (e: React.KeyboardEvent, expense: ProjectExpense, index: number) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          toggleSelection(expense.id);
          break;
        case "ArrowDown":
          e.preventDefault();
          const nextElement = document.querySelector(
            `[data-expense-index="${index + 1}"]`
          ) as HTMLElement;
          nextElement?.focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          const prevElement = document.querySelector(
            `[data-expense-index="${index - 1}"]`
          ) as HTMLElement;
          prevElement?.focus();
          break;
      }
    },
    [toggleSelection]
  );

  // ============================================================================
  // RECURRING TEMPLATES HANDLERS
  // ============================================================================

  function resetTemplateForm() {
    setTemplateFormData({
      name: "",
      description: "",
      category: "other",
      amountCents: 0,
      vendor: "",
      frequency: "monthly",
      dayOfWeek: 1,
      dayOfMonth: 1,
      monthOfYear: 1,
    });
    setEditingTemplate(null);
  }

  function openAddTemplateModal() {
    resetTemplateForm();
    setShowTemplateModal(true);
  }

  function openEditTemplateModal(template: RecurringExpenseTemplate) {
    setEditingTemplate(template);
    setTemplateFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      amountCents: template.amountCents,
      vendor: template.vendor || "",
      frequency: template.frequency,
      dayOfWeek: template.dayOfWeek || 1,
      dayOfMonth: template.dayOfMonth || 1,
      monthOfYear: template.monthOfYear || 1,
    });
    setShowTemplateModal(true);
  }

  async function handleSaveTemplate() {
    if (!templateFormData.name || !templateFormData.description || templateFormData.amountCents <= 0) {
      setError("Name, description, and amount are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const input: CreateRecurringTemplateInput = {
        name: templateFormData.name,
        description: templateFormData.description,
        category: templateFormData.category,
        amountCents: templateFormData.amountCents,
        vendor: templateFormData.vendor || undefined,
        frequency: templateFormData.frequency,
        dayOfWeek: ["weekly", "biweekly"].includes(templateFormData.frequency) ? templateFormData.dayOfWeek : undefined,
        dayOfMonth: ["monthly", "quarterly", "yearly"].includes(templateFormData.frequency) ? templateFormData.dayOfMonth : undefined,
        monthOfYear: templateFormData.frequency === "yearly" ? templateFormData.monthOfYear : undefined,
      };

      if (editingTemplate) {
        const result = await updateRecurringTemplate(editingTemplate.id, input);
        if (!result.success) {
          setError(result.error);
          return;
        }
      } else {
        const result = await createRecurringTemplate(input);
        if (!result.success) {
          setError(result.error);
          return;
        }
      }

      setShowTemplateModal(false);
      resetTemplateForm();
      await loadData();
    } catch {
      setError("Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTemplate(templateId: string) {
    try {
      const result = await deleteRecurringTemplate(templateId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      await loadData();
    } catch {
      setError("Failed to delete template");
    }
  }

  async function handleApplyTemplate(templateId: string) {
    try {
      const result = await generateExpenseFromTemplate(templateId, galleryId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShowApplyTemplateModal(false);
      await loadData();
    } catch {
      setError("Failed to apply template");
    }
  }

  const getFrequencyLabel = (freq: RecurrenceFrequency) => {
    const labels: Record<RecurrenceFrequency, string> = {
      weekly: "Weekly",
      biweekly: "Every 2 Weeks",
      monthly: "Monthly",
      quarterly: "Quarterly",
      yearly: "Yearly",
    };
    return labels[freq] || freq;
  };

  // ============================================================================
  // APPROVAL WORKFLOW HANDLERS
  // ============================================================================

  async function handleSubmitForApproval(expenseId: string) {
    try {
      const result = await submitExpenseForApproval(expenseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      await loadData();
    } catch {
      setError("Failed to submit for approval");
    }
  }

  async function handleApproveExpense(expenseId: string) {
    try {
      const result = await approveExpense(expenseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      await loadData();
    } catch {
      setError("Failed to approve expense");
    }
  }

  async function handleRejectExpense() {
    if (!rejectingExpenseId || !rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    try {
      const result = await rejectExpense(rejectingExpenseId, rejectionReason);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShowRejectModal(false);
      setRejectingExpenseId(null);
      setRejectionReason("");
      await loadData();
    } catch {
      setError("Failed to reject expense");
    }
  }

  const getApprovalStatusColor = (status: ExpenseApprovalStatus) => {
    switch (status) {
      case "pending": return "text-[var(--warning)]";
      case "approved": return "text-[var(--success)]";
      case "rejected": return "text-[var(--error)]";
      default: return "text-foreground-muted";
    }
  };

  const getApprovalStatusLabel = (status: ExpenseApprovalStatus) => {
    switch (status) {
      case "pending": return "Pending Approval";
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      default: return "";
    }
  };

  // ============================================================================
  // BUDGET HANDLERS
  // ============================================================================

  async function handleSaveBudget() {
    try {
      const result = await upsertProjectBudget(galleryId, budgetFormData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShowBudgetModal(false);
      await loadData();
    } catch {
      setError("Failed to save budget");
    }
  }

  const getBudgetStatusColor = (status: BudgetStatus["status"]) => {
    switch (status) {
      case "ok": return "text-[var(--success)]";
      case "warning": return "text-[var(--warning)]";
      case "critical": return "text-orange-500";
      case "over": return "text-[var(--error)]";
      default: return "text-foreground-muted";
    }
  };

  const getBudgetBarColor = (percentUsed: number | null, status: BudgetStatus["status"]) => {
    if (percentUsed === null) return "bg-[var(--foreground-muted)]";
    if (status === "over" || percentUsed > 100) return "bg-[var(--error)]";
    if (status === "critical") return "bg-orange-500";
    if (status === "warning") return "bg-[var(--warning)]";
    return "bg-[var(--success)]";
  };

  // ============================================================================
  // PDF REPORT HANDLERS
  // ============================================================================

  async function handleGeneratePDFReport() {
    setIsGeneratingReport(true);
    try {
      const dateFrom = reportDateFrom ? new Date(reportDateFrom) : undefined;
      const dateTo = reportDateTo ? new Date(reportDateTo) : undefined;

      const result = await generateExpenseReport(galleryId, dateFrom, dateTo);
      if (!result.success) {
        setError(result.error);
        return;
      }

      // Generate a simple HTML report that can be printed as PDF
      const reportData = result.data;
      const htmlContent = generateHTMLReport(reportData);

      // Open in new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        // Auto-trigger print dialog
        setTimeout(() => printWindow.print(), 500);
      }

      setShowReportModal(false);
    } catch {
      setError("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  }

  function generateHTMLReport(data: ExpenseReportData): string {
    const formatReportCurrency = (cents: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

    const formatReportDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense Report - ${data.projectName}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
          .summary-card { padding: 16px; background: #f9f9f9; border-radius: 8px; }
          .summary-label { font-size: 12px; color: #666; }
          .summary-value { font-size: 24px; font-weight: bold; margin-top: 4px; }
          .category-list { margin-bottom: 24px; }
          .category-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th, td { padding: 12px 8px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f5f5f5; font-weight: 600; }
          .status-paid { color: #22c55e; }
          .status-unpaid { color: #f59e0b; }
          .budget-section { margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Expense Report</h1>
        <div class="meta">
          <strong>${data.projectName}</strong><br>
          Generated: ${formatReportDate(data.generatedAt)}<br>
          Period: ${formatReportDate(data.dateRange.from)} - ${formatReportDate(data.dateRange.to)}
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Expenses</div>
            <div class="summary-value">${formatReportCurrency(data.summary.totalExpenses)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Paid</div>
            <div class="summary-value" style="color: #22c55e;">${formatReportCurrency(data.summary.totalPaid)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Unpaid</div>
            <div class="summary-value" style="color: #f59e0b;">${formatReportCurrency(data.summary.totalUnpaid)}</div>
          </div>
        </div>

        <h2>By Category</h2>
        <div class="category-list">
          ${data.summary.byCategory.map(cat => `
            <div class="category-item">
              <span>${getCategoryLabel(cat.category)} (${cat.count})</span>
              <span><strong>${formatReportCurrency(cat.amount)}</strong> (${cat.percentage}%)</span>
            </div>
          `).join("")}
        </div>

        ${data.budget ? `
          <div class="budget-section">
            <h2 style="margin-top: 0;">Budget Status</h2>
            <p>Budget: ${data.budget.totalBudget ? formatReportCurrency(data.budget.totalBudget) : "Not set"}</p>
            <p>Spent: ${formatReportCurrency(data.budget.totalSpent)} ${data.budget.percentUsed !== null ? `(${data.budget.percentUsed}%)` : ""}</p>
            <p>Remaining: ${data.budget.remaining !== null ? formatReportCurrency(data.budget.remaining) : "N/A"}</p>
            <p>Status: <strong style="color: ${data.budget.status === "ok" ? "#22c55e" : data.budget.status === "warning" ? "#f59e0b" : "#ef4444"}">${data.budget.status.toUpperCase()}</strong></p>
          </div>
        ` : ""}

        <h2>Expense Details (${data.summary.expenseCount})</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.expenses.map(exp => `
              <tr>
                <td>${formatReportDate(exp.date)}</td>
                <td>${exp.description}</td>
                <td>${getCategoryLabel(exp.category)}</td>
                <td>${exp.vendor || "-"}</td>
                <td>${formatReportCurrency(exp.amount)}</td>
                <td class="${exp.isPaid ? "status-paid" : "status-unpaid"}">${exp.isPaid ? "Paid" : "Unpaid"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)} role="status" aria-label="Loading expenses">
        <RefreshIcon className="h-6 w-6 animate-spin text-foreground-muted" />
        <span className="sr-only">Loading expense data...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)} role="region" aria-label="Project Profit & Loss">
      {/* Error */}
      {error && (
        <div
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between"
          role="alert"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-500/20 rounded"
            aria-label="Dismiss error"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* P&L Summary Cards */}
      {plSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="group" aria-label="Financial summary">
          {/* Revenue Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
              <DollarIcon className="h-4 w-4" />
              <span>Revenue</span>
            </div>
            <div className="text-2xl font-bold text-[var(--success)]" aria-label={`Total revenue: ${formatCurrency(plSummary.revenue.total)}`}>
              {formatCurrency(plSummary.revenue.total)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              {plSummary.revenue.paid > 0 && (
                <span className="text-[var(--success)]">
                  {formatCurrency(plSummary.revenue.paid)} paid
                </span>
              )}
              {plSummary.revenue.pending > 0 && (
                <span className="ml-2 text-[var(--warning)]">
                  {formatCurrency(plSummary.revenue.pending)} pending
                </span>
              )}
            </div>
          </div>

          {/* Expenses Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
              <TrendDownIcon className="h-4 w-4" />
              <span>Expenses</span>
            </div>
            <div className="text-2xl font-bold text-[var(--error)]" aria-label={`Total expenses: ${formatCurrency(plSummary.expenses.total)}`}>
              {formatCurrency(plSummary.expenses.total)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              {plSummary.expenses.itemCount} expense{plSummary.expenses.itemCount !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Profit Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
              <TrendUpIcon className="h-4 w-4" />
              <span>Net Profit</span>
            </div>
            <div
              className={cn(
                "text-2xl font-bold",
                plSummary.profit.gross >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
              )}
              aria-label={`Net profit: ${formatCurrency(plSummary.profit.gross)}`}
            >
              {formatCurrency(plSummary.profit.gross)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              {plSummary.profit.margin}% margin
            </div>
          </div>
        </div>
      )}

      {/* Budget Status Alert */}
      {budgetStatus && budgetStatus.alerts.length > 0 && (
        <div className="space-y-2">
          {budgetStatus.alerts.map((alert, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg border flex items-center gap-3",
                alert.type === "over" && "bg-[var(--error)]/10 border-[var(--error)]/20 text-[var(--error)]",
                alert.type === "critical" && "bg-orange-500/10 border-orange-500/20 text-orange-500",
                alert.type === "warning" && "bg-[var(--warning)]/10 border-[var(--warning)]/20 text-[var(--warning)]"
              )}
              role="alert"
            >
              <AlertTriangleIcon className="h-5 w-5 shrink-0" />
              <div className="flex-1">
                <span className="font-medium">
                  {alert.type === "over" ? "Over Budget" : alert.type === "critical" ? "Critical" : "Warning"}:
                </span>{" "}
                <span>
                  {alert.category === "total" ? "Total budget" : getCategoryLabel(alert.category as ExpenseCategory)}
                  {" "}is at {alert.percentUsed}% ({formatCurrency(alert.spentCents)} of {formatCurrency(alert.budgetCents)})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Features Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant={activeAdvancedTab === "expenses" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveAdvancedTab("expenses")}
          >
            <DollarIcon className="h-4 w-4 mr-1" />
            Expenses
          </Button>
          <Button
            variant={activeAdvancedTab === "templates" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveAdvancedTab("templates")}
          >
            <RepeatIcon className="h-4 w-4 mr-1" />
            Templates
            {recurringTemplates.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--background-secondary)]">
                {recurringTemplates.length}
              </span>
            )}
          </Button>
          <Button
            variant={activeAdvancedTab === "budget" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveAdvancedTab("budget")}
          >
            <WalletIcon className="h-4 w-4 mr-1" />
            Budget
            {budgetStatus && budgetStatus.status !== "ok" && (
              <span className={cn(
                "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                budgetStatus.status === "over" && "bg-[var(--error)]/20 text-[var(--error)]",
                budgetStatus.status === "critical" && "bg-orange-500/20 text-orange-500",
                budgetStatus.status === "warning" && "bg-[var(--warning)]/20 text-[var(--warning)]"
              )}>
                !
              </span>
            )}
          </Button>
          <Button
            variant={activeAdvancedTab === "analytics" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveAdvancedTab("analytics")}
          >
            <TrendingIcon className="h-4 w-4 mr-1" />
            Analytics
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {recurringTemplates.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowApplyTemplateModal(true)}>
              <PlayIcon className="h-4 w-4 mr-1" />
              Apply Template
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowReportModal(true)}>
            <FileTextIcon className="h-4 w-4 mr-1" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* Expense Breakdown by Category with Pie Chart */}
      {activeAdvancedTab === "expenses" && plSummary && plSummary.expenses.byCategory.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h3 className="font-semibold text-foreground mb-4">Expenses by Category</h3>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Pie Chart */}
            <div className="flex-shrink-0">
              <ExpensePieChart
                data={plSummary.expenses.byCategory}
                total={plSummary.expenses.total}
                getCategoryLabel={getCategoryLabel}
              />
            </div>

            {/* Category List */}
            <div className="flex-1 space-y-2" role="list" aria-label="Expense breakdown by category">
              {plSummary.expenses.byCategory.map((cat, i) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
                  role="listitem"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-foreground">
                      {getCategoryLabel(cat.category)}
                    </span>
                    <span className="text-xs text-foreground-muted">
                      ({cat.count})
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(cat.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab Content */}
      {activeAdvancedTab === "templates" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recurring Expense Templates</h3>
            <Button size="sm" onClick={openAddTemplateModal}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Template
            </Button>
          </div>
          {recurringTemplates.length === 0 ? (
            <div className="p-8 text-center">
              <RepeatIcon className="h-10 w-10 mx-auto text-foreground-muted mb-3" />
              <p className="text-foreground-muted">No recurring templates yet</p>
              <p className="text-sm text-foreground-muted mt-1">
                Create templates for expenses that occur regularly
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--card-border)]">
              {recurringTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--background-hover)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{template.name}</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                        {getFrequencyLabel(template.frequency)}
                      </span>
                      {!template.isActive && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--foreground-muted)]/10 text-foreground-muted">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-foreground-muted mt-1">
                      {template.description} • {getCategoryLabel(template.category)} • {formatCurrency(template.amountCents)}
                    </div>
                    {template.nextDueDate && (
                      <div className="text-xs text-foreground-muted mt-1 flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        Next: {formatDate(template.nextDueDate)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleApplyTemplate(template.id)}
                      className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-[var(--primary)] transition-colors"
                      title="Apply template now"
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditTemplateModal(template)}
                      className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] transition-colors"
                      title="Edit template"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-[var(--error)] transition-colors"
                      title="Delete template"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Budget Tab Content */}
      {activeAdvancedTab === "budget" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Budget Tracking</h3>
            <Button size="sm" onClick={() => setShowBudgetModal(true)}>
              <SettingsIcon className="h-4 w-4 mr-1" />
              Configure
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {/* Overall Budget */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Total Budget</span>
                <span className={cn("text-sm font-medium", getBudgetStatusColor(budgetStatus?.status || "ok"))}>
                  {budgetStatus?.percentUsed !== null && budgetStatus?.percentUsed !== undefined ? `${budgetStatus.percentUsed}%` : "Not set"}
                </span>
              </div>
              <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    getBudgetBarColor(budgetStatus?.percentUsed ?? null, budgetStatus?.status || "ok")
                  )}
                  style={{ width: `${Math.min(100, budgetStatus?.percentUsed || 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-foreground-muted">
                <span>Spent: {formatCurrency(budgetStatus?.totalSpent || 0)}</span>
                <span>
                  {budgetStatus?.budget.totalBudgetCents
                    ? `Budget: ${formatCurrency(budgetStatus.budget.totalBudgetCents)}`
                    : "No budget set"}
                </span>
              </div>
            </div>

            {/* Category Budgets */}
            {budgetStatus && budgetStatus.budget.byCategory.some(c => c.budgetCents !== null) && (
              <div className="space-y-3 pt-4 border-t border-[var(--card-border)]">
                <h4 className="text-sm font-medium text-foreground">By Category</h4>
                {budgetStatus.budget.byCategory
                  .filter(c => c.budgetCents !== null || c.spentCents > 0)
                  .map((cat) => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground-muted">{getCategoryLabel(cat.category)}</span>
                        <span className="text-xs text-foreground-muted">
                          {formatCurrency(cat.spentCents)}
                          {cat.budgetCents !== null && ` / ${formatCurrency(cat.budgetCents)}`}
                        </span>
                      </div>
                      {cat.budgetCents !== null && (
                        <div className="h-1.5 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              cat.percentUsed !== null && cat.percentUsed > 100 ? "bg-[var(--error)]" :
                              cat.percentUsed !== null && cat.percentUsed >= 80 ? "bg-[var(--warning)]" :
                              "bg-[var(--success)]"
                            )}
                            style={{ width: `${Math.min(100, cat.percentUsed || 0)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {!budgetStatus?.budget.totalBudgetCents && (
              <div className="text-center py-4">
                <WalletIcon className="h-8 w-8 mx-auto text-foreground-muted mb-2" />
                <p className="text-sm text-foreground-muted">No budget configured</p>
                <Button variant="ghost" size="sm" onClick={() => setShowBudgetModal(true)} className="mt-2">
                  Set Budget
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab Content */}
      {activeAdvancedTab === "analytics" && (
        <div className="space-y-6">
          {expenses.length === 0 ? (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
              <TrendingIcon className="h-12 w-12 mx-auto text-foreground-muted mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No Expense Data</h3>
              <p className="text-sm text-foreground-muted">
                Add expenses to see analytics and insights
              </p>
            </div>
          ) : (
            <>
              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <div className="text-xs text-foreground-muted mb-1">Total Spent</div>
                  <div className="text-xl font-bold text-foreground">
                    {formatCurrency(analyticsData.totalSpent)}
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <div className="text-xs text-foreground-muted mb-1">Avg per Expense</div>
                  <div className="text-xl font-bold text-foreground">
                    {formatCurrency(analyticsData.averageExpense)}
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <div className="text-xs text-foreground-muted mb-1">Top Category</div>
                  <div className="text-xl font-bold text-foreground truncate">
                    {analyticsData.topCategory?.name || "—"}
                  </div>
                  {analyticsData.topCategory && (
                    <div className="text-xs text-foreground-muted">
                      {formatCurrency(analyticsData.topCategory.value * 100)}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <div className="text-xs text-foreground-muted mb-1">Expense Count</div>
                  <div className="text-xl font-bold text-foreground">
                    {expenses.length}
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Trend Chart */}
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <h4 className="font-semibold text-foreground mb-4">Spending Over Time</h4>
                  {analyticsData.monthlyTrend.length > 1 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                          <XAxis
                            dataKey="label"
                            tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
                            axisLine={{ stroke: "var(--card-border)" }}
                          />
                          <YAxis
                            tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
                            axisLine={{ stroke: "var(--card-border)" }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--card)",
                              border: "1px solid var(--card-border)",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                          />
                          <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-sm text-foreground-muted">
                      Need more data to show trends
                    </div>
                  )}
                </div>

                {/* Category Breakdown Pie Chart */}
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <h4 className="font-semibold text-foreground mb-4">By Category</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={{ stroke: "var(--foreground-muted)" }}
                        >
                          {analyticsData.categoryBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--card-border)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Additional Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Method Breakdown */}
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <h4 className="font-semibold text-foreground mb-4">By Payment Method</h4>
                  <div className="space-y-3">
                    {analyticsData.paymentMethodBreakdown.map((method, index) => {
                      const percentage = (method.value / (analyticsData.totalSpent / 100)) * 100;
                      return (
                        <div key={method.method}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-foreground">{method.name}</span>
                            <span className="text-sm text-foreground-muted">
                              {formatCurrency(method.value * 100)} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Billable vs Non-Billable */}
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <h4 className="font-semibold text-foreground mb-4">Billable vs Non-Billable</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Billable", value: analyticsData.billableVsNonBillable.billable / 100 },
                            { name: "Non-Billable", value: analyticsData.billableVsNonBillable.nonBillable / 100 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) =>
                            percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                          }
                          labelLine={{ stroke: "var(--foreground-muted)" }}
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#6366f1" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--card-border)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-[var(--success)]">
                        {formatCurrency(analyticsData.billableVsNonBillable.billable)}
                      </div>
                      <div className="text-xs text-foreground-muted">Billable</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#6366f1]">
                        {formatCurrency(analyticsData.billableVsNonBillable.nonBillable)}
                      </div>
                      <div className="text-xs text-foreground-muted">Non-Billable</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Details Table */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
                <div className="p-4 border-b border-[var(--card-border)]">
                  <h4 className="font-semibold text-foreground">Category Details</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                        <th className="text-left p-3 text-xs font-medium text-foreground-muted">Category</th>
                        <th className="text-right p-3 text-xs font-medium text-foreground-muted">Amount</th>
                        <th className="text-right p-3 text-xs font-medium text-foreground-muted">% of Total</th>
                        <th className="text-right p-3 text-xs font-medium text-foreground-muted">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.categoryBreakdown.map((cat, index) => {
                        const count = expenses.filter((e) => e.category === cat.category).length;
                        const percentage = (cat.value / (analyticsData.totalSpent / 100)) * 100;
                        return (
                          <tr key={cat.category} className="border-b border-[var(--card-border)] last:border-0">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                <span className="text-sm text-foreground">{cat.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-right text-sm text-foreground">
                              {formatCurrency(cat.value * 100)}
                            </td>
                            <td className="p-3 text-right text-sm text-foreground-muted">
                              {percentage.toFixed(1)}%
                            </td>
                            <td className="p-3 text-right text-sm text-foreground-muted">{count}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Expenses List */}
      {activeAdvancedTab === "expenses" && (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        {/* Header with Search, Filters, and Actions */}
        <div className="p-4 border-b border-[var(--card-border)] space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="font-semibold text-foreground">Expenses</h3>
            <div className="flex items-center gap-2">
              {recurringTemplates.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await handleLoadForecast();
                    setShowForecastModal(true);
                  }}
                  aria-label="View expense forecast"
                >
                  <TrendingIcon className="h-4 w-4 mr-1" />
                  Forecast
                </Button>
              )}
              {expenses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportCSV}
                  aria-label="Export expenses to CSV"
                >
                  <DownloadIcon className="h-4 w-4 mr-1" />
                  Export
                </Button>
              )}
              {/* Quick Add Dropdown */}
              <div className="relative" ref={quickAddRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  aria-label="Quick add common expense"
                  aria-expanded={showQuickAdd}
                  aria-haspopup="menu"
                >
                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                  Quick Add
                </Button>
                {showQuickAdd && (
                  <div
                    className="absolute right-0 top-full mt-1 w-64 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-y-auto"
                    role="menu"
                  >
                    <div className="px-3 py-2 text-xs font-medium text-foreground-muted border-b border-[var(--card-border)]">
                      Quick Add Templates
                    </div>
                    {QUICK_TEMPLATES.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => handleQuickTemplate(template)}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--background-secondary)] transition-colors flex items-center gap-2"
                        role="menuitem"
                      >
                        <span className="text-lg">{template.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-foreground">{template.name}</div>
                          <div className="text-xs text-foreground-muted">{template.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button size="sm" onClick={openAddModal} aria-label="Add new expense">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Search, Sort, and Filter Row */}
          {expenses.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search expenses..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                  aria-label="Search expenses by description or vendor"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1">
                <SortIcon className="h-4 w-4 text-foreground-muted" />
                <select
                  value={`${sort.field}-${sort.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split("-") as [SortField, SortDirection];
                    setSort({ field, direction });
                  }}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                  aria-label="Sort expenses"
                >
                  <option value="date-desc">Date (Newest)</option>
                  <option value="date-asc">Date (Oldest)</option>
                  <option value="amount-desc">Amount (High to Low)</option>
                  <option value="amount-asc">Amount (Low to High)</option>
                  <option value="category-asc">Category (A-Z)</option>
                  <option value="category-desc">Category (Z-A)</option>
                  <option value="description-asc">Name (A-Z)</option>
                  <option value="description-desc">Name (Z-A)</option>
                </select>
              </div>

              {/* Filter Toggle */}
              <Button
                variant={showFilters ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="expense-filters"
              >
                <FilterIcon className="h-4 w-4 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--primary)] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && expenses.length > 0 && (
            <div
              id="expense-filters"
              className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[var(--card-border)]"
              role="group"
              aria-label="Filter options"
            >
              {/* Category Filter */}
              <div>
                <label htmlFor="filter-category" className="block text-xs text-foreground-muted mb-1">
                  Category
                </label>
                <select
                  id="filter-category"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value as ExpenseCategory | "all" })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                >
                  <option value="all">All Categories</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="filter-status" className="block text-xs text-foreground-muted mb-1">
                  Status
                </label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as "all" | "paid" | "unpaid" })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label htmlFor="filter-date-from" className="block text-xs text-foreground-muted mb-1">
                  From Date
                </label>
                <Input
                  id="filter-date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label htmlFor="filter-date-to" className="block text-xs text-foreground-muted mb-1">
                  To Date
                </label>
                <Input
                  id="filter-date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="text-sm"
                />
              </div>

              {/* Advanced Filters Toggle */}
              <div className="col-span-2 md:col-span-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  <ChevronDownIcon className={cn("h-3 w-3 transition-transform", showAdvancedFilters && "rotate-180")} />
                  {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
                </button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <>
                  {/* Payment Method Filter */}
                  <div>
                    <label htmlFor="filter-payment-method" className="block text-xs text-foreground-muted mb-1">
                      Payment Method
                    </label>
                    <select
                      id="filter-payment-method"
                      value={filters.paymentMethod}
                      onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value as PaymentMethod | "all" })}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                    >
                      <option value="all">All Methods</option>
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Billable Filter */}
                  <div>
                    <label htmlFor="filter-billable" className="block text-xs text-foreground-muted mb-1">
                      Billable Status
                    </label>
                    <select
                      id="filter-billable"
                      value={filters.billable}
                      onChange={(e) => setFilters({ ...filters, billable: e.target.value as "all" | "billable" | "non-billable" })}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                    >
                      <option value="all">All</option>
                      <option value="billable">Billable</option>
                      <option value="non-billable">Non-Billable</option>
                    </select>
                  </div>

                  {/* Approval Status Filter */}
                  <div>
                    <label htmlFor="filter-approval-status" className="block text-xs text-foreground-muted mb-1">
                      Approval Status
                    </label>
                    <select
                      id="filter-approval-status"
                      value={filters.approvalStatus}
                      onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value as ExpenseApprovalStatus | "all" })}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                    >
                      <option value="all">All Status</option>
                      {APPROVAL_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <div className="col-span-2 md:col-span-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div
            className="p-3 bg-[var(--primary)]/10 border-b border-[var(--card-border)] flex items-center justify-between flex-wrap gap-2"
            role="toolbar"
            aria-label="Bulk actions"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{selectedIds.size} selected</span>
              <button
                onClick={clearSelection}
                className="text-foreground-muted hover:text-foreground underline text-xs"
                aria-label="Clear selection"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={openBulkEditModal}
                disabled={isBulkProcessing}
                aria-label="Edit selected expenses"
              >
                <EditIcon className="h-4 w-4 mr-1" />
                Bulk Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkMarkPaid(true)}
                disabled={isBulkProcessing}
                aria-label="Mark selected as paid"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Mark Paid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkMarkPaid(false)}
                disabled={isBulkProcessing}
                aria-label="Mark selected as unpaid"
              >
                Mark Unpaid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={isBulkProcessing}
                className="text-[var(--error)] hover:text-[var(--error)]"
                aria-label="Delete selected expenses"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Expense List */}
        {filteredAndSortedExpenses.length === 0 ? (
          <div className="p-8 text-center">
            {expenses.length === 0 ? (
              <>
                <DollarIcon className="h-10 w-10 mx-auto text-foreground-muted mb-3" />
                <p className="text-foreground-muted">No expenses recorded yet</p>
                <p className="text-sm text-foreground-muted mt-1">
                  Track project costs to see your true profit
                </p>
              </>
            ) : (
              <>
                <SearchIcon className="h-10 w-10 mx-auto text-foreground-muted mb-3" />
                <p className="text-foreground-muted">No expenses match your filters</p>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div role="list" aria-label="Expense list">
            {/* Select All Header */}
            {filteredAndSortedExpenses.length > 1 && (
              <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredAndSortedExpenses.length}
                  onChange={toggleSelectAll}
                  className="rounded border-[var(--card-border)]"
                  aria-label={selectedIds.size === filteredAndSortedExpenses.length ? "Deselect all expenses" : "Select all expenses"}
                />
                <span className="text-xs text-foreground-muted">
                  {selectedIds.size === filteredAndSortedExpenses.length ? "Deselect all" : "Select all"} ({filteredAndSortedExpenses.length})
                </span>
              </div>
            )}

            {/* Expense Items */}
            <div className="divide-y divide-[var(--card-border)]">
              {filteredAndSortedExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  ref={index === 0 ? firstExpenseRef : undefined}
                  data-expense-index={index}
                  tabIndex={0}
                  role="listitem"
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-[var(--background-hover)] transition-colors group focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-inset",
                    selectedIds.has(expense.id) && "bg-[var(--primary)]/5"
                  )}
                  onKeyDown={(e) => handleExpenseKeyDown(e, expense, index)}
                  aria-selected={selectedIds.has(expense.id)}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(expense.id)}
                    onChange={() => toggleSelection(expense.id)}
                    className="rounded border-[var(--card-border)] shrink-0"
                    aria-label={`Select expense: ${expense.description}`}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">
                        {expense.description}
                      </span>
                      {!expense.isPaid && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20">
                          Unpaid
                        </span>
                      )}
                      {expense.receiptUrl && (
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-[var(--background-secondary)] text-foreground-muted hover:text-[var(--primary)]"
                          title="View receipt"
                          aria-label={`View receipt for ${expense.description}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ReceiptIcon className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-foreground-muted flex-wrap">
                      <span>{getCategoryLabel(expense.category)}</span>
                      {expense.vendor && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>{expense.vendor}</span>
                        </>
                      )}
                      {expense.teamMemberId && getTeamMemberName(expense.teamMemberId) && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            {getTeamMemberName(expense.teamMemberId)}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">•</span>
                      <span>{formatDate(expense.expenseDate)}</span>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-semibold text-foreground" aria-label={`Amount: ${formatCurrency(expense.amountCents)}`}>
                      {formatCurrency(expense.amountCents)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePaid(expense.id); }}
                        className={cn(
                          "p-1.5 rounded hover:bg-[var(--background-secondary)] transition-colors",
                          expense.isPaid ? "text-[var(--success)]" : "text-foreground-muted"
                        )}
                        title={expense.isPaid ? "Mark as unpaid" : "Mark as paid"}
                        aria-label={expense.isPaid ? "Mark as unpaid" : "Mark as paid"}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(expense); }}
                        className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] transition-colors"
                        title="Edit expense"
                        aria-label={`Edit expense: ${expense.description}`}
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicateExpense(expense.id); }}
                        className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] transition-colors"
                        title="Duplicate expense"
                        aria-label={`Duplicate expense: ${expense.description}`}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openSplitModal(expense); }}
                        className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] transition-colors"
                        title="Split expense"
                        aria-label={`Split expense: ${expense.description}`}
                      >
                        <SplitIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(expense.id); }}
                        className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-[var(--error)] transition-colors"
                        title="Delete expense"
                        aria-label={`Delete expense: ${expense.description}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {filteredAndSortedExpenses.length > 0 && (filters.search || activeFilterCount > 0) && (
          <div className="px-4 py-2 border-t border-[var(--card-border)] text-xs text-foreground-muted">
            Showing {filteredAndSortedExpenses.length} of {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
      )}

      {/* Add/Edit Expense Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label htmlFor="expense-description" className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-[var(--error)]">*</span>
              </label>
              <Input
                id="expense-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Photographer fee, Travel expenses"
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expense-amount" className="block text-sm font-medium text-foreground mb-1.5">
                  Amount <span className="text-[var(--error)]">*</span>
                </label>
                <Input
                  id="expense-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountCents / 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amountCents: Math.round(parseFloat(e.target.value || "0") * 100),
                    })
                  }
                  placeholder="0.00"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="expense-date" className="block text-sm font-medium text-foreground mb-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />
                  Expense Date
                </label>
                <Input
                  id="expense-date"
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expense-category" className="block text-sm font-medium text-foreground mb-1.5">
                  Category
                </label>
                <select
                  id="expense-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expense-vendor" className="block text-sm font-medium text-foreground mb-1.5">
                  Vendor/Payee
                </label>
                <div className="relative">
                  <Input
                    id="expense-vendor"
                    value={formData.vendor || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, vendor: e.target.value });
                      // Search vendors as user types
                      if (e.target.value.length >= 2) {
                        searchVendors(e.target.value).then((result) => {
                          if (result.success && result.data) {
                            setVendorSuggestions(result.data);
                          }
                        });
                      } else {
                        setVendorSuggestions([]);
                      }
                    }}
                    onFocus={() => {
                      if (formData.vendor && formData.vendor.length >= 2) {
                        searchVendors(formData.vendor).then((result) => {
                          if (result.success && result.data) {
                            setVendorSuggestions(result.data);
                          }
                        });
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding to allow click on suggestion
                      setTimeout(() => setVendorSuggestions([]), 200);
                    }}
                    placeholder="e.g., Company name"
                    autoComplete="off"
                  />
                  {vendorSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {vendorSuggestions.map((vendor) => (
                        <button
                          key={vendor.id}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--background-hover)] flex items-center justify-between"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              vendor: vendor.name,
                              paymentMethod: vendor.defaultPaymentMethod || formData.paymentMethod,
                            });
                            setVendorSuggestions([]);
                          }}
                        >
                          <span>{vendor.name}</span>
                          <span className="text-xs text-foreground-muted">{vendor.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method & Tax */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expense-payment-method" className="block text-sm font-medium text-foreground mb-1.5">
                  Payment Method
                </label>
                <select
                  id="expense-payment-method"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod | "" })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="">Select method...</option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expense-tax" className="block text-sm font-medium text-foreground mb-1.5">
                  Tax Amount
                </label>
                <Input
                  id="expense-tax"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.taxCents > 0 ? formData.taxCents / 100 : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taxCents: Math.round(parseFloat(e.target.value || "0") * 100),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Mileage Calculator */}
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
              <div className="flex items-center gap-2 mb-3">
                <CarIcon className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm font-medium">Mileage Calculator</span>
                <span className="text-xs text-foreground-muted ml-auto">
                  Rate: ${(mileageRate / 100).toFixed(2)}/mi
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="expense-mileage" className="block text-xs text-foreground-muted mb-1">
                    Miles Driven
                  </label>
                  <Input
                    id="expense-mileage"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.mileageDistance > 0 ? formData.mileageDistance : ""}
                    onChange={(e) => {
                      const distance = parseFloat(e.target.value || "0");
                      const calculatedAmount = Math.round(distance * mileageRate);
                      setFormData({
                        ...formData,
                        mileageDistance: distance,
                        mileageRateCents: mileageRate,
                        // Auto-fill amount if empty or was previously mileage-calculated
                        amountCents: formData.amountCents === 0 || formData.mileageDistance > 0
                          ? calculatedAmount
                          : formData.amountCents,
                      });
                    }}
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-foreground-muted mb-1">
                    Calculated Amount
                  </label>
                  <div className="px-3 py-2 bg-[var(--background)] rounded-lg border border-[var(--card-border)] text-sm text-foreground-muted">
                    {formData.mileageDistance > 0
                      ? formatCurrency(Math.round(formData.mileageDistance * mileageRate))
                      : "$0.00"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="expense-team-member" className="block text-sm font-medium text-foreground mb-1.5">
                Team Member
              </label>
              <select
                id="expense-team-member"
                value={formData.teamMemberId || ""}
                onChange={(e) => setFormData({ ...formData, teamMemberId: e.target.value })}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">No assignment</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Receipt
              </label>
              <div className="space-y-2">
                {formData.receiptUrl ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background-secondary)]">
                    <ReceiptIcon className="h-4 w-4 text-[var(--success)]" />
                    <a
                      href={formData.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--primary)] hover:underline truncate flex-1"
                    >
                      View Receipt
                    </a>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, receiptUrl: "" })}
                      className="p-1 hover:bg-[var(--background-hover)] rounded text-foreground-muted"
                      aria-label="Remove receipt"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReceiptUpload(file);
                      }}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex-1"
                    >
                      <UploadIcon className="h-4 w-4 mr-1" />
                      {isUploading ? `Uploading... ${uploadProgress}%` : "Upload Receipt"}
                    </Button>
                    <span className="text-xs text-foreground-muted">or</span>
                    <Input
                      type="url"
                      placeholder="Paste URL..."
                      value={formData.receiptUrl || ""}
                      onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                      className="flex-1 text-sm"
                    />
                  </div>
                )}
                {isUploading && (
                  <div className="h-1 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Checkboxes Row */}
            <div className="flex items-center gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPaid}
                    onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                    className="rounded"
                    aria-describedby="expense-paid-description"
                  />
                  <span>Expense has been paid</span>
                </label>
                <p id="expense-paid-description" className="sr-only">
                  Check this box if you have already paid this expense
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBillable}
                    onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
                    className="rounded"
                    aria-describedby="expense-billable-description"
                  />
                  <span className="flex items-center gap-1">
                    Billable to client
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px]">$</span>
                  </span>
                </label>
                <p id="expense-billable-description" className="sr-only">
                  Check this box if this expense can be billed to the client
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="expense-notes" className="block text-sm font-medium text-foreground mb-1.5">
                Notes
              </label>
              <Textarea
                id="expense-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details..."
                rows={2}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Saving..." : editingExpense ? "Save Changes" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-foreground-muted">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog
        open={bulkDeleteConfirm}
        onOpenChange={(open) => !open && setBulkDeleteConfirm(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} Expenses</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-foreground-muted">
              Are you sure you want to delete {selectedIds.size} expense{selectedIds.size !== 1 ? "s" : ""}? This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
            >
              {isBulkProcessing ? "Deleting..." : `Delete ${selectedIds.size} Expense${selectedIds.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recurring Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={(open) => !open && setShowTemplateModal(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Recurring Template"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Template Name <span className="text-[var(--error)]">*</span>
              </label>
              <Input
                value={templateFormData.name}
                onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                placeholder="e.g., Monthly Software Subscription"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-[var(--error)]">*</span>
              </label>
              <Input
                value={templateFormData.description}
                onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                placeholder="Expense description when applied"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Amount <span className="text-[var(--error)]">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={templateFormData.amountCents / 100}
                  onChange={(e) =>
                    setTemplateFormData({
                      ...templateFormData,
                      amountCents: Math.round(parseFloat(e.target.value || "0") * 100),
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={templateFormData.category}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Vendor
              </label>
              <Input
                value={templateFormData.vendor}
                onChange={(e) => setTemplateFormData({ ...templateFormData, vendor: e.target.value })}
                placeholder="Optional vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Frequency
              </label>
              <select
                value={templateFormData.frequency}
                onChange={(e) =>
                  setTemplateFormData({ ...templateFormData, frequency: e.target.value as RecurrenceFrequency })
                }
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every 2 Weeks</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {["weekly", "biweekly"].includes(templateFormData.frequency) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Day of Week
                </label>
                <select
                  value={templateFormData.dayOfWeek}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, dayOfWeek: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
            )}

            {["monthly", "quarterly", "yearly"].includes(templateFormData.frequency) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Day of Month
                </label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={templateFormData.dayOfMonth}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, dayOfMonth: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            )}

            {templateFormData.frequency === "yearly" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Month
                </label>
                <select
                  value={templateFormData.monthOfYear}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, monthOfYear: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  {["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"].map((month, i) => (
                    <option key={month} value={i + 1}>{month}</option>
                  ))}
                </select>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Template Modal */}
      <Dialog open={showApplyTemplateModal} onOpenChange={(open) => !open && setShowApplyTemplateModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Recurring Template</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-foreground-muted mb-4">
              Select a template to create an expense for this project.
            </p>
            <div className="space-y-2">
              {recurringTemplates.filter(t => t.isActive).map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleApplyTemplate(template.id)}
                  className="w-full text-left p-3 rounded-lg border border-[var(--card-border)] hover:bg-[var(--background-hover)] transition-colors"
                >
                  <div className="font-medium text-foreground">{template.name}</div>
                  <div className="text-sm text-foreground-muted mt-1">
                    {template.description} • {formatCurrency(template.amountCents)}
                  </div>
                </button>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowApplyTemplateModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Budget Configuration Modal */}
      <Dialog open={showBudgetModal} onOpenChange={(open) => !open && setShowBudgetModal(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Project Budget</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Total Project Budget
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={(budgetFormData.totalBudgetCents || 0) / 100}
                onChange={(e) =>
                  setBudgetFormData({
                    ...budgetFormData,
                    totalBudgetCents: Math.round(parseFloat(e.target.value || "0") * 100),
                  })
                }
                placeholder="0.00"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Set to 0 to remove the total budget limit
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Warning Threshold (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={budgetFormData.warningThreshold || 80}
                  onChange={(e) =>
                    setBudgetFormData({ ...budgetFormData, warningThreshold: parseInt(e.target.value) || 80 })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Critical Threshold (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={budgetFormData.criticalThreshold || 95}
                  onChange={(e) =>
                    setBudgetFormData({ ...budgetFormData, criticalThreshold: parseInt(e.target.value) || 95 })
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--card-border)]">
              <h4 className="text-sm font-medium text-foreground mb-3">Category Budgets (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const fieldName = `${cat.value}BudgetCents` as keyof CreateBudgetInput;
                  return (
                    <div key={cat.value}>
                      <label className="block text-xs text-foreground-muted mb-1">
                        {cat.label}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={((budgetFormData[fieldName] as number) || 0) / 100}
                        onChange={(e) =>
                          setBudgetFormData({
                            ...budgetFormData,
                            [fieldName]: Math.round(parseFloat(e.target.value || "0") * 100),
                          })
                        }
                        placeholder="0.00"
                        className="text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBudgetModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBudget}>
              Save Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Report Modal */}
      <Dialog open={showReportModal} onOpenChange={(open) => !open && setShowReportModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Expense Report</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-foreground-muted">
              Generate a printable PDF expense report for this project.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  From Date (Optional)
                </label>
                <Input
                  type="date"
                  value={reportDateFrom}
                  onChange={(e) => setReportDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  To Date (Optional)
                </label>
                <Input
                  type="date"
                  value={reportDateTo}
                  onChange={(e) => setReportDateTo(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-foreground-muted">
              Leave dates empty to include all expenses.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleGeneratePDFReport} disabled={isGeneratingReport}>
              <FileTextIcon className="h-4 w-4 mr-1" />
              {isGeneratingReport ? "Generating..." : "Generate Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Modal */}
      <Dialog open={showRejectModal} onOpenChange={(open) => !open && setShowRejectModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-foreground-muted">
              Please provide a reason for rejecting this expense.
            </p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Reason <span className="text-[var(--error)]">*</span>
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setShowRejectModal(false);
              setRejectingExpenseId(null);
              setRejectionReason("");
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectExpense}>
              Reject Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Forecast Modal */}
      <Dialog open={showForecastModal} onOpenChange={(open) => !open && setShowForecastModal(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingIcon className="h-5 w-5 text-[var(--primary)]" />
              Expense Forecast
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {forecast ? (
              <>
                {/* Summary */}
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      {forecast.periodMonths}-Month Forecast
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {formatCurrency(forecast.summary.totalProjected)}
                    </span>
                  </div>

                  {/* By Month */}
                  <div className="space-y-2">
                    <span className="text-xs text-foreground-muted">Monthly Breakdown</span>
                    <div className="grid grid-cols-3 gap-2">
                      {forecast.summary.byMonth.map((m) => (
                        <div key={m.month} className="p-2 rounded bg-[var(--background)] text-center">
                          <div className="text-xs text-foreground-muted">{m.month}</div>
                          <div className="text-sm font-medium text-foreground">{formatCurrency(m.amountCents)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* By Category */}
                {forecast.summary.byCategory.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">By Category</h4>
                    <div className="space-y-1">
                      {forecast.summary.byCategory.map((c) => (
                        <div key={c.category} className="flex items-center justify-between py-1 px-2 rounded hover:bg-[var(--background-secondary)]">
                          <span className="text-sm text-foreground-muted capitalize">{c.category.replace("_", " ")}</span>
                          <span className="text-sm font-medium text-foreground">{formatCurrency(c.amountCents)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Templates */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Active Recurring Templates ({forecast.forecasts.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {forecast.forecasts.map((f) => (
                      <div key={f.templateId} className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)]">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{f.templateName}</span>
                          <span className="text-sm text-foreground-muted capitalize">{f.frequency}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-foreground-muted capitalize">{f.category}</span>
                          <span className="text-sm font-medium text-[var(--primary)]">
                            {formatCurrency(f.amountCents)}/occurrence
                          </span>
                        </div>
                        <div className="text-xs text-foreground-muted mt-1">
                          {f.projectedExpenses.length} occurrence{f.projectedExpenses.length !== 1 ? "s" : ""} = {formatCurrency(f.totalProjected)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-foreground-muted">
                <TrendingIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recurring expense templates found.</p>
                <p className="text-sm mt-1">Create recurring templates to see expense forecasts.</p>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowForecastModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Split Expense Modal */}
      <Dialog open={showSplitModal} onOpenChange={(open) => !open && setShowSplitModal(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Split Expense</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {splittingExpense && (
              <>
                {/* Original Expense Info */}
                <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--card-border)]">
                  <div className="text-sm text-foreground-muted mb-1">Splitting:</div>
                  <div className="font-medium text-foreground">{splittingExpense.description}</div>
                  <div className="text-lg font-bold text-foreground mt-1">
                    {formatCurrency(splittingExpense.amountCents)}
                  </div>
                </div>

                {/* Split Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Split Into:</span>
                    <Button variant="ghost" size="sm" onClick={addSplitItem}>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Part
                    </Button>
                  </div>

                  {splitItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Part {index + 1}</span>
                        {splitItems.length > 2 && (
                          <button
                            onClick={() => removeSplitItem(index)}
                            className="p-1 rounded text-foreground-muted hover:text-[var(--error)] transition-colors"
                            title="Remove this part"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-foreground-muted mb-1">Category</label>
                          <select
                            value={item.category}
                            onChange={(e) => updateSplitItem(index, "category", e.target.value)}
                            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                          >
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-foreground-muted mb-1">Amount</label>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={(item.amountCents / 100).toFixed(2)}
                            onChange={(e) =>
                              updateSplitItem(
                                index,
                                "amountCents",
                                Math.round(parseFloat(e.target.value || "0") * 100)
                              )
                            }
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-foreground-muted mb-1">Description</label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateSplitItem(index, "description", e.target.value)}
                          className="text-sm"
                          placeholder="Description for this part"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Remaining Amount */}
                <div className={cn(
                  "p-3 rounded-lg border flex items-center justify-between",
                  splitRemainingAmount === 0
                    ? "bg-[var(--success)]/10 border-[var(--success)]/20"
                    : "bg-[var(--warning)]/10 border-[var(--warning)]/20"
                )}>
                  <span className="text-sm font-medium">
                    {splitRemainingAmount === 0 ? "Fully allocated" : "Remaining to allocate:"}
                  </span>
                  <span className={cn(
                    "text-lg font-bold",
                    splitRemainingAmount === 0 ? "text-[var(--success)]" : "text-[var(--warning)]"
                  )}>
                    {formatCurrency(Math.abs(splitRemainingAmount))}
                    {splitRemainingAmount < 0 && " over"}
                  </span>
                </div>
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowSplitModal(false);
                setSplittingExpense(null);
                setSplitItems([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSplitExpense}
              disabled={isSplitting || splitRemainingAmount !== 0}
            >
              {isSplitting ? "Splitting..." : "Split Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Modal */}
      <Dialog open={showBulkEditModal} onOpenChange={(open) => !open && setShowBulkEditModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit {selectedIds.size} Expense{selectedIds.size !== 1 ? "s" : ""}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-sm text-foreground-muted">
              Only fields you select will be updated. Leave fields unchanged to keep existing values.
            </p>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Category
              </label>
              <select
                value={bulkEditData.category}
                onChange={(e) => setBulkEditData({ ...bulkEditData, category: e.target.value as ExpenseCategory | "" })}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">— Keep existing —</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Payment Method
              </label>
              <select
                value={bulkEditData.paymentMethod}
                onChange={(e) => setBulkEditData({ ...bulkEditData, paymentMethod: e.target.value as PaymentMethod | "" })}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">— Keep existing —</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Billable Status */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Billable Status
              </label>
              <select
                value={bulkEditData.isBillable === null ? "" : bulkEditData.isBillable ? "true" : "false"}
                onChange={(e) => {
                  const value = e.target.value;
                  setBulkEditData({
                    ...bulkEditData,
                    isBillable: value === "" ? null : value === "true",
                  });
                }}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">— Keep existing —</option>
                <option value="true">Billable</option>
                <option value="false">Non-Billable</option>
              </select>
            </div>

            {/* Paid Status */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Paid Status
              </label>
              <select
                value={bulkEditData.isPaid === null ? "" : bulkEditData.isPaid ? "true" : "false"}
                onChange={(e) => {
                  const value = e.target.value;
                  setBulkEditData({
                    ...bulkEditData,
                    isPaid: value === "" ? null : value === "true",
                  });
                }}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">— Keep existing —</option>
                <option value="true">Paid</option>
                <option value="false">Unpaid</option>
              </select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBulkEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit} disabled={isBulkProcessing}>
              {isBulkProcessing ? "Updating..." : `Update ${selectedIds.size} Expense${selectedIds.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProjectPLPanel;
