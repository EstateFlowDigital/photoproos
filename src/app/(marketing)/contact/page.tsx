import { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";
import { getMarketingPageContent } from "@/lib/marketing/content";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMarketingPageContent("contact");
  return {
    title: meta.title || "Contact Us | PhotoProOS",
    description: meta.description || "Have a question, feedback, or want to learn more? We'd love to hear from you.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

export default async function ContactPage() {
  // Fetch CMS content
  const { content } = await getMarketingPageContent("contact");
  return (
    <main className="relative min-h-screen bg-background" data-element="contact-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="contact-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[400px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-16 lg:px-[124px] lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Get in Touch
            </h1>
            <p className="text-lg text-foreground-secondary">
              Have a question, feedback, or want to learn more? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24" data-element="contact-main-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16" data-element="contact-grid">
            {/* Contact Info */}
            <div className="lg:col-span-1" data-element="contact-info-column">
              <h2 className="mb-6 text-2xl font-bold text-foreground" data-element="contact-info-heading">
                Contact Information
              </h2>
              <div className="space-y-6" data-element="contact-info-list">
                <ContactInfoItem
                  elementId="contact-info-email"
                  icon={<MailIcon className="h-5 w-5" />}
                  title="Email"
                  content="hello@photoproos.com"
                  href="mailto:hello@photoproos.com"
                />
                <ContactInfoItem
                  elementId="contact-info-chat"
                  icon={<ChatIcon className="h-5 w-5" />}
                  title="Live Chat"
                  content="Available Mon-Fri, 9am-6pm EST"
                />
                <ContactInfoItem
                  elementId="contact-info-demo"
                  icon={<CalendarIcon className="h-5 w-5" />}
                  title="Book a Demo"
                  content="Schedule a personalized walkthrough"
                  href="/webinars"
                />
              </div>

              <div className="mt-10" data-element="contact-quick-links">
                <h3 className="mb-4 text-lg font-semibold text-foreground" data-element="contact-quick-links-heading">
                  Quick Links
                </h3>
                <ul className="space-y-3" data-element="contact-quick-links-list">
                  <li>
                    <Link
                      href="/support"
                      className="text-foreground-secondary transition-colors hover:text-[var(--primary)]"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="text-foreground-secondary transition-colors hover:text-[var(--primary)]"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/changelog"
                      className="text-foreground-secondary transition-colors hover:text-[var(--primary)]"
                    >
                      Changelog
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-10" data-element="contact-social">
                <h3 className="mb-4 text-lg font-semibold text-foreground" data-element="contact-social-heading">
                  Follow Us
                </h3>
                <div className="flex items-center gap-4" data-element="contact-social-links">
                  <SocialLink href="https://twitter.com/photoproos" label="Twitter" elementId="contact-social-twitter">
                    <TwitterIcon className="h-5 w-5" />
                  </SocialLink>
                  <SocialLink href="https://instagram.com/photoproos" label="Instagram" elementId="contact-social-instagram">
                    <InstagramIcon className="h-5 w-5" />
                  </SocialLink>
                  <SocialLink href="https://linkedin.com/company/photoproos" label="LinkedIn" elementId="contact-social-linkedin">
                    <LinkedInIcon className="h-5 w-5" />
                  </SocialLink>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2" data-element="contact-form-column">
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 lg:p-10" data-element="contact-form-card">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="border-t border-[var(--card-border)] bg-[var(--background-secondary)] py-16 lg:py-24" data-element="contact-faq-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="text-center" data-element="contact-faq-content">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="contact-faq-heading">
              Frequently Asked Questions
            </h2>
            <p className="mb-8 text-foreground-secondary" data-element="contact-faq-description">
              Find quick answers to common questions in our Help Center.
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              data-element="contact-faq-btn"
            >
              Visit Help Center
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// Components
function ContactInfoItem({
  icon,
  title,
  content,
  href,
  elementId,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  href?: string;
  elementId?: string;
}) {
  const baseClassName = "flex items-start gap-4";
  const innerContent = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
        {icon}
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className={`text-sm text-foreground-secondary ${href ? "group-hover:text-[var(--primary)]" : ""}`}>
          {content}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${baseClassName} group cursor-pointer`} data-element={elementId}>
        {innerContent}
      </Link>
    );
  }

  return <div className={baseClassName} data-element={elementId}>{innerContent}</div>;
}

function SocialLink({
  href,
  label,
  children,
  elementId,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  elementId?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-foreground-secondary transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
      data-element={elementId}
    >
      {children}
    </a>
  );
}

// Icons
function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
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

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}
