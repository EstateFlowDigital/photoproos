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
  Users,
  DollarSign,
  Building,
  Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudioSpace {
  id: string;
  name: string;
  type: "main" | "secondary" | "outdoor" | "cyclorama";
  capacity: number;
  hourlyRate: number;
  dailyRate: number;
  status: "available" | "booked" | "maintenance";
  amenities: string[];
  todayBookings: number;
  monthRevenue: number;
}

interface Booking {
  id: string;
  space: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "hourly" | "half-day" | "full-day";
  total: number;
  status: "confirmed" | "pending" | "completed";
}

const spaceTypeConfig = {
  main: { label: "Main Studio", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  secondary: { label: "Secondary", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  outdoor: { label: "Outdoor", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  cyclorama: { label: "Cyclorama", color: "text-[var(--ai)]", bg: "bg-[var(--ai)]/10" },
};

const statusConfig = {
  available: { label: "Available", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  booked: { label: "Booked", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  maintenance: { label: "Maintenance", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
};

const mockSpaces: StudioSpace[] = [
  {
    id: "1",
    name: "Studio A - Natural Light",
    type: "main",
    capacity: 15,
    hourlyRate: 150,
    dailyRate: 800,
    status: "booked",
    amenities: ["Natural Light", "Backdrops", "Sound System", "Makeup Station"],
    todayBookings: 2,
    monthRevenue: 4800,
  },
  {
    id: "2",
    name: "Studio B - Cyclorama",
    type: "cyclorama",
    capacity: 20,
    hourlyRate: 200,
    dailyRate: 1200,
    status: "available",
    amenities: ["White Cyc", "Lighting Grid", "Product Tables", "Green Screen"],
    todayBookings: 1,
    monthRevenue: 6400,
  },
  {
    id: "3",
    name: "Meeting Room",
    type: "secondary",
    capacity: 8,
    hourlyRate: 50,
    dailyRate: 250,
    status: "available",
    amenities: ["Projector", "Whiteboard", "Video Conferencing"],
    todayBookings: 0,
    monthRevenue: 800,
  },
  {
    id: "4",
    name: "Garden Terrace",
    type: "outdoor",
    capacity: 25,
    hourlyRate: 100,
    dailyRate: 500,
    status: "maintenance",
    amenities: ["Natural Settings", "Planters", "String Lights"],
    todayBookings: 0,
    monthRevenue: 1200,
  },
];

const mockBookings: Booking[] = [
  {
    id: "1",
    space: "Studio A",
    client: "Sarah Mitchell",
    date: "2025-01-12",
    startTime: "9:00 AM",
    endTime: "1:00 PM",
    type: "half-day",
    total: 400,
    status: "confirmed",
  },
  {
    id: "2",
    space: "Studio B",
    client: "TechCorp Inc",
    date: "2025-01-12",
    startTime: "2:00 PM",
    endTime: "6:00 PM",
    type: "hourly",
    total: 800,
    status: "confirmed",
  },
  {
    id: "3",
    space: "Studio A",
    client: "Emily Roberts",
    date: "2025-01-13",
    startTime: "10:00 AM",
    endTime: "5:00 PM",
    type: "full-day",
    total: 800,
    status: "pending",
  },
];

export function StudioClient() {
  const { toast } = useToast();
  const [view, setView] = React.useState<"spaces" | "bookings">("spaces");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const totalMonthRevenue = mockSpaces.reduce((sum, s) => sum + s.monthRevenue, 0);
  const availableSpaces = mockSpaces.filter((s) => s.status === "available").length;
  const todayTotalBookings = mockSpaces.reduce((sum, s) => sum + s.todayBookings, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAddSpace = () => {
    toast({
      title: "Add Space",
      description: "Opening space setup form...",
    });
  };

  const handleAction = (action: string, item: StudioSpace | Booking) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for "${'name' in item ? item.name : item.client}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Building className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockSpaces.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Spaces</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <Calendar className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{todayTotalBookings}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Today's Bookings</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <Clock className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{availableSpaces}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Available Now</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
              <DollarSign className="h-5 w-5 text-[var(--ai)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalMonthRevenue)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1">
          <button
            onClick={() => setView("spaces")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === "spaces"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Spaces
          </button>
          <button
            onClick={() => setView("bookings")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === "bookings"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Bookings
          </button>
        </div>
        <button
          onClick={handleAddSpace}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {view === "spaces" ? "Add Space" : "New Booking"}
        </button>
      </div>

      {/* Spaces View */}
      {view === "spaces" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {mockSpaces.map((space) => (
            <div
              key={space.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--foreground)]">{space.name}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[space.status].bg} ${statusConfig[space.status].color}`}>
                      {statusConfig[space.status].label}
                    </span>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-2 ${spaceTypeConfig[space.type].bg} ${spaceTypeConfig[space.type].color}`}>
                    {spaceTypeConfig[space.type].label}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === space.id ? null : space.id)}
                    className="rounded p-1 hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                  </button>
                  {openMenuId === space.id && (
                    <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                      <button
                        onClick={() => handleAction("View Details", space)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </button>
                      <button
                        onClick={() => handleAction("Edit Space", space)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Edit className="h-4 w-4" /> Edit Space
                      </button>
                      <button
                        onClick={() => handleAction("View Calendar", space)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Calendar className="h-4 w-4" /> View Calendar
                      </button>
                      <hr className="my-1 border-[var(--card-border)]" />
                      <button
                        onClick={() => handleAction("Delete Space", space)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">{formatCurrency(space.hourlyRate)}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">Per Hour</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">{formatCurrency(space.dailyRate)}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">Per Day</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">{space.capacity}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">Capacity</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {space.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-[var(--background-secondary)] px-2.5 py-1 text-xs text-[var(--foreground-muted)]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--card-border)] pt-4 text-sm">
                <span className="text-[var(--foreground-muted)]">
                  {space.todayBookings} bookings today
                </span>
                <span className="font-medium text-[var(--success)]">
                  {formatCurrency(space.monthRevenue)} this month
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bookings View */}
      {view === "bookings" && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Space</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Date & Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Type</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground-muted)]">Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[var(--foreground-muted)]">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-[var(--card-border)] hover:bg-[var(--background-secondary)]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--foreground)]">{booking.client}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground-muted)]">{booking.space}</td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground-muted)]">
                    <p>{booking.date}</p>
                    <p className="text-xs">{booking.startTime} - {booking.endTime}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground-muted)] capitalize">{booking.type.replace("-", " ")}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground)]">
                    {formatCurrency(booking.total)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      booking.status === "confirmed" ? "bg-[var(--success)]/10 text-[var(--success)]" :
                      booking.status === "pending" ? "bg-[var(--warning)]/10 text-[var(--warning)]" :
                      "bg-[var(--info)]/10 text-[var(--info)]"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded p-1 hover:bg-[var(--background-secondary)]">
                      <MoreHorizontal className="h-4 w-4 text-[var(--foreground-muted)]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
