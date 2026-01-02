import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyWebsiteBySlug } from "@/lib/actions/property-websites";
import { PropertyInquiryForm } from "./property-inquiry-form";
import { PropertyShareButtons } from "./property-share-buttons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const website = await getPropertyWebsiteBySlug(slug);

  if (!website) {
    return {
      title: "Property Not Found",
    };
  }

  const title =
    website.metaTitle ||
    `${website.address}, ${website.city}, ${website.state} ${website.zipCode}`;
  const description =
    website.metaDescription ||
    website.headline ||
    `${website.beds} bed, ${website.baths} bath home in ${website.city}, ${website.state}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function PropertyWebsitePage({ params }: PageProps) {
  const { slug } = await params;
  const website = await getPropertyWebsiteBySlug(slug);

  if (!website) {
    notFound();
  }

  if (!website.isPublished) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative">
        {/* Photo Gallery Hero */}
        <div className="grid h-[70vh] min-h-[500px] grid-cols-4 grid-rows-2 gap-1">
          {/* Main Image */}
          <div className="relative col-span-2 row-span-2 bg-[var(--card)]">
            {website.project.assets[0]?.thumbnailUrl ? (
              <img
                src={website.project.assets[0].thumbnailUrl}
                alt={website.address}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImagePlaceholder size="large" />
              </div>
            )}
          </div>
          {/* Secondary Images */}
          {website.project.assets.slice(1, 5).map((asset) => (
            <div key={asset.id} className="relative bg-[var(--card)]">
              {asset.thumbnailUrl ? (
                <img
                  src={asset.thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImagePlaceholder />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All Photos Button */}
        <button className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-[var(--background)] backdrop-blur-sm transition-colors hover:bg-white">
          <GridIcon className="h-4 w-4" />
          View all {website.project.assets.length} photos
        </button>
      </section>

      {/* Property Info */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="border-b border-[var(--card-border)] pb-8">
              {website.showPrice && website.price && (
                <p className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                  {formatPrice(website.price)}
                </p>
              )}
              <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{website.address}</h1>
              <p className="mt-1 text-lg text-foreground-secondary">
                {website.city}, {website.state} {website.zipCode}
              </p>

              {/* Quick Stats */}
              <div className="mt-6 flex flex-wrap items-center gap-6">
                {website.beds && (
                  <div className="flex items-center gap-2">
                    <BedIcon className="h-5 w-5 text-foreground-muted" />
                    <span className="text-foreground">{website.beds}</span>
                    <span className="text-foreground-secondary">beds</span>
                  </div>
                )}
                {website.baths && (
                  <div className="flex items-center gap-2">
                    <BathIcon className="h-5 w-5 text-foreground-muted" />
                    <span className="text-foreground">{website.baths}</span>
                    <span className="text-foreground-secondary">baths</span>
                  </div>
                )}
                {website.sqft && (
                  <div className="flex items-center gap-2">
                    <RulerIcon className="h-5 w-5 text-foreground-muted" />
                    <span className="text-foreground">{website.sqft.toLocaleString()}</span>
                    <span className="text-foreground-secondary">sqft</span>
                  </div>
                )}
                {website.lotSize && (
                  <div className="flex items-center gap-2">
                    <TreeIcon className="h-5 w-5 text-foreground-muted" />
                    <span className="text-foreground">{website.lotSize}</span>
                    <span className="text-foreground-secondary">lot</span>
                  </div>
                )}
                {website.yearBuilt && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-foreground-muted" />
                    <span className="text-foreground">{website.yearBuilt}</span>
                    <span className="text-foreground-secondary">built</span>
                  </div>
                )}
              </div>
            </div>

            {/* Virtual Tour & Video */}
            {(website.virtualTourUrl || website.videoUrl) && (
              <div className="border-b border-[var(--card-border)] py-8">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Virtual Experience</h2>
                <div className="flex flex-wrap gap-4">
                  {website.virtualTourUrl && (
                    <a
                      href={website.virtualTourUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-4 transition-colors hover:border-[var(--primary)] hover:bg-[var(--card)]/80"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                        <CubeIcon className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">3D Virtual Tour</p>
                        <p className="text-sm text-foreground-muted">Explore the property in 3D</p>
                      </div>
                    </a>
                  )}
                  {website.videoUrl && (
                    <a
                      href={website.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-4 transition-colors hover:border-[var(--error)] hover:bg-[var(--card)]/80"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--error)]/10">
                        <PlayIcon className="h-5 w-5 text-[var(--error)]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Video Tour</p>
                        <p className="text-sm text-foreground-muted">Watch the property video</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="border-b border-[var(--card-border)] py-8">
              {website.headline && (
                <h2 className="mb-4 text-xl font-semibold text-foreground">{website.headline}</h2>
              )}
              <div className="prose prose-invert max-w-none">
                {website.description?.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="mb-4 leading-relaxed text-foreground-secondary">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Features */}
            {website.features && website.features.length > 0 && (
              <div className="border-b border-[var(--card-border)] py-8">
                <h2 className="mb-6 text-lg font-semibold text-foreground">Features & Amenities</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {website.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckIcon className="h-5 w-5 flex-shrink-0 text-[var(--success)]" />
                      <span className="text-foreground-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Gallery Grid */}
            <div className="py-8">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Photo Gallery</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {website.project.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-[var(--card)]"
                  >
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center transition-transform group-hover:scale-105">
                        <ImagePlaceholder />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Contact Agent Card */}
              {website.showAgent && website.project.client && (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Contact Agent</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xl font-semibold text-[var(--primary)]">
                      {website.project.client.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{website.project.client.fullName}</p>
                      <p className="text-sm text-foreground-muted">{website.project.client.company}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {website.project.client.phone && (
                      <a
                        href={`tel:${website.project.client.phone}`}
                        className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        {website.project.client.phone}
                      </a>
                    )}
                    <a
                      href={`mailto:${website.project.client.email}`}
                      className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground"
                    >
                      <MailIcon className="h-4 w-4" />
                      {website.project.client.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Inquiry Form */}
              <PropertyInquiryForm
                propertyWebsiteId={website.id}
                propertyAddress={website.address}
              />

              {/* Share */}
              <PropertyShareButtons
                url={`${process.env.NEXT_PUBLIC_APP_URL || "https://photoproos.com"}/p/${website.slug}`}
                title={`${website.address}, ${website.city}, ${website.state}`}
                description={website.headline || undefined}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {website.isBranded && website.project.organization && (
        <footer className="border-t border-[var(--card-border)] py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                  <CameraIcon className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Photography by {website.project.organization.name}
                  </p>
                  <p className="text-sm text-foreground-muted">Professional Real Estate Photography</p>
                </div>
              </div>
              <p className="text-sm text-foreground-muted">
                Powered by{" "}
                <Link href="/" className="text-[var(--primary)] hover:underline">
                  PhotoProOS
                </Link>
              </p>
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}

// Components
function ImagePlaceholder({ size = "default" }: { size?: "default" | "large" }) {
  return (
    <svg
      className={size === "large" ? "h-16 w-16" : "h-10 w-10"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeOpacity={0.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

// Icons
function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 12h16M4 12a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6"
      />
    </svg>
  );
}

function BathIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16h16M6 16v4m12-4v4M4 12h16M6 8h.01M10 8h.01M14 8h.01M6 4h12a2 2 0 012 2v6H4V6a2 2 0 012-2z"
      />
    </svg>
  );
}

function RulerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function CubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
