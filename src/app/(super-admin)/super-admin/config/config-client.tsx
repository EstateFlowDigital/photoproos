"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  updateFeatureStatus,
  updateSystemSetting,
  seedDefaultFeatureFlags,
  seedDefaultSystemSettings,
} from "@/lib/actions/super-admin";

// Icons
function ToggleRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
      <circle cx="16" cy="12" r="2" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// Additional icons for platform modules
function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ClipboardListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

function FileInputIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M2 15h10" />
      <path d="m9 18 3-3-3-3" />
    </svg>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ImagesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 22H4a2 2 0 0 1-2-2V6" />
      <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
      <circle cx="12" cy="8" r="2" />
      <rect width="16" height="16" x="6" y="2" rx="2" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function BarChart3Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  );
}

function UsersRoundIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 21a8 8 0 0 0-16 0" />
      <circle cx="10" cy="8" r="5" />
      <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FileSignatureIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5" />
      <path d="M8 18h1" />
      <path d="M18.42 9.61a2.1 2.1 0 1 1 2.97 2.97L16.95 17 13 18l.99-3.95 4.43-4.44Z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Building2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    </svg>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

function PlugIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
    </svg>
  );
}

function CalculatorIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}

function LandmarkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}

type FeatureFlagStatus = "coming_soon" | "beta" | "live" | "discontinued";

interface FeatureFlag {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: FeatureFlagStatus;
  category: string;
  icon?: string;
  isSystem?: boolean;
  rolloutPercentage?: number;
  launchDate?: string;
  betaEndDate?: string;
  deprecationDate?: string;
}

interface SystemSetting {
  id: string;
  key: string;
  name: string;
  description: string;
  value: string;
  valueType: string;
  category: string;
}

interface AuditLog {
  id: string;
  actionType: string;
  description: string;
  createdAt: string;
  targetType?: string;
}

interface ConfigPageClientProps {
  initialFlags: unknown[];
  initialSettings: unknown[];
  initialAuditLogs: unknown[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // Existing feature icons
  sparkles: SparklesIcon,
  trophy: TrophyIcon,
  "message-circle": MessageCircleIcon,
  mail: MailIcon,
  bell: BellIcon,
  calendar: CalendarIcon,
  // Platform module icons
  "layout-dashboard": LayoutDashboardIcon,
  settings: SettingsIcon,
  "clipboard-list": ClipboardListIcon,
  "file-input": FileInputIcon,
  "message-square": MessageSquareIcon,
  images: ImagesIcon,
  "file-text": FileTextIcon,
  tag: TagIcon,
  "bar-chart-3": BarChart3Icon,
  "shopping-cart": ShoppingCartIcon,
  "credit-card": CreditCardIcon,
  receipt: ReceiptIcon,
  "users-round": UsersRoundIcon,
  users: UsersIcon,
  "file-signature": FileSignatureIcon,
  star: StarIcon,
  "building-2": Building2Icon,
  globe: GlobeIcon,
  camera: CameraIcon,
  scale: ScaleIcon,
  layers: LayersIcon,
  bot: BotIcon,
  megaphone: MegaphoneIcon,
  gift: GiftIcon,
  plug: PlugIcon,
  calculator: CalculatorIcon,
  landmark: LandmarkIcon,
};

const CATEGORY_NAMES: Record<string, string> = {
  // Cross-cutting features
  ai_features: "AI Features",
  engagement: "Engagement",
  communications: "Communications",
  finance: "Finance",
  experimental: "Experimental",
  system: "System",
  // Platform modules
  platform_core: "Core Modules",
  platform_operations: "Operations",
  platform_client: "Client Management",
  platform_advanced: "Advanced Features",
};

const STATUS_CONFIG: Record<FeatureFlagStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  coming_soon: {
    label: "Coming Soon",
    color: "text-[var(--info)]",
    bgColor: "bg-[var(--info)]/10",
    icon: ClockIcon,
  },
  beta: {
    label: "Beta",
    color: "text-[var(--warning)]",
    bgColor: "bg-[var(--warning)]/10",
    icon: FlaskIcon,
  },
  live: {
    label: "Live",
    color: "text-[var(--success)]",
    bgColor: "bg-[var(--success)]/10",
    icon: CheckCircleIcon,
  },
  discontinued: {
    label: "Discontinued",
    color: "text-[var(--foreground-muted)]",
    bgColor: "bg-[var(--foreground-muted)]/10",
    icon: XCircleIcon,
  },
};

export function ConfigPageClient({
  initialFlags,
  initialSettings,
  initialAuditLogs,
}: ConfigPageClientProps) {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags as FeatureFlag[]);
  const [settings, setSettings] = useState<SystemSetting[]>(initialSettings as SystemSetting[]);
  const [auditLogs] = useState<AuditLog[]>(initialAuditLogs as AuditLog[]);
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<FeatureFlagStatus | "all">("all");

  const handleUpdateStatus = async (slugOrId: string, newStatus: FeatureFlagStatus) => {
    startTransition(async () => {
      const result = await updateFeatureStatus(slugOrId, newStatus);
      if (result.success) {
        setFlags((prev) =>
          prev.map((f) =>
            f.slug === slugOrId || f.id === slugOrId
              ? { ...f, status: newStatus }
              : f
          )
        );
        toast.success(`Feature flag updated to ${STATUS_CONFIG[newStatus].label}`);
      } else {
        toast.error(result.error || "Failed to update feature flag status");
      }
    });
  };

  const handleToggleSetting = async (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    startTransition(async () => {
      const result = await updateSystemSetting(key, newValue);
      if (result.success) {
        setSettings((prev) =>
          prev.map((s) => (s.key === key ? { ...s, value: newValue } : s))
        );
        toast.success("System setting updated");
      } else {
        toast.error(result.error || "Failed to update setting");
      }
    });
  };

  const handleSeedDefaults = async () => {
    startTransition(async () => {
      const [flagsResult, settingsResult] = await Promise.all([
        seedDefaultFeatureFlags(),
        seedDefaultSystemSettings(),
      ]);

      if (flagsResult.success && settingsResult.success) {
        toast.success(
          `Seeded ${flagsResult.data} flags and ${settingsResult.data} settings`
        );
        // Reload page to get fresh data
        window.location.reload();
      } else {
        toast.error("Failed to seed defaults");
      }
    });
  };

  // Filter flags by status, then group by category
  const filteredFlags = statusFilter === "all"
    ? flags
    : flags.filter((f) => f.status === statusFilter);

  const flagsByCategory = filteredFlags.reduce((acc, flag) => {
    const categoryName = CATEGORY_NAMES[flag.category] || flag.category;
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(flag);
    return acc;
  }, {} as Record<string, FeatureFlag[]>);

  // Status counts for filter badges
  const statusCounts = flags.reduce((acc, flag) => {
    acc[flag.status] = (acc[flag.status] || 0) + 1;
    return acc;
  }, {} as Record<FeatureFlagStatus, number>);

  // Check if we have data
  const hasData = flags.length > 0 || settings.length > 0;

  return (
    <div className="space-y-6">
      {/* Empty State - Seed Button */}
      {!hasData && (
        <div
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]",
            "p-8 text-center"
          )}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-4">
            <ToggleRightIcon className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            No Configuration Data
          </h3>
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            Seed the default feature flags and system settings to get started.
          </p>
          <Button onClick={handleSeedDefaults} disabled={isPending}>
            {isPending ? "Seeding..." : "Seed Default Configuration"}
          </Button>
        </div>
      )}

      {/* System Settings */}
      {settings.length > 0 && (
        <div
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg",
                  "bg-[var(--error)]/10",
                  "flex items-center justify-center"
                )}
              >
                <ToggleRightIcon className="w-5 h-5 text-[var(--error)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  System Settings
                </h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Critical platform-wide settings
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className={cn(
                  "flex items-start justify-between gap-4 flex-wrap p-4 rounded-lg",
                  "border border-[var(--border)]",
                  "bg-[var(--background)]",
                  isPending && "opacity-50"
                )}
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {setting.name}
                  </p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  checked={setting.value === "true"}
                  onCheckedChange={() => handleToggleSetting(setting.key, setting.value)}
                  disabled={isPending}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Flags Header with Filter */}
      {flags.length > 0 && (
        <div
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]",
            "p-6"
          )}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Feature Flags
              </h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                Control feature availability across the platform
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-colors",
                  statusFilter === "all"
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-transparent text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--foreground-muted)]"
                )}
              >
                All ({flags.length})
              </button>
              {(Object.keys(STATUS_CONFIG) as FeatureFlagStatus[]).map((status) => {
                const config = STATUS_CONFIG[status];
                const count = statusCounts[status] || 0;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5",
                      statusFilter === status
                        ? `${config.bgColor} ${config.color} border-current`
                        : "bg-transparent text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--foreground-muted)]"
                    )}
                  >
                    {config.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Feature Flags by Category */}
      {Object.entries(flagsByCategory).map(([category, categoryFlags]) => (
        <div
          key={category}
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {category}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {categoryFlags.map((flag) => {
              const IconComponent = flag.icon ? ICON_MAP[flag.icon] : SparklesIcon;
              return (
                <div
                  key={flag.id}
                  className={cn(
                    "flex items-start justify-between gap-4 flex-wrap p-4 rounded-lg",
                    "border border-[var(--border)]",
                    "bg-[var(--background)]",
                    isPending && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg",
                        "bg-[var(--primary)]/10",
                        "flex items-center justify-center"
                      )}
                    >
                      {IconComponent && (
                        <IconComponent className="w-5 h-5 text-[var(--primary)]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--foreground)]">
                          {flag.name}
                        </p>
                        {flag.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {flag.description}
                      </p>
                      {flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100 && (
                        <p className="text-xs text-[var(--warning)] mt-1">
                          Rollout: {flag.rolloutPercentage}%
                        </p>
                      )}
                      {/* Lifecycle dates */}
                      {flag.status === "coming_soon" && flag.launchDate && (
                        <p className="text-xs text-[var(--info)] mt-1">
                          Launch: {new Date(flag.launchDate).toLocaleDateString()}
                        </p>
                      )}
                      {flag.status === "beta" && flag.betaEndDate && (
                        <p className="text-xs text-[var(--warning)] mt-1">
                          Beta ends: {new Date(flag.betaEndDate).toLocaleDateString()}
                        </p>
                      )}
                      {flag.status === "discontinued" && flag.deprecationDate && (
                        <p className="text-xs text-[var(--foreground-muted)] mt-1">
                          Discontinued: {new Date(flag.deprecationDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const statusConfig = STATUS_CONFIG[flag.status];
                      const StatusIcon = statusConfig.icon;
                      return (
                        <Badge
                          variant="secondary"
                          className={cn("text-xs gap-1", statusConfig.bgColor, statusConfig.color)}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </Badge>
                      );
                    })()}
                    <select
                      value={flag.status}
                      onChange={(e) => handleUpdateStatus(flag.slug, e.target.value as FeatureFlagStatus)}
                      disabled={isPending}
                      className={cn(
                        "text-sm rounded-md px-2 py-1",
                        "bg-[var(--background)] border border-[var(--border)]",
                        "text-[var(--foreground)]",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50",
                        isPending && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <option value="coming_soon">Coming Soon</option>
                      <option value="beta">Beta</option>
                      <option value="live">Live</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Recent Audit Log */}
      {auditLogs.length > 0 && (
        <div
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Recent Activity
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-4 flex-wrap text-sm"
              >
                <div>
                  <p className="text-[var(--foreground)]">{log.description}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {log.actionType.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="text-xs text-[var(--foreground-muted)]">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      {hasData && (
        <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3">
          <p className="text-sm text-[var(--success)]">
            <strong>Database-backed:</strong> All changes are persisted to the database and take effect immediately across all instances. Actions are logged for audit purposes.
          </p>
        </div>
      )}

      {/* Clerk Super Admin Setup Instructions */}
      <div
        className={cn(
          "rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]",
          "p-6"
        )}
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Setting Up Super Admin Access
        </h2>
        <div className="space-y-4 text-sm text-[var(--foreground-muted)]">
          <p>
            To grant super admin access to a user:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline">Clerk Dashboard</a></li>
            <li>Navigate to <strong>Users</strong> and find the user</li>
            <li>Click on the user → <strong>Metadata</strong> tab</li>
            <li>Under <strong>Public metadata</strong>, add:</li>
          </ol>
          <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)] font-mono text-xs">
            {`{`}<br/>
            {`  "isSuperAdmin": true`}<br/>
            {`}`}
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            The user will immediately have access to the Super Admin area without needing to log out.
          </p>
        </div>
      </div>
    </div>
  );
}
