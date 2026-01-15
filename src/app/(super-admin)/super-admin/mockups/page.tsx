import { MockupsPageClient } from "./mockups-page-client";

export const metadata = {
  title: "Mockup Library | PhotoProOS Admin",
  description: "Internal mockup library for marketing and social media assets",
};

export default function MockupsPage() {
  return (
    <div data-element="mockups-page">
      <div className="mb-6" data-element="mockups-header">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Mockup Library</h1>
        <p className="text-[var(--foreground-muted)]">
          Export ready-to-use mockups for marketing and social media
        </p>
      </div>

      <MockupsPageClient />
    </div>
  );
}
