import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center | PhotoProOS",
  description: "Get help with PhotoProOS. Browse documentation, tutorials, and FAQs to make the most of your photography business platform.",
};

const categories = [
  {
    title: "Getting Started",
    description: "New to PhotoProOS? Start here.",
    icon: RocketIcon,
    articles: [
      { title: "Quick Start Guide", href: "/help/getting-started/quick-start" },
      { title: "Setting Up Your Account", href: "/help/getting-started/account-setup" },
      { title: "Uploading Your First Gallery", href: "/help/getting-started/first-gallery" },
      { title: "Customizing Your Branding", href: "/help/getting-started/branding" },
    ],
  },
  {
    title: "Galleries",
    description: "Create and manage stunning photo galleries.",
    icon: ImageIcon,
    articles: [
      { title: "Creating a Gallery", href: "/help/galleries/create" },
      { title: "Organizing Photos", href: "/help/galleries/organize" },
      { title: "Gallery Privacy Settings", href: "/help/galleries/privacy" },
      { title: "Download Options", href: "/help/galleries/downloads" },
    ],
  },
  {
    title: "Clients & CRM",
    description: "Manage your client relationships.",
    icon: UsersIcon,
    articles: [
      { title: "Adding Clients", href: "/help/clients/add" },
      { title: "Client Portal Access", href: "/help/clients/portal" },
      { title: "Tags and Organization", href: "/help/clients/tags" },
      { title: "Communication History", href: "/help/clients/communication" },
    ],
  },
  {
    title: "Payments & Invoicing",
    description: "Get paid faster with seamless payments.",
    icon: CreditCardIcon,
    articles: [
      { title: "Setting Up Stripe", href: "/help/payments/stripe-setup" },
      { title: "Creating Invoices", href: "/help/payments/invoices" },
      { title: "Pay-to-Unlock Galleries", href: "/help/payments/pay-to-unlock" },
      { title: "Payment Reports", href: "/help/payments/reports" },
    ],
  },
  {
    title: "Bookings & Scheduling",
    description: "Streamline your booking process.",
    icon: CalendarIcon,
    articles: [
      { title: "Setting Up Availability", href: "/help/bookings/availability" },
      { title: "Booking Forms", href: "/help/bookings/forms" },
      { title: "Calendar Integration", href: "/help/bookings/calendar" },
      { title: "Automated Reminders", href: "/help/bookings/reminders" },
    ],
  },
  {
    title: "Account & Billing",
    description: "Manage your subscription and settings.",
    icon: SettingsIcon,
    articles: [
      { title: "Upgrading Your Plan", href: "/help/account/upgrade" },
      { title: "Managing Team Members", href: "/help/account/team" },
      { title: "Billing & Invoices", href: "/help/account/billing" },
      { title: "Cancellation & Refunds", href: "/help/account/cancellation" },
    ],
  },
];

const popularArticles = [
  { title: "How to upload photos to a gallery", category: "Galleries", href: "/help/galleries/create" },
  { title: "Setting up pay-to-unlock delivery", category: "Payments", href: "/help/payments/pay-to-unlock" },
  { title: "Connecting your Stripe account", category: "Payments", href: "/help/payments/stripe-setup" },
  { title: "Customizing gallery branding", category: "Galleries", href: "/help/getting-started/branding" },
  { title: "Managing client access", category: "Clients", href: "/help/clients/portal" },
  { title: "Exporting your data", category: "Account", href: "/help/account/data-export" },
];

export default function HelpPage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="support-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="support-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              How can we help?
            </h1>
            <p className="mb-8 text-lg text-foreground-secondary">
              Search our knowledge base or browse categories below
            </p>
            <div className="relative mx-auto max-w-xl" data-element="support-search">
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-secondary" />
              <input
                type="text"
                placeholder="Search for articles, guides, and tutorials..."
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-4 pl-12 pr-4 text-foreground placeholder:text-foreground-secondary focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                data-element="support-search-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24" data-element="support-categories-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-element="support-categories-grid">
            {categories.map((category) => (
              <div
                key={category.title}
                className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--border-hover)]"
                data-element={`support-category-${category.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                    <category.icon className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{category.title}</h3>
                    <p className="text-sm text-foreground-secondary">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article.title}>
                      <Link
                        href={article.href}
                        className="group flex items-center gap-2 text-sm text-foreground-secondary hover:text-[var(--primary)]"
                      >
                        <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="support-popular-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground" data-element="support-popular-heading">
            Popular Articles
          </h2>
          <div className="mx-auto max-w-2xl">
            <ul className="divide-y divide-[var(--card-border)]" data-element="support-popular-list">
              {popularArticles.map((article, index) => (
                <li key={article.title}>
                  <Link
                    href={article.href}
                    className="group flex items-start justify-between gap-4 flex-wrap py-4 text-foreground hover:text-[var(--primary)]"
                    data-element={`support-popular-article-${index}`}
                  >
                    <span>{article.title}</span>
                    <span className="rounded-full bg-[var(--background-tertiary)] px-3 py-1 text-xs text-foreground-secondary">
                      {article.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="support-videos-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mb-12 text-center" data-element="support-videos-header">
            <h2 className="mb-4 text-2xl font-bold text-foreground" data-element="support-videos-heading">
              Video Tutorials
            </h2>
            <p className="text-foreground-secondary" data-element="support-videos-description">
              Learn visually with our step-by-step video guides
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-element="support-videos-grid">
            {[
              { title: "Getting Started with PhotoProOS", duration: "5:32", href: "/webinars", id: "getting-started" },
              { title: "Creating Your First Gallery", duration: "8:15", href: "/webinars", id: "first-gallery" },
              { title: "Setting Up Payments", duration: "6:47", href: "/webinars", id: "payments" },
            ].map((video) => (
              <Link
                key={video.title}
                href={video.href}
                className="group overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] transition-colors hover:border-[var(--border-hover)]"
                data-element={`support-video-${video.id}`}
              >
                <div className="relative aspect-video bg-[var(--background-tertiary)]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-transform group-hover:scale-110">
                      <PlayIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {video.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-foreground group-hover:text-[var(--primary)]">
                    {video.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="support-contact-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="rounded-2xl border border-[var(--card-border)] bg-gradient-to-b from-[var(--primary)]/5 to-transparent p-8 text-center md:p-12" data-element="support-contact-card">
            <h2 className="mb-4 text-2xl font-bold text-foreground" data-element="support-contact-heading">
              Still need help?
            </h2>
            <p className="mb-8 text-foreground-secondary" data-element="support-contact-description">
              Our support team is here to help you succeed.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row" data-element="support-contact-buttons">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                data-element="support-contact-email-btn"
              >
                <MailIcon className="h-4 w-4" />
                Contact Support
              </Link>
              <Link
                href="/contact?subject=live-chat"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                data-element="support-contact-chat-btn"
              >
                <MessageIcon className="h-4 w-4" />
                Live Chat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.606 12.97a.75.75 0 0 1-.134 1.051 2.494 2.494 0 0 0-.93 2.437 2.494 2.494 0 0 0 2.437-.93.75.75 0 1 1 1.186.918 3.995 3.995 0 0 1-4.482 1.332.75.75 0 0 1-.461-.461 3.994 3.994 0 0 1 1.332-4.482.75.75 0 0 1 1.052.134Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M5.752 12A13.07 13.07 0 0 0 8 14.248v4.002c0 .414.336.75.75.75a5 5 0 0 0 4.797-6.414 12.984 12.984 0 0 0 5.45-10.848.75.75 0 0 0-.735-.735 12.984 12.984 0 0 0-10.849 5.45A5 5 0 0 0 1 11.25c.001.414.337.75.751.75h4.002ZM13 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clipRule="evenodd" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.102 41.102 0 0 1-3.55.414c-.28.02-.521.18-.643.413l-1.712 3.293a.75.75 0 0 1-1.33 0l-1.713-3.293a.783.783 0 0 0-.642-.413 41.108 41.108 0 0 1-3.55-.414C1.993 13.245 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902Z" clipRule="evenodd" />
    </svg>
  );
}
