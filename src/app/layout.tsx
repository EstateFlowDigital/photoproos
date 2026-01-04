import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PhotoProOS | The Business OS for Professional Photographers",
    template: "%s | PhotoProOS",
  },
  description: "Everything you need in one place. Deliver stunning galleries, collect payments automatically, and run your entire photography business with ease. Join 2,500+ photographers.",
  keywords: [
    "photography business",
    "client galleries",
    "photo delivery",
    "payment processing",
    "photography workflow",
    "client management",
    "gallery software",
    "photographer tools",
    "photo proofing",
    "professional photography",
  ],
  authors: [{ name: "PhotoProOS" }],
  creator: "PhotoProOS",
  publisher: "PhotoProOS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://photoproos.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PhotoProOS | The Business OS for Professional Photographers",
    description: "Deliver stunning galleries, collect payments automatically, and run your entire photography business from one platform.",
    url: "https://photoproos.com",
    siteName: "PhotoProOS",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "PhotoProOS - The Business OS for Professional Photographers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PhotoProOS | The Business OS for Professional Photographers",
    description: "Deliver stunning galleries, collect payments automatically, and run your entire photography business from one platform.",
    site: "@photoproos",
    creator: "@photoproos",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" data-scroll-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load fonts for appearance customization */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('photoproos-theme');
                  var resolved = theme;
                  if (!theme || theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', resolved);
                  document.documentElement.setAttribute('data-scroll-theme', resolved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ClerkProvider appearance={clerkAppearance}>
            {/* Skip to main content link for accessibility */}
            <a
              href="#main-content"
              className="skip-to-main-content"
            >
              Skip to main content
            </a>
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
