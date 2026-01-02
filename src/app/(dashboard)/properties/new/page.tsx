"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Demo galleries without property websites
const demoGalleries = [
  {
    id: "g1",
    name: "Sunset Hills Residence",
    status: "delivered",
    coverImageUrl: null,
    client: { fullName: "Jennifer Martinez", company: "Century 21" },
    location: {
      formattedAddress: "1234 Sunset Hills Dr, Austin, TX 78746",
      city: "Austin",
      state: "TX",
      postalCode: "78746",
    },
    assetsCount: 42,
  },
  {
    id: "g2",
    name: "Downtown Loft Photography",
    status: "delivered",
    coverImageUrl: null,
    client: { fullName: "Robert Kim", company: "Sotheby's" },
    location: {
      formattedAddress: "567 Congress Ave #1201, Austin, TX 78701",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
    },
    assetsCount: 28,
  },
  {
    id: "g3",
    name: "Lake Travis Waterfront",
    status: "pending",
    coverImageUrl: null,
    client: { fullName: "Amanda White", company: "Kuper Sotheby's" },
    location: {
      formattedAddress: "890 Lakefront Blvd, Lakeway, TX 78734",
      city: "Lakeway",
      state: "TX",
      postalCode: "78734",
    },
    assetsCount: 65,
  },
];

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean, minimal design with large photos",
    preview: "/images/templates/modern.jpg",
    bestFor: "Contemporary homes, new construction",
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Elegant dark theme with refined typography",
    preview: "/images/templates/luxury.jpg",
    bestFor: "High-end properties, estates",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Warm, traditional feel",
    preview: "/images/templates/classic.jpg",
    bestFor: "Suburban homes, family properties",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean, photo-focused",
    preview: "/images/templates/minimal.jpg",
    bestFor: "MLS compliance, any property",
  },
  {
    id: "commercial",
    name: "Commercial",
    description: "Professional, data-focused layout",
    preview: "/images/templates/commercial.jpg",
    bestFor: "Commercial real estate",
  },
];

const propertyTypes = [
  { value: "single_family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

export default function NewPropertyWebsitePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGallery, setSelectedGallery] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    lotSize: "",
    yearBuilt: "",
    propertyType: "single_family",
    headline: "",
    description: "",
    features: "",
    virtualTourUrl: "",
    videoUrl: "",
    isBranded: true,
    showPrice: true,
    showAgent: true,
  });

  const gallery = demoGalleries.find((g) => g.id === selectedGallery);

  const handleGallerySelect = (galleryId: string) => {
    const g = demoGalleries.find((gallery) => gallery.id === galleryId);
    setSelectedGallery(galleryId);

    // Auto-fill location data if available
    if (g?.location) {
      const addressParts = g.location.formattedAddress.split(",");
      setFormData((prev) => ({
        ...prev,
        address: addressParts[0]?.trim() || "",
        city: g.location.city || "",
        state: g.location.state || "",
        zipCode: g.location.postalCode || "",
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    router.push("/properties");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/properties"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Create Property Website</h1>
              <p className="text-sm text-foreground-secondary">
                Step {step} of 3
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Step 1: Select Gallery */}
        {step === 1 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Select a Gallery</h2>
            <p className="mb-6 text-foreground-secondary">
              Choose which photo gallery to create a property website for
            </p>

            <div className="space-y-4">
              {demoGalleries.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleGallerySelect(g.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedGallery === g.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
                      <ImageIcon className="h-8 w-8 text-foreground-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{g.name}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            g.status === "delivered"
                              ? "bg-[var(--success)]/20 text-[var(--success)]"
                              : "bg-[var(--warning)]/20 text-[var(--warning)]"
                          }`}
                        >
                          {g.status}
                        </span>
                      </div>
                      {g.client && (
                        <p className="mt-1 text-sm text-foreground-secondary">
                          {g.client.fullName}
                          {g.client.company && ` • ${g.client.company}`}
                        </p>
                      )}
                      {g.location && (
                        <p className="mt-1 text-sm text-foreground-muted">
                          {g.location.formattedAddress}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-foreground-muted">
                        {g.assetsCount} photos
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {selectedGallery === g.id ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]">
                          <CheckIcon className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-[var(--card-border)]" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedGallery}
                className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Property Details */}
        {step === 2 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Property Details</h2>
            <p className="mb-6 text-foreground-secondary">
              Enter the property information to display on the website
            </p>

            <div className="space-y-6">
              {/* Address Section */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-4 font-medium text-foreground">Location</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main Street"
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Austin"
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="TX"
                        className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="78701"
                        className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details Section */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-4 font-medium text-foreground">Property Info</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                        $
                      </span>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="850,000"
                        className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background pl-7 pr-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Beds
                    </label>
                    <input
                      type="number"
                      value={formData.beds}
                      onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                      placeholder="4"
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Baths
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.baths}
                      onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                      placeholder="3.5"
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Sq. Ft.
                    </label>
                    <input
                      type="text"
                      value={formData.sqft}
                      onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                      placeholder="2,800"
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Lot Size
                    </label>
                    <input
                      type="text"
                      value={formData.lotSize}
                      onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                      placeholder="0.25 acres"
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Year Built
                    </label>
                    <input
                      type="number"
                      value={formData.yearBuilt}
                      onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                      placeholder="2020"
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Property Type
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    >
                      {propertyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-4 font-medium text-foreground">Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="Stunning Modern Home in Prime Location"
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the property's key features and selling points..."
                      rows={4}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Features (one per line)
                    </label>
                    <textarea
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="Open floor plan&#10;Gourmet kitchen with granite countertops&#10;Private backyard with pool"
                      rows={4}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Virtual Tour & Video */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-4 font-medium text-foreground">Virtual Tour & Video</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Virtual Tour URL
                    </label>
                    <input
                      type="url"
                      value={formData.virtualTourUrl}
                      onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                      placeholder="https://my.matterport.com/show/?m=..."
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                    <p className="mt-1 text-xs text-foreground-muted">
                      Matterport, iGuide, Zillow 3D, or other virtual tour URL
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                    <p className="mt-1 text-xs text-foreground-muted">
                      YouTube or Vimeo video URL
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-[var(--card-border)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.address || !formData.city || !formData.state}
                className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Template & Settings */}
        {step === 3 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Template & Settings</h2>
            <p className="mb-6 text-foreground-secondary">
              Choose a design template and configure display options
            </p>

            <div className="space-y-6">
              {/* Template Selection */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-4 font-medium text-foreground">Choose Template</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        selectedTemplate === template.id
                          ? "border-[var(--primary)] bg-[var(--primary)]/5"
                          : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      <div className="mb-3 aspect-video rounded-lg bg-[var(--background-tertiary)]">
                        <div className="flex h-full items-center justify-center">
                          <LayoutIcon className="h-8 w-8 text-foreground-muted" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{template.name}</h4>
                        {selectedTemplate === template.id && (
                          <CheckIcon className="h-5 w-5 text-[var(--primary)]" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-foreground-secondary">{template.description}</p>
                      <p className="mt-2 text-xs text-foreground-muted">Best for: {template.bestFor}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Settings */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-4 font-medium text-foreground">Display Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Show Photographer Branding</p>
                      <p className="text-sm text-foreground-secondary">
                        Display your logo and business name on the website
                      </p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, isBranded: !formData.isBranded })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        formData.isBranded ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          formData.isBranded ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Show Price</p>
                      <p className="text-sm text-foreground-secondary">
                        Display the listing price on the website
                      </p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, showPrice: !formData.showPrice })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        formData.showPrice ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          formData.showPrice ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Show Agent Contact</p>
                      <p className="text-sm text-foreground-secondary">
                        Display the listing agent's contact information
                      </p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, showAgent: !formData.showAgent })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        formData.showAgent ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          formData.showAgent ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-6">
                <h3 className="mb-4 font-medium text-foreground">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Gallery:</span>
                    <span className="font-medium text-foreground">{gallery?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Address:</span>
                    <span className="font-medium text-foreground">
                      {formData.address}, {formData.city}, {formData.state}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Template:</span>
                    <span className="font-medium text-foreground">
                      {templates.find((t) => t.id === selectedTemplate)?.name}
                    </span>
                  </div>
                  {formData.price && (
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Price:</span>
                      <span className="font-medium text-foreground">${formData.price}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="rounded-lg border border-[var(--card-border)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Create Website
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
