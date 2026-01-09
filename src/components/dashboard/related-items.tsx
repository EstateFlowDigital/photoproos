import Link from "next/link";
import { cn } from "@/lib/utils";

interface RelatedItem {
  label: string;
  count: number;
  href: string;
  icon: React.ReactNode;
}

interface RelatedItemsProps {
  items: RelatedItem[];
  className?: string;
}

export function RelatedItems({ items, className }: RelatedItemsProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6", className)}>
      <h2 className="text-lg font-semibold text-foreground mb-4">Related</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start justify-between gap-4 flex-wrap rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--background-hover)] group"
          >
            <div className="flex items-center gap-3">
              <span className="text-foreground-muted group-hover:text-foreground transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                {item.count}
              </span>
              <ChevronRightIcon className="h-4 w-4 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
