"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DropdownMenu Component
 *
 * A composable dropdown menu with trigger and content.
 * Uses semantic design tokens for consistent theming.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger>
 *     <Button>Options</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="danger" onClick={handleDelete}>Delete</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */

interface DropdownMenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a DropdownMenu");
  }
  return context;
}

interface DropdownMenuProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function DropdownMenu({ children, defaultOpen = false }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

function DropdownMenuTrigger({ children, asChild, className }: DropdownMenuTriggerProps) {
  const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      "aria-expanded": isOpen,
      "aria-haspopup": true,
      ref: triggerRef,
    });
  }

  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-2",
        "text-foreground-muted transition-colors",
        "hover:bg-[var(--background-hover)] hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className
      )}
    >
      {children}
    </button>
  );
}

type DropdownMenuAlign = "start" | "center" | "end";
type DropdownMenuSide = "top" | "bottom";

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: DropdownMenuAlign;
  side?: DropdownMenuSide;
  sideOffset?: number;
}

function DropdownMenuContent({
  children,
  className,
  align = "end",
  side = "bottom",
  sideOffset = 4,
}: DropdownMenuContentProps) {
  const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen, triggerRef]);

  if (!isOpen) return null;

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  const sideClasses = {
    top: `bottom-full mb-${sideOffset}`,
    bottom: `top-full mt-${sideOffset}`,
  };

  return (
    <div
      ref={contentRef}
      role="menu"
      aria-orientation="vertical"
      className={cn(
        "absolute z-50 min-w-[180px] overflow-hidden",
        "rounded-lg border border-[var(--card-border)] bg-[var(--card)]",
        "py-1 shadow-xl",
        "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        alignmentClasses[align],
        side === "top" ? "bottom-full mb-1" : "top-full mt-1",
        className
      )}
      style={{ marginTop: side === "bottom" ? sideOffset : undefined, marginBottom: side === "top" ? sideOffset : undefined }}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  icon?: React.ReactNode;
  className?: string;
}

function DropdownMenuItem({
  children,
  onClick,
  disabled,
  variant = "default",
  icon,
  className,
}: DropdownMenuItemProps) {
  const { setIsOpen } = useDropdownMenu();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm",
        "transition-colors duration-[var(--duration-fast)]",
        "focus:outline-none focus-visible:bg-[var(--background-hover)]",
        variant === "default" && [
          "text-foreground",
          "hover:bg-[var(--background-hover)]",
          disabled && "cursor-not-allowed opacity-50",
        ],
        variant === "danger" && [
          "text-[var(--error)]",
          "hover:bg-[var(--error)]/10",
          disabled && "cursor-not-allowed opacity-50",
        ],
        className
      )}
    >
      {icon && (
        <span className={cn("h-4 w-4 shrink-0", variant === "default" && "text-foreground-muted")}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <div
      className={cn(
        "px-3 py-2 text-xs font-medium uppercase tracking-wider text-foreground-muted",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <div className={cn("my-1 h-px bg-[var(--card-border)]", className)} role="separator" />;
}

// Three-dot icon for common trigger usage
function MoreHorizontalIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </svg>
  );
}

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  MoreHorizontalIcon,
  MoreVerticalIcon,
};
