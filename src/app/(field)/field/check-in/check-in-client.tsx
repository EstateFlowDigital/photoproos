"use client";

import { useState } from "react";
import Link from "next/link";
import type { FieldBooking } from "@/lib/actions/field-operations";
import { checkIn } from "@/lib/actions/field-operations";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, MapPin, Clock, CheckCircle } from "lucide-react";

interface CheckInClientProps {
  bookings: FieldBooking[];
}

export function CheckInClient({ bookings }: CheckInClientProps) {
  const [selectedBooking, setSelectedBooking] = useState<FieldBooking | null>(
    bookings.find((b) => b.status === "confirmed") || null
  );
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const handleCheckIn = async () => {
    if (!selectedBooking) return;
    setIsLoading(true);

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const result = await checkIn({
              bookingId: selectedBooking.id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            if (result.success) {
              setIsCheckedIn(true);
              setCheckInTime(result.data.checkInTime);
            }
            setIsLoading(false);
          },
          async () => {
            const result = await checkIn({ bookingId: selectedBooking.id });
            if (result.success) {
              setIsCheckedIn(true);
              setCheckInTime(result.data.checkInTime);
            }
            setIsLoading(false);
          }
        );
      } else {
        const result = await checkIn({ bookingId: selectedBooking.id });
        if (result.success) {
          setIsCheckedIn(true);
          setCheckInTime(result.data.checkInTime);
        }
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  if (isCheckedIn && checkInTime) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-green-500/20 p-6">
          <CheckCircle className="h-16 w-16 text-green-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">Checked In!</h1>
        <p className="mt-2 text-foreground-muted">
          {new Date(checkInTime).toLocaleTimeString()}
        </p>
        <p className="mt-1 text-sm text-foreground-muted">
          {selectedBooking?.clientName} - {selectedBooking?.address}
        </p>
        <Link href="/field" className="mt-8">
          <Button>Back to Schedule</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-background/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/field">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Check In</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {confirmedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Camera className="h-12 w-12 text-foreground-muted" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">No Confirmed Bookings</h2>
            <p className="mt-2 text-sm text-foreground-muted">
              All of today&apos;s bookings have been completed or there are no bookings scheduled.
            </p>
            <Link href="/field" className="mt-6">
              <Button variant="outline">View Schedule</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-foreground-muted">
              Select a booking to check in
            </p>
            <div className="space-y-3">
              {confirmedBookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    selectedBooking?.id === booking.id
                      ? "border-primary bg-primary/10"
                      : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <h3 className="font-semibold text-foreground">{booking.clientName}</h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-foreground-muted">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(booking.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{booking.address}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedBooking && (
              <div className="mt-6">
                <Button
                  onClick={handleCheckIn}
                  disabled={isLoading}
                  className="w-full py-6 text-lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  {isLoading ? "Checking in..." : "Check In Now"}
                </Button>
                <p className="mt-2 text-center text-xs text-foreground-muted">
                  Your location will be recorded for verification
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
