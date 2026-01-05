import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  className?: string;
  href?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success";
}

export function StatCard({ label, value, change, positive, className, href, icon, variant = "default" }: StatCardProps) {
  const accentClass =
    variant === "success"
      ? "bg-[var(--success)]/10 text-[var(--success)]"
      : "bg-[var(--primary)]/10 text-[var(--primary)]";

  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-muted">{label}</p>
        {icon}
        {href && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-foreground-muted opacity-60 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{value}</span>
        {change && (
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            positive
              ? "bg-[var(--success)]/10 text-[var(--success)]"
              : "bg-[var(--background-secondary)] text-foreground-muted"
          )}>
            {change}
          </span>
        )}
      </div>
    </>
  );

  const cardClasses = cn(
    "rounded-xl border border-[var(--card-border)] bg-[var(--card)] density-padding",
    href && "group cursor-pointer transition-all hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      {content}
    </div>
  );
}
