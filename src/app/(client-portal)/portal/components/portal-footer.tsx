import Link from "next/link";

export function PortalFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--card-border)] py-6">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm text-[var(--foreground-muted)]">
          Powered by{" "}
          <Link href="/" className="font-medium text-[var(--primary)] hover:underline">
            PhotoProOS
          </Link>
        </p>
      </div>
    </footer>
  );
}
