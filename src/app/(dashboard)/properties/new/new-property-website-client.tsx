"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { createPropertyWebsite } from "@/lib/actions/property-websites";
import type { PropertyType, PropertyWebsiteTemplate } from "@prisma/client";

interface Project {
  id: string;
  name: string;
  status: string;
  coverImageUrl: string | null;
  client: {
    fullName: string | null;
    company: string | null;
  } | null;
  location: {
    formattedAddress: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
  } | null;
}

interface NewPropertyWebsiteClientProps {
  projects: Project[];
}

export function NewPropertyWebsiteClient({ projects }: NewPropertyWebsiteClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const preselectedGalleryId = searchParams ? searchParams.get("galleryId") : null;

  const [projectId, setProjectId] = useState(preselectedGalleryId || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("single_family");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<PropertyWebsiteTemplate>("modern");

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const project = projects.find((p) => p.id === id);
    if (project?.location) {
      setAddress(project.location.formattedAddress || "");
      setCity(project.location.city || "");
      setState(project.location.state || "");
      setZipCode(project.location.postalCode || "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      showToast("Please select a gallery", "error");
      return;
    }
    if (!address || !city || !state || !zipCode) {
      showToast("Please fill in the property address", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPropertyWebsite({
          projectId,
          address,
          city,
          state,
          zipCode,
          price: price ? parseFloat(price) : null,
          beds: beds ? parseInt(beds) : null,
          baths: baths ? parseFloat(baths) : null,
          sqft: sqft ? parseInt(sqft) : null,
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
          propertyType,
          headline: headline || null,
          description: description || null,
          template,
        });

        if (result.success) {
          showToast("Property website created", "success");
          router.push("/properties/" + result.id);
        } else {
          showToast(result.error || "Failed to create", "error");
        }
      } catch {
        showToast("An error occurred", "error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground">Select Gallery</h2>
        <div className="mt-4">
          {projects.length > 0 ? (
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
            >
              <option value="">Select a gallery...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} {project.client?.company ? `(${project.client.company})` : ""}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--card-border)] p-8 text-center">
              <p className="text-foreground-muted">No galleries available.</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground">Property Address</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Street Address *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">City *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Los Angeles"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
            />
          </div>
          <div className="grid gap-4 grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="CA"
                maxLength={2}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">ZIP *</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="90001"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground">Property Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="500000"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Beds</label>
            <input
              type="number"
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              placeholder="3"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Baths</label>
            <input
              type="number"
              value={baths}
              onChange={(e) => setBaths(e.target.value)}
              placeholder="2"
              step="0.5"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Sq Ft</label>
            <input
              type="number"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              placeholder="1500"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Year Built</label>
            <input
              type="number"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(e.target.value)}
              placeholder="2000"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
            >
              <option value="single_family">Single Family</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="multi_family">Multi Family</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <a
          href="/properties"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending || !projectId}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-[var(--primary)]/90 transition-colors"
        >
          {isPending ? "Creating..." : "Create Property Website"}
        </button>
      </div>
    </form>
  );
}
