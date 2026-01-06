"use client";

import { useState, useId } from "react";
import { POICategory } from "@prisma/client";

interface NeighborhoodConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

const POI_CATEGORIES: { value: POICategory; label: string; icon: string }[] = [
  { value: "school_elementary", label: "Elementary Schools", icon: "🏫" },
  { value: "school_middle", label: "Middle Schools", icon: "🏫" },
  { value: "school_high", label: "High Schools", icon: "🏫" },
  { value: "university", label: "Universities", icon: "🎓" },
  { value: "restaurant", label: "Restaurants", icon: "🍽️" },
  { value: "cafe", label: "Cafes & Coffee", icon: "☕" },
  { value: "shopping_grocery", label: "Grocery Stores", icon: "🛒" },
  { value: "shopping_mall", label: "Shopping Malls", icon: "🏬" },
  { value: "shopping_retail", label: "Retail Stores", icon: "🛍️" },
  { value: "park", label: "Parks", icon: "🌳" },
  { value: "gym_fitness", label: "Gyms & Fitness", icon: "💪" },
  { value: "hospital", label: "Hospitals", icon: "🏥" },
  { value: "pharmacy", label: "Pharmacies", icon: "💊" },
  { value: "bank", label: "Banks", icon: "🏦" },
  { value: "transit_bus", label: "Bus Stops", icon: "🚌" },
  { value: "transit_train", label: "Train Stations", icon: "🚂" },
  { value: "transit_subway", label: "Subway Stations", icon: "🚇" },
  { value: "gas_station", label: "Gas Stations", icon: "⛽" },
  { value: "church", label: "Churches", icon: "⛪" },
  { value: "entertainment", label: "Entertainment", icon: "🎭" },
  { value: "library", label: "Libraries", icon: "📚" },
  { value: "museum", label: "Museums", icon: "🏛️" },
];

export function NeighborhoodConfig({
  config,
  updateConfig,
}: NeighborhoodConfigProps) {
  const id = useId();
  const [selectedCategories, setSelectedCategories] = useState<POICategory[]>(
    (config.categories as POICategory[]) || [
      "school_elementary",
      "school_high",
      "restaurant",
      "shopping_grocery",
      "park",
      "transit_bus",
    ]
  );

  const handleCategoryToggle = (category: POICategory) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    updateConfig("categories", newCategories);
  };

  return (
    <div className="space-y-6">
      {/* Map Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Map Settings</h4>

        <div>
          <label
            htmlFor={`${id}-radius`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Search Radius
          </label>
          <select
            id={`${id}-radius`}
            value={(config.radius as number) || 3}
            onChange={(e) => updateConfig("radius", parseInt(e.target.value))}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value={1}>1 mile</option>
            <option value={2}>2 miles</option>
            <option value={3}>3 miles</option>
            <option value={5}>5 miles</option>
            <option value={10}>10 miles</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-mapStyle`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Map Style
          </label>
          <select
            id={`${id}-mapStyle`}
            value={(config.mapStyle as string) || "standard"}
            onChange={(e) => updateConfig("mapStyle", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="standard">Standard</option>
            <option value="satellite">Satellite</option>
            <option value="terrain">Terrain</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-zoom`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Default Zoom Level
          </label>
          <input
            id={`${id}-zoom`}
            type="range"
            min="12"
            max="18"
            value={(config.zoom as number) || 14}
            onChange={(e) => updateConfig("zoom", parseInt(e.target.value))}
            className="w-full"
            aria-valuemin={12}
            aria-valuemax={18}
            aria-valuenow={(config.zoom as number) || 14}
            aria-valuetext={`Zoom level ${(config.zoom as number) || 14}`}
          />
          <p className="mt-1 text-xs text-foreground-muted" aria-live="polite">
            Zoom: {(config.zoom as number) || 14}
          </p>
        </div>
      </div>

      {/* POI Categories */}
      <div className="space-y-4" role="group" aria-labelledby={`${id}-poi-heading`}>
        <h4 id={`${id}-poi-heading`} className="text-sm font-semibold text-foreground">
          Points of Interest to Display
        </h4>
        <p id={`${id}-poi-desc`} className="text-xs text-foreground-muted">
          Select which categories of nearby places to show on the map
        </p>

        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-describedby={`${id}-poi-desc`}
        >
          {POI_CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                selectedCategories.includes(cat.value)
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.value)}
                onChange={() => handleCategoryToggle(cat.value)}
                className="sr-only"
                aria-label={`Show ${cat.label} on map`}
              />
              <span className="text-base" aria-hidden="true">{cat.icon}</span>
              <span className="text-xs text-foreground">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">
          Display Options
        </h4>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showDistances as boolean) ?? true}
            onChange={(e) => updateConfig("showDistances", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show distance from property</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showDrivingTime as boolean) ?? true}
            onChange={(e) => updateConfig("showDrivingTime", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show driving time</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showWalkingTime as boolean) ?? false}
            onChange={(e) => updateConfig("showWalkingTime", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show walking time</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showRatings as boolean) ?? true}
            onChange={(e) => updateConfig("showRatings", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show ratings & reviews</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showWebsiteLinks as boolean) ?? true}
            onChange={(e) => updateConfig("showWebsiteLinks", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show website links</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showCategoryFilter as boolean) ?? true}
            onChange={(e) => updateConfig("showCategoryFilter", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show category filter for visitors</span>
        </label>
      </div>

      {/* Scores Display */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">
          Neighborhood Scores
        </h4>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showWalkScore as boolean) ?? true}
            onChange={(e) => updateConfig("showWalkScore", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Walk Score</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showBikeScore as boolean) ?? true}
            onChange={(e) => updateConfig("showBikeScore", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Bike Score</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showTransitScore as boolean) ?? true}
            onChange={(e) => updateConfig("showTransitScore", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Transit Score</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showCrimeStats as boolean) ?? false}
            onChange={(e) => updateConfig("showCrimeStats", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Crime Statistics</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showSchoolRatings as boolean) ?? true}
            onChange={(e) => updateConfig("showSchoolRatings", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show School Ratings</span>
        </label>
      </div>

      {/* Map Marker Style */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Marker Style</h4>

        <div>
          <label
            htmlFor={`${id}-markerStyle`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Icon Style
          </label>
          <select
            id={`${id}-markerStyle`}
            value={(config.markerStyle as string) || "emoji"}
            onChange={(e) => updateConfig("markerStyle", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="emoji">Emoji Icons</option>
            <option value="colored-dots">Colored Dots</option>
            <option value="pins">Map Pins</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.clusterMarkers as boolean) ?? true}
            onChange={(e) => updateConfig("clusterMarkers", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">
            Cluster nearby markers when zoomed out
          </span>
        </label>
      </div>

      {/* Property Marker */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">
          Property Marker
        </h4>

        <div>
          <label
            htmlFor={`${id}-propertyIcon`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Property Icon
          </label>
          <select
            id={`${id}-propertyIcon`}
            value={(config.propertyIcon as string) || "home"}
            onChange={(e) => updateConfig("propertyIcon", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="home">🏠 House</option>
            <option value="pin">📍 Pin</option>
            <option value="star">⭐ Star</option>
            <option value="flag">🚩 Flag</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-propertyMarkerColor`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Property Marker Color
          </label>
          <div className="flex gap-2">
            <input
              id={`${id}-propertyMarkerColor`}
              type="text"
              value={(config.propertyMarkerColor as string) || "#3b82f6"}
              onChange={(e) => updateConfig("propertyMarkerColor", e.target.value)}
              placeholder="#3b82f6"
              className="h-10 flex-1 rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
            />
            <input
              type="color"
              value={(config.propertyMarkerColor as string) || "#3b82f6"}
              onChange={(e) => updateConfig("propertyMarkerColor", e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-lg border border-[var(--card-border)]"
              aria-label="Select property marker color"
            />
          </div>
        </div>
      </div>

      {/* Layout Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Layout</h4>

        <div>
          <label
            htmlFor={`${id}-layout`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Section Layout
          </label>
          <select
            id={`${id}-layout`}
            value={(config.layout as string) || "map-with-list"}
            onChange={(e) => updateConfig("layout", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="map-only">Map Only</option>
            <option value="map-with-list">Map with POI List</option>
            <option value="map-with-sidebar">Map with Sidebar</option>
            <option value="scores-with-map">Scores First, Then Map</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-mapHeight`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Map Height
          </label>
          <select
            id={`${id}-mapHeight`}
            value={(config.mapHeight as string) || "medium"}
            onChange={(e) => updateConfig("mapHeight", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="small">Small (300px)</option>
            <option value="medium">Medium (450px)</option>
            <option value="large">Large (600px)</option>
            <option value="full">Full Height (80vh)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-maxPois`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Max POIs per Category
          </label>
          <input
            id={`${id}-maxPois`}
            type="number"
            min="1"
            max="20"
            value={(config.maxPoisPerCategory as number) || 5}
            onChange={(e) => updateConfig("maxPoisPerCategory", parseInt(e.target.value))}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Tip:</span> The
          neighborhood data will be automatically fetched based on the
          property&apos;s address. You can manually add or edit points of interest
          in the Neighborhood Data tab.
        </p>
      </div>
    </div>
  );
}
