"use client";

import { PortalPageWrapper, PortalComingSoon } from "../components";

interface PortalFilesClientProps {
  clientName?: string;
  clientEmail?: string;
}

export function PortalFilesClient({
  clientName,
  clientEmail,
}: PortalFilesClientProps) {
  return (
    <PortalPageWrapper clientName={clientName} clientEmail={clientEmail}>
      <div data-element="portal-files-page">
        <PortalComingSoon
          title="Your Files"
          subtitle="Access all your project files and documents"
          icon="📁"
          description="Download project files, view documents, and access shared materials."
          features={[
            "Project documents and files",
            "Contracts and agreements",
            "Prep guides and instructions",
            "Mood boards and inspiration",
            "Secure file downloads",
            "File upload for sharing",
          ]}
          relatedLinks={[
            { label: "Portal Home", href: "/portal" },
            { label: "Downloads", href: "/portal/downloads" },
            { label: "Contracts", href: "/portal/contracts" },
          ]}
        />
      </div>
    </PortalPageWrapper>
  );
}
