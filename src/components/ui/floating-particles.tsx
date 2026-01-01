"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface FloatingParticlesProps {
  className?: string;
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
}

/**
 * Floating particles background effect
 * Creates subtle, floating dots that move upward
 */
export function FloatingParticles({
  className,
  count = 30,
  color = "rgba(59, 130, 246, 0.3)",
  minSize = 2,
  maxSize = 6,
  minDuration = 15,
  maxDuration = 30,
}: FloatingParticlesProps) {
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    if (mediaQuery.matches) return;

    // Generate random particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: minSize + Math.random() * (maxSize - minSize),
        duration: minDuration + Math.random() * (maxDuration - minDuration),
        delay: Math.random() * -maxDuration,
        opacity: 0.1 + Math.random() * 0.4,
      });
    }
    setParticles(newParticles);
  }, [count, minSize, maxSize, minDuration, maxDuration]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: color,
            opacity: particle.opacity,
            animation: `float-up ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--particle-opacity, 0.3);
          }
          90% {
            opacity: var(--particle-opacity, 0.3);
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Glowing orbs background effect
 * Creates large, blurred orbs that slowly move
 */
interface GlowingOrbsProps {
  className?: string;
  colors?: string[];
}

export function GlowingOrbs({
  className,
  colors = ["rgba(59, 130, 246, 0.15)", "rgba(139, 92, 246, 0.12)", "rgba(236, 72, 153, 0.1)"],
}: GlowingOrbsProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {colors.map((color, index) => (
        <div
          key={index}
          className="absolute rounded-full blur-3xl"
          style={{
            width: `${400 + index * 100}px`,
            height: `${400 + index * 100}px`,
            backgroundColor: color,
            left: `${20 + index * 30}%`,
            top: `${10 + index * 20}%`,
            animation: `orb-float-${index} ${20 + index * 5}s ease-in-out infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes orb-float-0 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes orb-float-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 30px) scale(1.05);
          }
          66% {
            transform: translate(30px, -30px) scale(0.95);
          }
        }
        @keyframes orb-float-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, 40px) scale(0.95);
          }
          66% {
            transform: translate(-30px, -20px) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Grid lines background with glow effect
 */
interface GridLinesProps {
  className?: string;
  color?: string;
  size?: number;
  glowColor?: string;
}

export function GridLines({
  className,
  color = "rgba(255, 255, 255, 0.03)",
  size = 64,
  glowColor = "rgba(59, 130, 246, 0.1)",
}: GridLinesProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {/* Base grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${color} 1px, transparent 1px),
            linear-gradient(90deg, ${color} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
        }}
      />
      {/* Glow overlay that moves */}
      <div
        className="absolute inset-0 animate-grid-glow"
        style={{
          background: `radial-gradient(ellipse 600px 400px at 50% 50%, ${glowColor}, transparent)`,
        }}
      />
      <style jsx>{`
        @keyframes grid-glow-move {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
        .animate-grid-glow {
          animation: grid-glow-move 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Noise texture overlay for depth
 */
interface NoiseOverlayProps {
  className?: string;
  opacity?: number;
}

export function NoiseOverlay({ className, opacity = 0.03 }: NoiseOverlayProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}
