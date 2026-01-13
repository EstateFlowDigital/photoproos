"use client";

import { useState } from "react";
import {
  Car,
  MapPin,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Calendar,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type TripPurpose = "client_visit" | "venue_scouting" | "equipment_pickup" | "event" | "other";

interface MileageTrip {
  id: string;
  date: string;
  startLocation: string;
  endLocation: string;
  purpose: TripPurpose;
  miles: number;
  rate: number;
  projectId: string | null;
  projectName: string | null;
  notes: string;
}

const MOCK_TRIPS: MileageTrip[] = [
  {
    id: "1",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    startLocation: "Home Office, Los Angeles",
    endLocation: "Rosewood Manor, Pasadena",
    purpose: "venue_scouting",
    miles: 24.5,
    rate: 0.67,
    projectId: "p1",
    projectName: "Johnson Wedding",
    notes: "Site visit for ceremony location",
  },
  {
    id: "2",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    startLocation: "Home Office, Los Angeles",
    endLocation: "B&H Photo, West LA",
    purpose: "equipment_pickup",
    miles: 12.3,
    rate: 0.67,
    projectId: null,
    projectName: null,
    notes: "Picked up new lens rental",
  },
  {
    id: "3",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    startLocation: "Home Office, Los Angeles",
    endLocation: "Chen Residence, Beverly Hills",
    purpose: "client_visit",
    miles: 18.7,
    rate: 0.67,
    projectId: "p2",
    projectName: "Chen Family Portraits",
    notes: "Pre-session consultation",
  },
  {
    id: "4",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    startLocation: "Home Office, Los Angeles",
    endLocation: "The Grand Ballroom, Downtown LA",
    purpose: "event",
    miles: 8.2,
    rate: 0.67,
    projectId: "p3",
    projectName: "Corporate Gala",
    notes: "Event photography",
  },
  {
    id: "5",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    startLocation: "Home Office, Los Angeles",
    endLocation: "Griffith Park, Los Angeles",
    purpose: "client_visit",
    miles: 15.4,
    rate: 0.67,
    projectId: "p4",
    projectName: "Martinez Engagement",
    notes: "Engagement session",
  },
];

const PURPOSE_CONFIG: Record<TripPurpose, { label: string; color: string; bg: string }> = {
  client_visit: { label: "Client Visit", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  venue_scouting: { label: "Venue Scouting", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  equipment_pickup: { label: "Equipment", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  event: { label: "Event", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  other: { label: "Other", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

const IRS_RATE = 0.67; // 2024 IRS standard mileage rate

export function MileageClient() {
  const { showToast } = useToast();
  const [trips, setTrips] = useState<MileageTrip[]>(MOCK_TRIPS);
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState<TripPurpose | "all">("all");
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

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.startLocation.toLowerCase().includes(search.toLowerCase()) ||
      trip.endLocation.toLowerCase().includes(search.toLowerCase()) ||
      (trip.projectName?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesPurpose = purposeFilter === "all" || trip.purpose === purposeFilter;
    return matchesSearch && matchesPurpose;
  });

  const handleDelete = (tripId: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    showToast("Trip deleted", "success");
    setOpenMenuId(null);
  };

  // Calculate stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthTrips = trips.filter((t) => new Date(t.date) >= thisMonth);
  const thisYear = new Date();
  thisYear.setMonth(0, 1);
  const thisYearTrips = trips.filter((t) => new Date(t.date) >= thisYear);

  const stats = {
    totalMiles: trips.reduce((sum, t) => sum + t.miles, 0),
    thisMonthMiles: thisMonthTrips.reduce((sum, t) => sum + t.miles, 0),
    totalDeduction: trips.reduce((sum, t) => sum + t.miles * t.rate, 0),
    yearToDateDeduction: thisYearTrips.reduce((sum, t) => sum + t.miles * t.rate, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Miles</p>
            <Car className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalMiles.toFixed(1)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">This Month</p>
            <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{stats.thisMonthMiles.toFixed(1)} mi</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Deduction</p>
            <DollarSign className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(stats.totalDeduction)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">YTD Deduction</p>
            <DollarSign className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{formatCurrency(stats.yearToDateDeduction)}</p>
        </div>
      </div>

      {/* IRS Rate Info */}
      <div className="card p-4 bg-[var(--info)]/5 border-[var(--info)]/20">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--info)] font-medium">IRS Standard Mileage Rate:</span>
          <span className="text-foreground">${IRS_RATE} per mile (2024)</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value as TripPurpose | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Purposes</option>
            {Object.entries(PURPOSE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Log Trip
        </Button>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="card p-12 text-center">
          <Car className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No trips found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || purposeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Log your first trip to start tracking mileage"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTrips.map((trip) => {
            const purposeConfig = PURPOSE_CONFIG[trip.purpose];
            const deduction = trip.miles * trip.rate;

            return (
              <div key={trip.id} className="card p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${purposeConfig.bg}`}>
                      <Car className={`h-5 w-5 ${purposeConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-foreground">{trip.startLocation}</span>
                        <Navigation className="h-3 w-3 text-foreground-muted" />
                        <span className="text-sm text-foreground">{trip.endLocation}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-foreground-muted">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${purposeConfig.bg} ${purposeConfig.color}`}>
                          {purposeConfig.label}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(trip.date)}
                        </span>
                        {trip.projectName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {trip.projectName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{trip.miles.toFixed(1)} mi</p>
                      <p className="text-sm text-[var(--success)]">{formatCurrency(deduction)}</p>
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === trip.id ? null : trip.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === trip.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
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
