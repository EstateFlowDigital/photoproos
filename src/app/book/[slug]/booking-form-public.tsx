"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Briefcase,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  Lightbulb,
  Moon,
  Package,
  Palette,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  UtensilsCrossed,
} from "lucide-react";
import type { Industry, FormFieldType } from "@prisma/client";

import { cn } from "@/lib/utils";
import { submitBookingForm } from "@/lib/actions/booking-forms";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import type { ClientPreferences } from "@/lib/types/client-preferences";
import { updateClientBookingPreferences } from "@/lib/actions/client-preferences";

// File upload types
interface UploadedFile {
  filename: string;
  url: string;
  key: string;
  size: number;
  type: string;
}

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
  conditionalOn?: string | null;
  conditionalValue?: string | null;
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

interface ClientProfile {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  preferences: ClientPreferences | null;
}

interface BookingFormPublicProps {
  form: BookingForm;
  organization: Organization | null;
  clientProfile?: ClientProfile | null;
}

interface PreferenceOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface PreferenceGroup {
  key: string;
  title: string;
  description?: string;
  required?: boolean;
  options: PreferenceOption[];
}

interface ChecklistConfig {
  title: string;
  description?: string;
  items: string[];
}

const BOOKING_STEPS = [
  { id: "select", title: "Select" },
  { id: "contact", title: "Contact" },
  { id: "details", title: "Details" },
  { id: "preferences", title: "Preferences" },
];

const POLICY_VERSION = "2026-01-07";

const industryOptions: Record<Industry, { label: string; description: string; icon: React.ReactNode }>
  = {
  real_estate: {
    label: "Real Estate",
    description: "Residential and property listings",
    icon: <Home className="h-4 w-4" />,
  },
  commercial: {
    label: "Commercial",
    description: "Corporate and architectural shoots",
    icon: <Briefcase className="h-4 w-4" />,
  },
  events: {
    label: "Events",
    description: "Weddings and live events",
    icon: <Calendar className="h-4 w-4" />,
  },
  portraits: {
    label: "Portraits",
    description: "Headshots and personal sessions",
    icon: <User className="h-4 w-4" />,
  },
  food: {
    label: "Food",
    description: "Restaurants and hospitality",
    icon: <UtensilsCrossed className="h-4 w-4" />,
  },
  product: {
    label: "Product",
    description: "E-commerce and catalog imagery",
    icon: <Package className="h-4 w-4" />,
  },
};

const CHECKLISTS: Partial<Record<Industry, ChecklistConfig>> = {
  real_estate: {
    title: "Real Estate Prep Checklist",
    description: "A quick run-through to make sure the property is camera-ready.",
    items: [
      "Home is cleaned and staged",
      "Counters and surfaces are clear",
      "Cars are removed from driveway",
      "Exterior is tidy and lawn is mowed",
      "Pets are secured during the shoot",
      "Interior lights are accessible",
    ],
  },
  commercial: {
    title: "Commercial Shoot Checklist",
    description: "Set up the space so we can move quickly and capture every detail.",
    items: [
      "Reception or lobby is tidy",
      "Key work areas are staged",
      "Branding elements are visible",
      "Exterior signage is clean",
      "Access codes or keys provided",
    ],
  },
  portraits: {
    title: "Portrait Session Checklist",
    description: "Help us match the look you want and stay on schedule.",
    items: [
      "Wardrobe selected and ready",
      "Hair and makeup planned",
      "Reference images shared (if any)",
      "Arrival time confirmed",
    ],
  },
  events: {
    title: "Event Coverage Checklist",
    description: "Confirm key moments so we capture the full story.",
    items: [
      "Timeline shared with our team",
      "Key moments identified",
      "Point of contact assigned",
      "Venue access confirmed",
    ],
  },
  food: {
    title: "Food Shoot Checklist",
    description: "Make sure the kitchen and styling teams are aligned.",
    items: [
      "Menu items selected for capture",
      "Props and plating ready",
      "Chef or stylist on-site",
      "Branding guidelines provided",
    ],
  },
  product: {
    title: "Product Shoot Checklist",
    description: "Ensure we capture everything needed for sales and marketing.",
    items: [
      "Products prepared and cleaned",
      "SKU list or shot list provided",
      "Packaging variants included",
      "Usage goals specified (web, print, ads)",
    ],
  },
};

const DEFAULT_CHECKLIST: ChecklistConfig = {
  title: "Session Readiness",
  description: "A few quick confirmations before we lock in the shoot.",
  items: [
    "Location details are accurate",
    "Access instructions shared",
    "We can reach you on shoot day",
  ],
};

const PREFERENCE_GROUPS: Partial<Record<Industry, PreferenceGroup[]>> = {
  real_estate: [
    {
      key: "pref_blinds",
      title: "Blinds",
      description: "How should window coverings be handled?",
      required: true,
      options: [
        { value: "open", label: "Open", description: "Natural light and views", icon: <Sun className="h-4 w-4" /> },
        { value: "closed", label: "Closed", description: "Clean, uniform look", icon: <Moon className="h-4 w-4" /> },
        { value: "photographer", label: "Photographer decides", description: "We adjust room by room" },
      ],
    },
    {
      key: "pref_lights",
      title: "Lights",
      description: "Interior lighting preference",
      options: [
        { value: "on", label: "Lights on", description: "Warm, inviting feel", icon: <Lightbulb className="h-4 w-4" /> },
        { value: "off", label: "Lights off", description: "Clean daylight look" },
        { value: "mixed", label: "Mixed", description: "We decide per room" },
      ],
    },
    {
      key: "pref_exterior",
      title: "Exterior Coverage",
      description: "Preferred exterior style",
      options: [
        { value: "standard", label: "Standard", description: "Daylight exterior" },
        { value: "twilight", label: "Twilight", description: "Evening glow" },
        { value: "both", label: "Both", description: "Capture both looks", icon: <Sparkles className="h-4 w-4" /> },
      ],
    },
  ],
  portraits: [
    {
      key: "pref_background",
      title: "Backdrop",
      description: "Preferred background color",
      options: [
        { value: "light", label: "Light", description: "Clean, airy look", icon: <Palette className="h-4 w-4" /> },
        { value: "dark", label: "Dark", description: "Moody, dramatic" },
        { value: "neutral", label: "Neutral", description: "Soft, balanced" },
        { value: "custom", label: "Custom", description: "We will note your request" },
      ],
    },
    {
      key: "pref_retouching",
      title: "Retouching",
      description: "How much retouching do you prefer?",
      options: [
        { value: "light", label: "Light", description: "Natural cleanup" },
        { value: "standard", label: "Standard", description: "Balanced polish" },
        { value: "editorial", label: "Editorial", description: "High-end finish", icon: <Sparkles className="h-4 w-4" /> },
      ],
    },
  ],
  events: [
    {
      key: "pref_event_focus",
      title: "Coverage Focus",
      description: "What should we prioritize?",
      options: [
        { value: "candid", label: "Candid", description: "Natural moments" },
        { value: "posed", label: "Posed", description: "Structured portraits" },
        { value: "mixed", label: "Mixed", description: "Balanced coverage" },
      ],
    },
  ],
  commercial: [
    {
      key: "pref_branding",
      title: "Branding Emphasis",
      description: "How prominent should branding be?",
      options: [
        { value: "subtle", label: "Subtle", description: "Clean environment" },
        { value: "balanced", label: "Balanced", description: "Logo plus lifestyle" },
        { value: "bold", label: "Bold", description: "Brand-forward" },
      ],
    },
  ],
  food: [
    {
      key: "pref_food_style",
      title: "Food Styling",
      description: "Preferred visual style",
      options: [
        { value: "fresh", label: "Fresh & Bright", description: "Light, airy" },
        { value: "moody", label: "Moody", description: "Deep contrast" },
        { value: "editorial", label: "Editorial", description: "Magazine-ready" },
      ],
    },
  ],
  product: [
    {
      key: "pref_product_style",
      title: "Product Styling",
      description: "Preferred product look",
      options: [
        { value: "clean", label: "Clean", description: "Simple, minimal" },
        { value: "lifestyle", label: "Lifestyle", description: "Contextual scenes" },
        { value: "hero", label: "Hero", description: "Premium spotlight" },
      ],
    },
  ],
};

export function BookingFormPublic({ form, organization, clientProfile }: BookingFormPublicProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const services = form.services ?? [];
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(form.industry);
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const bookingPrefs = clientProfile?.preferences?.booking;
    return bookingPrefs?.preferences ? { ...bookingPrefs.preferences } : {};
  });
  const [selectedService, setSelectedService] = useState<string | null>(
    services.find((s) => s.isDefault)?.serviceId || services[0]?.serviceId || null
  );
  const [contactInfo, setContactInfo] = useState({
    name: clientProfile?.fullName || "",
    email: clientProfile?.email || "",
    phone: clientProfile?.phone || "",
    preferredDate: "",
    preferredTime: "",
  });
  const [clientExtras, setClientExtras] = useState(() => ({
    birthDate: clientProfile?.preferences?.booking?.profile?.birthDate || "",
    thankYouPreference: clientProfile?.preferences?.booking?.profile?.thankYouPreference || "",
    giftPreferenceNotes: clientProfile?.preferences?.booking?.profile?.giftPreferenceNotes || "",
  }));
  const [preferenceSelections, setPreferenceSelections] = useState<Record<string, string>>(() => {
    const bookingPrefs = clientProfile?.preferences?.booking;
    return bookingPrefs?.preferences ? { ...bookingPrefs.preferences } : {};
  });
  const [notes, setNotes] = useState("" as string);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyAcceptedAt, setPolicyAcceptedAt] = useState<string | null>(
    clientProfile?.preferences?.booking?.agreements?.policyAcceptedAt || null
  );
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const prefillApplied = useRef(false);

  const primaryColor = form.primaryColor || "#3b82f6";
  const logo = form.logoOverrideUrl || organization?.logo;
  const isReturningClient = Boolean(clientProfile?.id);

  const showIndustrySelector =
    !form.industry && organization?.industries && organization.industries.length > 1;

  const visibleFields = useMemo(() => {
    const fields = form.fields || [];
    const filtered = fields.filter((field) => {
      if (field.industries.length > 0 && selectedIndustry && !field.industries.includes(selectedIndustry)) {
        return false;
      }
      if (field.conditionalOn && field.conditionalValue !== undefined && field.conditionalValue !== null) {
        const dependentValue = formData[field.conditionalOn];
        if (Array.isArray(dependentValue)) {
          return dependentValue.includes(field.conditionalValue);
        }
        return dependentValue === field.conditionalValue;
      }
      return true;
    });
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [form.fields, formData, selectedIndustry]);

  const checklistConfig = useMemo(() => {
    if (selectedIndustry && CHECKLISTS[selectedIndustry]) {
      return CHECKLISTS[selectedIndustry] as ChecklistConfig;
    }
    return DEFAULT_CHECKLIST;
  }, [selectedIndustry]);

  const preferenceGroups = useMemo(() => {
    if (selectedIndustry && PREFERENCE_GROUPS[selectedIndustry]) {
      return PREFERENCE_GROUPS[selectedIndustry] as PreferenceGroup[];
    }
    return [];
  }, [selectedIndustry]);

  useEffect(() => {
    if (prefillApplied.current) return;
    if (!clientProfile) return;

    const bookingPrefs = clientProfile.preferences?.booking;
    if (bookingPrefs?.preferences) {
      setPreferenceSelections({ ...bookingPrefs.preferences });
    }

    prefillApplied.current = true;
  }, [clientProfile]);

  useEffect(() => {
    if (!showIndustrySelector) return;
    if (selectedIndustry) return;
    const preferredIndustry = clientProfile?.preferences?.booking?.preferredIndustry as Industry | undefined;
    if (preferredIndustry && industryOptions[preferredIndustry]) {
      setSelectedIndustry(preferredIndustry);
    }
  }, [clientProfile, selectedIndustry, showIndustrySelector]);

  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    checklistConfig.items.forEach((item) => {
      initialState[item] = false;
    });
    setChecklistState(initialState);
  }, [checklistConfig]);

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferenceSelections((prev) => ({ ...prev, [key]: value }));
  };

  const handleChecklistToggle = (item: string) => {
    setChecklistState((prev) => ({ ...prev, [item]: !prev[item] }));
    if (errors.checklist) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.checklist;
        return next;
      });
    }
  };

  const handleSelectAllChecklist = () => {
    const allChecked = checklistConfig.items.every((item) => checklistState[item]);
    const updated: Record<string, boolean> = {};
    checklistConfig.items.forEach((item) => {
      updated[item] = !allChecked;
    });
    setChecklistState(updated);
  };

  const handlePolicyAccept = () => {
    const acceptedAt = new Date().toISOString();
    setPolicyAcceptedAt(acceptedAt);
    setPolicyOpen(false);
    if (errors.policy) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.policy;
        return next;
      });
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateFields = (fields: FormField[]) => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (!field.isRequired) return;
      const value = formData[field.id];
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });

    fields.forEach((field) => {
      const value = formData[field.id];
      if (!value || !field.validation) return;
      if (field.validation.minLength && typeof value === "string" && value.length < field.validation.minLength) {
        newErrors[field.id] = `Minimum ${field.validation.minLength} characters required`;
      }
      if (field.validation.maxLength && typeof value === "string" && value.length > field.validation.maxLength) {
        newErrors[field.id] = `Maximum ${field.validation.maxLength} characters allowed`;
      }
      if (field.validation.min !== undefined && typeof value === "number" && value < field.validation.min) {
        newErrors[field.id] = `Minimum value is ${field.validation.min}`;
      }
      if (field.validation.max !== undefined && typeof value === "number" && value > field.validation.max) {
        newErrors[field.id] = `Maximum value is ${field.validation.max}`;
      }
    });

    return newErrors;
  };

  const validateStep = (stepIndex: number) => {
    const newErrors: Record<string, string> = {};

    if (stepIndex === 0) {
      if (showIndustrySelector && !selectedIndustry) {
        newErrors.industry = "Please select an industry";
      }
      if (services.length > 0 && !selectedService) {
        newErrors.service = "Please select a service";
      }
    }

    if (stepIndex === 1) {
      if (!contactInfo.name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!contactInfo.email.trim() || !validateEmail(contactInfo.email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (stepIndex === 2) {
      const requiresPropertyDetails = selectedIndustry === "real_estate" || selectedIndustry === "commercial";
      if (requiresPropertyDetails) {
        if (!formData.propertyAddress) {
          newErrors.propertyAddress = "Address is required";
        }
        if (!formData.squareFootage) {
          newErrors.squareFootage = "Square footage is required";
        }
      }
      const fieldErrors = validateFields(visibleFields);
      Object.assign(newErrors, fieldErrors);
    }

    if (stepIndex === 3) {
      const allChecked = checklistConfig.items.every((item) => checklistState[item]);
      if (!allChecked) {
        newErrors.checklist = "Please confirm each checklist item";
      }
      if (!policyAcceptedAt) {
        newErrors.policy = "Please accept the policies to continue";
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, BOOKING_STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const canSubmit = validateStep(3);
    if (!canSubmit) return;

    const submissionData = {
      ...formData,
      notes,
      selectedIndustry,
      preferences: preferenceSelections,
      checklist: {
        title: checklistConfig.title,
        items: checklistConfig.items,
        confirmedItems: checklistConfig.items.filter((item) => checklistState[item]),
        confirmedAt: new Date().toISOString(),
      },
      policy: {
        acceptedAt: policyAcceptedAt,
        version: POLICY_VERSION,
      },
      clientProfile: {
        birthDate: clientExtras.birthDate || null,
        thankYouPreference: clientExtras.thankYouPreference || null,
        giftPreferenceNotes: clientExtras.giftPreferenceNotes || null,
      },
      returningClient: isReturningClient,
      clientId: clientProfile?.id || null,
    };

    startTransition(async () => {
      try {
        await submitBookingForm({
          bookingFormId: form.id,
          data: submissionData,
          clientName: contactInfo.name,
          clientEmail: contactInfo.email,
          clientPhone: contactInfo.phone || null,
          preferredDate: contactInfo.preferredDate
            ? new Date(contactInfo.preferredDate).toISOString()
            : null,
          preferredTime: contactInfo.preferredTime || null,
          serviceId: selectedService,
        });

        if (isReturningClient) {
          try {
            await updateClientBookingPreferences({
              profile: {
                birthDate: clientExtras.birthDate || undefined,
                thankYouPreference: clientExtras.thankYouPreference || undefined,
                giftPreferenceNotes: clientExtras.giftPreferenceNotes || undefined,
              },
              preferences: preferenceSelections,
              agreements: {
                policyAcceptedAt: policyAcceptedAt || undefined,
                policyVersion: POLICY_VERSION,
                checklistAcceptedAt: new Date().toISOString(),
              },
              preferredIndustry: selectedIndustry || undefined,
            });
          } catch (preferenceError) {
            console.error("Failed to update client preferences:", preferenceError);
          }
        }

        router.push(`/book/${form.slug}/confirmation`);
      } catch (error) {
        console.error("Error submitting form:", error);
        setSubmitError("Failed to submit form. Please try again.");
      }
    });
  };

  return (
    <div
      className="min-h-screen bg-[var(--background)]"
      style={{ "--primary": primaryColor } as React.CSSProperties}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at top left, ${primaryColor}20, transparent 60%), radial-gradient(circle at bottom right, ${primaryColor}10, transparent 55%)`,
          }}
        />
        {form.heroImageUrl && (
          <div className="absolute inset-0 opacity-10">
            <Image
              src={form.heroImageUrl}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="relative max-w-3xl mx-auto px-6 py-12 text-center">
          {logo && (
            <div className="mb-6">
              <Image
                src={logo}
                alt={organization?.name || "Logo"}
                width={140}
                height={48}
                className="mx-auto h-10 w-auto object-contain"
              />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
            {form.headline || "Book Your Session"}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-foreground-muted">
            {form.subheadline || "Tell us what you need and we will handle the rest."}
          </p>
          {(organization?.publicPhone || organization?.publicEmail) && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-foreground-muted">
              {organization?.publicPhone && (
                <span>{organization.publicPhone}</span>
              )}
              {organization?.publicEmail && (
                <span>{organization.publicEmail}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Step {currentStep + 1} of {BOOKING_STEPS.length}</p>
                  <h2 className="text-xl font-semibold text-foreground">{BOOKING_STEPS[currentStep].title}</h2>
                </div>
                <div className="hidden md:block w-2/3">
                  <ProgressIndicator steps={BOOKING_STEPS} currentStep={currentStep} />
                </div>
              </div>
              <div className="md:hidden">
                <ProgressIndicator steps={BOOKING_STEPS} currentStep={currentStep} />
              </div>
            </div>
          </div>

          {/* Step 1: Select */}
          {currentStep === 0 && (
            <div className="space-y-8">
              {showIndustrySelector && (
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <StepHeader
                    title="What type of photography do you need?"
                    description="Pick the category that best matches your project."
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {organization?.industries?.map((industry) => {
                      const option = industryOptions[industry];
                      if (!option) return null;
                      const isSelected = selectedIndustry === industry;
                      return (
                        <button
                          key={industry}
                          type="button"
                          onClick={() => setSelectedIndustry(industry)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all",
                            isSelected
                              ? "border-transparent text-white shadow"
                              : "border-[var(--card-border)] text-foreground hover:border-[var(--border-hover)]"
                          )}
                          style={
                            isSelected
                              ? { backgroundColor: primaryColor }
                              : undefined
                          }
                        >
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full",
                            isSelected ? "bg-white/20" : "bg-[var(--background-tertiary)] text-foreground"
                          )}>
                            {option.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{option.label}</p>
                            <p className={cn("text-xs", isSelected ? "text-white/80" : "text-foreground-muted")}>{option.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.industry && (
                    <p className="mt-2 text-sm text-red-500">{errors.industry}</p>
                  )}
                </div>
              )}

              {form.services && form.services.length > 0 && (
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <StepHeader
                    title="Select a Service"
                    description="Choose the package that fits your goals."
                  />
                  <div className="grid gap-3">
                    {form.services.map((formService) => {
                      const isSelected = selectedService === formService.serviceId;
                      return (
                        <button
                          key={formService.serviceId}
                          type="button"
                          onClick={() => setSelectedService(formService.serviceId)}
                          className={cn(
                            "w-full rounded-xl border px-4 py-4 text-left transition-all",
                            isSelected
                              ? "border-transparent shadow"
                              : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                          )}
                          style={
                            isSelected
                              ? { backgroundColor: `${primaryColor}12`, borderColor: primaryColor }
                              : undefined
                          }
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {formService.service.name}
                              </p>
                              {formService.service.description && (
                                <p className="mt-1 text-xs text-foreground-muted">
                                  {formService.service.description}
                                </p>
                              )}
                            </div>
                            {formService.service.price && (
                              <span className="text-sm font-semibold text-foreground">
                                ${formService.service.price}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.service && (
                    <p className="mt-2 text-sm text-red-500">{errors.service}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Contact */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <StepHeader
                  title="Contact Information"
                  description={isReturningClient ? "We pre-filled your saved contact details." : "Tell us how to reach you."}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Your Name"
                    required
                    value={contactInfo.name}
                    onChange={(value) => setContactInfo((prev) => ({ ...prev, name: value }))}
                    error={errors.name}
                    primaryColor={primaryColor}
                  />
                  <InputField
                    label="Email"
                    required
                    type="email"
                    value={contactInfo.email}
                    onChange={(value) => setContactInfo((prev) => ({ ...prev, email: value }))}
                    error={errors.email}
                    primaryColor={primaryColor}
                  />
                  <InputField
                    label="Phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(value) => setContactInfo((prev) => ({ ...prev, phone: value }))}
                    primaryColor={primaryColor}
                  />
                </div>
              </div>

              {!isReturningClient && (
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <StepHeader
                    title="New Client Details"
                    description="Help us personalize your experience."
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Birthdate"
                      type="date"
                      value={clientExtras.birthDate}
                      onChange={(value) => setClientExtras((prev) => ({ ...prev, birthDate: value }))}
                      primaryColor={primaryColor}
                    />
                    <SelectField
                      label="Thank You Preference"
                      value={clientExtras.thankYouPreference}
                      onChange={(value) => setClientExtras((prev) => ({ ...prev, thankYouPreference: value }))}
                      options={[
                        { value: "gift_card", label: "Gift card" },
                        { value: "discount", label: "Discount on next shoot" },
                        { value: "prints", label: "Prints or album" },
                        { value: "surprise", label: "Surprise me" },
                      ]}
                      primaryColor={primaryColor}
                    />
                    <TextAreaField
                      label="Gift Notes"
                      value={clientExtras.giftPreferenceNotes}
                      onChange={(value) => setClientExtras((prev) => ({ ...prev, giftPreferenceNotes: value }))}
                      placeholder="Any preferences or ideas we should know about?"
                      primaryColor={primaryColor}
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <StepHeader
                  title="Preferred Date & Time"
                  description="Share your preferred timing and we will confirm availability."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Preferred Date"
                    type="date"
                    value={contactInfo.preferredDate}
                    onChange={(value) => setContactInfo((prev) => ({ ...prev, preferredDate: value }))}
                    primaryColor={primaryColor}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <SelectField
                    label="Preferred Time"
                    value={contactInfo.preferredTime}
                    onChange={(value) => setContactInfo((prev) => ({ ...prev, preferredTime: value }))}
                    options={[
                      { value: "Morning (8am-12pm)", label: "Morning (8am-12pm)" },
                      { value: "Afternoon (12pm-5pm)", label: "Afternoon (12pm-5pm)" },
                      { value: "Evening (5pm-8pm)", label: "Evening (5pm-8pm)" },
                      { value: "Flexible", label: "Flexible" },
                    ]}
                    primaryColor={primaryColor}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {(selectedIndustry === "real_estate" || selectedIndustry === "commercial") && (
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <StepHeader
                    title="Property Details"
                    description="We need the basics to prepare for the shoot."
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextAreaField
                      label="Property Address"
                      required
                      value={(formData.propertyAddress as string) || ""}
                      onChange={(value) => handleFieldChange("propertyAddress", value)}
                      error={errors.propertyAddress}
                      placeholder="Street, city, state, zip"
                      primaryColor={primaryColor}
                    />
                    <InputField
                      label="Square Footage"
                      required
                      type="number"
                      value={(formData.squareFootage as string) || ""}
                      onChange={(value) => handleFieldChange("squareFootage", value ? Number(value) : "")}
                      error={errors.squareFootage}
                      primaryColor={primaryColor}
                    />
                    <InputField
                      label="Bedrooms"
                      type="number"
                      value={(formData.bedrooms as string) || ""}
                      onChange={(value) => handleFieldChange("bedrooms", value ? Number(value) : "")}
                      primaryColor={primaryColor}
                    />
                    <InputField
                      label="Bathrooms"
                      type="number"
                      value={(formData.bathrooms as string) || ""}
                      onChange={(value) => handleFieldChange("bathrooms", value ? Number(value) : "")}
                      primaryColor={primaryColor}
                    />
                    <SelectField
                      label="Occupancy"
                      value={(formData.occupancy as string) || ""}
                      onChange={(value) => handleFieldChange("occupancy", value)}
                      options={[
                        { value: "occupied", label: "Occupied" },
                        { value: "vacant", label: "Vacant" },
                        { value: "staged", label: "Staged" },
                      ]}
                      primaryColor={primaryColor}
                    />
                    <SelectField
                      label="Listing Stage"
                      value={(formData.listingStage as string) || ""}
                      onChange={(value) => handleFieldChange("listingStage", value)}
                      options={[
                        { value: "pre-list", label: "Pre-list" },
                        { value: "active", label: "Active listing" },
                        { value: "under-contract", label: "Under contract" },
                      ]}
                      primaryColor={primaryColor}
                    />
                  </div>
                </div>
              )}

              {visibleFields.length > 0 && (
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <StepHeader
                    title="Project Details"
                    description="Share any specifics about the shoot."
                  />
                  <div className="space-y-4">
                    {visibleFields.map((field) => (
                      <FormFieldInput
                        key={field.id}
                        field={field}
                        value={formData[field.id]}
                        onChange={(value) => handleFieldChange(field.id, value)}
                        error={errors[field.id]}
                        primaryColor={primaryColor}
                        bookingFormId={form.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {preferenceGroups.length > 0 && (
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <StepHeader
                    title="Shoot Preferences"
                    description="Tell us how you want the shoot to feel."
                  />
                  <div className="space-y-6">
                    {preferenceGroups.map((group) => (
                      <PreferenceGroupSection
                        key={group.key}
                        group={group}
                        selectedValue={preferenceSelections[group.key] || ""}
                        onSelect={(value) => handlePreferenceChange(group.key, value)}
                        primaryColor={primaryColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <StepHeader
                  title={checklistConfig.title}
                  description={checklistConfig.description}
                />
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleSelectAllChecklist}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {checklistConfig.items.every((item) => checklistState[item]) ? "Clear all" : "Select all"}
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {checklistConfig.items.map((item) => (
                      <label
                        key={item}
                        className={cn(
                          "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                          checklistState[item]
                            ? "border-[var(--success)]/40 bg-[var(--success)]/10 text-foreground"
                            : "border-[var(--card-border)] text-foreground-muted"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checklistState[item] || false}
                          onChange={() => handleChecklistToggle(item)}
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                          style={{ accentColor: primaryColor }}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                  {errors.checklist && (
                    <p className="text-sm text-red-500">{errors.checklist}</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <StepHeader
                  title="Policies & Agreements"
                  description="Please review and confirm our shoot expectations."
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPolicyOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Review policies
                  </button>
                  {policyAcceptedAt && (
                    <span className="text-sm text-[var(--success)]">Accepted</span>
                  )}
                </div>
                {errors.policy && (
                  <p className="mt-2 text-sm text-red-500">{errors.policy}</p>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <StepHeader
                  title="Important Notes"
                  description="Anything else we should know before the shoot?"
                />
                <TextAreaField
                  label="Notes"
                  value={notes}
                  onChange={setNotes}
                  placeholder="Special requests, access notes, or anything else."
                  primaryColor={primaryColor}
                />
              </div>

              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <StepHeader
                  title="Review"
                  description="Confirm the details below before submitting."
                />
                <div className="grid gap-3 text-sm text-foreground">
                  <SummaryItem label="Industry" value={selectedIndustry ? industryOptions[selectedIndustry]?.label : ""} />
                  <SummaryItem
                    label="Service"
                    value={services.find((s) => s.serviceId === selectedService)?.service.name || ""}
                  />
                  <SummaryItem label="Contact" value={`${contactInfo.name} · ${contactInfo.email}`} />
                  {contactInfo.preferredDate && (
                    <SummaryItem
                      label="Preferred Date"
                      value={`${contactInfo.preferredDate} ${contactInfo.preferredTime || ""}`}
                    />
                  )}
                  {selectedIndustry === "real_estate" && formData.propertyAddress && (
                    <SummaryItem label="Property" value={String(formData.propertyAddress)} />
                  )}
                  {Object.keys(preferenceSelections).length > 0 && (
                    <SummaryItem
                      label="Preferences"
                      value={Object.entries(preferenceSelections)
                        .map(([key, value]) => `${key.replace("pref_", "").replace(/_/g, " ")}: ${value}`)
                        .join(" · ")}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            {currentStep < BOOKING_STEPS.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {currentStep === BOOKING_STEPS.length - 1 && (
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                style={{ backgroundColor: primaryColor }}
              >
                {isPending ? "Submitting..." : "Submit Request"}
              </button>
            )}
          </div>

          {form.requireApproval && (
            <p className="text-center text-sm text-foreground-muted">
              Your request will be reviewed and we will confirm availability shortly.
            </p>
          )}
        </form>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-[var(--card-border)]">
        <p className="text-sm text-foreground-muted">
          Powered by <span className="font-medium text-foreground">PhotoProOS</span>
        </p>
      </footer>

      <PolicyModal
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        onAccept={handlePolicyAccept}
        primaryColor={primaryColor}
      />
    </div>
  );
}

function StepHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      )}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
      <span className="text-xs uppercase tracking-[0.2em] text-foreground-muted">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function PreferenceGroupSection({
  group,
  selectedValue,
  onSelect,
  primaryColor,
}: {
  group: PreferenceGroup;
  selectedValue: string;
  onSelect: (value: string) => void;
  primaryColor: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
        {group.required && (
          <span className="text-xs text-red-500">Required</span>
        )}
      </div>
      {group.description && (
        <p className="mt-1 text-xs text-foreground-muted">{group.description}</p>
      )}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {group.options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                isSelected
                  ? "border-transparent text-white shadow"
                  : "border-[var(--card-border)] text-foreground hover:border-[var(--border-hover)]"
              )}
              style={
                isSelected
                  ? { backgroundColor: primaryColor }
                  : undefined
              }
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                isSelected ? "bg-white/20" : "bg-[var(--background-tertiary)]"
              )}>
                {option.icon || <Camera className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{option.label}</p>
                {option.description && (
                  <p className={cn("text-xs", isSelected ? "text-white/80" : "text-foreground-muted")}>{option.description}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  primaryColor,
  min,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  primaryColor: string;
  min?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className={cn(
          "w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2",
          error ? "border-red-500" : "border-[var(--card-border)]"
        )}
        style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  primaryColor,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  primaryColor: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  error,
  placeholder,
  primaryColor,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  primaryColor: string;
  required?: boolean;
}) {
  return (
    <div className="sm:col-span-2">
      <label className="block text-sm font-medium text-foreground mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2",
          error ? "border-red-500" : "border-[var(--card-border)]"
        )}
        style={{ "--tw-ring-color": `${primaryColor}40` } as React.CSSProperties}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function PolicyModal({
  open,
  onClose,
  onAccept,
  primaryColor,
}: {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  primaryColor: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Policies & Agreements</h3>
            <p className="mt-1 text-sm text-foreground-muted">Version {POLICY_VERSION}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--card-border)] px-2 py-1 text-xs text-foreground-muted"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4 text-sm text-foreground">
          <div>
            <p className="font-semibold">We will:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground-muted">
              <li>Arrive on time and prepared for the shoot</li>
              <li>Deliver professional imagery aligned with your selections</li>
              <li>Communicate any schedule adjustments promptly</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">You agree to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground-muted">
              <li>Provide access to the location on shoot day</li>
              <li>Complete the prep checklist before our arrival</li>
              <li>Notify us if anything changes with the property or schedule</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground"
          >
            Review later
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <ShieldCheck className="h-4 w-4" />
            I agree
          </button>
        </div>
      </div>
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
  bookingFormId,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  primaryColor: string;
  bookingFormId: string;
}) {
  const inputStyles = cn(
    "w-full px-4 py-2.5 rounded-lg border bg-[var(--background)] text-foreground focus:outline-none focus:ring-2",
    error ? "border-red-500" : "border-[var(--card-border)]"
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
            inputMode={field.type === "email" ? "email" : field.type === "phone" ? "tel" : undefined}
            autoComplete={field.type === "email" ? "email" : field.type === "phone" ? "tel" : undefined}
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
            inputMode="decimal"
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
                <span className="text-foreground">{opt}</span>
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
                  className="mt-0.5 h-4 w-4 rounded-full border-2 border-[var(--border-visible)] bg-transparent accent-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                  style={{ accentColor: primaryColor }}
                />
                <span className="text-foreground">{opt}</span>
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
            <span className="text-foreground">
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
          <FileUploadField
            fieldId={field.id}
            bookingFormId={bookingFormId}
            value={value as UploadedFile[] | undefined}
            onChange={onChange}
            error={error}
            primaryColor={primaryColor}
            isRequired={field.isRequired}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {field.label}
        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {field.helpText && (
        <p className="text-sm text-foreground-muted mt-1">{field.helpText}</p>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// File Upload Field Component
function FileUploadField({
  fieldId,
  bookingFormId,
  value,
  onChange,
  error,
  primaryColor,
  isRequired,
}: {
  fieldId: string;
  bookingFormId: string;
  value: UploadedFile[] | undefined;
  onChange: (value: unknown) => void;
  error?: string;
  primaryColor: string;
  isRequired: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadedFiles = value || [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const newFiles: UploadedFile[] = [...uploadedFiles];

    for (const file of Array.from(files)) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds 10MB limit`);
        continue;
      }

      try {
        // Step 1: Get presigned URL
        const urlResponse = await fetch("/api/upload/booking-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingFormId,
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });

        const urlResult = await urlResponse.json();
        if (!urlResult.success) {
          setUploadError(urlResult.error || `Failed to upload ${file.name}`);
          continue;
        }

        // Step 2: Upload to R2
        const uploadResponse = await fetch(urlResult.data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          setUploadError(`Failed to upload ${file.name}`);
          continue;
        }

        // Step 3: Add to uploaded files list
        newFiles.push({
          filename: file.name,
          url: urlResult.data.publicUrl,
          key: urlResult.data.key,
          size: file.size,
          type: file.type,
        });
      } catch (err) {
        console.error("Upload error:", err);
        setUploadError(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    onChange(newFiles);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    onChange(newFiles.length > 0 ? newFiles : undefined);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return (
        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type === "application/pdf") {
      return (
        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-foreground text-sm font-medium transition-colors hover:bg-[var(--background-hover)]",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Choose Files
            </>
          )}
        </button>
        <span className="text-sm text-foreground-muted">
          Images, PDF, DOC (max 10MB each)
        </span>
      </div>

      {/* Upload error */}
      {uploadError && (
        <p className="text-red-500 text-sm">{uploadError}</p>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <ul className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <li
              key={file.key}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(file.type)}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.filename}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="p-1 text-foreground-muted hover:text-red-500 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && isRequired && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
