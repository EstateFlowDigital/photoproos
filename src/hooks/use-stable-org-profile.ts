"use client";

import { useEffect, useMemo, useState } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";

type CachedOrg = {
  id: string;
  name: string | null;
  slug: string | null;
  imageUrl?: string | null;
};

type CachedUser = {
  id: string;
  fullName: string | null;
  emailAddress: string | null;
  imageUrl?: string | null;
};

type CachedState = {
  org?: CachedOrg | null;
  user?: CachedUser | null;
};

const STORAGE_KEY = "ppos_org_profile";

/**
 * Provides a stable organization/user object across route transitions.
 * Reads last known values from localStorage immediately and updates from Clerk when available.
 */
export function useStableOrgProfile() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const [cached, setCached] = useState<CachedState>({});

  // Hydrate from localStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CachedState;
        setCached(parsed);
      }
    } catch {
      // ignore JSON/parse errors
    }
  }, []);

  // Update cache when live Clerk data is present
  useEffect(() => {
    if (typeof window === "undefined") return;

    const next: CachedState = {
      org: organization
        ? {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            imageUrl: organization.imageUrl,
          }
        : cached.org,
      user: user
        ? {
            id: user.id,
            fullName: user.fullName,
            emailAddress: user.primaryEmailAddress?.emailAddress || null,
            imageUrl: user.imageUrl,
          }
        : cached.user,
    };

    // Only write when we actually have fresh data
    if (organization || user) {
      setCached(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage failures
      }
    }
  }, [organization, user]);

  const stableOrg = useMemo(() => organization || cached.org || null, [organization, cached.org]);
  const stableUser = useMemo(() => user || cached.user || null, [user, cached.user]);

  return { organization: stableOrg, user: stableUser };
}
