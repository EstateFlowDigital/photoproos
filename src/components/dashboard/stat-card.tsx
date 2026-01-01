import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  className?: string;
}

export function StatCard({ label, value, change, positive, className }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 lg:p-5",
      className
    )}>
      <p className="text-sm text-foreground-muted">{label}</p>
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
    </div>
  );
}
