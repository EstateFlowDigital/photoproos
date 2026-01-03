import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("stack-header", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-foreground-muted lg:text-base">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="stack-actions w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
