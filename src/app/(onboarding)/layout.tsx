import "@/app/globals.css";

export const metadata = {
  title: "Get Started | Dovetail",
  description: "Set up your Dovetail account",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {children}
    </div>
  );
}
