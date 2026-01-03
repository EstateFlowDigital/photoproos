"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortfolioWebsite } from "@/lib/actions/portfolio-websites";
import { useToast } from "@/components/ui/toast";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function NewPortfolioClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(toSlug(name));
    }
  }, [name, slugEdited]);

  const handleCreate = () => {
    if (!name.trim()) return;

    startTransition(async () => {
      const result = await createPortfolioWebsite({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
      });

      if (result.success && result.id) {
        showToast("Portfolio website created", "success");
        router.push(`/portfolios/${result.id}`);
      } else {
        showToast(result.error || "Failed to create portfolio", "error");
      }
    });
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground">Website Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Studio Portfolio"
              className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Public URL</label>
            <div className="mt-2 flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground">
              <span className="text-foreground-muted">/portfolio/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(toSlug(e.target.value));
                }}
                className="ml-1 flex-1 bg-transparent text-sm text-foreground outline-none"
                placeholder="your-studio"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Introduce your style, specialties, and what clients can expect."
              className="mt-2 min-h-[120px] w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-5">
          <h3 className="text-sm font-medium text-foreground">What you can add next</h3>
          <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
            <li>Pick gallery projects to feature</li>
            <li>Customize hero text and branding</li>
            <li>Publish and share your link</li>
          </ul>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isPending}
            className="mt-6 w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Portfolio"}
          </button>
        </div>
      </div>
    </div>
  );
}
