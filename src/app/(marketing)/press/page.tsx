import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press Kit | PhotoProOS",
  description: "Download PhotoProOS brand assets, logos, and press materials.",
};

const pressReleases = [
  {
    title: "PhotoProOS Launches to Help Professional Photographers Streamline Their Business",
    date: "January 2025",
    excerpt: "New all-in-one platform combines gallery delivery, payment processing, and client management.",
  },
  {
    title: "PhotoProOS Announces Pay-to-Unlock Gallery Feature",
    date: "December 2024",
    excerpt: "Revolutionary feature helps photographers increase revenue by 40% with seamless payment integration.",
  },
];

const mediaContacts = [
  {
    name: "Press Inquiries",
    email: "press@photoproos.com",
    description: "For media inquiries, interviews, and story opportunities.",
  },
  {
    name: "Partnership Inquiries",
    email: "partners@photoproos.com",
    description: "For business development and partnership opportunities.",
  },
];

export default function PressPage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="press-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="press-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Press Kit
            </h1>
            <p className="text-lg text-foreground-secondary">
              Everything you need to write about PhotoProOS. Download our logos, read our story, and get in touch.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="py-16 lg:py-24" data-element="press-assets-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-2xl font-bold text-foreground" data-element="press-assets-heading">Brand Assets</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-element="press-assets-grid">
            {/* Logo Light */}
            <div className="rounded-xl border border-[var(--card-border)] bg-white p-8">
              <div className="mb-6 flex h-20 items-center justify-center">
                <div className="text-2xl font-bold text-gray-900">PhotoProOS</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Logo (Light)</span>
                <button className="text-sm font-medium text-blue-600 hover:underline">
                  Download
                </button>
              </div>
            </div>

            {/* Logo Dark */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[#0A0A0A] p-8">
              <div className="mb-6 flex h-20 items-center justify-center">
                <div className="text-2xl font-bold text-white">PhotoProOS</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Logo (Dark)</span>
                <button className="text-sm font-medium text-blue-400 hover:underline">
                  Download
                </button>
              </div>
            </div>

            {/* Icon */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8">
              <div className="mb-6 flex h-20 items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--primary)] text-2xl font-bold text-white">
                  P
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">App Icon</span>
                <button className="text-sm font-medium text-[var(--primary)] hover:underline">
                  Download
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
              Download All Assets (ZIP)
            </button>
          </div>
        </div>
      </section>

      {/* Company Facts */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="press-facts-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-2xl font-bold text-foreground" data-element="press-facts-heading">Company Facts</h2>
          <div className="grid gap-6 md:grid-cols-2" data-element="press-facts-grid">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="mb-4 font-semibold text-foreground">About PhotoProOS</h3>
              <p className="text-foreground-secondary">
                PhotoProOS is the all-in-one business operating system for professional photographers. Our platform helps photographers deliver stunning galleries, collect payments automatically, and run their entire business from one place. Founded in 2024, we're on a mission to help photographers spend less time on admin and more time behind the camera.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="mb-4 font-semibold text-foreground">Quick Stats</h3>
              <ul className="space-y-3 text-foreground-secondary">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--primary)]" />
                  <span>Founded: 2024</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--primary)]" />
                  <span>Headquarters: Remote-first</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--primary)]" />
                  <span>Industry: SaaS / Photography</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[var(--primary)]" />
                  <span>Website: photoproos.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="press-releases-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-2xl font-bold text-foreground" data-element="press-releases-heading">Press Releases</h2>
          <div className="space-y-6" data-element="press-releases-list">
            {pressReleases.map((release, index) => (
              <div
                key={release.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
                data-element={`press-release-${index}`}
              >
                <div className="mb-2 text-sm text-foreground-muted">{release.date}</div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{release.title}</h3>
                <p className="text-foreground-secondary">{release.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="press-contact-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-2xl font-bold text-foreground" data-element="press-contact-heading">Media Contact</h2>
          <div className="grid gap-6 md:grid-cols-2" data-element="press-contact-grid">
            {mediaContacts.map((contact) => (
              <div
                key={contact.name}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
                data-element={`press-contact-${contact.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <h3 className="mb-2 font-semibold text-foreground">{contact.name}</h3>
                <p className="mb-4 text-sm text-foreground-secondary">{contact.description}</p>
                <Link
                  href={`mailto:${contact.email}`}
                  className="text-[var(--primary)] hover:underline"
                >
                  {contact.email}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
