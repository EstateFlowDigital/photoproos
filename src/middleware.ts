import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

  // Webhooks (Stripe, Clerk, etc.)
  "/api/webhooks/(.*)",

  // Marketing pages
  "/pricing",
  "/features(.*)",
  "/industries(.*)",
  "/about",
  "/contact",
  "/careers",
  "/press",
  "/partners",
  "/affiliates",
  "/blog(.*)",
  "/guides(.*)",
  "/webinars(.*)",
  "/changelog",
  "/roadmap",
  "/help(.*)",
  "/legal(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
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
