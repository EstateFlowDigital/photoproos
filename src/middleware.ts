import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Main application domains (add your production domain here)
const MAIN_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "app.photoproos.com",
  "photoproos.com",
  "www.photoproos.com",
];

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  // Home and auth pages
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/signup(.*)",

  // Public gallery view (clients access their photos here)
  "/g/(.*)",
  "/api/gallery/(.*)",

  // Public property websites
  "/p/(.*)",

  // Portfolio websites (public viewing)
  "/portfolio/(.*)",
  "/api/portfolio/(.*)",

  // Client portal (uses its own session system, not Clerk)
  "/portal(.*)",
  "/api/auth/client(.*)",

  // Contract signing (public for signers)
  "/sign/(.*)",

  // Public form submissions
  "/f/(.*)",

  // Webhooks (Stripe, Clerk, etc.)
  "/api/webhooks/(.*)",

  // Third-party integrations (Dropbox, etc.)
  "/api/integrations/(.*)",

  // Marketing pages
  "/pricing",
  "/features(.*)",
  "/industries(.*)",
  "/about",
  "/contact",
  "/careers",
  "/press",
  "/integrations",
  "/partners",
  "/affiliates",
  "/blog(.*)",
  "/guides(.*)",
  "/webinars(.*)",
  "/changelog",
  "/roadmap",
  "/help(.*)",
  "/support(.*)",
  "/legal(.*)",

  // Referral redirect route
  "/r/(.*)",

  // Custom domain handler
  "/_custom-domain(.*)",
]);

// Check if request is from a custom domain
function isCustomDomain(host: string): boolean {
  // Remove port if present
  const hostname = host.split(":")[0];

  // Check if this is a main domain
  for (const mainDomain of MAIN_DOMAINS) {
    if (hostname === mainDomain || hostname.endsWith(`.${mainDomain}`)) {
      return false;
    }
  }

  // Check if this is a Railway preview domain
  if (hostname.includes(".railway.app") || hostname.includes(".up.railway.app")) {
    return false;
  }

  return true;
}

export default clerkMiddleware(async (auth, request) => {
  const host = request.headers.get("host") || "";

  // Handle custom domain routing
  if (isCustomDomain(host)) {
    const url = new URL(request.url);

    // Only handle root path or paths that don't look like assets
    const pathname = url.pathname;
    if (pathname === "/" || !pathname.includes(".")) {
      // Rewrite to custom domain handler with the host as a parameter
      const newUrl = new URL(`/_custom-domain`, request.url);
      newUrl.searchParams.set("domain", host.split(":")[0]);
      newUrl.searchParams.set("path", pathname);
      return NextResponse.rewrite(newUrl);
    }
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
