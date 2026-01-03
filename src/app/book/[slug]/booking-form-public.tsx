"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { submitBookingForm } from "@/lib/actions/booking-forms";
import type { Industry, FormFieldType } from "@prisma/client";

interface FieldValidation {
  options?: string[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  sortOrder: number;
  industries: Industry[];
  validation: FieldValidation | null;
  [key: string]: unknown;
}

interface FormService {
  serviceId: string;
  sortOrder: number;
  isDefault: boolean;
  service: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    duration: string | number | null;
  };
}

interface BookingForm {
  id: string;
  organizationId?: string;
  name: string;
  slug: string;
  description: string | null;
  industry: Industry | null;
  isPublished?: boolean;
  headline: string | null;
  subheadline: string | null;
  heroImageUrl: string | null;
  logoOverrideUrl?: string | null;
  primaryColor: string | null;
  requireApproval?: boolean;
  fields?: FormField[];
  services?: FormService[];
  organization?: Organization;
  [key: string]: unknown;
}

interface Organization {
  id?: string;
  name: string;
  slug?: string;
  logoUrl?: string | null;
  logo?: string | null;
  primaryColor?: string | null;
  publicPhone?: string | null;
  publicEmail?: string | null;
  industries?: Industry[];
  primaryIndustry?: Industry | null;
  settings?: unknown;
  [key: string]: unknown;
}

interface BookingFormPublicProps {
  form: BookingForm;
  organization: Organization | null;
}

const industryLabels: Record<Industry, string> = {
  real_estate: "Real Estate",
  commercial: "Commercial",
  events: "Events",
  portraits: "Portraits",
  food: "Food & Hospitality",
  product: "Product",
};

export function BookingFormPublic({ form, organization }: BookingFormPublicProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const services = form.services ?? [];
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(form.industry);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [selectedService, setSelectedService] = useState<string | null>(
    services.find((s) => s.isDefault)?.serviceId || services[0]?.serviceId || null
  );
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const primaryColor = form.primaryColor || "#3b82f6";
  const logo = form.logoOverrideUrl || organization?.logo;

  // Filter fields based on selected industry
  const visibleFields = (form.fields || [])
    .filter((field) => {
      if (field.industries.length === 0) return true;
      if (!selectedIndustry) return true;
      return field.industries.includes(selectedIndustry);
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Check if we need to show industry selector
  const showIndustrySelector =
    !form.industry && organization?.industries && organization.industries.length > 1;

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user types
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate contact info
    if (!contactInfo.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!contactInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Validate required fields
    visibleFields.forEach((field) => {
      if (field.isRequired) {
        const value = formData[field.id];
        if (value === undefined || value === null || value === "") {
          newErrors[field.id] = `${field.label} is required`;
        }
      }

      // Validate field constraints
      const value = formData[field.id];
      if (value && field.validation) {
        if (field.validation.minLength && typeof value === "string" && value.length < field.validation.minLength) {
          newErrors[field.id] = `Minimum ${field.validation.minLength} characters required`;
        }
        if (field.validation.maxLength && typeof value === "string" && value.length > field.validation.maxLength) {
          newErrors[field.id] = `Maximum ${field.validation.maxLength} characters allowed`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      try {
        await submitBookingForm({
          bookingFormId: form.id,
          data: formData,
          clientName: contactInfo.name,
          clientEmail: contactInfo.email,
          clientPhone: contactInfo.phone || null,
          preferredDate: contactInfo.preferredDate
            ? new Date(contactInfo.preferredDate).toISOString()
            : null,
          preferredTime: contactInfo.preferredTime || null,
          serviceId: selectedService,
        });

        // Redirect to confirmation page
        router.push(`/book/${form.slug}/confirmation`);
      } catch (error) {
        console.error("Error submitting form:", error);
        setSubmitError("Failed to submit form. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="relative py-12 px-6"
        style={{ backgroundColor: `${primaryColor}10` }}
      >
        <div className="max-w-2xl mx-auto text-center">
          {logo && (
            <div className="mb-6">
              <Image
                src={logo}
                alt={organization?.name || "Logo"}
                width={120}
                height={40}
                className="mx-auto h-10 w-auto object-contain"
              />
            </div>
          )}
          <h1
            className="text-3xl font-bold mb-3"
            style={{ color: primaryColor }}
          >
            {form.headline || "Book Your Session"}
          </h1>
          {form.subheadline && (
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {form.subheadline}
            </p>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Industry Selector */}
          {showIndustrySelector && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                What type of photography do you need?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {organization?.industries?.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setSelectedIndustry(ind)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium border transition-all text-left",
                      selectedIndustry === ind
                        ? "text-white"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                    style={
                      selectedIndustry === ind
                        ? { backgroundColor: primaryColor, borderColor: primaryColor }
                        : undefined
                    }
                  >
                    {industryLabels[ind]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Service Selection */}
          {form.services && form.services.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Select a Service
              </label>
              <div className="space-y-2">
                {form.services.map((formService) => (
                  <button
                    key={formService.serviceId}
                    type="button"
                    onClick={() => setSelectedService(formService.serviceId)}
                    className={cn(
                      "w-full px-4 py-4 rounded-lg border transition-all text-left",
                      selectedService === formService.serviceId
                        ? "border-2"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                    style={
                      selectedService === formService.serviceId
                        ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formService.service.name}
                        </p>
                        {formService.service.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {formService.service.description}
                          </p>
                        )}
                      </div>
                      {formService.service.price && (
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${formService.service.price}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2",
                    errors.name
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                  style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2",
                    errors.email
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                  style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
                />
              </div>
            </div>
          </div>

          {/* Preferred Date/Time */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Preferred Date & Time{" "}
              <span className="text-sm font-normal text-gray-500">(optional)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={contactInfo.preferredDate}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, preferredDate: e.target.value }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Time
                </label>
                <select
                  value={contactInfo.preferredTime}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, preferredTime: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
                >
                  <option value="">Select a time</option>
                  <option value="Morning (8am-12pm)">Morning (8am-12pm)</option>
                  <option value="Afternoon (12pm-5pm)">Afternoon (12pm-5pm)</option>
                  <option value="Evening (5pm-8pm)">Evening (5pm-8pm)</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Form Fields */}
          {visibleFields.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Project Details
              </h2>
              <div className="space-y-4">
                {visibleFields.map((field) => (
                  <FormFieldInput
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    error={errors[field.id]}
                    primaryColor={primaryColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-6 rounded-lg text-white font-medium text-lg transition-opacity disabled:opacity-70"
            style={{ backgroundColor: primaryColor }}
          >
            {isPending ? "Submitting..." : "Submit Request"}
          </button>

          {form.requireApproval && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Your request will be reviewed and we'll get back to you shortly.
            </p>
          )}
        </form>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Powered by{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            PhotoProOS
          </span>
        </p>
      </footer>
    </div>
  );
}

// Form Field Input Component
function FormFieldInput({
  field,
  value,
  onChange,
  error,
  primaryColor,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  primaryColor: string;
}) {
  const inputStyles = cn(
    "w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2",
    error ? "border-red-500 focus:ring-red-200" : "border-gray-200 dark:border-gray-700"
  );

  const renderInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "url":
        return (
          <input
            type={field.type === "phone" ? "tel" : field.type}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || undefined}
            className={inputStyles}
            style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
          />
        );

      case "textarea":
        return (
          <textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || undefined}
            rows={4}
            className={cn(inputStyles, "resize-none")}
            style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={(value as number) ?? ""}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : "")}
            placeholder={field.placeholder || undefined}
            min={field.validation?.min}
            max={field.validation?.max}
            className={inputStyles}
            style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputStyles}
            style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
          />
        );

      case "time":
        return (
          <input
            type="time"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputStyles}
            style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
          />
        );

      case "datetime":
        return (
          <input
            type="datetime-local"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputStyles}
            style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
          />
        );

      case "select":
        return (
          <select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputStyles}
            style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
          >
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.validation?.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {field.validation?.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, opt]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== opt));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                  style={{ accentColor: primaryColor }}
                />
                <span className="text-gray-900 dark:text-gray-100">{opt}</span>
              </label>
            ))}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.validation?.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="h-4 w-4"
                  style={{ accentColor: primaryColor }}
                />
                <span className="text-gray-900 dark:text-gray-100">{opt}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
              style={{ accentColor: primaryColor }}
            />
            <span className="text-gray-900 dark:text-gray-100">
              {field.placeholder || "Yes"}
            </span>
          </label>
        );

      case "address":
        return (
          <textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "Enter address"}
            rows={3}
            className={cn(inputStyles, "resize-none")}
            style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
          />
        );

      case "file":
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            File upload is not yet available. Please describe your files in the notes.
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {field.label}
        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {field.helpText && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{field.helpText}</p>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
