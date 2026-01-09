import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyWebsiteBySlug } from "@/lib/actions/property-websites";
import { PropertyInquiryForm } from "./property-inquiry-form";
import { PropertyShareButtons } from "./property-share-buttons";
import { getGoogleFontsUrl, getCustomFontStyles } from "@/lib/fonts";

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

// Template configuration for different design styles
const templateStyles = {
  modern: {
    main: "min-h-screen bg-[var(--background)]",
    heroGrid: "grid h-[70vh] min-h-[500px] grid-cols-4 grid-rows-2 gap-1",
    heroImage: "bg-[var(--card)]",
    section: "mx-auto max-w-7xl px-6 py-12",
    heading: "text-2xl font-semibold text-foreground md:text-3xl",
    price: "mb-2 text-3xl font-bold text-foreground md:text-4xl",
    card: "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6",
    divider: "border-b border-[var(--card-border)] py-8",
    accent: "text-[var(--primary)]",
    accentBg: "bg-[var(--primary)]",
    accentBgLight: "bg-[var(--primary)]/10",
    sectionHeading: "mb-6 text-lg font-semibold text-foreground",
    secondaryText: "text-foreground-secondary",
    mutedText: "text-foreground-muted",
    footer: "border-t border-[var(--card-border)] py-8",
    footerBg: "",
    successColor: "text-[var(--success)]",
  },
  classic: {
    main: "min-h-screen bg-[#faf8f5]",
    heroGrid: "grid h-[65vh] min-h-[450px] grid-cols-4 grid-rows-2 gap-2 p-2",
    heroImage: "bg-[#ebe6de]",
    section: "mx-auto max-w-6xl px-8 py-16",
    heading: "text-2xl font-serif text-[#2d2d2d] md:text-3xl",
    price: "mb-3 text-3xl font-serif font-medium text-[#1a1a1a] md:text-4xl",
    card: "rounded-lg border border-[#e5e0d8] bg-white p-8 shadow-sm",
    divider: "border-b border-[#e5e0d8] py-10",
    accent: "text-[#b8860b]",
    accentBg: "bg-[#b8860b]",
    accentBgLight: "bg-[#b8860b]/10",
    sectionHeading: "mb-8 text-xl font-serif text-[#2d2d2d]",
    secondaryText: "text-[#5a5a5a]",
    mutedText: "text-[#8a8a8a]",
    footer: "border-t border-[#e5e0d8] py-8 bg-white",
    footerBg: "bg-white",
    successColor: "text-[#2d8a4e]",
  },
  luxury: {
    main: "min-h-screen bg-[#0a0a0a]",
    heroGrid: "grid h-[80vh] min-h-[550px] grid-cols-3 grid-rows-2 gap-0.5",
    heroImage: "bg-[#1a1a1a]",
    section: "mx-auto max-w-7xl px-8 py-16",
    heading: "text-2xl font-light tracking-wide text-white uppercase md:text-3xl",
    price: "mb-4 text-4xl font-extralight tracking-widest text-[#d4af37] md:text-5xl",
    card: "rounded-none border border-[#2a2a2a] bg-[#111] p-8",
    divider: "border-b border-[#2a2a2a] py-12",
    accent: "text-[#d4af37]",
    accentBg: "bg-[#d4af37]",
    accentBgLight: "bg-[#d4af37]/10",
    sectionHeading: "mb-8 text-sm font-light tracking-[0.2em] uppercase text-[#888]",
    secondaryText: "text-[#aaa]",
    mutedText: "text-[#666]",
    footer: "border-t border-[#2a2a2a] py-8",
    footerBg: "",
    successColor: "text-[#d4af37]",
  },
  minimal: {
    main: "min-h-screen bg-white",
    heroGrid: "grid h-[75vh] min-h-[500px] grid-cols-1",
    heroImage: "bg-[#f5f5f5]",
    section: "mx-auto max-w-4xl px-6 py-16",
    heading: "text-xl font-normal text-[#111] md:text-2xl",
    price: "mb-2 text-2xl font-medium text-[#111] md:text-3xl",
    card: "border border-[#eee] bg-white p-6",
    divider: "border-b border-[#eee] py-12",
    accent: "text-[#111]",
    accentBg: "bg-[#111]",
    accentBgLight: "bg-[#111]/5",
    sectionHeading: "mb-6 text-base font-medium text-[#111]",
    secondaryText: "text-[#666]",
    mutedText: "text-[#999]",
    footer: "border-t border-[#eee] py-8",
    footerBg: "",
    successColor: "text-[#111]",
  },
  commercial: {
    main: "min-h-screen bg-[#f5f5f7]",
    heroGrid: "grid h-[60vh] min-h-[400px] grid-cols-3 gap-4 p-4",
    heroImage: "bg-white",
    section: "mx-auto max-w-7xl px-6 py-10",
    heading: "text-xl font-semibold text-[#1d1d1f] md:text-2xl",
    price: "mb-2 text-2xl font-bold text-[#1d1d1f] md:text-3xl",
    card: "rounded-lg border border-[#d2d2d7] bg-white p-6 shadow-sm",
    divider: "border-b border-[#d2d2d7] py-8",
    accent: "text-[#0066cc]",
    accentBg: "bg-[#0066cc]",
    accentBgLight: "bg-[#0066cc]/10",
    sectionHeading: "mb-4 text-base font-semibold uppercase tracking-wide text-[#6e6e73]",
    secondaryText: "text-[#6e6e73]",
    mutedText: "text-[#86868b]",
    footer: "border-t border-[#d2d2d7] py-8 bg-white",
    footerBg: "bg-white",
    successColor: "text-[#32d74b]",
  },
};

// Generate Schema.org structured data for SEO
function generateSchemaOrg(website: NonNullable<Awaited<ReturnType<typeof getPropertyWebsiteBySlug>>>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: website.headline || `${website.address}, ${website.city}`,
    description: website.description || website.metaDescription || `${website.beds} bed, ${website.baths} bath property in ${website.city}, ${website.state}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/p/${website.slug}`,
    datePosted: website.publishedAt?.toISOString() || website.createdAt.toISOString(),
    ...(website.price && { price: website.price / 100, priceCurrency: "USD" }),
    address: {
      "@type": "PostalAddress",
      streetAddress: website.address,
      addressLocality: website.city,
      addressRegion: website.state,
      postalCode: website.zipCode,
      addressCountry: "US",
    },
    ...(website.project.assets[0]?.thumbnailUrl && {
      image: website.project.assets.slice(0, 5).map(a => a.thumbnailUrl || a.originalUrl).filter(Boolean),
    }),
    ...(website.sqft && { floorSize: { "@type": "QuantitativeValue", value: website.sqft, unitCode: "SQF" } }),
    ...(website.beds && { numberOfBedrooms: website.beds }),
    ...(website.baths && { numberOfBathroomsTotal: website.baths }),
    ...(website.yearBuilt && { yearBuilt: website.yearBuilt }),
    ...(website.lotSize && { lotSize: { "@type": "QuantitativeValue", value: website.lotSize } }),
    ...(website.project.client && {
      broker: {
        "@type": "RealEstateAgent",
        name: website.project.client.fullName || website.project.client.company,
        email: website.project.client.email,
        ...(website.project.client.phone && { telephone: website.project.client.phone }),
      },
    }),
  };
  return JSON.stringify(schema);
}

// Helper to format open house date/time
function formatOpenHouseDateTime(date: Date): { date: string; time: string } {
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date: dateStr, time: timeStr };
}

// Check if open house is currently active or upcoming
function getOpenHouseStatus(startDate: Date | null, endDate: Date | null): "upcoming" | "active" | "past" | null {
  if (!startDate) return null;
  const now = new Date();
  const end = endDate || new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
  if (now < startDate) return "upcoming";
  if (now >= startDate && now <= end) return "active";
  return "past";
}

// Get the actual accent color value from template or custom color
function getAccentColorHex(template: keyof typeof templateStyles, customColor?: string | null): string {
  if (customColor) return customColor;
  const templateAccents: Record<keyof typeof templateStyles, string> = {
    modern: "#3b82f6",
    classic: "#b8860b",
    luxury: "#d4af37",
    minimal: "#111111",
    commercial: "#0066cc",
  };
  return templateAccents[template] || "#3b82f6";
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

  const template = (website.template as keyof typeof templateStyles) || "modern";
  const styles = templateStyles[template] || templateStyles.modern;

  // Get custom accent color or use template default
  const customAccentColor = website.accentColor;
  const accentColorHex = getAccentColorHex(template, customAccentColor);

  // Get custom fonts
  const googleFontsUrl = getGoogleFontsUrl(website.fontHeading, website.fontBody);
  const { headingStyle, bodyStyle } = getCustomFontStyles(website.fontHeading, website.fontBody);

  // Check open house status
  const openHouseStatus = getOpenHouseStatus(website.openHouseDate, website.openHouseEndDate);
  const showOpenHouse = openHouseStatus === "upcoming" || openHouseStatus === "active";

  return (
    <main
      data-element="gallery-short-page"
      className={styles.main}
      style={{
        ...(customAccentColor ? { "--custom-accent": customAccentColor } : {}),
        ...bodyStyle,
      } as React.CSSProperties}
    >
      {/* Google Fonts */}
      {googleFontsUrl && (
        <link rel="stylesheet" href={googleFontsUrl} />
      )}

      {/* Schema.org Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateSchemaOrg(website) }}
      />

      {/* Open House Banner */}
      {showOpenHouse && website.openHouseDate && (
        <div
          className="sticky top-0 z-50 py-3 px-4 text-center text-white font-medium"
          style={{ backgroundColor: accentColorHex }}
        >
          <div className="flex items-center justify-center gap-3">
            <OpenHouseIcon className="h-5 w-5" />
            <span>
              {openHouseStatus === "active" ? (
                <>Open House in Progress!</>
              ) : (
                <>
                  Open House: {formatOpenHouseDateTime(website.openHouseDate).date} at {formatOpenHouseDateTime(website.openHouseDate).time}
                  {website.openHouseEndDate && (
                    <> - {formatOpenHouseDateTime(website.openHouseEndDate).time}</>
                  )}
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative">
        {/* Photo Gallery Hero */}
        <div className={styles.heroGrid}>
          {/* Main Image */}
          <div className={`relative col-span-2 row-span-2 ${styles.heroImage}`}>
            {website.project.assets[0]?.thumbnailUrl ? (
              <img
                src={website.project.assets[0].thumbnailUrl}
                alt={website.address}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImagePlaceholder size="large" template={template} />
              </div>
            )}
          </div>
          {/* Secondary Images - Hide for minimal template */}
          {template !== "minimal" && website.project.assets.slice(1, 5).map((asset) => (
            <div key={asset.id} className={`relative ${styles.heroImage}`}>
              {asset.thumbnailUrl ? (
                <img
                  src={asset.thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImagePlaceholder template={template} />
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
      <section className={styles.section}>
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className={`${styles.divider.replace('py-8', 'pb-8').replace('py-10', 'pb-10').replace('py-12', 'pb-12')}`}>
              {website.showPrice && website.price && (
                <p className={styles.price}>
                  {formatPrice(website.price)}
                </p>
              )}
              <h1 className={styles.heading} style={headingStyle}>{website.address}</h1>
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

            {/* Virtual Tour Embed */}
            {website.virtualTourUrl && (
              <div className={styles.divider}>
                <h2 className={styles.sectionHeading} style={headingStyle}>3D Virtual Tour</h2>
                <MediaEmbed url={website.virtualTourUrl} type="tour" />
              </div>
            )}

            {/* Video Embed */}
            {website.videoUrl && (
              <div className={styles.divider}>
                <h2 className={styles.sectionHeading} style={headingStyle}>Property Video</h2>
                <MediaEmbed url={website.videoUrl} type="video" />
              </div>
            )}

            {/* Description */}
            <div className={styles.divider}>
              {website.headline && (
                <h2 className={styles.sectionHeading} style={headingStyle}>{website.headline}</h2>
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
              <div className={styles.divider}>
                <h2 className={styles.sectionHeading} style={headingStyle}>Features & Amenities</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {website.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckIcon
                        className={`h-5 w-5 flex-shrink-0 ${!customAccentColor ? styles.successColor : ""}`}
                        style={customAccentColor ? { color: customAccentColor } : undefined}
                      />
                      <span className={styles.secondaryText}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Gallery Grid */}
            <div className="py-8">
              <h2 className={styles.sectionHeading} style={headingStyle}>Photo Gallery</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {website.project.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg ${styles.heroImage}`}
                  >
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center transition-transform group-hover:scale-105">
                        <ImagePlaceholder template={template} />
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
            <div className={`sticky space-y-6 ${showOpenHouse ? "top-16" : "top-6"}`}>
              {/* Contact Agent Card */}
              {website.showAgent && website.project.client && (
                <div className={styles.card}>
                  <h3 className={styles.sectionHeading.replace('mb-6', 'mb-4').replace('mb-8', 'mb-4')}>Contact Agent</h3>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold ${!customAccentColor ? `${styles.accentBgLight} ${styles.accent}` : ""}`}
                      style={customAccentColor ? {
                        backgroundColor: `${customAccentColor}20`,
                        color: customAccentColor,
                      } : undefined}
                    >
                      {website.project.client.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className={template === "luxury" ? "font-medium text-white" : template === "modern" ? "font-medium text-foreground" : "font-medium text-[#1d1d1f]"}>{website.project.client.fullName}</p>
                      <p className={`text-sm ${styles.mutedText}`}>{website.project.client.company}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {website.project.client.phone && (
                      <a
                        href={`tel:${website.project.client.phone}`}
                        className={`flex items-center gap-2 text-sm ${styles.secondaryText} hover:${styles.accent}`}
                      >
                        <PhoneIcon className="h-4 w-4" />
                        {website.project.client.phone}
                      </a>
                    )}
                    <a
                      href={`mailto:${website.project.client.email}`}
                      className={`flex items-center gap-2 text-sm ${styles.secondaryText} hover:${styles.accent}`}
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
                accentColor={customAccentColor}
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
        <footer className={`${styles.footer} ${styles.footerBg}`}>
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${!customAccentColor ? styles.accentBgLight : ""}`}
                  style={customAccentColor ? { backgroundColor: `${customAccentColor}20` } : undefined}
                >
                  <CameraIcon
                    className={`h-5 w-5 ${!customAccentColor ? styles.accent : ""}`}
                    style={customAccentColor ? { color: customAccentColor } : undefined}
                  />
                </div>
                <div>
                  <p className={template === "luxury" ? "font-medium text-white" : template === "modern" ? "font-medium text-foreground" : "font-medium text-[#1d1d1f]"}>
                    Photography by {website.project.organization.name}
                  </p>
                  <p className={`text-sm ${styles.mutedText}`}>Professional Photography</p>
                </div>
              </div>
              <p className={`text-sm ${styles.mutedText}`}>
                Powered by{" "}
                <Link
                  href="/"
                  className={`hover:underline ${!customAccentColor ? styles.accent : ""}`}
                  style={customAccentColor ? { color: customAccentColor } : undefined}
                >
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

// Media Embed Component for Videos and Tours
function MediaEmbed({ url, type }: { url: string; type: "video" | "tour" }) {
  // Helper to extract video/embed information
  const getEmbedInfo = (url: string) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // YouTube
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        let videoId = "";
        if (hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get("v") || "";
        }
        if (videoId) {
          return {
            type: "youtube",
            embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
          };
        }
      }

      // Vimeo
      if (hostname.includes("vimeo.com")) {
        const videoId = urlObj.pathname.split("/").filter(Boolean).pop();
        if (videoId) {
          return {
            type: "vimeo",
            embedUrl: `https://player.vimeo.com/video/${videoId}`,
          };
        }
      }

      // Matterport
      if (hostname.includes("matterport.com") || hostname.includes("my.matterport.com")) {
        const modelId = urlObj.searchParams.get("m") || urlObj.pathname.split("/").filter(Boolean).pop();
        if (modelId) {
          return {
            type: "matterport",
            embedUrl: `https://my.matterport.com/show/?m=${modelId}&play=1`,
          };
        }
      }

      // iGuide
      if (hostname.includes("iguide") || hostname.includes("youriguide.com")) {
        return {
          type: "iguide",
          embedUrl: url,
        };
      }

      // Zillow 3D Home
      if (hostname.includes("zillow.com") && url.includes("3d-home")) {
        return {
          type: "zillow",
          embedUrl: url,
        };
      }

      // CloudPano
      if (hostname.includes("cloudpano.com")) {
        return {
          type: "cloudpano",
          embedUrl: url,
        };
      }

      // Kuula
      if (hostname.includes("kuula.co")) {
        return {
          type: "kuula",
          embedUrl: url.replace("/share/", "/post/"),
        };
      }

      // Default - return as embeddable URL
      return {
        type: "unknown",
        embedUrl: url,
      };
    } catch {
      return {
        type: "unknown",
        embedUrl: url,
      };
    }
  };

  const embedInfo = getEmbedInfo(url);

  // For known embeddable sources, show iframe
  if (embedInfo.type !== "unknown") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[var(--card)]">
        <iframe
          src={embedInfo.embedUrl}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
          allowFullScreen
          loading="lazy"
          title={type === "video" ? "Property Video" : "Virtual Tour"}
        />
      </div>
    );
  }

  // For unknown URLs, show a clickable card with link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--primary)]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
        {type === "video" ? (
          <PlayIcon className="h-6 w-6 text-[var(--primary)]" />
        ) : (
          <CubeIcon className="h-6 w-6 text-[var(--primary)]" />
        )}
      </div>
      <div>
        <p className="font-medium text-foreground">
          {type === "video" ? "Watch Property Video" : "Explore 3D Virtual Tour"}
        </p>
        <p className="text-sm text-foreground-muted">Opens in a new tab</p>
      </div>
      <ExternalLinkIcon className="ml-auto h-5 w-5 text-foreground-muted" />
    </a>
  );
}

// Components
function ImagePlaceholder({ size = "default", template = "modern" }: { size?: "default" | "large"; template?: string }) {
  const iconColor = template === "luxury" || template === "modern" ? "#888" : "#aaa";
  return (
    <svg
      className={size === "large" ? "h-16 w-16" : "h-10 w-10"}
      fill="none"
      viewBox="0 0 24 24"
      stroke={iconColor}
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

function CameraIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

function OpenHouseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}
