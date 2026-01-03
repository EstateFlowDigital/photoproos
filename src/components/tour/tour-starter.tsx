"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTour } from "./tour-provider";
import { welcomeTour, getTourById } from "./tours";

/**
 * Client component that detects tour query params and starts the appropriate tour.
 * Place this in pages where tours should auto-start based on URL params.
 */
export function TourStarter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { startTour, isActive } = useTour();

  useEffect(() => {
    const tourId = searchParams?.get("tour");
    if (tourId && !isActive) {
      // Get the tour by ID
      const tour = tourId === "welcome" ? welcomeTour : getTourById(tourId);

      if (tour) {
        // Small delay to ensure the page has rendered
        const timer = setTimeout(() => {
          startTour(tour);
          // Remove the tour param from URL without refresh
          const newParams = new URLSearchParams(searchParams?.toString() || "");
          newParams.delete("tour");
          const newUrl = newParams.toString()
            ? `${window.location.pathname}?${newParams.toString()}`
            : window.location.pathname;
          router.replace(newUrl, { scroll: false });
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, startTour, isActive, router]);

  return null;
}
