import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("stack-header", className)} data-element="page-header">
      <div className="min-w-0" data-element="page-header-content">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground break-words lg:text-3xl" data-element="page-title">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-foreground-muted break-words lg:text-base" data-element="page-subtitle">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="stack-actions w-full sm:w-auto" data-element="page-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
}
