import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Client Galleries | PhotoProOS Features",
  description: "Create beautiful, branded galleries that impress clients and drive sales with pay-to-unlock photo delivery.",
};

const features = [
  {
    title: "Customizable Gallery Themes",
    description: "Choose from multiple professionally designed themes that match your brand aesthetic.",
    icon: PaletteIcon,
  },
  {
    title: "Pay-Per-Photo or Gallery Pricing",
    description: "Set flexible pricing models - charge per photo, per gallery, or offer bundled packages.",
    icon: DollarIcon,
  },
  {
    title: "Password Protection",
    description: "Keep galleries private with password protection and expiration dates.",
    icon: LockIcon,
  },
  {
    title: "Bulk Download for Clients",
    description: "Let clients download all their photos at once with a single click.",
    icon: DownloadIcon,
  },
  {
    title: "Mobile-Optimized Viewing",
    description: "Galleries look stunning on any device - desktop, tablet, or mobile.",
    icon: DevicesIcon,
  },
  {
    title: "Favorites & Selection",
    description: "Clients can mark favorites and make selections directly in the gallery.",
    icon: HeartIcon,
  },
  {
    title: "Watermark Protection",
    description: "Automatic watermarking on preview images until payment is received.",
    icon: ShieldIcon,
  },
  {
    title: "Activity Tracking",
    description: "See when clients view galleries, which photos they like, and download activity.",
    icon: ChartIcon,
  },
];

export default function GalleriesFeaturePage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="features-galleries-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="features-galleries-hero">
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
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              Most Popular Feature
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Client Galleries
            </h1>
            <p className="mb-8 text-lg text-foreground-secondary">
              Create beautiful, branded galleries that impress clients and drive sales with pay-to-unlock photo delivery.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                Start free trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-16 lg:py-24" data-element="features-galleries-preview-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="relative mx-auto max-w-4xl overflow-x-auto rounded-2xl border border-[var(--card-border)] bg-[var(--card)]" data-element="features-galleries-preview-card">
            <div className="flex items-center gap-2 border-b border-[var(--card-border)] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[var(--error)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--warning)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--success)]" />
              </div>
              <div className="flex-1 text-center text-xs text-foreground-secondary">
                gallery.photoproos.com/smith-wedding
              </div>
            </div>
            <div className="p-8">
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-2xl font-bold text-foreground">Smith Wedding Gallery</h3>
                <p className="text-sm text-foreground-secondary">248 photos • 2.4 GB • Ready to share</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-gradient-to-br from-[var(--background-tertiary)] to-[var(--background-hover)]"
                  />
                ))}
              </div>
              <div className="mt-6 flex items-start justify-between gap-4 flex-wrap rounded-lg bg-[var(--background-tertiary)] p-4">
                <div>
                  <p className="font-medium text-foreground">Full Gallery Access</p>
                  <p className="text-sm text-foreground-secondary">248 high-resolution photos</p>
                </div>
                <div className="rounded-lg bg-[var(--primary)] px-6 py-2 font-medium text-white">
                  $299
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-galleries-features-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="features-galleries-features-heading">
            Everything you need for stunning galleries
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4" data-element="features-galleries-features-grid">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
              >
                <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                  <feature.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-galleries-howitworks-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="features-galleries-howitworks-heading">
            How it works
          </h2>
          <div className="mx-auto max-w-4xl">
            <div className="space-y-8" data-element="features-galleries-howitworks-list">
              {[
                {
                  step: "01",
                  title: "Upload your photos",
                  description: "Drag and drop your edited photos. We support JPEG, PNG, RAW, and HEIC formats up to 50MB each.",
                },
                {
                  step: "02",
                  title: "Set your pricing",
                  description: "Choose free delivery or set your prices. Per-photo, full gallery, or create custom packages.",
                },
                {
                  step: "03",
                  title: "Share with clients",
                  description: "Send a beautiful, branded gallery link. Clients can view, favorite, and purchase.",
                },
                {
                  step: "04",
                  title: "Get paid instantly",
                  description: "When clients pay, high-resolution downloads unlock automatically. Money goes straight to your Stripe account.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-foreground-secondary">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-galleries-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="features-galleries-cta-heading">
            Ready to create stunning galleries?
          </h2>
          <p className="mb-8 text-foreground-secondary" data-element="features-galleries-cta-description">
            Start free with 5 galleries. Upgrade anytime.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            data-element="features-galleries-cta-btn"
          >
            Start free trial
          </Link>
        </div>
      </section>
    </main>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 0 0-3.471 2.987 10.04 10.04 0 0 1 4.815 4.815 18.748 18.748 0 0 0 2.987-3.472l3.386-5.079A1.902 1.902 0 0 0 20.599 1.5Zm-8.3 14.025a18.76 18.76 0 0 0 1.896-1.207 8.026 8.026 0 0 0-4.513-4.513A18.75 18.75 0 0 0 8.475 11.7l-.278.5a5.26 5.26 0 0 1 3.601 3.602l.502-.278ZM6.75 13.5A3.75 3.75 0 0 0 3 17.25a1.5 1.5 0 0 1-1.601 1.497.75.75 0 0 0-.7 1.123 5.25 5.25 0 0 0 9.8-2.62 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function DevicesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10.5 18.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
      <path fillRule="evenodd" d="M8.625.75A3.375 3.375 0 0 0 5.25 4.125v15.75a3.375 3.375 0 0 0 3.375 3.375h6.75a3.375 3.375 0 0 0 3.375-3.375V4.125A3.375 3.375 0 0 0 15.375.75h-6.75ZM7.5 4.125C7.5 3.504 8.004 3 8.625 3h6.75c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 0 1 7.5 19.875V4.125Z" clipRule="evenodd" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
    </svg>
  );
}
