"use client";

import { useState } from "react";
import { logoutClient } from "@/lib/actions/client-auth";
import { CameraIcon, LogoutIcon, LoadingSpinner } from "./icons";
import { NotificationBell } from "./notification-bell";
import type { ClientData, InvoiceData, QuestionnaireData, GalleryData } from "./types";

interface PortalHeaderProps {
  client: ClientData;
  invoices?: InvoiceData[];
  questionnaires?: QuestionnaireData[];
  galleries?: GalleryData[];
}

export function PortalHeader({ client, invoices = [], questionnaires = [], galleries = [] }: PortalHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = client.fullName || client.email.split("@")[0];
  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutClient();
    window.location.href = "/portal/login";
  };

  return (
    <header className="border-b border-[var(--card-border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]">
              <CameraIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Client Portal</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell */}
            <NotificationBell
              invoices={invoices}
              questionnaires={questionnaires}
              galleries={galleries}
            />

            {/* User Info - Hidden on mobile */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-[var(--foreground-muted)]">{client.company || client.email}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-medium text-[var(--primary)]">
              {firstLetter}
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-white disabled:opacity-50"
            >
              {isLoggingOut ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <LogoutIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{isLoggingOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
