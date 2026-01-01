"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

interface PageTransitionContextType {
  isTransitioning: boolean;
  startTransition: () => void;
}

const PageTransitionContext = React.createContext<PageTransitionContextType>({
  isTransitioning: false,
  startTransition: () => {},
});

export function usePageTransition() {
  return React.useContext(PageTransitionContext);
}

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const pathname = usePathname();

  // Reset transition state when pathname changes
  React.useEffect(() => {
    setIsTransitioning(false);
  }, [pathname]);

  const startTransition = React.useCallback(() => {
    setIsTransitioning(true);
  }, []);

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, startTransition }}>
      {/* Page transition overlay */}
      <div
        className="page-transition-overlay"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transition: "opacity 300ms ease-in-out",
        }}
      />
      {/* Page content with fade effect */}
      <div
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: "opacity 200ms ease-out",
        }}
      >
        {children}
      </div>
    </PageTransitionContext.Provider>
  );
}

/**
 * Animated page wrapper with entrance animation
 */
interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Small delay to trigger entrance animation
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : "translateY(10px)",
        transition: "opacity 400ms ease-out, transform 400ms ease-out",
      }}
    >
      {children}
    </div>
  );
}
