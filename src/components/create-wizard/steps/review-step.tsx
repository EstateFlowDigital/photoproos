"use client";

import { CheckCircle, ArrowLeft, User, Briefcase, Image, Calendar, Receipt, Loader2 } from "lucide-react";
import type { WizardData } from "@/app/(dashboard)/create/create-wizard-client";

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  priceCents: number;
  duration: string | null;
  deliverables: string[];
  isDefault: boolean;
}

interface Location {
  id: string;
  formattedAddress: string;
  city: string | null;
  state: string | null;
}

interface BookingType {
  id: string;
  name: string;
  color: string | null;
  durationMinutes: number;
}

interface ReviewStepProps {
  formData: WizardData;
  updateFormData: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  clients: Client[];
  services: Service[];
  locations: Location[];
  bookingTypes: BookingType[];
  totalPrice: number;
  onSubmit: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: "Real Estate",
  portrait: "Portrait",
  event: "Event",
  commercial: "Commercial",
  wedding: "Wedding",
  product: "Product",
  other: "Other",
};

export function ReviewStep({
  formData,
  onBack,
  isLoading,
  clients,
  services,
  locations,
  bookingTypes,
  totalPrice,
  onSubmit,
}: ReviewStepProps) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const getClientInfo = () => {
    if (formData.clientMode === "new") {
      return {
        name: formData.newClient.fullName,
        email: formData.newClient.email,
        phone: formData.newClient.phone,
        company: formData.newClient.company,
        isNew: true,
      };
    }
    const client = clients.find((c) => c.id === formData.clientId);
    return {
      name: client?.fullName || "Unknown",
      email: client?.email || "",
      phone: client?.phone || "",
      company: client?.company || "",
      isNew: false,
    };
  };

  const getSelectedServices = () => {
    return formData.selectedServices.map((selected) => {
      const service = services.find((s) => s.id === selected.serviceId);
      return {
        ...service,
        isPrimary: selected.isPrimary,
      };
    });
  };

  const getBookingType = () => {
    return bookingTypes.find((t) => t.id === formData.bookingTypeId);
  };

  const getLocation = () => {
    return locations.find((l) => l.id === formData.locationId);
  };

  const clientInfo = getClientInfo();
  const selectedServices = getSelectedServices();
  const bookingType = getBookingType();
  const location = getLocation();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--success)]/10 text-[var(--success)] mb-2">
          <CheckCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Review & Create
        </h2>
        <p className="text-foreground-secondary">
          Verify the details before creating your project
        </p>
      </div>

      {/* Summary Sections */}
      <div className="space-y-4">
        {/* Client */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="font-medium text-foreground">Client</h3>
            {clientInfo.isNew && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--success)]/20 text-[var(--success)]">
                New
              </span>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-foreground">{clientInfo.name}</p>
            <p className="text-foreground-muted">{clientInfo.email}</p>
            {clientInfo.phone && <p className="text-foreground-muted">{clientInfo.phone}</p>}
            {clientInfo.company && <p className="text-foreground-muted">{clientInfo.company}</p>}
          </div>
        </div>

        {/* Services */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="font-medium text-foreground">Services</h3>
            <span className="text-sm text-foreground-muted">
              ({selectedServices.length})
            </span>
          </div>
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div key={service?.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-foreground">{service?.name}</span>
                  {service?.isPrimary && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--primary)]/20 text-[var(--primary)]">
                      Primary
                    </span>
                  )}
                  <span className="text-xs text-foreground-muted">
                    {CATEGORY_LABELS[service?.category || "other"]}
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {formatPrice(service?.priceCents || 0)}
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-[var(--border)] flex items-center justify-between">
              <span className="font-medium text-foreground">Total</span>
              <span className="text-lg font-bold text-[var(--primary)]">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="font-medium text-foreground">Gallery</h3>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-foreground font-medium">{formData.galleryName}</p>
            {formData.galleryDescription && (
              <p className="text-foreground-muted">{formData.galleryDescription}</p>
            )}
            {formData.galleryPassword && (
              <p className="text-foreground-muted">
                Password protected
              </p>
            )}
          </div>
        </div>

        {/* Booking */}
        {formData.createBooking && (
          <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="font-medium text-foreground">Booking</h3>
            </div>
            <div className="space-y-1 text-sm">
              {bookingType && (
                <div className="flex items-center gap-2">
                  {bookingType.color && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: bookingType.color }}
                    />
                  )}
                  <span className="text-foreground">{bookingType.name}</span>
                </div>
              )}
              <p className="text-foreground">
                {formatDate(formData.scheduledDate)} - {formatDate(formData.scheduledEndDate)}
              </p>
              {location && (
                <p className="text-foreground-muted">{location.formattedAddress}</p>
              )}
              {formData.bookingNotes && (
                <p className="text-foreground-muted italic">{formData.bookingNotes}</p>
              )}
            </div>
          </div>
        )}

        {/* Invoice */}
        {formData.createInvoice && (
          <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="font-medium text-foreground">Invoice</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-foreground">
                Invoice for {formatPrice(totalPrice)}
              </p>
              {formData.requirePaymentFirst && (
                <p className="text-foreground-muted">
                  Payment required before gallery access
                </p>
              )}
              {formData.invoiceNotes && (
                <p className="text-foreground-muted italic">{formData.invoiceNotes}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-[var(--background-secondary)] transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--success)] text-white font-medium hover:bg-[var(--success)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Create Project
            </>
          )}
        </button>
      </div>
    </div>
  );
}
