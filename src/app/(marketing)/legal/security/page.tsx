import { Metadata } from "next";
import Link from "next/link";
import { getLegalContent } from "@/lib/marketing/content";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getLegalContent("security");
  return {
    title: meta.title || "Security | PhotoProOS",
    description: meta.description || "Learn about our security practices. Your photos are protected by enterprise-grade security.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

const certifications = [
  { name: "SOC 2 Type II", description: "Independently audited security controls" },
  { name: "GDPR Compliant", description: "EU data protection compliance" },
  { name: "CCPA Compliant", description: "California privacy compliance" },
  { name: "ISO 27001", description: "Information security management" },
];

const features = [
  {
    title: "256-bit SSL Encryption",
    description: "All data is encrypted in transit using bank-level TLS 1.3 encryption.",
    icon: LockIcon,
  },
  {
    title: "SOC 2 Type II Certified",
    description: "Independently audited security controls and data protection practices.",
    icon: ShieldIcon,
  },
  {
    title: "GDPR Compliant",
    description: "Full compliance with EU data protection regulations and privacy laws.",
    icon: GlobeIcon,
  },
  {
    title: "99.9% Uptime SLA",
    description: "Enterprise-grade infrastructure with redundancy across multiple regions.",
    icon: ServerIcon,
  },
  {
    title: "Automated Backups",
    description: "Your galleries are backed up daily with 30-day retention and instant recovery.",
    icon: DatabaseIcon,
  },
  {
    title: "Two-Factor Authentication",
    description: "Protect your account with TOTP or SMS-based two-factor authentication.",
    icon: KeyIcon,
  },
];

const stats = [
  { value: "0", label: "Data breaches" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Monitoring" },
  { value: "256-bit", label: "Encryption" },
];

export default function SecurityPage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="legal-security-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="legal-security-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/5 px-4 py-1.5 text-sm font-medium text-[var(--success)]">
              Bank-level security
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Your photos are safe with us
            </h1>
            <p className="text-lg text-foreground-secondary">
              We take security seriously. Your images are encrypted, backed up, and protected by the same infrastructure used by Fortune 500 companies.
            </p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12" data-element="legal-security-certifications-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4" data-element="legal-security-certifications-grid">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center"
              >
                <p className="font-bold text-foreground">{cert.name}</p>
                <p className="text-xs text-foreground-secondary">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12" data-element="legal-security-stats-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4" data-element="legal-security-stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-[var(--success)]">{stat.value}</p>
                <p className="text-sm text-foreground-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="legal-security-features-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="legal-security-features-heading">
            Enterprise-grade security features
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-element="legal-security-features-grid">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
              >
                <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/10">
                  <feature.icon className="h-6 w-6 text-[var(--success)]" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Ownership */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="legal-security-ownership-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground" data-element="legal-security-ownership-heading">
              Your photos, your data
            </h2>
            <div className="space-y-4 text-left" data-element="legal-security-ownership-list">
              {[
                "Your photos are never sold or shared",
                "You retain 100% ownership of your content",
                "Delete anytime - we'll remove everything",
                "Export all your data at any time",
                "No AI training on your images without consent",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <CheckIcon className="h-5 w-5 text-[var(--success)]" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="legal-security-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="legal-security-cta-heading">
            Security questions?
          </h2>
          <p className="mb-8 text-foreground-secondary">
            Our security team is happy to answer any questions.
          </p>
          <Link
            href="/contact?subject=security"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            data-element="legal-security-cta-btn"
          >
            Contact security team
          </Link>
        </div>
      </section>
    </main>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0Z" />
    </svg>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.08 5.227A3 3 0 0 1 6.979 3H17.02a3 3 0 0 1 2.9 2.227l2.113 7.926A5.228 5.228 0 0 0 18.75 12H5.25a5.228 5.228 0 0 0-3.284 1.153L4.08 5.227Z" />
      <path fillRule="evenodd" d="M5.25 13.5a3.75 3.75 0 1 0 0 7.5h13.5a3.75 3.75 0 1 0 0-7.5H5.25Zm10.5 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm3.75-.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
    </svg>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 1.5c-3.67 0-7.5.955-7.5 3.75v13.5c0 2.795 3.83 3.75 7.5 3.75s7.5-.955 7.5-3.75V5.25c0-2.795-3.83-3.75-7.5-3.75Z" clipRule="evenodd" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 0 0-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 0 0-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 0 0 .75-.75v-1.5h1.5A.75.75 0 0 0 9 19.5V18h1.5a.75.75 0 0 0 .53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1 0 15.75 1.5Zm0 3a.75.75 0 0 0 0 1.5A2.25 2.25 0 0 1 18 8.25a.75.75 0 0 0 1.5 0 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
