import "@/app/globals.css";

export const metadata = {
  title: "Get Started | PhotoProOS",
  description: "Set up your PhotoProOS account",
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
