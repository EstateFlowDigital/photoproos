"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Confetti particle types for variety
type ParticleShape = "circle" | "square" | "rectangle" | "star";

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  shape: ParticleShape;
  size: number;
  velocity: { x: number; y: number };
  rotationSpeed: number;
}

export interface ConfettiProps {
  /** Trigger the confetti animation (default: false) */
  trigger?: boolean;
  /** Duration of animation in ms (default: 3000) */
  duration?: number;
  /** Number of particles (default: 50) */
  particleCount?: number;
  /** Custom colors array */
  colors?: string[];
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Origin point: 'center' | 'top' | 'bottom' (default: 'top') */
  origin?: "center" | "top" | "bottom";
  /** Spread angle in degrees (default: 90) */
  spread?: number;
  /** Gravity strength (default: 0.5) */
  gravity?: number;
}

const DEFAULT_COLORS = [
  "#3b82f6", // Blue (primary)
  "#8b5cf6", // Purple (AI)
  "#22c55e", // Green (success)
  "#f97316", // Orange (warning)
  "#ec4899", // Pink
  "#eab308", // Yellow
];

const SHAPES: ParticleShape[] = ["circle", "square", "rectangle", "star"];

function createParticle(
  id: number,
  colors: string[],
  origin: "center" | "top" | "bottom",
  spread: number
): Particle {
  const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
  const velocity = 8 + Math.random() * 8;
  const isFromTop = origin === "top";
  const isFromCenter = origin === "center";

  return {
    id,
    x: 50 + (Math.random() - 0.5) * 40, // Start position (% of container)
    y: isFromTop ? -5 : isFromCenter ? 50 : 105,
    rotation: Math.random() * 360,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    size: 8 + Math.random() * 8,
    velocity: {
      x: Math.sin(angle) * velocity * (Math.random() > 0.5 ? 1 : -1),
      y: isFromTop ? velocity : isFromCenter ? -velocity * Math.abs(Math.cos(angle)) : -velocity,
    },
    rotationSpeed: (Math.random() - 0.5) * 20,
  };
}

function ParticleComponent({ particle, gravity }: { particle: Particle; gravity: number }) {
  const { shape, size, color } = particle;

  // Render different shapes
  if (shape === "star") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  if (shape === "rectangle") {
    return (
      <div
        style={{
          width: size * 1.5,
          height: size * 0.5,
          backgroundColor: color,
          borderRadius: 2,
        }}
      />
    );
  }

  if (shape === "square") {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: 2,
        }}
      />
    );
  }

  // Circle (default)
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: "50%",
      }}
    />
  );
}

export function Confetti({
  trigger = false,
  duration = 3000,
  particleCount = 50,
  colors = DEFAULT_COLORS,
  onComplete,
  origin = "top",
  spread = 90,
  gravity = 0.5,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true);
      const newParticles = Array.from({ length: particleCount }, (_, i) =>
        createParticle(i, colors, origin, spread)
      );
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        setIsAnimating(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, particleCount, colors, origin, spread, duration, onComplete, isAnimating]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
          {particles.map((particle, index) => (
            <motion.div
              key={particle.id}
              initial={{
                x: `${particle.x}vw`,
                y: `${particle.y}vh`,
                rotate: particle.rotation,
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x: `${particle.x + particle.velocity.x * 10}vw`,
                y: `${particle.y + particle.velocity.y * -5 + gravity * 80}vh`,
                rotate: particle.rotation + particle.rotationSpeed * 20,
                opacity: [1, 1, 0],
                scale: [0, 1.2, 1, 0.8],
              }}
              transition={{
                duration: duration / 1000,
                delay: index * 0.02,
                ease: [0.25, 0.1, 0.25, 1],
                opacity: { times: [0, 0.7, 1] },
                scale: { times: [0, 0.2, 0.5, 1] },
              }}
              className="absolute"
              style={{
                transformOrigin: "center center",
              }}
            >
              <ParticleComponent particle={particle} gravity={gravity} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Preset configurations for common celebrations
export const confettiPresets = {
  /** Small celebration - subtle feedback */
  subtle: {
    particleCount: 20,
    duration: 2000,
    gravity: 0.3,
  },
  /** Standard celebration - balanced */
  standard: {
    particleCount: 50,
    duration: 3000,
    gravity: 0.5,
  },
  /** Big celebration - impactful */
  celebration: {
    particleCount: 100,
    duration: 4000,
    gravity: 0.6,
  },
  /** Success colors only */
  success: {
    particleCount: 40,
    duration: 2500,
    colors: ["#22c55e", "#16a34a", "#15803d", "#4ade80"],
    gravity: 0.4,
  },
  /** Payment success - premium feel */
  payment: {
    particleCount: 60,
    duration: 3500,
    colors: ["#22c55e", "#3b82f6", "#eab308", "#8b5cf6"],
    origin: "center" as const,
    gravity: 0.5,
  },
};
