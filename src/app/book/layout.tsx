import "@/app/globals.css";

export const metadata = {
  title: "Book a Session",
  description: "Request a photography session",
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0A0A0A]">
      {children}
    </div>
  );
}
