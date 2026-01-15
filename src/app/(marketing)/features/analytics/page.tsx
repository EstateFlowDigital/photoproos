import { Metadata } from "next";
import Link from "next/link";
import { getFeaturesContent } from "@/lib/marketing/content";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getFeaturesContent("analytics");
  return {
    title: meta.title || "Analytics & Reports | PhotoProOS Features",
    description: meta.description || "Understand your business with powerful analytics. Track revenue, identify trends, and make data-driven decisions.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

const metrics = [
  { label: "Total Revenue", value: "$47,250", change: "+12%", period: "vs last month" },
  { label: "Bookings", value: "34", change: "+8%", period: "vs last month" },
  { label: "Gallery Views", value: "1,247", change: "+23%", period: "vs last month" },
  { label: "Avg. Order Value", value: "$389", change: "+5%", period: "vs last month" },
];

const features = [
  {
    title: "Revenue Tracking",
    description: "Track your earnings in real-time. See trends, compare periods, and forecast future revenue.",
    icon: ChartIcon,
  },
  {
    title: "Client Insights",
    description: "Understand your best clients. See lifetime value, booking frequency, and preferences.",
    icon: UsersIcon,
  },
  {
    title: "Gallery Performance",
    description: "See which galleries perform best. Track views, downloads, and conversion rates.",
    icon: ImageIcon,
  },
  {
    title: "Financial Reports",
    description: "Generate professional reports for taxes, accounting, and business planning.",
    icon: DocumentIcon,
  },
  {
    title: "Export to Accounting",
    description: "Export your data to QuickBooks, Xero, or download as CSV for your accountant.",
    icon: ExportIcon,
  },
  {
    title: "Goal Tracking",
    description: "Set revenue goals and track your progress. Stay motivated with visual progress bars.",
    icon: TargetIcon,
  },
];

// Type for CMS hero content
interface HeroContent {
  badge?: string;
  headline?: string;
  subheadline?: string;
}

export default async function AnalyticsFeaturePage() {
  // Fetch CMS content
  const { content } = await getFeaturesContent("analytics");

  // Extract hero content from CMS with fallbacks
  const heroContent: HeroContent = (content as { hero?: HeroContent })?.hero || {};
  const heroBadge = heroContent.badge || "Data-driven decisions";
  const heroHeadline = heroContent.headline || "Analytics & Reports";
  const heroSubheadline = heroContent.subheadline || "Understand your business with powerful analytics. Track revenue, identify trends, and make data-driven decisions.";

  return (
    <main className="relative min-h-screen bg-background" data-element="features-analytics-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="features-analytics-hero">
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
              {heroBadge}
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {heroHeadline}
            </h1>
            <p className="mb-8 text-lg text-foreground-secondary">
              {heroSubheadline}
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

      {/* Dashboard Preview */}
      <section className="py-16 lg:py-24" data-element="features-analytics-preview-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6" data-element="features-analytics-preview-card">
              <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <h3 className="font-semibold text-foreground" data-element="features-analytics-preview-heading">Business Overview</h3>
                <span className="text-sm text-foreground-secondary">Last 30 days</span>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4" data-element="features-analytics-metrics-grid">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg bg-[var(--background-tertiary)] p-4"
                  >
                    <p className="mb-1 text-sm text-foreground-secondary">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <p className="text-xs">
                      <span className="text-[var(--success)]">{metric.change}</span>
                      <span className="text-foreground-secondary"> {metric.period}</span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-[var(--background-tertiary)] p-4">
                <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
                  <p className="text-sm font-medium text-foreground">Revenue Trend</p>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2 text-xs text-foreground-secondary">
                      <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                      This year
                    </span>
                    <span className="flex items-center gap-2 text-xs text-foreground-secondary">
                      <span className="h-2 w-2 rounded-full bg-[var(--primary)]/30" />
                      Last year
                    </span>
                  </div>
                </div>
                <div className="flex h-32 items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 75, 95, 80, 100].map((height, i) => (
                    <div key={i} className="flex flex-1 flex-col gap-1">
                      <div
                        className="rounded-t bg-[var(--primary)]"
                        style={{ height: `${height}%` }}
                      />
                      <div
                        className="rounded-t bg-[var(--primary)]/30"
                        style={{ height: `${height * 0.7}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-analytics-features-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="features-analytics-features-heading">
            Analytics features
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-element="features-analytics-features-grid">
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

      {/* Report Types */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-analytics-reports-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground" data-element="features-analytics-reports-heading">
              Reports you can generate
            </h2>
            <p className="mb-12 text-foreground-secondary" data-element="features-analytics-reports-description">
              Professional reports ready for your accountant or business planning
            </p>
            <div className="grid gap-4 md:grid-cols-2" data-element="features-analytics-reports-grid">
              {[
                "Monthly Revenue Report",
                "Quarterly Tax Summary",
                "Client Lifetime Value Report",
                "Gallery Performance Report",
                "Annual Income Statement",
                "Expense Tracking Report",
                "Payment History Export",
                "Custom Date Range Report",
              ].map((report) => (
                <div
                  key={report}
                  className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4"
                >
                  <DocumentIcon className="h-5 w-5 text-[var(--primary)]" />
                  <span className="text-sm text-foreground">{report}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="features-analytics-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="features-analytics-cta-heading">
            Ready to understand your business?
          </h2>
          <p className="mb-8 text-foreground-secondary" data-element="features-analytics-cta-description">
            Start tracking your metrics today.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            data-element="features-analytics-cta-btn"
          >
            Start free trial
          </Link>
        </div>
      </section>
    </main>
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
    </svg>
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

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm9.75 5.25a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Zm0-3a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
    </svg>
  );
}
