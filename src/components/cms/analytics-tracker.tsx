"use client";

import { useEffect, useRef, useCallback } from "react";
import type { CMSPageEventType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface AnalyticsTrackerProps {
  pageId: string;
  pageSlug: string;
  /**
   * Whether to track scroll depth milestones
   * @default true
   */
  trackScrollDepth?: boolean;
  /**
   * Whether to track time on page
   * @default true
   */
  trackTimeOnPage?: boolean;
  /**
   * Whether to track CTA clicks (elements with data-cta attribute)
   * @default true
   */
  trackCTAClicks?: boolean;
  /**
   * Whether to track link clicks
   * @default false
   */
  trackLinkClicks?: boolean;
  /**
   * API endpoint for tracking
   * @default "/api/cms/analytics"
   */
  endpoint?: string;
}

interface TrackEventPayload {
  type: "event" | "session_start" | "session_end" | "conversion";
  pageId?: string;
  pageSlug?: string;
  eventType?: CMSPageEventType;
  eventData?: Record<string, unknown>;
  visitorId: string;
  sessionId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingUrl?: string;
  duration?: number;
  conversionType?: string;
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

const VISITOR_ID_KEY = "cms_visitor_id";
const SESSION_ID_KEY = "cms_session_id";
const SESSION_START_KEY = "cms_session_start";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateId("v");
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const storedSessionId = sessionStorage.getItem(SESSION_ID_KEY);
  const sessionStart = sessionStorage.getItem(SESSION_START_KEY);

  // Check if session is still valid
  if (storedSessionId && sessionStart) {
    const elapsed = Date.now() - parseInt(sessionStart, 10);
    if (elapsed < SESSION_TIMEOUT) {
      // Update session activity
      sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
      return storedSessionId;
    }
  }

  // Create new session
  const sessionId = generateId("s");
  sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  return sessionId;
}

// ============================================================================
// URL UTILITIES
// ============================================================================

function getUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
    (param) => {
      const value = params.get(param);
      if (value) {
        const key = param.replace("utm_", "utm") + param.charAt(4).toUpperCase() + param.slice(5);
        utmParams[key.replace("utm", "utm").toLowerCase()] = value;
      }
    }
  );

  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    utmContent: params.get("utm_content") || undefined,
  } as Record<string, string>;
}

// ============================================================================
// ANALYTICS TRACKER COMPONENT
// ============================================================================

export function AnalyticsTracker({
  pageId,
  pageSlug,
  trackScrollDepth = true,
  trackTimeOnPage = true,
  trackCTAClicks = true,
  trackLinkClicks = false,
  endpoint = "/api/cms/analytics",
}: AnalyticsTrackerProps) {
  const startTimeRef = useRef<number>(Date.now());
  const trackedScrollMilestones = useRef<Set<number>>(new Set());
  const maxScrollDepth = useRef<number>(0);
  const isNewSession = useRef<boolean>(false);

  // Send event to API
  const sendEvent = useCallback(
    async (payload: Partial<TrackEventPayload>) => {
      try {
        const visitorId = getVisitorId();
        const sessionId = getOrCreateSessionId();
        const utmParams = getUTMParams();

        const fullPayload: TrackEventPayload = {
          ...payload,
          visitorId,
          sessionId,
          referrer: document.referrer || undefined,
          ...utmParams,
        } as TrackEventPayload;

        // Use sendBeacon for better reliability on page unload
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            endpoint,
            JSON.stringify(fullPayload)
          );
        } else {
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fullPayload),
            keepalive: true,
          });
        }
      } catch (error) {
        console.error("Analytics tracking error:", error);
      }
    },
    [endpoint]
  );

  // Track pageview and session start
  useEffect(() => {
    const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    const sessionStart = sessionStorage.getItem(SESSION_START_KEY);
    const isNewSessionStart =
      !sessionId ||
      !sessionStart ||
      Date.now() - parseInt(sessionStart, 10) >= SESSION_TIMEOUT;

    isNewSession.current = isNewSessionStart;

    // Start new session if needed
    if (isNewSessionStart) {
      sendEvent({
        type: "session_start",
        pageId,
        pageSlug,
        landingUrl: window.location.href,
      });
    }

    // Track pageview
    sendEvent({
      type: "event",
      pageId,
      pageSlug,
      eventType: "pageview",
    });

    startTimeRef.current = Date.now();
  }, [pageId, pageSlug, sendEvent]);

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollPercent);

      // Track milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        if (
          scrollPercent >= milestone &&
          !trackedScrollMilestones.current.has(milestone)
        ) {
          trackedScrollMilestones.current.add(milestone);
          sendEvent({
            type: "event",
            pageId,
            pageSlug,
            eventType: "scroll_depth",
            eventData: { depth: milestone },
          });
        }
      }
    };

    // Throttle scroll handler
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [pageId, pageSlug, trackScrollDepth, sendEvent]);

  // Track time on page (on unload)
  useEffect(() => {
    if (!trackTimeOnPage) return;

    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      sendEvent({
        type: "event",
        pageId,
        pageSlug,
        eventType: "time_on_page",
        eventData: { duration, maxScrollDepth: maxScrollDepth.current },
      });

      // End session if this was the entry page
      if (isNewSession.current) {
        sendEvent({
          type: "session_end",
          duration,
        });
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [pageId, pageSlug, trackTimeOnPage, sendEvent]);

  // Track CTA clicks
  useEffect(() => {
    if (!trackCTAClicks) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const ctaElement = target.closest("[data-cta]");

      if (ctaElement) {
        const ctaId = ctaElement.getAttribute("data-cta");
        const ctaType = ctaElement.getAttribute("data-cta-type") || "default";

        sendEvent({
          type: "event",
          pageId,
          pageSlug,
          eventType: "cta_click",
          eventData: { ctaId, ctaType },
        });

        // Check if this is a signup/conversion CTA
        if (ctaType === "signup" || ctaType === "conversion") {
          sendEvent({
            type: "conversion",
            conversionType: ctaType,
          });
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pageId, pageSlug, trackCTAClicks, sendEvent]);

  // Track link clicks
  useEffect(() => {
    if (!trackLinkClicks) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href) {
        const isExternal = link.hostname !== window.location.hostname;

        sendEvent({
          type: "event",
          pageId,
          pageSlug,
          eventType: "link_click",
          eventData: {
            href: link.href,
            text: link.textContent?.substring(0, 100),
            isExternal,
          },
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pageId, pageSlug, trackLinkClicks, sendEvent]);

  // This component doesn't render anything
  return null;
}

// ============================================================================
// HOOK FOR MANUAL EVENT TRACKING
// ============================================================================

interface UseAnalyticsReturn {
  trackEvent: (
    eventType: CMSPageEventType,
    eventData?: Record<string, unknown>
  ) => void;
  trackConversion: (conversionType: string) => void;
  trackVideoPlay: (videoId: string, videoTitle?: string) => void;
  trackVideoComplete: (videoId: string) => void;
  trackFormStart: (formId: string) => void;
  trackFormSubmit: (formId: string) => void;
  trackShare: (platform: string, contentId?: string) => void;
  trackDownload: (fileName: string, fileType?: string) => void;
}

export function useAnalytics(
  pageId: string,
  pageSlug: string,
  endpoint: string = "/api/cms/analytics"
): UseAnalyticsReturn {
  const sendEvent = useCallback(
    async (payload: Partial<TrackEventPayload>) => {
      try {
        const visitorId = getVisitorId();
        const sessionId = getOrCreateSessionId();

        const fullPayload: TrackEventPayload = {
          ...payload,
          visitorId,
          sessionId,
          pageId,
          pageSlug,
        } as TrackEventPayload;

        if (navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, JSON.stringify(fullPayload));
        } else {
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fullPayload),
            keepalive: true,
          });
        }
      } catch (error) {
        console.error("Analytics tracking error:", error);
      }
    },
    [pageId, pageSlug, endpoint]
  );

  const trackEvent = useCallback(
    (eventType: CMSPageEventType, eventData?: Record<string, unknown>) => {
      sendEvent({ type: "event", eventType, eventData });
    },
    [sendEvent]
  );

  const trackConversion = useCallback(
    (conversionType: string) => {
      sendEvent({ type: "conversion", conversionType });
    },
    [sendEvent]
  );

  const trackVideoPlay = useCallback(
    (videoId: string, videoTitle?: string) => {
      sendEvent({
        type: "event",
        eventType: "video_play",
        eventData: { videoId, videoTitle },
      });
    },
    [sendEvent]
  );

  const trackVideoComplete = useCallback(
    (videoId: string) => {
      sendEvent({
        type: "event",
        eventType: "video_complete",
        eventData: { videoId },
      });
    },
    [sendEvent]
  );

  const trackFormStart = useCallback(
    (formId: string) => {
      sendEvent({
        type: "event",
        eventType: "form_start",
        eventData: { formId },
      });
    },
    [sendEvent]
  );

  const trackFormSubmit = useCallback(
    (formId: string) => {
      sendEvent({
        type: "event",
        eventType: "form_submit",
        eventData: { formId },
      });
    },
    [sendEvent]
  );

  const trackShare = useCallback(
    (platform: string, contentId?: string) => {
      sendEvent({
        type: "event",
        eventType: "share",
        eventData: { platform, contentId },
      });
    },
    [sendEvent]
  );

  const trackDownload = useCallback(
    (fileName: string, fileType?: string) => {
      sendEvent({
        type: "event",
        eventType: "download",
        eventData: { fileName, fileType },
      });
    },
    [sendEvent]
  );

  return {
    trackEvent,
    trackConversion,
    trackVideoPlay,
    trackVideoComplete,
    trackFormStart,
    trackFormSubmit,
    trackShare,
    trackDownload,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { AnalyticsTrackerProps, UseAnalyticsReturn };
