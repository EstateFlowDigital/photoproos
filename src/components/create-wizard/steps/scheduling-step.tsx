"use client";

import { useState } from "react";
import { Calendar, ArrowRight, ArrowLeft, Clock, MapPin, FileText, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import type { WizardData } from "@/app/(dashboard)/create/create-wizard-client";

type SchedulingLocation = {
  id: string;
  formattedAddress: string;
  city: string | null;
  state: string | null;
  name?: string | null;
  address?: string | null;
};

interface BookingType {
  id: string;
  name: string;
  color: string | null;
  durationMinutes: number;
}

interface SchedulingStepProps {
  formData: WizardData;
  updateFormData: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  locations: SchedulingLocation[];
  bookingTypes: BookingType[];
}

export function SchedulingStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  locations,
  bookingTypes,
}: SchedulingStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const handleDateChange = (value: string, field: "scheduledDate" | "scheduledEndDate") => {
    if (!value) {
      updateFormData({ [field]: null });
      return;
    }
    updateFormData({ [field]: new Date(value) });
  };

  const handleBookingTypeChange = (typeId: string) => {
    updateFormData({ bookingTypeId: typeId });

    // Auto-set end time based on booking type duration
    const bookingType = bookingTypes.find((t) => t.id === typeId);
    if (bookingType && formData.scheduledDate) {
      const endDate = new Date(formData.scheduledDate.getTime() + bookingType.durationMinutes * 60 * 1000);
      updateFormData({ scheduledEndDate: endDate });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.createBooking) {
      if (!formData.scheduledDate) {
        newErrors.scheduledDate = "Start time is required";
      }
      if (!formData.scheduledEndDate) {
        newErrors.scheduledEndDate = "End time is required";
      }
      if (formData.scheduledDate && formData.scheduledEndDate) {
        if (formData.scheduledEndDate <= formData.scheduledDate) {
          newErrors.scheduledEndDate = "End time must be after start time";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <Calendar className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Scheduling & Billing
        </h2>
        <p className="text-foreground-secondary">
          Optionally schedule a session and set up billing
        </p>
      </div>

      {/* Booking Toggle */}
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.createBooking}
              onChange={(e) => updateFormData({ createBooking: e.target.checked })}
              className="sr-only"
            />
            <div
              className={cn(
                "w-10 h-6 rounded-full transition-colors",
                formData.createBooking ? "bg-[var(--primary)]" : "bg-[var(--background-secondary)]"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
                  formData.createBooking ? "translate-x-[18px]" : "translate-x-0.5"
                )}
              />
            </div>
          </div>
          <div>
            <span className="font-medium text-foreground">Schedule a session</span>
            <p className="text-sm text-foreground-muted">Create a booking for this project</p>
          </div>
        </label>
      </div>

      {/* Booking Form */}
      {formData.createBooking && (
        <div className="space-y-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
          {/* Booking Type */}
          {bookingTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                <Clock className="w-4 h-4 inline mr-1.5" />
                Booking Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {bookingTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleBookingTypeChange(type.id)}
                    className={cn(
                      "p-3 rounded-lg text-left border-2 transition-colors",
                      formData.bookingTypeId === type.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {type.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                      )}
                      <span className="font-medium text-foreground text-sm">{type.name}</span>
                    </div>
                    <span className="text-xs text-foreground-muted">
                      {type.durationMinutes} min
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date/Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Start Time <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.scheduledDate)}
                onChange={(e) => handleDateChange(e.target.value, "scheduledDate")}
                className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
              {errors.scheduledDate && (
                <p className="text-sm text-[var(--error)]">{errors.scheduledDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                End Time <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.scheduledEndDate)}
                onChange={(e) => handleDateChange(e.target.value, "scheduledEndDate")}
                className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
              {errors.scheduledEndDate && (
                <p className="text-sm text-[var(--error)]">{errors.scheduledEndDate}</p>
              )}
            </div>
          </div>

          {/* Location */}
          {locations.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                <MapPin className="w-4 h-4 inline mr-1.5" />
                Location
              </label>
              <select
                value={formData.locationId}
                onChange={(e) => updateFormData({ locationId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              >
                <option value="">Select a location...</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.formattedAddress}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              <FileText className="w-4 h-4 inline mr-1.5" />
              Notes
            </label>
            <textarea
              value={formData.bookingNotes}
              onChange={(e) => updateFormData({ bookingNotes: e.target.value })}
              placeholder="Add any notes about the session..."
              rows={2}
              className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
            />
          </div>
        </div>
      )}

      {/* Invoice Toggle */}
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.createInvoice}
              onChange={(e) => updateFormData({ createInvoice: e.target.checked })}
              className="sr-only"
            />
            <div
              className={cn(
                "w-10 h-6 rounded-full transition-colors",
                formData.createInvoice ? "bg-[var(--primary)]" : "bg-[var(--background-secondary)]"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
                  formData.createInvoice ? "translate-x-[18px]" : "translate-x-0.5"
                )}
              />
            </div>
          </div>
          <div>
            <span className="font-medium text-foreground">
              <Receipt className="w-4 h-4 inline mr-1.5" />
              Create an invoice
            </span>
            <p className="text-sm text-foreground-muted">Generate an invoice for the selected services</p>
          </div>
        </label>
      </div>

      {/* Invoice Options */}
      {formData.createInvoice && (
        <div className="space-y-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
          {/* Require Payment */}
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={formData.requirePaymentFirst}
              onCheckedChange={(checked) => updateFormData({ requirePaymentFirst: checked === true })}
            />
            <div>
              <span className="font-medium text-foreground">Require payment before gallery access</span>
              <p className="text-sm text-foreground-muted">
                Client must pay before viewing photos
              </p>
            </div>
          </label>

          {/* Invoice Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Invoice Notes
            </label>
            <textarea
              value={formData.invoiceNotes}
              onChange={(e) => updateFormData({ invoiceNotes: e.target.value })}
              placeholder="Add any notes for the invoice..."
              rows={2}
              className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-start justify-between gap-4 flex-wrap pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-[var(--background-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
