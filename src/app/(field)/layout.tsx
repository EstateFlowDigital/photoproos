import { ClerkProvider } from "@clerk/nextjs";
import "@/app/globals.css";

// Force dynamic rendering to avoid static generation issues when Clerk auth
// pulls request headers during build.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata = {
  title: "PhotoProOS Field",
  description: "Mobile field operations for photographers",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </ClerkProvider>
  );
}
