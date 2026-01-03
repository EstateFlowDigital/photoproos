"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ServiceSelector, type DatabaseServiceType } from "@/components/dashboard/service-selector";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { TravelInfoCard } from "@/components/dashboard/travel-info-card";
import { TeamMemberSelector } from "@/components/dashboard/team-member-selector";
import { Select } from "@/components/ui/select";
import { createBooking, createRecurringBooking, createBookingReminders, type ReminderInput } from "@/lib/actions/bookings";
import { getRecurrenceSummary } from "@/lib/utils/bookings";
import { calculateTravelPreview } from "@/lib/actions/locations";
import type { ServiceType } from "@/lib/services";
import type { PlaceDetails } from "@/lib/google-maps/types";
import type { TravelInfo } from "@/lib/google-maps/types";
import type { RecurrencePattern } from "@prisma/client";

// Union type for selected service (can be static or database service)
type SelectedService = ServiceType | DatabaseServiceType | null;

// Location data from place selection
interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

interface Client {
  id: string;
  name: string;
  contact: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  duration: string | null;
  description: string | null;
}

interface BookingNewFormProps {
  clients: Client[];
  timeSlots: { value: string; label: string }[];
  services: Service[];
}

export function BookingNewForm({ clients, timeSlots, services }: BookingNewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<SelectedService>(null);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [assignedMemberId, setAssignedMemberId] = useState<string | undefined>(undefined);

  // Location state
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [addressValue, setAddressValue] = useState("");
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
  const [travelLoading, setTravelLoading] = useState(false);
  const [travelError, setTravelError] = useState<string | null>(null);

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>("weekly");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndType, setRecurrenceEndType] = useState<"date" | "count">("count");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrenceCount, setRecurrenceCount] = useState(4);
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>([]);

  // Reminder state
  const [reminder24h, setReminder24h] = useState(true);
  const [reminder1h, setReminder1h] = useState(false);
  const [reminderRecipient, setReminderRecipient] = useState<"client" | "photographer" | "both">("client");

  // Calculate travel from home base
  const calculateTravel = useCallback(async (lat: number, lng: number, userId?: string) => {
    setTravelLoading(true);
    setTravelError(null);
    try {
      const result = await calculateTravelPreview(lat, lng, userId);
      if (result.success) {
        setTravelInfo({
          distanceMiles: result.data.distanceMiles,
          travelTimeMinutes: result.data.travelTimeMinutes,
          travelFeeCents: result.data.travelFeeCents,
          freeThresholdMiles: 0, // We'll get this from org settings
          feePerMile: 0, // We'll get this from org settings
        });
      } else {
        // If no home base configured, don't show error - just hide travel card
        setTravelInfo(null);
      }
    } catch (err) {
      // Silently fail - travel info is optional
      setTravelInfo(null);
    } finally {
      setTravelLoading(false);
    }
  }, []);

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback(async (place: PlaceDetails) => {
    const newLocationData: LocationData = {
      address: place.formattedAddress,
      latitude: place.latitude,
      longitude: place.longitude,
      placeId: place.placeId,
    };
    setLocationData(newLocationData);
    setAddressValue(place.formattedAddress);

    // Calculate travel info from assigned member's or org's home base
    await calculateTravel(place.latitude, place.longitude, assignedMemberId);
  }, [calculateTravel, assignedMemberId]);

  // Recalculate travel when assigned member changes
  const handleAssignedMemberChange = useCallback(async (memberId: string | undefined) => {
    setAssignedMemberId(memberId);

    // Recalculate travel if we have a location
    if (locationData) {
      await calculateTravel(locationData.latitude, locationData.longitude, memberId);
    }
  }, [calculateTravel, locationData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    const clientId = formData.get("clientId") as string;
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    // Use addressValue from state (set by autocomplete or manual input)
    const address = addressValue || (formData.get("address") as string);
    const locationNotes = formData.get("locationNotes") as string;
    const notes = formData.get("notes") as string;

    // Validate required fields
    if (!title || !date || !startTime || !endTime || !address) {
      setError("Please fill in all required fields");
      return;
    }

    // Create Date objects from date and time
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      setError("End time must be after start time");
      return;
    }

    startTransition(async () => {
      const bookingInput = {
        title,
        clientId: clientId || undefined,
        serviceId: selectedService?.id || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        location: address,
        locationNotes: locationNotes || undefined,
        notes: notes || undefined,
      };

      // Build reminders array
      const reminders: ReminderInput[] = [];
      if (reminder24h) {
        reminders.push({
          type: "hours_24",
          channel: "email",
          recipient: reminderRecipient,
        });
      }
      if (reminder1h) {
        reminders.push({
          type: "hours_1",
          channel: "email",
          recipient: reminderRecipient,
        });
      }

      if (isRecurring) {
        // Create recurring booking series
        const result = await createRecurringBooking({
          ...bookingInput,
          isRecurring: true,
          recurrencePattern,
          recurrenceInterval,
          recurrenceEndDate: recurrenceEndType === "date" && recurrenceEndDate
            ? new Date(recurrenceEndDate)
            : undefined,
          recurrenceCount: recurrenceEndType === "count" ? recurrenceCount : undefined,
          recurrenceDaysOfWeek: recurrencePattern === "custom" ? recurrenceDaysOfWeek : undefined,
        });

        if (result.success) {
          // Create reminders for the parent booking
          if (reminders.length > 0) {
            await createBookingReminders(result.data.id, reminders);
          }
          router.push(`/scheduling/${result.data.id}`);
        } else {
          setError(result.error);
        }
      } else {
        // Create single booking
        const result = await createBooking(bookingInput);

        if (result.success) {
          // Create reminders for the booking
          if (reminders.length > 0) {
            await createBookingReminders(result.data.id, reminders);
          }
          router.push(`/scheduling/${result.data.id}`);
        } else {
          setError(result.error);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      {/* Session Details */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Session Details</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
              Session Title <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Downtown Luxury Listing"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <Select
              name="clientId"
              label="Client"
              placeholder="Select a client (optional)..."
              options={clients.map((client) => ({
                value: client.id,
                label: `${client.name} (${client.contact})`,
              }))}
            />
            <p className="mt-1.5 text-xs text-foreground-muted">
              Or{" "}
              <Link href="/clients/new" className="text-[var(--primary)] hover:underline">
                create a new client
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Date & Time</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1.5">
              Date <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              name="startTime"
              label="Start Time"
              required
              placeholder="Select start time..."
              options={timeSlots}
            />
            <Select
              name="endTime"
              label="End Time"
              required
              placeholder="Select end time..."
              options={timeSlots}
            />
          </div>
        </div>
      </div>

      {/* Recurrence */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Repeat</h2>
            <p className="text-sm text-foreground-muted">Create a recurring booking series</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--background-secondary)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
          </label>
        </div>

        {isRecurring && (
          <div className="space-y-4 pt-4 border-t border-[var(--card-border)]">
            {/* Recurrence Pattern */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Repeats
              </label>
              <div className="flex flex-wrap gap-2">
                {(["daily", "weekly", "biweekly", "monthly", "custom"] as RecurrencePattern[]).map((pattern) => (
                  <button
                    key={pattern}
                    type="button"
                    onClick={() => setRecurrencePattern(pattern)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      recurrencePattern === pattern
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--background-secondary)] text-foreground hover:bg-[var(--background-hover)]"
                    }`}
                  >
                    {pattern === "daily" && "Daily"}
                    {pattern === "weekly" && "Weekly"}
                    {pattern === "biweekly" && "Every 2 weeks"}
                    {pattern === "monthly" && "Monthly"}
                    {pattern === "custom" && "Custom"}
                  </button>
                ))}
              </div>
            </div>

            {/* Interval (for daily, weekly, monthly) */}
            {(recurrencePattern === "daily" || recurrencePattern === "weekly" || recurrencePattern === "monthly") && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Every
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                    className="w-20 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-foreground-muted">
                    {recurrencePattern === "daily" && (recurrenceInterval === 1 ? "day" : "days")}
                    {recurrencePattern === "weekly" && (recurrenceInterval === 1 ? "week" : "weeks")}
                    {recurrencePattern === "monthly" && (recurrenceInterval === 1 ? "month" : "months")}
                  </span>
                </div>
              </div>
            )}

            {/* Days of Week (for custom) */}
            {recurrencePattern === "custom" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  On these days
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (recurrenceDaysOfWeek.includes(index)) {
                          setRecurrenceDaysOfWeek(recurrenceDaysOfWeek.filter((d) => d !== index));
                        } else {
                          setRecurrenceDaysOfWeek([...recurrenceDaysOfWeek, index].sort());
                        }
                      }}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        recurrenceDaysOfWeek.includes(index)
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--background-secondary)] text-foreground hover:bg-[var(--background-hover)]"
                      }`}
                    >
                      {day.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* End Condition */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Ends
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrenceEndType"
                    checked={recurrenceEndType === "count"}
                    onChange={() => setRecurrenceEndType("count")}
                    className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-foreground">After</span>
                  <input
                    type="number"
                    min={2}
                    max={52}
                    value={recurrenceCount}
                    onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 4)}
                    disabled={recurrenceEndType !== "count"}
                    className="w-16 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
                  />
                  <span className="text-sm text-foreground-muted">occurrences</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrenceEndType"
                    checked={recurrenceEndType === "date"}
                    onChange={() => setRecurrenceEndType("date")}
                    className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-foreground">On</span>
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    disabled={recurrenceEndType !== "date"}
                    className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
                  />
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-[var(--background-secondary)] p-3">
              <div className="flex items-center gap-2">
                <RepeatIcon className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm text-foreground">
                  {getRecurrenceSummary(recurrencePattern, recurrenceInterval, recurrencePattern === "custom" ? recurrenceDaysOfWeek : undefined)}
                  {recurrenceEndType === "count" && ` for ${recurrenceCount} sessions`}
                  {recurrenceEndType === "date" && recurrenceEndDate && ` until ${new Date(recurrenceEndDate).toLocaleDateString()}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>

        <div className="space-y-4">
          <AddressAutocomplete
            label="Address"
            placeholder="Start typing an address..."
            value={addressValue}
            onChange={setAddressValue}
            onPlaceSelect={handlePlaceSelect}
            required
          />
          {/* Hidden input for form validation */}
          <input type="hidden" name="address" value={addressValue} />

          {/* Travel Info Card - shows when location is selected and home base is configured */}
          {(travelLoading || travelInfo) && (
            <TravelInfoCard
              travelInfo={travelInfo}
              isLoading={travelLoading}
              error={travelError}
              showFeeBreakdown={false}
            />
          )}

          <div>
            <label htmlFor="locationNotes" className="block text-sm font-medium text-foreground mb-1.5">
              Location Notes
            </label>
            <textarea
              id="locationNotes"
              name="locationNotes"
              rows={2}
              placeholder="e.g., Park in visitor lot, enter through side gate..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Service & Pricing Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Service & Pricing</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Select a predefined service package or set custom pricing for this session.
        </p>

        <ServiceSelector
          selectedServiceId={selectedService?.id}
          customPrice={price}
          customDescription={description}
          onServiceChange={setSelectedService}
          onPriceChange={setPrice}
          onDescriptionChange={setDescription}
          mode="booking"
        />

        {/* Hidden inputs for form submission */}
        <input type="hidden" name="serviceId" value={selectedService?.id || ""} />
        <input type="hidden" name="price" value={price} />
        <input type="hidden" name="serviceDescription" value={description} />

        {/* Deposit field */}
        <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
          <label htmlFor="deposit" className="block text-sm font-medium text-foreground mb-1.5">
            Deposit Required
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
            <input
              type="number"
              id="deposit"
              name="deposit"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <p className="mt-1.5 text-xs text-foreground-muted">
            Optional deposit to secure the booking
          </p>
        </div>
      </div>

      {/* Team Assignment */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Team Assignment</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Assign a team member who is qualified to perform this service.
        </p>

        <TeamMemberSelector
          serviceId={selectedService?.id}
          value={assignedMemberId}
          onChange={handleAssignedMemberChange}
          label="Assigned Team Member"
          helperText={
            selectedService
              ? "Only showing team members qualified for this service"
              : "Select a service first to see qualified team members"
          }
          showUnqualified={false}
        />

        {/* Hidden input for form submission */}
        <input type="hidden" name="assignedUserId" value={assignedMemberId || ""} />
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Session Notes</h2>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
            Notes & Requirements
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="e.g., Bring wide-angle lens, property will be staged, focus on kitchen and master bedroom..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
          />
        </div>
      </div>

      {/* Notifications & Reminders */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Notifications & Reminders</h2>

        <div className="space-y-4">
          {/* Confirmation Email */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="sendConfirmation"
              defaultChecked
              className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Send confirmation email</span>
              <p className="text-xs text-foreground-muted">Email the client with booking details</p>
            </div>
          </label>

          {/* Reminders Section */}
          <div className="pt-3 border-t border-[var(--card-border)]">
            <div className="flex items-center gap-2 mb-3">
              <BellIcon className="h-4 w-4 text-foreground-muted" />
              <span className="text-sm font-medium text-foreground">Automatic Reminders</span>
            </div>

            <div className="space-y-3 pl-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder24h}
                  onChange={(e) => setReminder24h(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">24 hours before</span>
                  <p className="text-xs text-foreground-muted">Send reminder email one day before the session</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder1h}
                  onChange={(e) => setReminder1h(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">1 hour before</span>
                  <p className="text-xs text-foreground-muted">Send last-minute reminder email</p>
                </div>
              </label>

              {/* Recipient Selection */}
              {(reminder24h || reminder1h) && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-foreground-muted mb-2">Send reminders to:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "client", label: "Client only" },
                      { value: "photographer", label: "Team only" },
                      { value: "both", label: "Both" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setReminderRecipient(option.value as typeof reminderRecipient)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          reminderRecipient === option.value
                            ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                            : "bg-[var(--background)] border-[var(--card-border)] text-foreground-muted hover:border-[var(--primary)]/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="pt-3 border-t border-[var(--card-border)]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="addToCalendar"
                defaultChecked
                className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <div>
                <span className="text-sm font-medium text-foreground">Add to calendar</span>
                <p className="text-xs text-foreground-muted">Create a calendar event for this booking</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/scheduling"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Creating...
            </>
          ) : (
            "Create Booking"
          )}
        </button>
      </div>
    </form>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

function RepeatIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6Zm0 14.5a2 2 0 0 1-1.95-1.557 33.54 33.54 0 0 0 3.9 0A2 2 0 0 1 10 16.5Z" clipRule="evenodd" />
    </svg>
  );
}
