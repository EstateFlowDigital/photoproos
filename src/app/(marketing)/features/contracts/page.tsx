import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contracts & E-Sign | PhotoProOS Features",
  description: "Send and sign contracts digitally. Keep everything organized with legally-binding electronic signatures.",
};

const features = [
  {
    title: "Contract Templates",
    description: "Start with professional templates designed specifically for photographers.",
    icon: DocumentIcon,
  },
  {
    title: "Electronic Signatures",
    description: "Legally-binding e-signatures that hold up in court. Compliant with ESIGN and UETA.",
    icon: PenIcon,
  },
  {
    title: "Automatic Reminders",
    description: "Never chase unsigned contracts. Automatic reminders keep things moving.",
    icon: BellIcon,
  },
  {
    title: "Signed Document Storage",
    description: "All signed contracts stored securely and easily accessible.",
    icon: FolderIcon,
  },
  {
    title: "Legal Compliance",
    description: "Full audit trail with timestamps, IP addresses, and authentication.",
    icon: ShieldIcon,
  },
  {
    title: "Mobile Signing",
    description: "Clients can sign from any device - phone, tablet, or desktop.",
    icon: DeviceIcon,
  },
];

const templates = [
  "Photography Service Agreement",
  "Model Release Form",
  "Property Release Form",
  "Wedding Photography Contract",
  "Event Photography Contract",
  "Commercial License Agreement",
];

export default function ContractsFeaturePage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="features-contracts-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="features-contracts-hero">
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
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/5 px-4 py-1.5 text-sm font-medium text-[var(--success)]">
              Available Now
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Contracts & E-Sign
            </h1>
            <p className="mb-8 text-lg text-foreground-secondary">
              Send and sign contracts digitally. Keep everything organized with legally-binding electronic signatures.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                Start free trial
              </Link>
              <Link
                href="/features/galleries"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Explore all features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-contracts-features-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="features-contracts-features-heading">
            Everything you need
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-element="features-contracts-features-grid">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--ai)]/10">
                  <feature.icon className="h-6 w-6 text-[var(--ai)]" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-contracts-templates-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground" data-element="features-contracts-templates-heading">
              Pre-built templates
            </h2>
            <p className="mb-12 text-foreground-secondary" data-element="features-contracts-templates-description">
              Professional contract templates designed for photographers
            </p>
            <div className="grid gap-4 md:grid-cols-2" data-element="features-contracts-templates-grid">
              {templates.map((template) => (
                <div
                  key={template}
                  className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4"
                >
                  <DocumentIcon className="h-5 w-5 text-[var(--ai)]" />
                  <span className="text-sm text-foreground">{template}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-contracts-howitworks-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="mb-8 text-3xl font-bold text-foreground" data-element="features-contracts-howitworks-heading">
              How it works
            </h2>
            <div className="space-y-6" data-element="features-contracts-howitworks-list">
              {[
                { step: "1", title: "Choose a template", description: "Start with a professional template or create your own from scratch" },
                { step: "2", title: "Customize & send", description: "Add your terms, client details, and send via email for signature" },
                { step: "3", title: "Track & sign", description: "Get notified when clients view and sign. Everything is stored securely" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 text-left"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-foreground-secondary">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-contracts-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="features-contracts-cta-heading">
            Ready to streamline your contracts?
          </h2>
          <p className="mb-8 text-foreground-secondary" data-element="features-contracts-cta-description">
            Start sending professional contracts in minutes. No legal expertise required.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            data-element="features-contracts-cta-btn"
          >
            Start free trial
          </Link>
        </div>
      </section>
    </main>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
    </svg>
  );
}

function PenIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
      <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
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

function DeviceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10.5 18.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
      <path fillRule="evenodd" d="M8.625.75A3.375 3.375 0 0 0 5.25 4.125v15.75a3.375 3.375 0 0 0 3.375 3.375h6.75a3.375 3.375 0 0 0 3.375-3.375V4.125A3.375 3.375 0 0 0 15.375.75h-6.75ZM7.5 4.125C7.5 3.504 8.004 3 8.625 3h6.75c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 0 1 7.5 19.875V4.125Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
    </svg>
  );
}
