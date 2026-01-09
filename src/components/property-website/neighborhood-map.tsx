"use client";

import { useState, useMemo } from "react";
import { POICategory } from "@prisma/client";

// POI Category info with icons and colors
const POI_CATEGORY_INFO: Record<
  POICategory,
  { icon: string; color: string; label: string }
> = {
  school_elementary: { icon: "🏫", color: "#4CAF50", label: "Elementary Schools" },
  school_middle: { icon: "🏫", color: "#4CAF50", label: "Middle Schools" },
  school_high: { icon: "🏫", color: "#4CAF50", label: "High Schools" },
  school_private: { icon: "🏫", color: "#4CAF50", label: "Private Schools" },
  university: { icon: "🎓", color: "#2196F3", label: "Universities" },
  shopping_mall: { icon: "🏬", color: "#FF9800", label: "Shopping Malls" },
  shopping_grocery: { icon: "🛒", color: "#8BC34A", label: "Grocery Stores" },
  shopping_retail: { icon: "🛍️", color: "#FF9800", label: "Retail Stores" },
  restaurant: { icon: "🍽️", color: "#FF5722", label: "Restaurants" },
  cafe: { icon: "☕", color: "#795548", label: "Cafes" },
  bar: { icon: "🍺", color: "#FF5722", label: "Bars" },
  park: { icon: "🌳", color: "#4CAF50", label: "Parks" },
  playground: { icon: "🎡", color: "#4CAF50", label: "Playgrounds" },
  gym_fitness: { icon: "💪", color: "#9C27B0", label: "Gyms & Fitness" },
  hospital: { icon: "🏥", color: "#F44336", label: "Hospitals" },
  pharmacy: { icon: "💊", color: "#E91E63", label: "Pharmacies" },
  police: { icon: "👮", color: "#1976D2", label: "Police Stations" },
  fire_station: { icon: "🚒", color: "#D32F2F", label: "Fire Stations" },
  transit_bus: { icon: "🚌", color: "#3F51B5", label: "Bus Stops" },
  transit_train: { icon: "🚂", color: "#3F51B5", label: "Train Stations" },
  transit_subway: { icon: "🚇", color: "#3F51B5", label: "Subway Stations" },
  airport: { icon: "✈️", color: "#607D8B", label: "Airports" },
  beach: { icon: "🏖️", color: "#00BCD4", label: "Beaches" },
  golf_course: { icon: "⛳", color: "#4CAF50", label: "Golf Courses" },
  church: { icon: "⛪", color: "#9E9E9E", label: "Churches" },
  mosque: { icon: "🕌", color: "#9E9E9E", label: "Mosques" },
  synagogue: { icon: "🕍", color: "#9E9E9E", label: "Synagogues" },
  temple: { icon: "🛕", color: "#9E9E9E", label: "Temples" },
  library: { icon: "📚", color: "#673AB7", label: "Libraries" },
  museum: { icon: "🏛️", color: "#673AB7", label: "Museums" },
  theater: { icon: "🎭", color: "#E91E63", label: "Theaters" },
  cinema: { icon: "🎬", color: "#E91E63", label: "Cinemas" },
  entertainment: { icon: "🎉", color: "#E91E63", label: "Entertainment" },
  bank: { icon: "🏦", color: "#607D8B", label: "Banks" },
  post_office: { icon: "📮", color: "#2196F3", label: "Post Offices" },
  gas_station: { icon: "⛽", color: "#795548", label: "Gas Stations" },
  ev_charging: { icon: "🔌", color: "#4CAF50", label: "EV Charging" },
  other: { icon: "📍", color: "#9E9E9E", label: "Other" },
};

interface PointOfInterest {
  id: string;
  name: string;
  category: POICategory;
  subcategory?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  distanceMiles: number;
  drivingMins?: number | null;
  walkingMins?: number | null;
  transitMins?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  priceLevel?: number | null;
  website?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  schoolGrades?: string | null;
  schoolType?: string | null;
  schoolRating?: number | null;
}

interface NeighborhoodData {
  walkScore?: number | null;
  bikeScore?: number | null;
  transitScore?: number | null;
  soundScore?: number | null;
  crimeIndex?: number | null;
  crimeDataSource?: string | null;
  nearestElementaryRating?: number | null;
  nearestMiddleRating?: number | null;
  nearestHighRating?: number | null;
  pointsOfInterest: PointOfInterest[];
}

interface NeighborhoodMapProps {
  propertyAddress: string;
  propertyLat: number;
  propertyLng: number;
  neighborhoodData: NeighborhoodData | null;
  config: {
    categories?: POICategory[];
    radius?: number;
    mapStyle?: string;
    zoom?: number;
    showDistances?: boolean;
    showDrivingTime?: boolean;
    showWalkingTime?: boolean;
    showRatings?: boolean;
    showWebsiteLinks?: boolean;
    showCategoryFilter?: boolean;
    showWalkScore?: boolean;
    showBikeScore?: boolean;
    showTransitScore?: boolean;
    showCrimeStats?: boolean;
    showSchoolRatings?: boolean;
    markerStyle?: string;
    clusterMarkers?: boolean;
    propertyIcon?: string;
    propertyMarkerColor?: string;
    layout?: string;
    mapHeight?: string;
    maxPoisPerCategory?: number;
  };
}

export function NeighborhoodMap({
  propertyAddress,
  propertyLat,
  propertyLng,
  neighborhoodData,
  config,
}: NeighborhoodMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<POICategory | "all">(
    "all"
  );
  const [selectedPOI, setSelectedPOI] = useState<PointOfInterest | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Get available categories from POIs
  const availableCategories = useMemo(() => {
    if (!neighborhoodData?.pointsOfInterest) return [];
    const categories = new Set(
      neighborhoodData.pointsOfInterest.map((poi) => poi.category)
    );
    return Array.from(categories).filter(
      (cat) => !config.categories || config.categories.includes(cat)
    );
  }, [neighborhoodData?.pointsOfInterest, config.categories]);

  // Filter POIs by selected category
  const filteredPOIs = useMemo(() => {
    if (!neighborhoodData?.pointsOfInterest) return [];
    let pois = neighborhoodData.pointsOfInterest;

    // Filter by config categories
    if (config.categories && config.categories.length > 0) {
      pois = pois.filter((poi) => config.categories!.includes(poi.category));
    }

    // Filter by selected category
    if (selectedCategory !== "all") {
      pois = pois.filter((poi) => poi.category === selectedCategory);
    }

    // Limit per category
    if (config.maxPoisPerCategory) {
      const grouped = new Map<POICategory, PointOfInterest[]>();
      pois.forEach((poi) => {
        const existing = grouped.get(poi.category) || [];
        if (existing.length < config.maxPoisPerCategory!) {
          existing.push(poi);
          grouped.set(poi.category, existing);
        }
      });
      pois = Array.from(grouped.values()).flat();
    }

    return pois;
  }, [
    neighborhoodData?.pointsOfInterest,
    selectedCategory,
    config.categories,
    config.maxPoisPerCategory,
  ]);

  // Group POIs by category for the list view
  const groupedPOIs = useMemo(() => {
    const groups = new Map<POICategory, PointOfInterest[]>();
    filteredPOIs.forEach((poi) => {
      const existing = groups.get(poi.category) || [];
      existing.push(poi);
      groups.set(poi.category, existing);
    });
    return groups;
  }, [filteredPOIs]);

  // Map height based on config
  const mapHeightClass = useMemo(() => {
    switch (config.mapHeight) {
      case "small":
        return "h-[300px]";
      case "large":
        return "h-[600px]";
      case "full":
        return "h-[80vh]";
      default:
        return "h-[450px]";
    }
  }, [config.mapHeight]);

  // Get walk score label
  const getWalkScoreLabel = (score: number) => {
    if (score >= 90) return "Walker's Paradise";
    if (score >= 70) return "Very Walkable";
    if (score >= 50) return "Somewhat Walkable";
    if (score >= 25) return "Car-Dependent";
    return "Almost All Errands Require a Car";
  };

  // Get crime safety label
  const getCrimeSafetyLabel = (crimeIndex: number) => {
    if (crimeIndex < 20) return { label: "Very Safe", color: "#4CAF50" };
    if (crimeIndex < 40) return { label: "Safe", color: "#8BC34A" };
    if (crimeIndex < 60) return { label: "Average", color: "#FFC107" };
    if (crimeIndex < 80) return { label: "Below Average", color: "#FF9800" };
    return { label: "High Crime", color: "#F44336" };
  };

  // Property icon based on config
  const propertyIconEmoji = useMemo(() => {
    switch (config.propertyIcon) {
      case "pin":
        return "📍";
      case "star":
        return "⭐";
      case "flag":
        return "🚩";
      default:
        return "🏠";
    }
  }, [config.propertyIcon]);

  // Generate Google Maps embed URL
  const mapEmbedUrl = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError("Map API key not configured");
      return null;
    }

    const center = `${propertyLat},${propertyLng}`;
    const zoom = config.zoom || 14;
    const mapType = config.mapStyle === "satellite" ? "satellite" : "roadmap";

    // Create markers string
    let markers = `markers=color:${config.propertyMarkerColor?.replace("#", "0x") || "0x3b82f6"}|label:H|${center}`;

    // Add POI markers (limited to prevent URL length issues)
    filteredPOIs.slice(0, 20).forEach((poi) => {
      const catInfo = POI_CATEGORY_INFO[poi.category];
      markers += `&markers=color:${catInfo.color.replace("#", "0x")}|${poi.latitude},${poi.longitude}`;
    });

    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center}&zoom=${zoom}&maptype=${mapType}`;
  }, [
    propertyLat,
    propertyLng,
    config.zoom,
    config.mapStyle,
    config.propertyMarkerColor,
    filteredPOIs,
  ]);

  // Static map fallback (for when embed is not available)
  const staticMapUrl = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    const center = `${propertyLat},${propertyLng}`;
    const zoom = config.zoom || 14;
    const mapType = config.mapStyle === "satellite" ? "satellite" : "roadmap";

    const markers = `markers=color:blue|label:H|${center}`;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=800x450&maptype=${mapType}&${markers}&key=${apiKey}`;
  }, [propertyLat, propertyLng, config.zoom, config.mapStyle]);

  return (
    <div className="neighborhood-map-section space-y-6">
      {/* Scores Section */}
      {(config.showWalkScore ||
        config.showBikeScore ||
        config.showTransitScore) &&
        neighborhoodData && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {config.showWalkScore !== false &&
              neighborhoodData.walkScore !== null &&
              neighborhoodData.walkScore !== undefined && (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-secondary">
                      Walk Score
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      {neighborhoodData.walkScore}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-tertiary)]">
                    <div
                      className="h-full rounded-full bg-[#4CAF50]"
                      style={{ width: `${neighborhoodData.walkScore}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-foreground-muted">
                    {getWalkScoreLabel(neighborhoodData.walkScore)}
                  </p>
                </div>
              )}

            {config.showBikeScore !== false &&
              neighborhoodData.bikeScore !== null &&
              neighborhoodData.bikeScore !== undefined && (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-secondary">
                      Bike Score
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      {neighborhoodData.bikeScore}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-tertiary)]">
                    <div
                      className="h-full rounded-full bg-[#2196F3]"
                      style={{ width: `${neighborhoodData.bikeScore}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-foreground-muted">
                    {neighborhoodData.bikeScore >= 70
                      ? "Bikeable"
                      : "Somewhat Bikeable"}
                  </p>
                </div>
              )}

            {config.showTransitScore !== false &&
              neighborhoodData.transitScore !== null &&
              neighborhoodData.transitScore !== undefined && (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-secondary">
                      Transit Score
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      {neighborhoodData.transitScore}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-tertiary)]">
                    <div
                      className="h-full rounded-full bg-[#9C27B0]"
                      style={{ width: `${neighborhoodData.transitScore}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-foreground-muted">
                    {neighborhoodData.transitScore >= 70
                      ? "Excellent Transit"
                      : "Good Transit"}
                  </p>
                </div>
              )}

            {config.showCrimeStats &&
              neighborhoodData.crimeIndex !== null &&
              neighborhoodData.crimeIndex !== undefined && (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-secondary">
                      Safety
                    </span>
                    <span
                      className="text-lg font-semibold"
                      style={{
                        color: getCrimeSafetyLabel(neighborhoodData.crimeIndex)
                          .color,
                      }}
                    >
                      {getCrimeSafetyLabel(neighborhoodData.crimeIndex).label}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-tertiary)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${100 - neighborhoodData.crimeIndex}%`,
                        backgroundColor: getCrimeSafetyLabel(
                          neighborhoodData.crimeIndex
                        ).color,
                      }}
                    />
                  </div>
                  {neighborhoodData.crimeDataSource && (
                    <p className="mt-2 text-xs text-foreground-muted">
                      Source: {neighborhoodData.crimeDataSource}
                    </p>
                  )}
                </div>
              )}
          </div>
        )}

      {/* School Ratings */}
      {config.showSchoolRatings && neighborhoodData && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <h3 className="mb-4 font-semibold text-foreground">Nearby Schools</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {neighborhoodData.nearestElementaryRating !== null &&
              neighborhoodData.nearestElementaryRating !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4CAF50]/20">
                    <span className="text-xl">🏫</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">
                      Elementary
                    </p>
                    <p className="font-semibold text-foreground">
                      {neighborhoodData.nearestElementaryRating}/10
                    </p>
                  </div>
                </div>
              )}
            {neighborhoodData.nearestMiddleRating !== null &&
              neighborhoodData.nearestMiddleRating !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2196F3]/20">
                    <span className="text-xl">🏫</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Middle</p>
                    <p className="font-semibold text-foreground">
                      {neighborhoodData.nearestMiddleRating}/10
                    </p>
                  </div>
                </div>
              )}
            {neighborhoodData.nearestHighRating !== null &&
              neighborhoodData.nearestHighRating !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9C27B0]/20">
                    <span className="text-xl">🏫</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">High</p>
                    <p className="font-semibold text-foreground">
                      {neighborhoodData.nearestHighRating}/10
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      {config.showCategoryFilter !== false && availableCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)]"
            }`}
          >
            All ({filteredPOIs.length})
          </button>
          {availableCategories.map((category) => {
            const info = POI_CATEGORY_INFO[category];
            const count =
              neighborhoodData?.pointsOfInterest.filter(
                (p) => p.category === category
              ).length || 0;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)]"
                }`}
              >
                <span>{info.icon}</span>
                <span>
                  {info.label} ({count})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Map and POI List Layout */}
      <div
        className={
          config.layout === "map-with-sidebar"
            ? "flex flex-col gap-6 lg:flex-row"
            : "space-y-6"
        }
      >
        {/* Map */}
        <div
          className={
            config.layout === "map-with-sidebar" ? "lg:flex-1" : "w-full"
          }
        >
          <div
            className={`relative overflow-hidden rounded-xl border border-[var(--card-border)] ${mapHeightClass}`}
          >
            {mapError ? (
              <div className="flex h-full items-center justify-center bg-[var(--card)]">
                <div className="text-center">
                  <p className="text-foreground-secondary">{mapError}</p>
                  <p className="mt-2 text-sm text-foreground-muted">
                    {propertyAddress}
                  </p>
                </div>
              </div>
            ) : mapEmbedUrl ? (
              <iframe
                src={mapEmbedUrl}
                className="h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : staticMapUrl ? (
              <img
                src={staticMapUrl}
                alt={`Map of ${propertyAddress}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[var(--card)]">
                <div className="text-center">
                  <span className="text-4xl">{propertyIconEmoji}</span>
                  <p className="mt-2 text-foreground-secondary">
                    {propertyAddress}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    Interactive map requires Google Maps API key
                  </p>
                </div>
              </div>
            )}

            {/* Property marker overlay */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg"
                style={{
                  backgroundColor:
                    config.propertyMarkerColor || "var(--primary)",
                }}
              >
                <span className="text-lg">{propertyIconEmoji}</span>
              </div>
            </div>
          </div>
        </div>

        {/* POI List */}
        {(config.layout === "map-with-list" ||
          config.layout === "map-with-sidebar") && (
          <div
            className={
              config.layout === "map-with-sidebar"
                ? "lg:w-96 lg:overflow-y-auto"
                : ""
            }
            style={
              config.layout === "map-with-sidebar"
                ? { maxHeight: mapHeightClass.includes("80vh") ? "80vh" : "600px" }
                : undefined
            }
          >
            <div className="space-y-4">
              {Array.from(groupedPOIs.entries()).map(([category, pois]) => (
                <div
                  key={category}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xl">
                      {POI_CATEGORY_INFO[category].icon}
                    </span>
                    <h3 className="font-semibold text-foreground">
                      {POI_CATEGORY_INFO[category].label}
                    </h3>
                    <span className="text-sm text-foreground-muted">
                      ({pois.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {pois.map((poi) => (
                      <div
                        key={poi.id}
                        className={`cursor-pointer rounded-lg border p-3 transition-all ${
                          selectedPOI?.id === poi.id
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-transparent hover:border-[var(--card-border)] hover:bg-[var(--background-hover)]"
                        }`}
                        onClick={() =>
                          setSelectedPOI(
                            selectedPOI?.id === poi.id ? null : poi
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {poi.name}
                            </p>
                            {poi.address && (
                              <p className="text-xs text-foreground-muted">
                                {poi.address}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {config.showDistances !== false && (
                              <p className="text-sm font-medium text-foreground-secondary">
                                {poi.distanceMiles} mi
                              </p>
                            )}
                            {config.showDrivingTime && poi.drivingMins && (
                              <p className="text-xs text-foreground-muted">
                                🚗 {poi.drivingMins} min
                              </p>
                            )}
                            {config.showWalkingTime && poi.walkingMins && (
                              <p className="text-xs text-foreground-muted">
                                🚶 {poi.walkingMins} min
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {selectedPOI?.id === poi.id && (
                          <div className="mt-3 space-y-2 border-t border-[var(--card-border)] pt-3">
                            {config.showRatings && poi.rating && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground-muted">
                                  Rating:
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="font-medium text-foreground">
                                    {poi.rating}
                                  </span>
                                  {poi.reviewCount && (
                                    <span className="text-xs text-foreground-muted">
                                      ({poi.reviewCount} reviews)
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            {poi.schoolRating && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground-muted">
                                  School Rating:
                                </span>
                                <span className="font-medium text-foreground">
                                  {poi.schoolRating}/10
                                </span>
                                {poi.schoolType && (
                                  <span className="text-xs text-foreground-muted capitalize">
                                    ({poi.schoolType})
                                  </span>
                                )}
                              </div>
                            )}
                            {poi.schoolGrades && (
                              <p className="text-sm text-foreground-muted">
                                Grades: {poi.schoolGrades}
                              </p>
                            )}
                            {poi.phone && (
                              <a
                                href={`tel:${poi.phone}`}
                                className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                              >
                                📞 {poi.phone}
                              </a>
                            )}
                            {config.showWebsiteLinks && poi.website && (
                              <a
                                href={poi.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                              >
                                🔗 Visit Website
                              </a>
                            )}
                            <a
                              href={`https://www.google.com/maps/dir/${propertyLat},${propertyLng}/${poi.latitude},${poi.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                            >
                              Get Directions
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* No POIs Message */}
      {filteredPOIs.length === 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <p className="text-foreground-secondary">
            No points of interest found in this area.
          </p>
        </div>
      )}
    </div>
  );
}
