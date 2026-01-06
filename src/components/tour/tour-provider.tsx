"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  lazy,
  Suspense,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { markTourCompleted } from "@/lib/actions/tour";

// Lazy load TourSpotlight to avoid loading framer-motion for all dashboard pages
const TourSpotlight = lazy(() =>
  import("./tour-spotlight").then((mod) => ({ default: mod.TourSpotlight }))
);

export interface TourStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  route?: string; // Route to navigate to for this step
  action?: () => void; // Optional action to perform
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
}

interface TourContextValue {
  isActive: boolean;
  currentTour: Tour | null;
  currentStepIndex: number;
  currentStep: TourStep | null;
  startTour: (tour: Tour) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

interface TourProviderProps {
  children: ReactNode;
  organizationId?: string;
}

export function TourProvider({ children, organizationId }: TourProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = currentTour?.steps[currentStepIndex] ?? null;

  // Navigate to step route if needed
  useEffect(() => {
    if (isActive && currentStep?.route && pathname !== currentStep.route) {
      router.push(currentStep.route);
    }
  }, [isActive, currentStep, pathname, router]);

  const startTour = useCallback((tour: Tour) => {
    setCurrentTour(tour);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(async () => {
    if (currentTour && organizationId) {
      // Mark tour as completed
      await markTourCompleted(organizationId, currentTour.id);
    }
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStepIndex(0);
  }, [currentTour, organizationId]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) return;

    if (currentStepIndex < currentTour.steps.length - 1) {
      // Execute any action for the current step
      if (currentStep?.action) {
        currentStep.action();
      }
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Tour complete
      endTour();
    }
  }, [currentTour, currentStepIndex, currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentTour,
        currentStepIndex,
        currentStep,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
      }}
    >
      {children}
      {isActive && currentStep && (
        <Suspense fallback={null}>
          <TourSpotlight
            step={currentStep}
            stepIndex={currentStepIndex}
            totalSteps={currentTour?.steps.length ?? 0}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTour}
          />
        </Suspense>
      )}
    </TourContext.Provider>
  );
}
