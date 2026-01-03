"use client";

import { cn } from "@/lib/utils";
import { serviceCategories, formatServicePrice, type ServiceCategory } from "@/lib/services";

export interface SelectableService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  priceCents: number;
  duration: string | null;
  deliverables: string[];
  isActive: boolean;
  isDefault: boolean;
  usageCount?: number;
}

interface SelectableServiceCardProps {
  service: SelectableService;
  isSelected: boolean;
  onSelect: (id: string) => void;
  selectionMode: boolean;
  onNavigate?: (id: string) => void;
}

export function SelectableServiceCard({
  service,
  isSelected,
  onSelect,
  selectionMode,
  onNavigate,
}: SelectableServiceCardProps) {
  const categoryInfo = serviceCategories[service.category];

  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault();
      onSelect(service.id);
    } else if (onNavigate) {
      onNavigate(service.id);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(service.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative rounded-xl border bg-[var(--card)] p-5 transition-all cursor-pointer",
        selectionMode && "hover:border-[var(--primary)]/50",
        !selectionMode && "hover:border-[var(--primary)]/50 hover:shadow-lg",
        service.isActive ? "border-[var(--card-border)]" : "border-dashed opacity-60",
        isSelected && "ring-2 ring-[var(--primary)] border-[var(--primary)]"
      )}
    >
      {/* Selection Checkbox */}
      <div
        onClick={handleCheckboxClick}
        className={cn(
          "absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded border transition-all",
          isSelected
            ? "bg-[var(--primary)] border-[var(--primary)]"
            : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--primary)]",
          !selectionMode && "opacity-0 group-hover:opacity-100"
        )}
      >
        {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 pr-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", categoryInfo.color)}>
              {categoryInfo.label}
            </span>
            {service.isDefault && (
              <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                Template
              </span>
            )}
            {!service.isActive && (
              <span className="rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                Inactive
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-[var(--primary)] transition-colors line-clamp-2 sm:line-clamp-1">
            {service.name}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-foreground">{formatServicePrice(service.priceCents)}</p>
          {service.duration && (
            <p className="text-xs text-foreground-muted">{service.duration}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {service.description && (
        <p className="mt-3 text-sm text-foreground-muted line-clamp-2">{service.description}</p>
      )}

      {/* Deliverables */}
      {service.deliverables.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {service.deliverables.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-foreground">
              <CheckIcon className="h-3.5 w-3.5 text-[var(--success)] shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
          {service.deliverables.length > 3 && (
            <p className="text-xs text-foreground-muted pl-5">
              +{service.deliverables.length - 3} more
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs text-foreground-muted">
        <span>Used in {service.usageCount || 0} galleries</span>
        {!selectionMode && (
          <span className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
            Edit →
          </span>
        )}
      </div>
    </div>
  );
}

interface SelectableServiceRowProps {
  service: SelectableService;
  isSelected: boolean;
  onSelect: (id: string) => void;
  selectionMode: boolean;
  onNavigate?: (id: string) => void;
}

export function SelectableServiceRow({
  service,
  isSelected,
  onSelect,
  selectionMode,
  onNavigate,
}: SelectableServiceRowProps) {
  const categoryInfo = serviceCategories[service.category];

  const handleRowClick = () => {
    if (selectionMode) {
      onSelect(service.id);
    } else if (onNavigate) {
      onNavigate(service.id);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(service.id);
  };

  return (
    <tr
      onClick={handleRowClick}
      className={cn(
        "hover:bg-[var(--background-hover)] transition-colors cursor-pointer",
        isSelected && "bg-[var(--primary)]/5"
      )}
    >
      {/* Checkbox Column */}
      <td className="px-4 py-3 w-12">
        <div
          onClick={handleCheckboxClick}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border transition-all cursor-pointer",
            isSelected
              ? "bg-[var(--primary)] border-[var(--primary)]"
              : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--primary)]"
          )}
        >
          {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{service.name}</p>
        {service.description && (
          <p className="text-xs text-foreground-muted truncate max-w-xs">{service.description}</p>
        )}
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", categoryInfo.color)}>
          {categoryInfo.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="font-semibold text-foreground">{formatServicePrice(service.priceCents)}</span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-foreground-muted">{service.duration || "—"}</span>
      </td>
      <td className="px-4 py-3 text-center hidden lg:table-cell">
        <span className="text-sm text-foreground-muted">{service.usageCount || 0}</span>
      </td>
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        {service.isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--foreground-muted)]/10 px-2 py-0.5 text-xs font-medium text-foreground-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted" />
            Inactive
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {!selectionMode && (
          <span className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground">
            Edit
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        )}
      </td>
    </tr>
  );
}

// Icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
