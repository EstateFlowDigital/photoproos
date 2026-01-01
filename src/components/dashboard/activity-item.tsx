import { cn } from "@/lib/utils";

interface ActivityItemProps {
  icon: React.ReactNode;
  text: string;
  time: string;
  highlight?: boolean;
}

export function ActivityItem({ icon, text, time, highlight }: ActivityItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg p-3",
      highlight && "bg-[var(--success)]/5"
    )}>
      <div className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        highlight
          ? "bg-[var(--success)]/10 text-[var(--success)]"
          : "bg-[var(--background-elevated)] text-foreground-muted"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{text}</p>
        <p className="mt-0.5 text-xs text-foreground-muted">{time}</p>
      </div>
    </div>
  );
}
