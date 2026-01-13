"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface BrowserMockupProps {
  url?: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
}

interface PhoneMockupProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================
// BROWSER MOCKUP COMPONENT
// ============================================

export function BrowserMockup({
  url = "app.photoproos.com",
  children,
  className,
  height = "h-[500px]",
}: BrowserMockupProps) {
  return (
    <div
      className={cn(
        "browser-mockup rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl shadow-black/30 overflow-hidden",
        className
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-3">
        {/* Traffic lights */}
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>

        {/* URL bar */}
        <div className="ml-4 flex flex-1 items-center gap-2 rounded-lg bg-[var(--background)] px-3 py-1.5 max-w-md">
          <LockIcon className="h-3.5 w-3.5 text-[var(--success)]" />
          <span className="text-xs text-foreground-muted">{url}</span>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] flex items-center justify-center text-[10px] font-medium text-white">
            JD
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className={cn("relative overflow-hidden bg-[var(--background)]", height)}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// PHONE MOCKUP COMPONENT
// ============================================

export function PhoneMockup({ children, className }: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "phone-mockup relative mx-auto w-[280px]",
        className
      )}
    >
      {/* Phone frame */}
      <div className="relative rounded-[40px] border-[12px] border-[var(--background-elevated)] bg-[var(--background)] shadow-2xl shadow-black/40">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[var(--background-elevated)]" />

        {/* Screen content */}
        <div className="relative overflow-hidden rounded-[28px] aspect-[9/19.5]">
          {/* Status bar */}
          <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-2 text-[10px] font-medium text-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <SignalIcon className="h-3 w-3" />
              <WifiIcon className="h-3 w-3" />
              <BatteryIcon className="h-4 w-4" />
            </div>
          </div>

          {/* Content */}
          <div className="h-full pt-8">
            {children}
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-foreground/20" />
      </div>
    </div>
  );
}

// ============================================
// TABLET MOCKUP COMPONENT
// ============================================

interface TabletMockupProps {
  children: React.ReactNode;
  className?: string;
}

export function TabletMockup({ children, className }: TabletMockupProps) {
  return (
    <div
      className={cn(
        "tablet-mockup relative mx-auto w-[400px]",
        className
      )}
    >
      {/* Tablet frame */}
      <div className="relative rounded-[24px] border-[10px] border-[var(--background-elevated)] bg-[var(--background)] shadow-2xl shadow-black/40">
        {/* Camera */}
        <div className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--background-active)]" />

        {/* Screen content */}
        <div className="relative overflow-hidden rounded-[14px] aspect-[4/3]">
          {children}
        </div>

        {/* Home button */}
        <div className="absolute bottom-2 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-foreground/20" />
      </div>
    </div>
  );
}

// ============================================
// ICONS
// ============================================

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <rect x="1" y="10" width="3" height="4" rx="0.5" />
      <rect x="5" y="7" width="3" height="7" rx="0.5" />
      <rect x="9" y="4" width="3" height="10" rx="0.5" />
      <rect x="13" y="1" width="3" height="13" rx="0.5" />
    </svg>
  );
}

function WifiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 2c-3.87 0-7.23 2.18-9 5.4a.75.75 0 0 0 1.3.75C1.75 5.67 4.66 4 8 4s6.25 1.67 7.7 4.15a.75.75 0 0 0 1.3-.75C15.23 4.18 11.87 2 8 2Z" />
      <path d="M8 6c-2.35 0-4.41 1.23-5.6 3.1a.75.75 0 0 0 1.26.82C4.64 8.46 6.21 7.5 8 7.5s3.36.96 4.34 2.42a.75.75 0 0 0 1.26-.82C12.41 7.23 10.35 6 8 6Z" />
      <path d="M8 10a2.5 2.5 0 0 0-2.15 1.22.75.75 0 0 0 1.26.82A1 1 0 0 1 8 11.5a1 1 0 0 1 .89.54.75.75 0 0 0 1.26-.82A2.5 2.5 0 0 0 8 10Z" />
      <circle cx="8" cy="14" r="1" />
    </svg>
  );
}

function BatteryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 12" fill="currentColor" className={className}>
      <rect x="0" y="0" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="2" y="2" width="15" height="8" rx="1" fill="currentColor" />
      <rect x="21" y="3" width="3" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}
