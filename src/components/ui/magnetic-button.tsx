"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

interface MagneticButtonProps extends ButtonProps {
  intensity?: number;
}

/**
 * Magnetic Button - follows cursor with subtle magnetic effect
 * Use for prominent CTAs to add interactivity
 */
export function MagneticButton({
  children,
  className,
  intensity = 0.3,
  ...props
}: MagneticButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = (e.clientX - centerX) * intensity;
      const distanceY = (e.clientY - centerY) * intensity;

      setPosition({ x: distanceX, y: distanceY });
    },
    [intensity]
  );

  const handleMouseLeave = React.useCallback(() => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <Button
      ref={buttonRef}
      className={cn("magnetic-button", className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      <span
        className="transition-transform duration-150"
        style={{
          transform: isHovered
            ? `translate(${position.x * 0.2}px, ${position.y * 0.2}px)`
            : "none",
        }}
      >
        {children}
      </span>
    </Button>
  );
}
