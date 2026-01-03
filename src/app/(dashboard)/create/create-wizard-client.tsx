"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ClientStep } from "@/components/create-wizard/steps/client-step";
import { ServicesStep } from "@/components/create-wizard/steps/services-step";
import { GalleryStep } from "@/components/create-wizard/steps/gallery-step";
import { SchedulingStep } from "@/components/create-wizard/steps/scheduling-step";
import { ReviewStep } from "@/components/create-wizard/steps/review-step";
import { createProjectBundle, type CreateProjectBundleInput } from "@/lib/actions/create-wizard";
import { useToast } from "@/components/ui/toast";

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
  name: string;
  address: string | null;
}

interface BookingType {
  id: string;
  name: string;
  color: string | null;
  durationMinutes: number;
}

interface CreateWizardClientProps {
  clients: Client[];
  services: Service[];
  locations: Location[];
  bookingTypes: BookingType[];
}

export interface WizardData {
  // Client
  clientMode: "existing" | "new";
  clientId: string;
  newClient: {
    fullName: string;
    email: string;
    phone: string;
    company: string;
  };

  // Services
  selectedServices: {
    serviceId: string;
    isPrimary: boolean;
    priceCentsOverride?: number | null;
  }[];

  // Gallery
  galleryName: string;
  galleryDescription: string;
  galleryPassword: string;

  // Booking
  createBooking: boolean;
  scheduledDate: Date | null;
  scheduledEndDate: Date | null;
  bookingTypeId: string;
  locationId: string;
  bookingNotes: string;

  // Invoice
  createInvoice: boolean;
  requirePaymentFirst: boolean;
  invoiceNotes: string;
}

const STEPS = [
  { id: "client", title: "Client" },
  { id: "services", title: "Services" },
  { id: "gallery", title: "Gallery" },
  { id: "scheduling", title: "Scheduling" },
  { id: "review", title: "Review" },
];

export function CreateWizardClient({
  clients,
  services,
  locations,
  bookingTypes,
}: CreateWizardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<WizardData>({
    // Client
    clientMode: "existing",
    clientId: "",
    newClient: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
    },

    // Services
    selectedServices: [],

    // Gallery
    galleryName: "",
    galleryDescription: "",
    galleryPassword: "",

    // Booking
    createBooking: false,
    scheduledDate: null,
    scheduledEndDate: null,
    bookingTypeId: "",
    locationId: "",
    bookingNotes: "",

    // Invoice
    createInvoice: false,
    requirePaymentFirst: false,
    invoiceNotes: "",
  });

  const updateFormData = useCallback((updates: Partial<WizardData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const input: CreateProjectBundleInput = {
        clientMode: formData.clientMode,
        clientId: formData.clientMode === "existing" ? formData.clientId : undefined,
        newClient: formData.clientMode === "new" ? formData.newClient : undefined,
        services: formData.selectedServices,
        galleryName: formData.galleryName,
        galleryDescription: formData.galleryDescription || undefined,
        galleryPassword: formData.galleryPassword || undefined,
        createBooking: formData.createBooking,
        scheduledDate: formData.scheduledDate || undefined,
        scheduledEndDate: formData.scheduledEndDate || undefined,
        bookingTypeId: formData.bookingTypeId || undefined,
        locationId: formData.locationId || undefined,
        bookingNotes: formData.bookingNotes || undefined,
        createInvoice: formData.createInvoice,
        requirePaymentFirst: formData.requirePaymentFirst,
        invoiceNotes: formData.invoiceNotes || undefined,
      };

      const result = await createProjectBundle(input);

      if (result.success) {
        showToast("Project created successfully!", "success");
        router.push(`/galleries/${result.data.galleryId}`);
      } else {
        showToast(result.error, "error");
      }
    } catch (error) {
      showToast("Failed to create project", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPrice = () => {
    let total = 0;
    for (const selected of formData.selectedServices) {
      const service = services.find((s) => s.id === selected.serviceId);
      if (service) {
        total += selected.priceCentsOverride ?? service.priceCents;
      }
    }
    return total;
  };

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      isLoading,
    };

    switch (currentStep) {
      case 0:
        return <ClientStep {...commonProps} clients={clients} />;
      case 1:
        return <ServicesStep {...commonProps} services={services} />;
      case 2:
        return <GalleryStep {...commonProps} />;
      case 3:
        return (
          <SchedulingStep
            {...commonProps}
            locations={locations}
            bookingTypes={bookingTypes}
          />
        );
      case 4:
        return (
          <ReviewStep
            {...commonProps}
            clients={clients}
            services={services}
            locations={locations}
            bookingTypes={bookingTypes}
            totalPrice={getTotalPrice()}
            onSubmit={handleSubmit}
          />
        );
      default:
        return <ClientStep {...commonProps} clients={clients} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-foreground">New Project</h1>
            <Link
              href="/dashboard"
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[var(--background-secondary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </Link>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isUpcoming = index > currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                        isCompleted && "bg-[var(--success)] text-white",
                        isCurrent && "bg-[var(--primary)] text-white",
                        isUpcoming && "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-xs font-medium hidden sm:block",
                        isCurrent && "text-foreground",
                        !isCurrent && "text-foreground-muted"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        index < currentStep
                          ? "bg-[var(--success)]"
                          : "bg-[var(--background-secondary)]"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
