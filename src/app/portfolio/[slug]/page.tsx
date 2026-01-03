export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioWebsiteBySlug } from "@/lib/actions/portfolio-websites";

export default async function PortfolioPublicPage({ params }: { params: { slug: string } }) {
  const website = await getPortfolioWebsiteBySlug(params.slug);

  if (!website) {
    notFound();
  }

  const heroTitle = website.heroTitle || website.name;
  const heroSubtitle = website.heroSubtitle || website.description;
  const projects = website.projects.map((item) => item.project);

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      <header
        className="border-b border-[var(--card-border)] bg-[var(--card)]"
        style={{ borderColor: website.primaryColor || undefined }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            {website.logoUrl ? (
              <img src={website.logoUrl} alt={website.organization.name} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: website.primaryColor || "#3b82f6" }}
              >
                {website.organization.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm text-foreground-muted">Portfolio</p>
              <p className="text-lg font-semibold text-foreground">{website.organization.name}</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-sm text-foreground-muted md:flex">
            {website.organization.publicEmail && (
              <a href={`mailto:${website.organization.publicEmail}`} className="hover:text-foreground">
                {website.organization.publicEmail}
              </a>
            )}
            {website.organization.publicPhone && (
              <a href={`tel:${website.organization.publicPhone}`} className="hover:text-foreground">
                {website.organization.publicPhone}
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: website.accentColor || "#8b5cf6" }}>
              Featured Work
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-foreground md:text-5xl">
              {heroTitle}
            </h1>
            {heroSubtitle && (
              <p className="mt-4 text-lg text-foreground-muted">{heroSubtitle}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {website.organization.website && (
                <Link
                  href={website.organization.website}
                  className="rounded-full border border-[var(--card-border)] px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--border-hover)] hover:text-[var(--primary)]"
                >
                  Visit Website
                </Link>
              )}
              {website.organization.publicEmail && (
                <a
                  href={`mailto:${website.organization.publicEmail}`}
                  className="rounded-full px-5 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: website.primaryColor || "#3b82f6" }}
                >
                  Book a Session
                </a>
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground">Portfolio Highlights</h2>
            <p className="mt-2 text-sm text-foreground-muted">
              Curated galleries that reflect the style, lighting, and storytelling clients hire us for.
            </p>
            <div className="mt-6 space-y-3 text-sm text-foreground-muted">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: website.accentColor || "#8b5cf6" }} />
                <span>High-impact hero imagery for marketing and web</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: website.accentColor || "#8b5cf6" }} />
                <span>Consistent color grading and premium retouching</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: website.accentColor || "#8b5cf6" }} />
                <span>Optimized delivery for web, print, and social</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Portfolio Galleries</h2>
            <span className="text-sm text-foreground-muted">{projects.length} projects</span>
          </div>

          {projects.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-12 text-center text-foreground-muted">
              This portfolio is still being curated.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const asset = project.assets[0];
                const imageUrl = project.coverImageUrl || asset?.thumbnailUrl || asset?.originalUrl;

                return (
                  <div
                    key={project.id}
                    className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] transition-transform hover:-translate-y-1"
                  >
                    <div className="aspect-[4/3] w-full bg-[var(--background-secondary)]">
                      {imageUrl ? (
                        <img src={imageUrl} alt={project.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-foreground-muted">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                      {project.description && (
                        <p className="mt-2 text-sm text-foreground-muted line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-foreground-muted">
          <span>© {new Date().getFullYear()} {website.organization.name}</span>
          {website.organization.website && (
            <Link href={website.organization.website} className="hover:text-foreground">
              {website.organization.website}
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
