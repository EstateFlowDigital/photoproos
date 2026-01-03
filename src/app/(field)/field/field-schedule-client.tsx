"use client";

import { useState } from "react";
import Link from "next/link";
import type { FieldBooking } from "@/lib/actions/field-operations";
import { checkIn, checkOut } from "@/lib/actions/field-operations";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, Camera, CheckCircle } from "lucide-react";

interface FieldScheduleClientProps {
  todaysBookings: FieldBooking[];
  upcomingBookings: FieldBooking[];
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function BookingCard({ booking, showDate = false }: { booking: FieldBooking; showDate?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await checkIn({
              bookingId: booking.id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setIsLoading(false);
            window.location.reload();
          },
          async () => {
            await checkIn({ bookingId: booking.id });
            setIsLoading(false);
            window.location.reload();
          }
        );
      } else {
        await checkIn({ bookingId: booking.id });
        setIsLoading(false);
        window.location.reload();
      }
    } catch {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await checkOut({
              bookingId: booking.id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setIsLoading(false);
            window.location.reload();
          },
          async () => {
            await checkOut({ bookingId: booking.id });
            setIsLoading(false);
            window.location.reload();
          }
        );
      } else {
        await checkOut({ bookingId: booking.id });
        setIsLoading(false);
        window.location.reload();
      }
    } catch {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{booking.clientName}</h3>
          {booking.title && (
            <p className="text-sm text-foreground-muted truncate">{booking.title}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${statusColors[booking.status] || ""}`}>
          {booking.status}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {showDate && (
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(booking.startTime)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <Clock className="h-4 w-4" />
          <span>{formatTime(booking.startTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{booking.address}</span>
        </div>
        {booking.clientPhone && (
          <a
            href={`tel:${booking.clientPhone}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="h-4 w-4" />
            <span>{booking.clientPhone}</span>
          </a>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {booking.status === "confirmed" && (
          <Button
            onClick={handleCheckIn}
            disabled={isLoading}
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            {isLoading ? "Checking in..." : "Check In"}
          </Button>
        )}
        {booking.status === "pending" && (
          <Button
            onClick={handleCheckOut}
            disabled={isLoading}
            variant="secondary"
            className="flex-1"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isLoading ? "Completing..." : "Complete"}
          </Button>
        )}
        <Button variant="outline" asChild className="shrink-0">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(booking.address)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export function FieldScheduleClient({
  todaysBookings,
  upcomingBookings,
}: FieldScheduleClientProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const futureBookings = upcomingBookings.filter((b) => {
    const bookingDate = new Date(b.startTime);
    const todayDate = new Date();
    bookingDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);
    return bookingDate > todayDate;
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-background/95 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Field App</h1>
            <p className="text-sm text-foreground-muted">{today}</p>
          </div>
          <Link href="/field/check-in">
            <Button size="sm" variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Quick Check-In
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 space-y-6 p-4 pb-20">
        {/* Today's Bookings */}
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-foreground-muted">
            Today ({todaysBookings.length})
          </h2>
          {todaysBookings.length === 0 ? (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
              <Calendar className="mx-auto h-8 w-8 text-foreground-muted" />
              <p className="mt-2 text-sm text-foreground-muted">No bookings today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming */}
        {futureBookings.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-foreground-muted">
              Upcoming ({futureBookings.length})
            </h2>
            <div className="space-y-3">
              {futureBookings.slice(0, 5).map((booking) => (
                <BookingCard key={booking.id} booking={booking} showDate />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--card-border)] bg-background/95 backdrop-blur px-4 py-2 safe-area-inset-bottom">
        <div className="flex justify-around">
          <Link href="/field" className="flex flex-col items-center gap-1 py-2 text-primary">
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Schedule</span>
          </Link>
          <Link href="/field/check-in" className="flex flex-col items-center gap-1 py-2 text-foreground-muted hover:text-foreground">
            <Camera className="h-5 w-5" />
            <span className="text-xs">Check In</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
