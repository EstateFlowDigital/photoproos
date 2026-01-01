import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | PhotoProOS",
  description: "Learn how PhotoProOS collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 1, 2025";

  return (
    <main className="relative min-h-screen bg-background">
      <article className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
        <header className="mb-12 border-b border-[var(--card-border)] pb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-foreground-secondary">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="prose prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Introduction</h2>
            <p className="mb-4 text-foreground-secondary">
              PhotoProOS ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Information We Collect</h2>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Personal Information</h3>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Name and contact information (email, phone, address)</li>
              <li>Account credentials</li>
              <li>Payment and billing information</li>
              <li>Business information (company name, industry)</li>
            </ul>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Usage Data</h3>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Log data and device information</li>
              <li>Usage patterns and preferences</li>
              <li>Analytics and performance data</li>
            </ul>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Content</h3>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Photos and media files you upload</li>
              <li>Gallery and project information</li>
              <li>Client data you store in the platform</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">How We Use Your Information</h2>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>To provide and maintain our service</li>
              <li>To process transactions and send billing notifications</li>
              <li>To communicate with you about updates, features, and support</li>
              <li>To improve and personalize your experience</li>
              <li>To ensure platform security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Data Sharing</h2>
            <p className="mb-4 text-foreground-secondary">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li><strong>Service providers:</strong> Payment processors (Stripe), cloud hosting (Cloudflare, Railway), email services (Resend)</li>
              <li><strong>Your clients:</strong> When you share galleries or invoices with them</li>
              <li><strong>Legal authorities:</strong> When required by law or to protect rights</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Data Security</h2>
            <p className="mb-4 text-foreground-secondary">
              We implement industry-standard security measures including:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>256-bit SSL/TLS encryption for data in transit</li>
              <li>Encrypted storage for data at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication mechanisms</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Your Rights</h2>
            <p className="mb-4 text-foreground-secondary">
              Depending on your location, you may have rights to:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data ("right to be forgotten")</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
              <li>Restrict or object to certain processing</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Cookies</h2>
            <p className="mb-4 text-foreground-secondary">
              We use cookies and similar technologies to maintain sessions, remember preferences, and analyze usage. You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Data Retention</h2>
            <p className="mb-4 text-foreground-secondary">
              We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data as required by law or for legitimate business purposes for up to 90 days.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">International Transfers</h2>
            <p className="mb-4 text-foreground-secondary">
              Your data may be processed in countries outside your residence. We ensure appropriate safeguards are in place for international data transfers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Children's Privacy</h2>
            <p className="mb-4 text-foreground-secondary">
              Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Changes to This Policy</h2>
            <p className="mb-4 text-foreground-secondary">
              We may update this privacy policy periodically. We will notify you of significant changes via email or through the platform.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Contact Us</h2>
            <p className="mb-4 text-foreground-secondary">
              If you have questions about this privacy policy or our data practices, please contact us at:
            </p>
            <ul className="mb-4 list-none text-foreground-secondary">
              <li>Email: privacy@photoproos.com</li>
              <li>Address: [Company Address]</li>
            </ul>
          </section>
        </div>

        <footer className="mt-12 border-t border-[var(--card-border)] pt-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/terms" className="text-sm text-[var(--primary)] hover:underline">
              Terms of Service
            </Link>
            <Link href="/legal/cookies" className="text-sm text-[var(--primary)] hover:underline">
              Cookie Policy
            </Link>
            <Link href="/contact" className="text-sm text-[var(--primary)] hover:underline">
              Contact Us
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
