import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card Component
 *
 * A container component for grouping related content.
 * Uses semantic design tokens for consistent theming.
 *
 * @example
 * // Basic card
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 *
 * @example
 * // Accessible region with label
 * <Card asRegion aria-labelledby="stats-title">
 *   <CardTitle id="stats-title">Statistics</CardTitle>
 * </Card>
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * When true, adds role="region" to make the card a landmark.
   * Should be used with aria-labelledby pointing to CardTitle.
   */
  asRegion?: boolean;
  /**
   * When true, adds role="article" for standalone content cards.
   * Use for cards that represent independent pieces of content.
   */
  asArticle?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asRegion, asArticle, ...props }, ref) => (
    <div
      ref={ref}
      role={asRegion ? "region" : asArticle ? "article" : undefined}
      data-element="card"
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-element="card-header"
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-element="card-title"
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-element="card-description"
    className={cn("text-sm text-foreground-muted", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} data-element="card-content" className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-element="card-footer"
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
