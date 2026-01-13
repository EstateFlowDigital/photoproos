"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Send,
  Download,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PayrollEntry {
  id: string;
  name: string;
  type: "contractor" | "employee";
  role: string;
  period: string;
  hoursWorked: number;
  rate: number;
  earnings: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: "pending" | "approved" | "paid" | "scheduled";
  paymentMethod: "direct-deposit" | "check";
  scheduledDate: string | null;
}

const statusConfig = {
  pending: { label: "Pending", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  approved: { label: "Approved", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  paid: { label: "Paid", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  scheduled: { label: "Scheduled", color: "text-[var(--ai)]", bg: "bg-[var(--ai)]/10" },
};

const mockPayroll: PayrollEntry[] = [
  {
    id: "1",
    name: "Mike Thompson",
    type: "contractor",
    role: "Second Shooter",
    period: "Jan 1-15, 2025",
    hoursWorked: 32,
    rate: 50,
    earnings: 1600,
    bonus: 200,
    deductions: 0,
    netPay: 1800,
    status: "pending",
    paymentMethod: "direct-deposit",
    scheduledDate: null,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    type: "employee",
    role: "Studio Manager",
    period: "Jan 1-15, 2025",
    hoursWorked: 80,
    rate: 25,
    earnings: 2000,
    bonus: 0,
    deductions: 350,
    netPay: 1650,
    status: "approved",
    paymentMethod: "direct-deposit",
    scheduledDate: "2025-01-15",
  },
  {
    id: "3",
    name: "Emily Chen",
    type: "contractor",
    role: "Photo Editor",
    period: "Jan 1-15, 2025",
    hoursWorked: 45,
    rate: 35,
    earnings: 1575,
    bonus: 0,
    deductions: 0,
    netPay: 1575,
    status: "paid",
    paymentMethod: "direct-deposit",
    scheduledDate: null,
  },
  {
    id: "4",
    name: "James Wilson",
    type: "contractor",
    role: "Videographer",
    period: "Jan 1-15, 2025",
    hoursWorked: 24,
    rate: 75,
    earnings: 1800,
    bonus: 150,
    deductions: 0,
    netPay: 1950,
    status: "scheduled",
    paymentMethod: "check",
    scheduledDate: "2025-01-16",
  },
  {
    id: "5",
    name: "Lisa Rodriguez",
    type: "contractor",
    role: "Makeup Artist",
    period: "Jan 1-15, 2025",
    hoursWorked: 16,
    rate: 60,
    earnings: 960,
    bonus: 0,
    deductions: 0,
    netPay: 960,
    status: "pending",
    paymentMethod: "direct-deposit",
    scheduledDate: null,
  },
];

export function PayrollClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredPayroll = mockPayroll.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPayroll = mockPayroll.reduce((sum, e) => sum + e.netPay, 0);
  const pendingAmount = mockPayroll.filter((e) => e.status === "pending" || e.status === "approved").reduce((sum, e) => sum + e.netPay, 0);
  const paidAmount = mockPayroll.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.netPay, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleRunPayroll = () => {
    toast({
      title: "Run Payroll",
      description: "Opening payroll processing wizard...",
    });
  };

  const handleAction = (action: string, entry: PayrollEntry) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for ${entry.name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <DollarSign className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalPayroll)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Payroll</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
              <Clock className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(pendingAmount)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <CheckCircle className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(paidAmount)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Paid This Period</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <Users className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockPayroll.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Team Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <button
          onClick={handleRunPayroll}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Run Payroll
        </button>
      </div>

      {/* Payroll Table */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Team Member</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Period</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground-muted)]">Hours</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground-muted)]">Earnings</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground-muted)]">Net Pay</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[var(--foreground-muted)]">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPayroll.map((entry) => (
              <tr key={entry.id} className="border-b border-[var(--card-border)] hover:bg-[var(--background-secondary)]">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{entry.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {entry.role} • {entry.type === "contractor" ? "1099" : "W-2"}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--foreground-muted)]">{entry.period}</td>
                <td className="px-4 py-3 text-right">
                  <p className="text-sm text-[var(--foreground)]">{entry.hoursWorked}h</p>
                  <p className="text-xs text-[var(--foreground-muted)]">@ {formatCurrency(entry.rate)}/hr</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="text-sm text-[var(--foreground)]">{formatCurrency(entry.earnings)}</p>
                  {entry.bonus > 0 && (
                    <p className="text-xs text-[var(--success)]">+{formatCurrency(entry.bonus)} bonus</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-semibold text-[var(--foreground)]">{formatCurrency(entry.netPay)}</p>
                  <p className="text-xs text-[var(--foreground-muted)] capitalize">{entry.paymentMethod.replace("-", " ")}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[entry.status].bg} ${statusConfig[entry.status].color}`}>
                    {statusConfig[entry.status].label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === entry.id ? null : entry.id)}
                      className="rounded p-1 hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4 text-[var(--foreground-muted)]" />
                    </button>
                    {openMenuId === entry.id && (
                      <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                        <button
                          onClick={() => handleAction("View Details", entry)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </button>
                        {entry.status === "pending" && (
                          <button
                            onClick={() => handleAction("Approve", entry)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </button>
                        )}
                        {entry.status === "approved" && (
                          <button
                            onClick={() => handleAction("Process Payment", entry)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <Send className="h-4 w-4" /> Process Payment
                          </button>
                        )}
                        <button
                          onClick={() => handleAction("View Timesheet", entry)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Calendar className="h-4 w-4" /> View Timesheet
                        </button>
                        <button
                          onClick={() => handleAction("Download Stub", entry)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Download className="h-4 w-4" /> Download Stub
                        </button>
                        <button
                          onClick={() => handleAction("View 1099", entry)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <FileText className="h-4 w-4" /> View 1099/W-2
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayroll.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No payroll entries found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Run payroll to process team payments"}
          </p>
          <button
            onClick={handleRunPayroll}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Run Payroll
          </button>
        </div>
      )}
    </div>
  );
}
