import { MarketingStudioHub } from "./marketing-studio-hub";

export const metadata = {
  title: "Marketing Studio | PhotoProOS Admin",
  description: "Create and manage social media content with platform-accurate previews",
};

export default function MarketingStudioPage() {
  return (
    <div data-element="marketing-studio-page">
      <div className="mb-6" data-element="marketing-studio-header">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Marketing Studio</h1>
        <p className="text-[var(--foreground-muted)]">
          Create stunning social media content with real-time platform previews
        </p>
      </div>

      <MarketingStudioHub />
    </div>
  );
}
