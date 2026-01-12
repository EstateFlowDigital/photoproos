"use client";

import { PortalPageWrapper, PortalComingSoon } from "../components";

interface PortalFavoritesClientProps {
  clientName?: string;
  clientEmail?: string;
}

export function PortalFavoritesClient({
  clientName,
  clientEmail,
}: PortalFavoritesClientProps) {
  return (
    <PortalPageWrapper clientName={clientName} clientEmail={clientEmail}>
      <div data-element="portal-favorites-page">
        <PortalComingSoon
          title="Your Favorites"
          subtitle="Photos you've marked as favorites"
          icon="❤️"
          description="View all photos you've favorited across your galleries in one place."
          features={[
            "All favorites in one view",
            "Organized by gallery and session",
            "Quick unfavorite option",
            "Share favorites with family",
            "Add to cart for purchase",
            "Download favorited photos",
          ]}
          relatedLinks={[
            { label: "Portal Home", href: "/portal" },
            { label: "Galleries", href: "/portal/galleries" },
            { label: "Selects", href: "/portal/selects" },
          ]}
        />
      </div>
    </PortalPageWrapper>
  );
}
