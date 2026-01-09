"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Code,
  CheckCircle,
  Clock,
  LayoutDashboard,
  Users,
  Building,
  Calendar,
  FileText,
  CreditCard,
  Image,
  Settings,
  HelpCircle,
  Megaphone,
  Shield,
  Smartphone,
  Globe,
  LogIn,
  Sparkles,
} from "lucide-react";

interface PageItem {
  route: string;
  file: string;
  isStub: boolean;
}

interface Section {
  title: string;
  icon: React.ReactNode;
  pages: PageItem[];
  subsections?: { title: string; pages: PageItem[] }[];
}

// Sitemap data organized by section
const sitemapData: Section[] = [
  {
    title: "Public Routes",
    icon: <Globe className="h-5 w-5" />,
    pages: [
      { route: "/", file: "src/app/page.tsx", isStub: false },
      { route: "/book/:slug", file: "src/app/book/[slug]/page.tsx", isStub: false },
      { route: "/book/:slug/confirmation", file: "src/app/book/[slug]/confirmation/page.tsx", isStub: false },
      { route: "/g/:slug", file: "src/app/g/[slug]/page.tsx", isStub: false },
      { route: "/invite/:token", file: "src/app/invite/[token]/page.tsx", isStub: false },
      { route: "/order/:slug", file: "src/app/order/[slug]/page.tsx", isStub: false },
      { route: "/order/:slug/confirmation", file: "src/app/order/[slug]/confirmation/page.tsx", isStub: false },
      { route: "/p/:slug", file: "src/app/p/[slug]/page.tsx", isStub: false },
      { route: "/pay/:id", file: "src/app/pay/[id]/page.tsx", isStub: false },
      { route: "/portfolio/:slug", file: "src/app/portfolio/[slug]/page.tsx", isStub: false },
      { route: "/r/:code", file: "src/app/r/[code]/page.tsx", isStub: false },
      { route: "/review/:token", file: "src/app/review/[token]/page.tsx", isStub: false },
      { route: "/review/:token/thank-you", file: "src/app/review/[token]/thank-you/page.tsx", isStub: false },
      { route: "/schedule", file: "src/app/schedule/page.tsx", isStub: false },
      { route: "/sign/:token", file: "src/app/sign/[token]/page.tsx", isStub: false },
      { route: "/sign/:token/complete", file: "src/app/sign/[token]/complete/page.tsx", isStub: false },
      { route: "/track", file: "src/app/track/page.tsx", isStub: false },
      { route: "/unsubscribe", file: "src/app/unsubscribe/page.tsx", isStub: false },
    ],
  },
  {
    title: "Authentication",
    icon: <LogIn className="h-5 w-5" />,
    pages: [
      { route: "/sign-in", file: "src/app/(auth)/sign-in/[[...sign-in]]/page.tsx", isStub: false },
      { route: "/sign-up", file: "src/app/(auth)/sign-up/[[...sign-up]]/page.tsx", isStub: false },
      { route: "/signup", file: "src/app/(auth)/signup/page.tsx", isStub: false },
    ],
  },
  {
    title: "Onboarding",
    icon: <Sparkles className="h-5 w-5" />,
    pages: [
      { route: "/onboarding", file: "src/app/(onboarding)/onboarding/page.tsx", isStub: false },
    ],
  },
  {
    title: "Marketing Site",
    icon: <Megaphone className="h-5 w-5" />,
    pages: [],
    subsections: [
      {
        title: "Main Pages",
        pages: [
          { route: "/about", file: "src/app/(marketing)/about/page.tsx", isStub: false },
          { route: "/affiliates", file: "src/app/(marketing)/affiliates/page.tsx", isStub: false },
          { route: "/blog", file: "src/app/(marketing)/blog/page.tsx", isStub: false },
          { route: "/blog/:slug", file: "src/app/(marketing)/blog/[slug]/page.tsx", isStub: false },
          { route: "/careers", file: "src/app/(marketing)/careers/page.tsx", isStub: false },
          { route: "/changelog", file: "src/app/(marketing)/changelog/page.tsx", isStub: false },
          { route: "/contact", file: "src/app/(marketing)/contact/page.tsx", isStub: false },
          { route: "/guides", file: "src/app/(marketing)/guides/page.tsx", isStub: false },
          { route: "/integrations", file: "src/app/(marketing)/integrations/page.tsx", isStub: false },
          { route: "/partners", file: "src/app/(marketing)/partners/page.tsx", isStub: false },
          { route: "/press", file: "src/app/(marketing)/press/page.tsx", isStub: false },
          { route: "/pricing", file: "src/app/(marketing)/pricing/page.tsx", isStub: false },
          { route: "/roadmap", file: "src/app/(marketing)/roadmap/page.tsx", isStub: false },
          { route: "/support", file: "src/app/(marketing)/support/page.tsx", isStub: false },
          { route: "/support/:category/:article", file: "src/app/(marketing)/support/[category]/[article]/page.tsx", isStub: false },
          { route: "/webinars", file: "src/app/(marketing)/webinars/page.tsx", isStub: false },
          { route: "/webinars/:slug", file: "src/app/(marketing)/webinars/[slug]/page.tsx", isStub: false },
        ],
      },
      {
        title: "Features",
        pages: [
          { route: "/features/analytics", file: "src/app/(marketing)/features/analytics/page.tsx", isStub: false },
          { route: "/features/automation", file: "src/app/(marketing)/features/automation/page.tsx", isStub: false },
          { route: "/features/clients", file: "src/app/(marketing)/features/clients/page.tsx", isStub: false },
          { route: "/features/contracts", file: "src/app/(marketing)/features/contracts/page.tsx", isStub: false },
          { route: "/features/email-marketing", file: "src/app/(marketing)/features/email-marketing/page.tsx", isStub: false },
          { route: "/features/galleries", file: "src/app/(marketing)/features/galleries/page.tsx", isStub: false },
          { route: "/features/payments", file: "src/app/(marketing)/features/payments/page.tsx", isStub: false },
          { route: "/features/social-media", file: "src/app/(marketing)/features/social-media/page.tsx", isStub: false },
        ],
      },
      {
        title: "Industries",
        pages: [
          { route: "/industries/architecture", file: "src/app/(marketing)/industries/architecture/page.tsx", isStub: false },
          { route: "/industries/commercial", file: "src/app/(marketing)/industries/commercial/page.tsx", isStub: false },
          { route: "/industries/events", file: "src/app/(marketing)/industries/events/page.tsx", isStub: false },
          { route: "/industries/food", file: "src/app/(marketing)/industries/food/page.tsx", isStub: false },
          { route: "/industries/portraits", file: "src/app/(marketing)/industries/portraits/page.tsx", isStub: false },
          { route: "/industries/real-estate", file: "src/app/(marketing)/industries/real-estate/page.tsx", isStub: false },
        ],
      },
      {
        title: "Legal",
        pages: [
          { route: "/legal/cookies", file: "src/app/(marketing)/legal/cookies/page.tsx", isStub: false },
          { route: "/legal/dpa", file: "src/app/(marketing)/legal/dpa/page.tsx", isStub: false },
          { route: "/legal/privacy", file: "src/app/(marketing)/legal/privacy/page.tsx", isStub: false },
          { route: "/legal/security", file: "src/app/(marketing)/legal/security/page.tsx", isStub: false },
          { route: "/legal/terms", file: "src/app/(marketing)/legal/terms/page.tsx", isStub: false },
        ],
      },
    ],
  },
  {
    title: "Super Admin",
    icon: <Shield className="h-5 w-5" />,
    pages: [
      { route: "/super-admin", file: "src/app/(super-admin)/super-admin/page.tsx", isStub: false },
      { route: "/super-admin/announcements", file: "src/app/(super-admin)/super-admin/announcements/page.tsx", isStub: false },
      { route: "/super-admin/config", file: "src/app/(super-admin)/super-admin/config/page.tsx", isStub: false },
      { route: "/super-admin/developer", file: "src/app/(super-admin)/super-admin/developer/page.tsx", isStub: false },
      { route: "/super-admin/discounts", file: "src/app/(super-admin)/super-admin/discounts/page.tsx", isStub: false },
      { route: "/super-admin/engagement", file: "src/app/(super-admin)/super-admin/engagement/page.tsx", isStub: false },
      { route: "/super-admin/feedback", file: "src/app/(super-admin)/super-admin/feedback/page.tsx", isStub: false },
      { route: "/super-admin/logs", file: "src/app/(super-admin)/super-admin/logs/page.tsx", isStub: false },
      { route: "/super-admin/revenue", file: "src/app/(super-admin)/super-admin/revenue/page.tsx", isStub: false },
      { route: "/super-admin/roadmap", file: "src/app/(super-admin)/super-admin/roadmap/page.tsx", isStub: false },
      { route: "/super-admin/support", file: "src/app/(super-admin)/super-admin/support/page.tsx", isStub: false },
      { route: "/super-admin/support/:ticketId", file: "src/app/(super-admin)/super-admin/support/[ticketId]/page.tsx", isStub: false },
      { route: "/super-admin/users", file: "src/app/(super-admin)/super-admin/users/page.tsx", isStub: false },
      { route: "/super-admin/users/:userId", file: "src/app/(super-admin)/super-admin/users/[userId]/page.tsx", isStub: false },
    ],
  },
  {
    title: "Client Portal",
    icon: <Users className="h-5 w-5" />,
    pages: [
      { route: "/portal", file: "src/app/(client-portal)/portal/page.tsx", isStub: false },
      { route: "/portal/booking", file: "src/app/(client-portal)/portal/booking/page.tsx", isStub: true },
      { route: "/portal/contracts", file: "src/app/(client-portal)/portal/contracts/page.tsx", isStub: true },
      { route: "/portal/downloads", file: "src/app/(client-portal)/portal/downloads/page.tsx", isStub: true },
      { route: "/portal/favorites", file: "src/app/(client-portal)/portal/favorites/page.tsx", isStub: true },
      { route: "/portal/files", file: "src/app/(client-portal)/portal/files/page.tsx", isStub: true },
      { route: "/portal/login", file: "src/app/(client-portal)/portal/login/page.tsx", isStub: false },
      { route: "/portal/payments", file: "src/app/(client-portal)/portal/payments/page.tsx", isStub: true },
      { route: "/portal/proofing", file: "src/app/(client-portal)/portal/proofing/page.tsx", isStub: true },
      { route: "/portal/proofing/:id", file: "src/app/(client-portal)/portal/proofing/[id]/page.tsx", isStub: true },
      { route: "/portal/questionnaires/:id", file: "src/app/(client-portal)/portal/questionnaires/[id]/page.tsx", isStub: false },
      { route: "/portal/schedule", file: "src/app/(client-portal)/portal/schedule/page.tsx", isStub: true },
      { route: "/portal/selects", file: "src/app/(client-portal)/portal/selects/page.tsx", isStub: true },
    ],
  },
  {
    title: "Field App",
    icon: <Smartphone className="h-5 w-5" />,
    pages: [
      { route: "/field", file: "src/app/(field)/field/page.tsx", isStub: false },
      { route: "/field/check-in", file: "src/app/(field)/field/check-in/page.tsx", isStub: false },
      { route: "/field/checklist", file: "src/app/(field)/field/checklist/page.tsx", isStub: true },
      { route: "/field/notes", file: "src/app/(field)/field/notes/page.tsx", isStub: true },
      { route: "/field/upload", file: "src/app/(field)/field/upload/page.tsx", isStub: true },
      { route: "/field/weather", file: "src/app/(field)/field/weather/page.tsx", isStub: true },
    ],
  },
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    pages: [],
    subsections: [
      {
        title: "Core",
        pages: [
          { route: "/dashboard", file: "src/app/(dashboard)/dashboard/page.tsx", isStub: false },
          { route: "/create", file: "src/app/(dashboard)/create/page.tsx", isStub: false },
          { route: "/notifications", file: "src/app/(dashboard)/notifications/page.tsx", isStub: false },
          { route: "/feedback", file: "src/app/(dashboard)/feedback/page.tsx", isStub: false },
        ],
      },
      {
        title: "Clients & CRM",
        pages: [
          { route: "/clients", file: "src/app/(dashboard)/clients/page.tsx", isStub: false },
          { route: "/clients/new", file: "src/app/(dashboard)/clients/new/page.tsx", isStub: false },
          { route: "/clients/import", file: "src/app/(dashboard)/clients/import/page.tsx", isStub: false },
          { route: "/clients/merge", file: "src/app/(dashboard)/clients/merge/page.tsx", isStub: false },
          { route: "/clients/:id", file: "src/app/(dashboard)/clients/[id]/page.tsx", isStub: false },
          { route: "/clients/:id/edit", file: "src/app/(dashboard)/clients/[id]/edit/page.tsx", isStub: false },
          { route: "/leads", file: "src/app/(dashboard)/leads/page.tsx", isStub: false },
          { route: "/leads/analytics", file: "src/app/(dashboard)/leads/analytics/page.tsx", isStub: false },
          { route: "/inbox", file: "src/app/(dashboard)/inbox/page.tsx", isStub: false },
          { route: "/pipeline", file: "src/app/(dashboard)/pipeline/page.tsx", isStub: true },
          { route: "/opportunities", file: "src/app/(dashboard)/opportunities/page.tsx", isStub: true },
          { route: "/opportunities/:id", file: "src/app/(dashboard)/opportunities/[id]/page.tsx", isStub: true },
          { route: "/proposals", file: "src/app/(dashboard)/proposals/page.tsx", isStub: true },
          { route: "/proposals/new", file: "src/app/(dashboard)/proposals/new/page.tsx", isStub: true },
          { route: "/proposals/:id", file: "src/app/(dashboard)/proposals/[id]/page.tsx", isStub: true },
          { route: "/referrals", file: "src/app/(dashboard)/referrals/page.tsx", isStub: true },
          { route: "/loyalty", file: "src/app/(dashboard)/loyalty/page.tsx", isStub: true },
          { route: "/segments", file: "src/app/(dashboard)/segments/page.tsx", isStub: true },
          { route: "/segments/:id", file: "src/app/(dashboard)/segments/[id]/page.tsx", isStub: true },
          { route: "/vip", file: "src/app/(dashboard)/vip/page.tsx", isStub: true },
          { route: "/client-journey", file: "src/app/(dashboard)/client-journey/page.tsx", isStub: true },
        ],
      },
      {
        title: "Brokerages",
        pages: [
          { route: "/brokerages", file: "src/app/(dashboard)/brokerages/page.tsx", isStub: false },
          { route: "/brokerages/new", file: "src/app/(dashboard)/brokerages/new/page.tsx", isStub: false },
          { route: "/brokerages/:id", file: "src/app/(dashboard)/brokerages/[id]/page.tsx", isStub: false },
          { route: "/brokerages/:id/edit", file: "src/app/(dashboard)/brokerages/[id]/edit/page.tsx", isStub: false },
        ],
      },
      {
        title: "Properties",
        pages: [
          { route: "/properties", file: "src/app/(dashboard)/properties/page.tsx", isStub: false },
          { route: "/properties/new", file: "src/app/(dashboard)/properties/new/page.tsx", isStub: false },
          { route: "/properties/:id", file: "src/app/(dashboard)/properties/[id]/page.tsx", isStub: false },
          { route: "/properties/:id/edit", file: "src/app/(dashboard)/properties/[id]/edit/page.tsx", isStub: false },
          { route: "/tours", file: "src/app/(dashboard)/tours/page.tsx", isStub: true },
          { route: "/floor-plans", file: "src/app/(dashboard)/floor-plans/page.tsx", isStub: true },
          { route: "/aerial", file: "src/app/(dashboard)/aerial/page.tsx", isStub: true },
        ],
      },
      {
        title: "Projects & Bookings",
        pages: [
          { route: "/projects", file: "src/app/(dashboard)/projects/page.tsx", isStub: false },
          { route: "/projects/analytics", file: "src/app/(dashboard)/projects/analytics/page.tsx", isStub: false },
          { route: "/projects/tasks/:id", file: "src/app/(dashboard)/projects/tasks/[id]/page.tsx", isStub: false },
          { route: "/booking", file: "src/app/(dashboard)/booking/page.tsx", isStub: false },
          { route: "/booking-page", file: "src/app/(dashboard)/booking-page/page.tsx", isStub: true },
          { route: "/booking-rules", file: "src/app/(dashboard)/booking-rules/page.tsx", isStub: true },
          { route: "/availability", file: "src/app/(dashboard)/availability/page.tsx", isStub: true },
          { route: "/waitlist", file: "src/app/(dashboard)/waitlist/page.tsx", isStub: true },
          { route: "/mini-sessions", file: "src/app/(dashboard)/mini-sessions/page.tsx", isStub: false },
        ],
      },
      {
        title: "Scheduling",
        pages: [
          { route: "/scheduling", file: "src/app/(dashboard)/scheduling/page.tsx", isStub: false },
          { route: "/scheduling/new", file: "src/app/(dashboard)/scheduling/new/page.tsx", isStub: false },
          { route: "/scheduling/availability", file: "src/app/(dashboard)/scheduling/availability/page.tsx", isStub: false },
          { route: "/scheduling/time-off", file: "src/app/(dashboard)/scheduling/time-off/page.tsx", isStub: false },
          { route: "/scheduling/types", file: "src/app/(dashboard)/scheduling/types/page.tsx", isStub: false },
          { route: "/scheduling/booking-forms", file: "src/app/(dashboard)/scheduling/booking-forms/page.tsx", isStub: false },
          { route: "/scheduling/booking-forms/:id", file: "src/app/(dashboard)/scheduling/booking-forms/[id]/page.tsx", isStub: false },
          { route: "/scheduling/booking-forms/:id/submissions", file: "src/app/(dashboard)/scheduling/booking-forms/[id]/submissions/page.tsx", isStub: false },
          { route: "/scheduling/:id", file: "src/app/(dashboard)/scheduling/[id]/page.tsx", isStub: false },
          { route: "/scheduling/:id/edit", file: "src/app/(dashboard)/scheduling/[id]/edit/page.tsx", isStub: false },
        ],
      },
      {
        title: "Services",
        pages: [
          { route: "/services", file: "src/app/(dashboard)/services/page.tsx", isStub: false },
          { route: "/services/new", file: "src/app/(dashboard)/services/new/page.tsx", isStub: false },
          { route: "/services/:id", file: "src/app/(dashboard)/services/[id]/page.tsx", isStub: false },
          { route: "/services/addons", file: "src/app/(dashboard)/services/addons/page.tsx", isStub: false },
          { route: "/services/addons/new", file: "src/app/(dashboard)/services/addons/new/page.tsx", isStub: false },
          { route: "/services/addons/:id", file: "src/app/(dashboard)/services/addons/[id]/page.tsx", isStub: false },
          { route: "/services/bundles", file: "src/app/(dashboard)/services/bundles/page.tsx", isStub: false },
          { route: "/services/bundles/new", file: "src/app/(dashboard)/services/bundles/new/page.tsx", isStub: false },
          { route: "/services/bundles/:id", file: "src/app/(dashboard)/services/bundles/[id]/page.tsx", isStub: false },
          { route: "/pricing", file: "src/app/(dashboard)/pricing/page.tsx", isStub: true },
        ],
      },
      {
        title: "Contracts",
        pages: [
          { route: "/contracts", file: "src/app/(dashboard)/contracts/page.tsx", isStub: false },
          { route: "/contracts/new", file: "src/app/(dashboard)/contracts/new/page.tsx", isStub: false },
          { route: "/contracts/:id", file: "src/app/(dashboard)/contracts/[id]/page.tsx", isStub: false },
          { route: "/contracts/:id/edit", file: "src/app/(dashboard)/contracts/[id]/edit/page.tsx", isStub: false },
          { route: "/contracts/templates", file: "src/app/(dashboard)/contracts/templates/page.tsx", isStub: false },
          { route: "/contracts/templates/new", file: "src/app/(dashboard)/contracts/templates/new/page.tsx", isStub: false },
          { route: "/contracts/templates/:id", file: "src/app/(dashboard)/contracts/templates/[id]/page.tsx", isStub: false },
          { route: "/releases", file: "src/app/(dashboard)/releases/page.tsx", isStub: true },
          { route: "/waivers", file: "src/app/(dashboard)/waivers/page.tsx", isStub: true },
          { route: "/licenses", file: "src/app/(dashboard)/licenses/page.tsx", isStub: true },
          { route: "/licensing", file: "src/app/(dashboard)/licensing/page.tsx", isStub: false },
        ],
      },
      {
        title: "Questionnaires",
        pages: [
          { route: "/questionnaires", file: "src/app/(dashboard)/questionnaires/page.tsx", isStub: false },
          { route: "/questionnaires/templates/new", file: "src/app/(dashboard)/questionnaires/templates/new/page.tsx", isStub: false },
          { route: "/questionnaires/templates/:id", file: "src/app/(dashboard)/questionnaires/templates/[id]/page.tsx", isStub: false },
          { route: "/questionnaires/templates/:id/preview", file: "src/app/(dashboard)/questionnaires/templates/[id]/preview/page.tsx", isStub: false },
          { route: "/questionnaires/assigned/:id", file: "src/app/(dashboard)/questionnaires/assigned/[id]/page.tsx", isStub: false },
          { route: "/forms", file: "src/app/(dashboard)/forms/page.tsx", isStub: false },
          { route: "/forms/:id", file: "src/app/(dashboard)/forms/[id]/page.tsx", isStub: false },
          { route: "/surveys", file: "src/app/(dashboard)/surveys/page.tsx", isStub: true },
        ],
      },
      {
        title: "Billing",
        pages: [
          { route: "/billing", file: "src/app/(dashboard)/billing/page.tsx", isStub: false },
          { route: "/billing/analytics", file: "src/app/(dashboard)/billing/analytics/page.tsx", isStub: false },
          { route: "/billing/reports", file: "src/app/(dashboard)/billing/reports/page.tsx", isStub: false },
          { route: "/billing/estimates", file: "src/app/(dashboard)/billing/estimates/page.tsx", isStub: false },
          { route: "/billing/estimates/new", file: "src/app/(dashboard)/billing/estimates/new/page.tsx", isStub: false },
          { route: "/billing/estimates/:id", file: "src/app/(dashboard)/billing/estimates/[id]/page.tsx", isStub: false },
          { route: "/billing/estimates/:id/edit", file: "src/app/(dashboard)/billing/estimates/[id]/edit/page.tsx", isStub: false },
          { route: "/billing/credit-notes", file: "src/app/(dashboard)/billing/credit-notes/page.tsx", isStub: false },
          { route: "/billing/retainers", file: "src/app/(dashboard)/billing/retainers/page.tsx", isStub: false },
          { route: "/invoices", file: "src/app/(dashboard)/invoices/page.tsx", isStub: false },
          { route: "/invoices/new", file: "src/app/(dashboard)/invoices/new/page.tsx", isStub: false },
          { route: "/invoices/recurring", file: "src/app/(dashboard)/invoices/recurring/page.tsx", isStub: false },
          { route: "/invoices/:id", file: "src/app/(dashboard)/invoices/[id]/page.tsx", isStub: false },
          { route: "/invoices/:id/edit", file: "src/app/(dashboard)/invoices/[id]/edit/page.tsx", isStub: false },
          { route: "/payments", file: "src/app/(dashboard)/payments/page.tsx", isStub: false },
          { route: "/payments/:id", file: "src/app/(dashboard)/payments/[id]/page.tsx", isStub: false },
          { route: "/failed-payments", file: "src/app/(dashboard)/failed-payments/page.tsx", isStub: true },
          { route: "/refunds", file: "src/app/(dashboard)/refunds/page.tsx", isStub: true },
        ],
      },
      {
        title: "Financial",
        pages: [
          { route: "/expenses", file: "src/app/(dashboard)/expenses/page.tsx", isStub: true },
          { route: "/expenses/new", file: "src/app/(dashboard)/expenses/new/page.tsx", isStub: true },
          { route: "/expenses/:id", file: "src/app/(dashboard)/expenses/[id]/page.tsx", isStub: true },
          { route: "/mileage", file: "src/app/(dashboard)/mileage/page.tsx", isStub: true },
          { route: "/payroll", file: "src/app/(dashboard)/payroll/page.tsx", isStub: true },
          { route: "/commissions", file: "src/app/(dashboard)/commissions/page.tsx", isStub: true },
          { route: "/timesheets", file: "src/app/(dashboard)/timesheets/page.tsx", isStub: true },
          { route: "/timesheets/:id", file: "src/app/(dashboard)/timesheets/[id]/page.tsx", isStub: true },
        ],
      },
      {
        title: "Galleries",
        pages: [
          { route: "/galleries", file: "src/app/(dashboard)/galleries/page.tsx", isStub: false },
          { route: "/galleries/new", file: "src/app/(dashboard)/galleries/new/page.tsx", isStub: false },
          { route: "/galleries/:id", file: "src/app/(dashboard)/galleries/[id]/page.tsx", isStub: false },
          { route: "/galleries/:id/edit", file: "src/app/(dashboard)/galleries/[id]/edit/page.tsx", isStub: false },
          { route: "/galleries/services", file: "src/app/(dashboard)/galleries/services/page.tsx", isStub: false },
          { route: "/proofing", file: "src/app/(dashboard)/proofing/page.tsx", isStub: true },
          { route: "/reveal", file: "src/app/(dashboard)/reveal/page.tsx", isStub: true },
          { route: "/sneak-peeks", file: "src/app/(dashboard)/sneak-peeks/page.tsx", isStub: true },
          { route: "/slideshows", file: "src/app/(dashboard)/slideshows/page.tsx", isStub: true },
          { route: "/session-recaps", file: "src/app/(dashboard)/session-recaps/page.tsx", isStub: true },
        ],
      },
      {
        title: "Products",
        pages: [
          { route: "/products", file: "src/app/(dashboard)/products/page.tsx", isStub: false },
          { route: "/products/new", file: "src/app/(dashboard)/products/new/page.tsx", isStub: true },
          { route: "/products/:id", file: "src/app/(dashboard)/products/[id]/page.tsx", isStub: true },
          { route: "/collections", file: "src/app/(dashboard)/collections/page.tsx", isStub: true },
          { route: "/digital-products", file: "src/app/(dashboard)/digital-products/page.tsx", isStub: true },
          { route: "/albums", file: "src/app/(dashboard)/albums/page.tsx", isStub: true },
          { route: "/prints", file: "src/app/(dashboard)/prints/page.tsx", isStub: true },
          { route: "/wall-art", file: "src/app/(dashboard)/wall-art/page.tsx", isStub: true },
          { route: "/gift-cards", file: "src/app/(dashboard)/gift-cards/page.tsx", isStub: true },
          { route: "/coupons", file: "src/app/(dashboard)/coupons/page.tsx", isStub: true },
          { route: "/memberships", file: "src/app/(dashboard)/memberships/page.tsx", isStub: true },
          { route: "/abandoned-carts", file: "src/app/(dashboard)/abandoned-carts/page.tsx", isStub: true },
          { route: "/fulfillment", file: "src/app/(dashboard)/fulfillment/page.tsx", isStub: true },
          { route: "/shipping", file: "src/app/(dashboard)/shipping/page.tsx", isStub: true },
        ],
      },
      {
        title: "Orders",
        pages: [
          { route: "/orders", file: "src/app/(dashboard)/orders/page.tsx", isStub: false },
          { route: "/orders/analytics", file: "src/app/(dashboard)/orders/analytics/page.tsx", isStub: false },
          { route: "/orders/:id", file: "src/app/(dashboard)/orders/[id]/page.tsx", isStub: false },
          { route: "/order-pages", file: "src/app/(dashboard)/order-pages/page.tsx", isStub: false },
          { route: "/order-pages/new", file: "src/app/(dashboard)/order-pages/new/page.tsx", isStub: false },
          { route: "/order-pages/:id", file: "src/app/(dashboard)/order-pages/[id]/page.tsx", isStub: false },
        ],
      },
      {
        title: "Team",
        pages: [
          { route: "/team", file: "src/app/(dashboard)/team/page.tsx", isStub: true },
          { route: "/associates", file: "src/app/(dashboard)/associates/page.tsx", isStub: true },
          { route: "/resources", file: "src/app/(dashboard)/resources/page.tsx", isStub: true },
          { route: "/assignments", file: "src/app/(dashboard)/assignments/page.tsx", isStub: true },
          { route: "/gear", file: "src/app/(dashboard)/gear/page.tsx", isStub: true },
          { route: "/vendors", file: "src/app/(dashboard)/vendors/page.tsx", isStub: true },
          { route: "/locations", file: "src/app/(dashboard)/locations/page.tsx", isStub: true },
          { route: "/studio", file: "src/app/(dashboard)/studio/page.tsx", isStub: true },
          { route: "/rentals", file: "src/app/(dashboard)/rentals/page.tsx", isStub: true },
        ],
      },
      {
        title: "Education",
        pages: [
          { route: "/courses", file: "src/app/(dashboard)/courses/page.tsx", isStub: true },
          { route: "/videos", file: "src/app/(dashboard)/videos/page.tsx", isStub: true },
          { route: "/workshops", file: "src/app/(dashboard)/workshops/page.tsx", isStub: true },
          { route: "/mentoring", file: "src/app/(dashboard)/mentoring/page.tsx", isStub: true },
        ],
      },
      {
        title: "Marketing",
        pages: [
          { route: "/campaigns", file: "src/app/(dashboard)/campaigns/page.tsx", isStub: true },
          { route: "/email-campaigns", file: "src/app/(dashboard)/email-campaigns/page.tsx", isStub: true },
          { route: "/social", file: "src/app/(dashboard)/social/page.tsx", isStub: true },
          { route: "/content", file: "src/app/(dashboard)/content/page.tsx", isStub: true },
          { route: "/blog", file: "src/app/(dashboard)/blog/page.tsx", isStub: true },
          { route: "/seo", file: "src/app/(dashboard)/seo/page.tsx", isStub: true },
          { route: "/ads", file: "src/app/(dashboard)/ads/page.tsx", isStub: true },
          { route: "/reviews", file: "src/app/(dashboard)/reviews/page.tsx", isStub: true },
          { route: "/landing-pages", file: "src/app/(dashboard)/landing-pages/page.tsx", isStub: true },
        ],
      },
      {
        title: "Communications",
        pages: [
          { route: "/communications", file: "src/app/(dashboard)/communications/page.tsx", isStub: true },
          { route: "/email-inbox", file: "src/app/(dashboard)/email-inbox/page.tsx", isStub: true },
          { route: "/sms", file: "src/app/(dashboard)/sms/page.tsx", isStub: true },
          { route: "/messages", file: "src/app/(dashboard)/messages/page.tsx", isStub: false },
          { route: "/messages/new", file: "src/app/(dashboard)/messages/new/page.tsx", isStub: false },
          { route: "/messages/requests", file: "src/app/(dashboard)/messages/requests/page.tsx", isStub: false },
          { route: "/messages/:conversationId", file: "src/app/(dashboard)/messages/[conversationId]/page.tsx", isStub: false },
        ],
      },
      {
        title: "Workflows",
        pages: [
          { route: "/workflows", file: "src/app/(dashboard)/workflows/page.tsx", isStub: true },
          { route: "/automations", file: "src/app/(dashboard)/automations/page.tsx", isStub: true },
          { route: "/templates", file: "src/app/(dashboard)/templates/page.tsx", isStub: true },
        ],
      },
      {
        title: "Portfolios",
        pages: [
          { route: "/portfolios", file: "src/app/(dashboard)/portfolios/page.tsx", isStub: false },
          { route: "/portfolios/new", file: "src/app/(dashboard)/portfolios/new/page.tsx", isStub: false },
          { route: "/portfolios/:id", file: "src/app/(dashboard)/portfolios/[id]/page.tsx", isStub: false },
        ],
      },
      {
        title: "Reports",
        pages: [
          { route: "/reports", file: "src/app/(dashboard)/reports/page.tsx", isStub: true },
          { route: "/reports/revenue", file: "src/app/(dashboard)/reports/revenue/page.tsx", isStub: true },
          { route: "/reports/profit-loss", file: "src/app/(dashboard)/reports/profit-loss/page.tsx", isStub: true },
          { route: "/reports/tax-summary", file: "src/app/(dashboard)/reports/tax-summary/page.tsx", isStub: true },
          { route: "/reports/team", file: "src/app/(dashboard)/reports/team/page.tsx", isStub: true },
          { route: "/reports/bookings", file: "src/app/(dashboard)/reports/bookings/page.tsx", isStub: true },
          { route: "/reports/clients", file: "src/app/(dashboard)/reports/clients/page.tsx", isStub: true },
          { route: "/analytics", file: "src/app/(dashboard)/analytics/page.tsx", isStub: false },
          { route: "/benchmarks", file: "src/app/(dashboard)/benchmarks/page.tsx", isStub: true },
          { route: "/goals", file: "src/app/(dashboard)/goals/page.tsx", isStub: true },
          { route: "/activity", file: "src/app/(dashboard)/activity/page.tsx", isStub: true },
        ],
      },
      {
        title: "Gamification",
        pages: [
          { route: "/achievements", file: "src/app/(dashboard)/achievements/page.tsx", isStub: false },
          { route: "/achievements/year-in-review", file: "src/app/(dashboard)/achievements/year-in-review/page.tsx", isStub: false },
          { route: "/leaderboard", file: "src/app/(dashboard)/leaderboard/page.tsx", isStub: false },
          { route: "/quests", file: "src/app/(dashboard)/quests/page.tsx", isStub: false },
          { route: "/skills", file: "src/app/(dashboard)/skills/page.tsx", isStub: false },
        ],
      },
      {
        title: "AI",
        pages: [
          { route: "/ai", file: "src/app/(dashboard)/ai/page.tsx", isStub: false },
          { route: "/batch", file: "src/app/(dashboard)/batch/page.tsx", isStub: false },
        ],
      },
      {
        title: "Data",
        pages: [
          { route: "/files", file: "src/app/(dashboard)/files/page.tsx", isStub: true },
          { route: "/storage", file: "src/app/(dashboard)/storage/page.tsx", isStub: true },
          { route: "/backups", file: "src/app/(dashboard)/backups/page.tsx", isStub: true },
          { route: "/import", file: "src/app/(dashboard)/import/page.tsx", isStub: true },
          { route: "/export", file: "src/app/(dashboard)/export/page.tsx", isStub: true },
          { route: "/archive", file: "src/app/(dashboard)/archive/page.tsx", isStub: true },
          { route: "/trash", file: "src/app/(dashboard)/trash/page.tsx", isStub: true },
          { route: "/tags", file: "src/app/(dashboard)/tags/page.tsx", isStub: true },
          { route: "/custom-fields", file: "src/app/(dashboard)/custom-fields/page.tsx", isStub: true },
        ],
      },
      {
        title: "Integrations",
        pages: [
          { route: "/integrations", file: "src/app/(dashboard)/integrations/page.tsx", isStub: true },
          { route: "/integrations/quickbooks", file: "src/app/(dashboard)/integrations/quickbooks/page.tsx", isStub: true },
          { route: "/integrations/google", file: "src/app/(dashboard)/integrations/google/page.tsx", isStub: true },
          { route: "/integrations/zapier", file: "src/app/(dashboard)/integrations/zapier/page.tsx", isStub: true },
          { route: "/webhooks", file: "src/app/(dashboard)/webhooks/page.tsx", isStub: true },
          { route: "/api-keys", file: "src/app/(dashboard)/api-keys/page.tsx", isStub: true },
        ],
      },
      {
        title: "Help",
        pages: [
          { route: "/help", file: "src/app/(dashboard)/help/page.tsx", isStub: false },
          { route: "/help/faq", file: "src/app/(dashboard)/help/faq/page.tsx", isStub: false },
          { route: "/help/contact", file: "src/app/(dashboard)/help/contact/page.tsx", isStub: false },
          { route: "/help/getting-started", file: "src/app/(dashboard)/help/getting-started/page.tsx", isStub: true },
          { route: "/help/videos", file: "src/app/(dashboard)/help/videos/page.tsx", isStub: true },
          { route: "/help/:category", file: "src/app/(dashboard)/help/[category]/page.tsx", isStub: false },
          { route: "/help/:category/:slug", file: "src/app/(dashboard)/help/[category]/[slug]/page.tsx", isStub: false },
          { route: "/support", file: "src/app/(dashboard)/support/page.tsx", isStub: true },
          { route: "/support/new", file: "src/app/(dashboard)/support/new/page.tsx", isStub: true },
        ],
      },
      {
        title: "Settings",
        pages: [
          { route: "/settings", file: "src/app/(dashboard)/settings/page.tsx", isStub: false },
          { route: "/settings/profile", file: "src/app/(dashboard)/settings/profile/page.tsx", isStub: false },
          { route: "/settings/branding", file: "src/app/(dashboard)/settings/branding/page.tsx", isStub: false },
          { route: "/settings/appearance", file: "src/app/(dashboard)/settings/appearance/page.tsx", isStub: false },
          { route: "/settings/notifications", file: "src/app/(dashboard)/settings/notifications/page.tsx", isStub: false },
          { route: "/settings/billing", file: "src/app/(dashboard)/settings/billing/page.tsx", isStub: false },
          { route: "/settings/billing/upgrade", file: "src/app/(dashboard)/settings/billing/upgrade/page.tsx", isStub: false },
          { route: "/settings/payments", file: "src/app/(dashboard)/settings/payments/page.tsx", isStub: false },
          { route: "/settings/payouts", file: "src/app/(dashboard)/settings/payouts/page.tsx", isStub: false },
          { route: "/settings/team", file: "src/app/(dashboard)/settings/team/page.tsx", isStub: false },
          { route: "/settings/team/:id/capabilities", file: "src/app/(dashboard)/settings/team/[id]/capabilities/page.tsx", isStub: false },
          { route: "/settings/calendar", file: "src/app/(dashboard)/settings/calendar/page.tsx", isStub: false },
          { route: "/settings/booking", file: "src/app/(dashboard)/settings/booking/page.tsx", isStub: true },
          { route: "/settings/email", file: "src/app/(dashboard)/settings/email/page.tsx", isStub: false },
          { route: "/settings/email-logs", file: "src/app/(dashboard)/settings/email-logs/page.tsx", isStub: false },
          { route: "/settings/sms", file: "src/app/(dashboard)/settings/sms/page.tsx", isStub: false },
          { route: "/settings/sms/templates", file: "src/app/(dashboard)/settings/sms/templates/page.tsx", isStub: false },
          { route: "/settings/security", file: "src/app/(dashboard)/settings/security/page.tsx", isStub: true },
          { route: "/settings/data", file: "src/app/(dashboard)/settings/data/page.tsx", isStub: true },
          { route: "/settings/integrations", file: "src/app/(dashboard)/settings/integrations/page.tsx", isStub: false },
          { route: "/settings/territories", file: "src/app/(dashboard)/settings/territories/page.tsx", isStub: false },
          { route: "/settings/watermarks", file: "src/app/(dashboard)/settings/watermarks/page.tsx", isStub: false },
          { route: "/settings/gallery-templates", file: "src/app/(dashboard)/settings/gallery-templates/page.tsx", isStub: false },
          { route: "/settings/gallery-addons", file: "src/app/(dashboard)/settings/gallery-addons/page.tsx", isStub: false },
          { route: "/settings/canned-responses", file: "src/app/(dashboard)/settings/canned-responses/page.tsx", isStub: false },
          { route: "/settings/mls-presets", file: "src/app/(dashboard)/settings/mls-presets/page.tsx", isStub: false },
          { route: "/settings/photographer-pay", file: "src/app/(dashboard)/settings/photographer-pay/page.tsx", isStub: false },
          { route: "/settings/equipment", file: "src/app/(dashboard)/settings/equipment/page.tsx", isStub: false },
          { route: "/settings/travel", file: "src/app/(dashboard)/settings/travel/page.tsx", isStub: false },
          { route: "/settings/tax-prep", file: "src/app/(dashboard)/settings/tax-prep/page.tsx", isStub: false },
          { route: "/settings/discounts", file: "src/app/(dashboard)/settings/discounts/page.tsx", isStub: false },
          { route: "/settings/features", file: "src/app/(dashboard)/settings/features/page.tsx", isStub: false },
          { route: "/settings/referrals", file: "src/app/(dashboard)/settings/referrals/page.tsx", isStub: false },
          { route: "/settings/my-referrals", file: "src/app/(dashboard)/settings/my-referrals/page.tsx", isStub: false },
          { route: "/settings/reviews", file: "src/app/(dashboard)/settings/reviews/page.tsx", isStub: false },
          { route: "/settings/reviews/requests", file: "src/app/(dashboard)/settings/reviews/requests/page.tsx", isStub: false },
          { route: "/settings/gamification", file: "src/app/(dashboard)/settings/gamification/page.tsx", isStub: false },
          { route: "/settings/marketing", file: "src/app/(dashboard)/settings/marketing/page.tsx", isStub: false },
          { route: "/settings/onboarding", file: "src/app/(dashboard)/settings/onboarding/page.tsx", isStub: false },
          { route: "/settings/walkthroughs", file: "src/app/(dashboard)/settings/walkthroughs/page.tsx", isStub: false },
          { route: "/settings/roadmap", file: "src/app/(dashboard)/settings/roadmap/page.tsx", isStub: false },
          { route: "/settings/support", file: "src/app/(dashboard)/settings/support/page.tsx", isStub: false },
          { route: "/settings/developer", file: "src/app/(dashboard)/settings/developer/page.tsx", isStub: false },
          { route: "/settings/developer/api", file: "src/app/(dashboard)/settings/developer/api/page.tsx", isStub: false },
          { route: "/settings/quickbooks", file: "src/app/(dashboard)/settings/quickbooks/page.tsx", isStub: false },
          { route: "/settings/mailchimp", file: "src/app/(dashboard)/settings/mailchimp/page.tsx", isStub: false },
          { route: "/settings/zapier", file: "src/app/(dashboard)/settings/zapier/page.tsx", isStub: false },
          { route: "/settings/slack", file: "src/app/(dashboard)/settings/slack/page.tsx", isStub: false },
          { route: "/settings/calendly", file: "src/app/(dashboard)/settings/calendly/page.tsx", isStub: false },
          { route: "/settings/dropbox", file: "src/app/(dashboard)/settings/dropbox/page.tsx", isStub: false },
        ],
      },
    ],
  },
];

// Calculate totals
function calculateTotals() {
  let total = 0;
  let implemented = 0;
  let stub = 0;

  sitemapData.forEach((section) => {
    section.pages.forEach((page) => {
      total++;
      if (page.isStub) stub++;
      else implemented++;
    });
    section.subsections?.forEach((sub) => {
      sub.pages.forEach((page) => {
        total++;
        if (page.isStub) stub++;
        else implemented++;
      });
    });
  });

  return { total, implemented, stub };
}

function SectionComponent({ section }: { section: Section }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const allPages = [
    ...section.pages,
    ...(section.subsections?.flatMap((s) => s.pages) || []),
  ];
  const implementedCount = allPages.filter((p) => !p.isStub).length;
  const stubCount = allPages.filter((p) => p.isStub).length;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-start justify-between gap-4 flex-wrap hover:bg-background-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-primary">{section.icon}</span>
          <span className="font-semibold text-foreground">{section.title}</span>
          <span className="text-xs text-foreground-muted">
            ({implementedCount} implemented, {stubCount} stub)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-foreground-muted" />
        ) : (
          <ChevronRight className="h-5 w-5 text-foreground-muted" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          {section.pages.length > 0 && (
            <div className="p-4">
              <PageList pages={section.pages} />
            </div>
          )}

          {section.subsections?.map((sub, idx) => (
            <div key={idx} className="border-t border-border">
              <div className="px-4 py-2 bg-background-elevated">
                <span className="text-sm font-medium text-foreground-muted">
                  {sub.title}
                </span>
              </div>
              <div className="p-4">
                <PageList pages={sub.pages} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PageList({ pages }: { pages: PageItem[] }) {
  return (
    <div className="space-y-1">
      {pages.map((page, idx) => (
        <div
          key={idx}
          className="flex items-start justify-between gap-4 flex-wrap py-2 px-3 rounded-lg hover:bg-background-hover transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {page.isStub ? (
              <Clock className="h-4 w-4 text-[var(--warning)] flex-shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 text-[var(--success)] flex-shrink-0" />
            )}
            <a
              href={`https://app.photoproos.com${page.route.replace(/:(\w+)/g, "example")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground hover:text-primary transition-colors truncate"
            >
              {page.route}
            </a>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={`https://app.photoproos.com${page.route.replace(/:(\w+)/g, "example")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors"
              title="Open page"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <span className="text-xs text-foreground-muted font-mono truncate max-w-[200px]">
              {page.file.replace("src/app/", "")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AppMapClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "implemented" | "stub">("all");
  const totals = calculateTotals();

  const filteredSections = sitemapData
    .map((section) => {
      const filterPages = (pages: PageItem[]) =>
        pages.filter((page) => {
          const matchesSearch =
            page.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.file.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFilter =
            filterStatus === "all" ||
            (filterStatus === "implemented" && !page.isStub) ||
            (filterStatus === "stub" && page.isStub);
          return matchesSearch && matchesFilter;
        });

      return {
        ...section,
        pages: filterPages(section.pages),
        subsections: section.subsections?.map((sub) => ({
          ...sub,
          pages: filterPages(sub.pages),
        })),
      };
    })
    .filter(
      (section) =>
        section.pages.length > 0 ||
        section.subsections?.some((sub) => sub.pages.length > 0)
    );

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-element="app-map-page">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                PhotoProOS Sitemap
              </h1>
              <p className="text-foreground-muted text-sm">
                {totals.total} pages ({totals.implemented} implemented, {totals.stub} stub)
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 rounded-lg bg-background-elevated border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="px-4 py-2 rounded-lg bg-background-elevated border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Pages</option>
                <option value="implemented">Implemented</option>
                <option value="stub">Coming Soon</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totals.total}</p>
                <p className="text-sm text-foreground-muted">Total Pages</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--success)]/10">
                <CheckCircle className="h-5 w-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totals.implemented}</p>
                <p className="text-sm text-foreground-muted">Implemented</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--warning)]/10">
                <Clock className="h-5 w-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totals.stub}</p>
                <p className="text-sm text-foreground-muted">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {filteredSections.map((section, idx) => (
            <SectionComponent key={idx} section={section} />
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground-muted">No pages match your search.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-t border-border">
        <p className="text-center text-sm text-foreground-muted">
          Generated January 2026 | PhotoProOS Application Sitemap
        </p>
      </div>
    </div>
  );
}
