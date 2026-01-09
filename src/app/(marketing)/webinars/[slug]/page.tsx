import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWebinar, getAllWebinars, getRelatedWebinars } from "@/lib/webinars/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const webinars = getAllWebinars();
  return webinars.map((webinar) => ({
    slug: webinar.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const webinar = getWebinar(slug);

  if (!webinar) {
    return {
      title: "Webinar Not Found | PhotoProOS",
    };
  }

  return {
    title: `${webinar.title} | PhotoProOS Webinars`,
    description: webinar.description,
  };
}

export default async function WebinarPage({ params }: PageProps) {
  const { slug } = await params;
  const webinar = getWebinar(slug);

  if (!webinar) {
    notFound();
  }

  const relatedWebinars = getRelatedWebinars(slug);
  const isUpcoming = webinar.status === "upcoming";

  return (
    <main className="relative min-h-screen bg-background" data-element="webinar-detail-page">
      {/* Header */}
      <section className="border-b border-[var(--card-border)]">
        <div className="mx-auto max-w-[1512px] px-6 py-8 lg:px-[124px]">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-foreground-muted">
            <Link href="/webinars" className="hover:text-foreground">
              Webinars
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-foreground-secondary">{webinar.title}</span>
          </nav>

          <div className="flex items-start gap-3">
            {isUpcoming ? (
              <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
                Upcoming
              </span>
            ) : (
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                On-Demand
              </span>
            )}
            <span className="rounded-full bg-[var(--background-tertiary)] px-3 py-1 text-xs text-foreground-secondary">
              {webinar.duration}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {webinar.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-foreground-secondary">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-foreground-muted" />
              <span>{webinar.date}</span>
            </div>
            {webinar.time && (
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-foreground-muted" />
                <span>{webinar.time}</span>
              </div>
            )}
            {webinar.views && (
              <div className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4 text-foreground-muted" />
                <span>{webinar.views} views</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-[1512px] px-6 py-12 lg:px-[124px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div>
            {/* Video Player or Register */}
            {isUpcoming ? (
              <div className="mb-8 rounded-xl border border-[var(--card-border)] bg-gradient-to-b from-pink-500/5 to-transparent p-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pink-500/10">
                  <CalendarIcon className="h-8 w-8 text-pink-400" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  Register for This Webinar
                </h2>
                <p className="mb-6 text-foreground-secondary">
                  {webinar.date} at {webinar.time}
                </p>
                <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
                  <BellIcon className="h-4 w-4" />
                  Register Free
                </button>
                <p className="mt-4 text-xs text-foreground-muted">
                  You'll receive a reminder email before the webinar starts
                </p>
              </div>
            ) : (
              <div className="mb-8 overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
                <div className="relative aspect-video bg-[var(--background-tertiary)]">
                  {webinar.videoUrl ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mb-4 inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                          <PlayIcon className="h-10 w-10 ml-1" />
                        </div>
                        <p className="text-foreground-secondary">
                          Click to watch the recording
                        </p>
                        <p className="mt-2 text-sm text-foreground-muted">
                          Video coming soon
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-foreground-muted">Video unavailable</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-foreground">About This Webinar</h2>
              <div className="space-y-4 text-foreground-secondary">
                {webinar.longDescription.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-foreground">What We'll Cover</h2>
              <ul className="space-y-3">
                {webinar.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--primary)]" />
                    <span className="text-foreground-secondary">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Takeaways */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Key Takeaways</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {webinar.takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <StarIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                    <span className="text-foreground-secondary">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="mb-4 font-semibold text-foreground">Hosted By</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-lg font-bold text-[var(--primary)]">
                  {webinar.host.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-medium text-foreground">{webinar.host.name}</p>
                  <p className="text-sm text-foreground-secondary">{webinar.host.role}</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="mb-4 font-semibold text-foreground">Share This Webinar</h3>
              <div className="flex gap-3">
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--card-border)] text-foreground-secondary transition-colors hover:border-[var(--border-hover)] hover:text-foreground">
                  <TwitterIcon className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--card-border)] text-foreground-secondary transition-colors hover:border-[var(--border-hover)] hover:text-foreground">
                  <LinkedInIcon className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--card-border)] text-foreground-secondary transition-colors hover:border-[var(--border-hover)] hover:text-foreground">
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Related */}
            {relatedWebinars.length > 0 && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-4 font-semibold text-foreground">Related Webinars</h3>
                <div className="space-y-4">
                  {relatedWebinars.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/webinars/${related.slug}`}
                      className="group block"
                    >
                      <p className="font-medium text-foreground group-hover:text-[var(--primary)]">
                        {related.title}
                      </p>
                      <p className="mt-1 text-sm text-foreground-muted">
                        {related.duration} · {related.views} views
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-xl border border-[var(--card-border)] bg-gradient-to-b from-[var(--primary)]/5 to-transparent p-6">
              <h3 className="mb-2 font-semibold text-foreground">Ready to get started?</h3>
              <p className="mb-4 text-sm text-foreground-secondary">
                Try PhotoProOS free and implement what you've learned.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Icons
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
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

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
  );
}
