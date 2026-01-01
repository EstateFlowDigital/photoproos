"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string | string[];
  speed?: number;
  delay?: number;
  loop?: boolean;
  cursor?: boolean;
  cursorChar?: string;
  className?: string;
  onComplete?: () => void;
}

/**
 * Typewriter text animation
 * Supports single text or array of texts (cycles through them)
 */
export function Typewriter({
  text,
  speed = 50,
  delay = 1000,
  loop = false,
  cursor = true,
  cursorChar = "|",
  className,
  onComplete,
}: TypewriterProps) {
  const texts = Array.isArray(text) ? text : [text];
  const [displayText, setDisplayText] = React.useState("");
  const [textIndex, setTextIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setDisplayText(texts[0]);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const currentText = texts[textIndex];

    if (!isDeleting) {
      // Typing
      if (charIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing current text
        if (texts.length === 1 && !loop) {
          setIsComplete(true);
          onComplete?.();
          return;
        }

        // Wait before deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, delay);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, speed / 2);
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting
        setIsDeleting(false);
        const nextIndex = (textIndex + 1) % texts.length;
        setTextIndex(nextIndex);

        if (!loop && nextIndex === 0) {
          setIsComplete(true);
          onComplete?.();
        }
      }
    }
  }, [charIndex, textIndex, isDeleting, texts, speed, delay, loop, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {cursor && !isComplete && (
        <span className="animate-pulse ml-0.5">{cursorChar}</span>
      )}
    </span>
  );
}

/**
 * Split text animation - animates each word/character individually
 */
interface SplitTextProps {
  text: string;
  type?: "words" | "chars";
  stagger?: number;
  className?: string;
  wordClassName?: string;
  charClassName?: string;
  isVisible?: boolean;
}

export function SplitText({
  text,
  type = "words",
  stagger = 50,
  className,
  wordClassName,
  charClassName,
  isVisible = true,
}: SplitTextProps) {
  const words = text.split(" ");

  if (type === "chars") {
    const chars = text.split("");
    return (
      <span className={className}>
        {chars.map((char, i) => (
          <span
            key={i}
            className={cn(
              "inline-block transition-all duration-500",
              charClassName
            )}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transitionDelay: `${i * stagger}ms`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className={cn(
            "inline-block transition-all duration-500",
            wordClassName
          )}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(20px)",
            transitionDelay: `${i * stagger}ms`,
          }}
        >
          {word}
          {i < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </span>
  );
}

/**
 * Gradient text with animated gradient position
 */
interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export function AnimatedGradientText({
  children,
  className,
  colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#3b82f6"],
  speed = 3,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent animate-gradient-shift",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "200% auto",
        animationDuration: `${speed}s`,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Text reveal on scroll - slides up with mask
 */
interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  isVisible?: boolean;
  delay?: number;
}

export function TextReveal({
  children,
  className,
  isVisible = true,
  delay = 0,
}: TextRevealProps) {
  return (
    <span className={cn("inline-block overflow-hidden", className)}>
      <span
        className="inline-block transition-transform duration-700 ease-out"
        style={{
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
          transitionDelay: `${delay}ms`,
        }}
      >
        {children}
      </span>
    </span>
  );
}
