import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-[120px] md:text-[180px] font-bold text-foreground/5 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
                <CameraOffIcon className="h-10 w-10 text-[var(--primary)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-foreground-secondary mb-8 text-lg">
          Looks like this shot didn't make the final cut. The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <HomeIcon className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <HelpIcon className="h-4 w-4" />
            Help Center
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-[var(--card-border)]">
          <p className="text-sm text-foreground-muted mb-4">Popular pages</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/features/galleries"
              className="text-sm text-foreground-secondary hover:text-[var(--primary)] transition-colors"
            >
              Galleries
            </Link>
            <span className="text-foreground-muted">·</span>
            <Link
              href="/pricing"
              className="text-sm text-foreground-secondary hover:text-[var(--primary)] transition-colors"
            >
              Pricing
            </Link>
            <span className="text-foreground-muted">·</span>
            <Link
              href="/contact"
              className="text-sm text-foreground-secondary hover:text-[var(--primary)] transition-colors"
            >
              Contact
            </Link>
            <span className="text-foreground-muted">·</span>
            <Link
              href="/blog"
              className="text-sm text-foreground-secondary hover:text-[var(--primary)] transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function CameraOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18M3.805 11.5A7.5 7.5 0 0 1 4.5 9h.19l1.06-2.12A1.5 1.5 0 0 1 7.09 6h4.82a1.5 1.5 0 0 1 1.34.83L14.31 9h.19a7.47 7.47 0 0 1 2.194.33M21 12a9 9 0 0 1-9 9 9 9 0 0 1-7.195-3.59M15 12a3 3 0 1 1-6 0" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}
