import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes that don't require authentication
// NOTE: Dashboard routes temporarily public for development/review
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/api/webhooks/(.*)",
  "/g/(.*)", // Public gallery view
  "/api/gallery/(.*)", // Public gallery API
  "/dashboard(.*)", // TEMPORARY: Dashboard public for review
  "/galleries(.*)", // TEMPORARY: Galleries public for review
  "/clients(.*)", // TEMPORARY: Clients public for review
  "/payments(.*)", // TEMPORARY: Payments public for review
  "/scheduling(.*)", // TEMPORARY: Scheduling public for review
  "/settings(.*)", // TEMPORARY: Settings public for review
  "/invoices(.*)", // TEMPORARY: Invoices public for review
  "/contracts(.*)", // TEMPORARY: Contracts public for review
  "/analytics(.*)", // TEMPORARY: Analytics public for review
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
