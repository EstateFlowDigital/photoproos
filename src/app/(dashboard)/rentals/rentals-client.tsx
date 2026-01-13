"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Camera,
  CheckCircle,
  AlertTriangle,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Rental {
  id: string;
  equipment: string;
  category: string;
  renter: string;
  renterType: "client" | "team" | "external";
  status: "reserved" | "checked-out" | "overdue" | "returned";
  checkoutDate: string;
  dueDate: string;
  returnedDate: string | null;
  dailyRate: number;
  totalDays: number;
  condition: "excellent" | "good" | "fair" | "needs-repair";
}

const statusConfig = {
  reserved: { label: "Reserved", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  "checked-out": { label: "Checked Out", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  overdue: { label: "Overdue", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
  returned: { label: "Returned", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
};

const conditionConfig = {
  excellent: { label: "Excellent", color: "text-[var(--success)]" },
  good: { label: "Good", color: "text-[var(--info)]" },
  fair: { label: "Fair", color: "text-[var(--warning)]" },
  "needs-repair": { label: "Needs Repair", color: "text-[var(--error)]" },
};

const mockRentals: Rental[] = [
  {
    id: "1",
    equipment: "Canon EOS R5",
    category: "Camera Body",
    renter: "Sarah Mitchell",
    renterType: "client",
    status: "checked-out",
    checkoutDate: "2025-01-10",
    dueDate: "2025-01-14",
    returnedDate: null,
    dailyRate: 150,
    totalDays: 4,
    condition: "excellent",
  },
  {
    id: "2",
    equipment: "70-200mm f/2.8 Lens",
    category: "Lens",
    renter: "Mike Thompson",
    renterType: "team",
    status: "reserved",
    checkoutDate: "2025-01-15",
    dueDate: "2025-01-17",
    returnedDate: null,
    dailyRate: 75,
    totalDays: 2,
    condition: "good",
  },
  {
    id: "3",
    equipment: "Profoto B10 Strobe Kit",
    category: "Lighting",
    renter: "Emily Roberts",
    renterType: "external",
    status: "overdue",
    checkoutDate: "2025-01-05",
    dueDate: "2025-01-10",
    returnedDate: null,
    dailyRate: 100,
    totalDays: 5,
    condition: "good",
  },
  {
    id: "4",
    equipment: "DJI Ronin-S Gimbal",
    category: "Support",
    renter: "James Chen",
    renterType: "client",
    status: "returned",
    checkoutDate: "2025-01-02",
    dueDate: "2025-01-05",
    returnedDate: "2025-01-05",
    dailyRate: 50,
    totalDays: 3,
    condition: "excellent",
  },
  {
    id: "5",
    equipment: "Sony A7IV",
    category: "Camera Body",
    renter: "Tech Studio Co",
    renterType: "external",
    status: "checked-out",
    checkoutDate: "2025-01-11",
    dueDate: "2025-01-13",
    returnedDate: null,
    dailyRate: 125,
    totalDays: 2,
    condition: "good",
  },
];

export function RentalsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredRentals = mockRentals.filter((rental) => {
    const matchesSearch =
      rental.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.renter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rental.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeRentals = mockRentals.filter((r) => r.status === "checked-out" || r.status === "reserved").length;
  const overdueRentals = mockRentals.filter((r) => r.status === "overdue").length;
  const totalRevenue = mockRentals.reduce((sum, r) => sum + (r.dailyRate * r.totalDays), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCreate = () => {
    toast({
      title: "Create Rental",
      description: "Opening rental booking form...",
    });
  };

  const handleAction = (action: string, rental: Rental) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for "${rental.equipment}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Package className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockRentals.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Rentals</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
              <Camera className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{activeRentals}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Active</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--error)]/10">
              <AlertTriangle className="h-5 w-5 text-[var(--error)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{overdueRentals}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Overdue</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <CheckCircle className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Revenue</p>
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
              placeholder="Search rentals..."
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
            <option value="reserved">Reserved</option>
            <option value="checked-out">Checked Out</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Rental
        </button>
      </div>

      {/* Rentals Table */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Equipment</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Renter</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Dates</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground-muted)]">Rate</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[var(--foreground-muted)]">Condition</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[var(--foreground-muted)]">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredRentals.map((rental) => (
              <tr key={rental.id} className="border-b border-[var(--card-border)] hover:bg-[var(--background-secondary)]">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{rental.equipment}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{rental.category}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-[var(--foreground)]">{rental.renter}</p>
                    <p className="text-xs text-[var(--foreground-muted)] capitalize">{rental.renterType}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    <p className="text-[var(--foreground)]">{rental.checkoutDate}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Due: {rental.dueDate}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-medium text-[var(--foreground)]">{formatCurrency(rental.dailyRate)}/day</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{rental.totalDays} days</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm ${conditionConfig[rental.condition].color}`}>
                    {conditionConfig[rental.condition].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[rental.status].bg} ${statusConfig[rental.status].color}`}>
                    {statusConfig[rental.status].label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === rental.id ? null : rental.id)}
                      className="rounded p-1 hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4 text-[var(--foreground-muted)]" />
                    </button>
                    {openMenuId === rental.id && (
                      <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                        <button
                          onClick={() => handleAction("View Details", rental)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </button>
                        {rental.status === "reserved" && (
                          <button
                            onClick={() => handleAction("Check Out", rental)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <Camera className="h-4 w-4" /> Check Out
                          </button>
                        )}
                        {(rental.status === "checked-out" || rental.status === "overdue") && (
                          <button
                            onClick={() => handleAction("Check In", rental)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <CheckCircle className="h-4 w-4" /> Check In
                          </button>
                        )}
                        <button
                          onClick={() => handleAction("Edit", rental)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleAction("Extend", rental)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Calendar className="h-4 w-4" /> Extend
                        </button>
                        <hr className="my-1 border-[var(--card-border)]" />
                        <button
                          onClick={() => handleAction("Delete", rental)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
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

      {filteredRentals.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Camera className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No rentals found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first equipment rental"}
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            New Rental
          </button>
        </div>
      )}
    </div>
  );
}
