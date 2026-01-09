export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, KeyIcon, CodeIcon, BookOpenIcon } from "@/components/ui/settings-icons";
import { ApiDocumentationClient } from "./api-documentation-client";

export default function ApiDocumentationPage() {
  // Get the base URL for the API
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";

  return (
    <div data-element="settings-developer-api-page" className="space-y-6">
      <PageHeader
        title="API Documentation"
        subtitle="Integrate PhotoProOS with your applications"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/settings/integrations">
                <KeyIcon className="h-4 w-4" />
                Manage API Keys
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings/developer">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Developer
              </Link>
            </Button>
          </div>
        }
      />

      {/* Quick Start */}
      <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/20 text-[var(--primary)]">
            <BookOpenIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Quick Start</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Get started with the PhotoProOS API in three steps:
            </p>
            <ol className="mt-3 space-y-2 text-sm text-foreground-secondary">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">1</span>
                <Link href="/settings/integrations" className="text-[var(--primary)] hover:underline">
                  Generate an API key
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">2</span>
                Add the key to your <code className="rounded bg-[var(--background-secondary)] px-1.5 py-0.5 text-xs">Authorization</code> header
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">3</span>
                Make requests to <code className="rounded bg-[var(--background-secondary)] px-1.5 py-0.5 text-xs">{baseUrl}/api/v1/</code>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <ApiDocumentationClient baseUrl={baseUrl} />
    </div>
  );
}
