import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | PhotoProOS",
  description: "Terms and conditions for using PhotoProOS photography business platform.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "January 1, 2025";

  return (
    <main className="relative min-h-screen bg-background">
      <article className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
        <header className="mb-12 border-b border-[var(--card-border)] pb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-foreground-secondary">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="prose prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="mb-4 text-foreground-secondary">
              By accessing or using PhotoProOS ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">2. Description of Service</h2>
            <p className="mb-4 text-foreground-secondary">
              PhotoProOS is a business management platform for professional photographers, providing gallery delivery, client management, payment processing, and workflow automation tools.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">3. Account Registration</h2>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>You must be at least 18 years old to create an account</li>
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>One person or entity may not maintain multiple free accounts</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">4. Subscriptions and Payments</h2>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Paid features require a valid subscription</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>Price changes will be notified 30 days in advance</li>
              <li>Refunds are available within 14 days for annual plans</li>
              <li>We may suspend accounts with overdue payments</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">5. Your Content</h2>
            <p className="mb-4 text-foreground-secondary">
              "Content" refers to photos, text, data, and materials you upload or create using our Service.
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>You retain all ownership rights to your Content</li>
              <li>You grant us a license to host, display, and deliver your Content as part of the Service</li>
              <li>You are responsible for ensuring you have rights to all Content you upload</li>
              <li>We do not use your Content for AI training or marketing without explicit consent</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">6. Acceptable Use</h2>
            <p className="mb-4 text-foreground-secondary">You agree not to:</p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Upload illegal, harmful, or infringing content</li>
              <li>Use the Service for spam, phishing, or fraud</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Reverse engineer or copy our technology</li>
              <li>Resell the Service without authorization</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">7. Payment Processing</h2>
            <p className="mb-4 text-foreground-secondary">
              We use Stripe to process payments. By using payment features, you also agree to Stripe's Terms of Service. We are not responsible for Stripe's actions or failures.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">8. Intellectual Property</h2>
            <p className="mb-4 text-foreground-secondary">
              The Service, including its original content, features, and functionality, is owned by PhotoProOS and is protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">9. Termination</h2>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>You may cancel your account at any time</li>
              <li>We may suspend or terminate accounts that violate these Terms</li>
              <li>Upon termination, your right to use the Service ceases immediately</li>
              <li>You may export your data within 30 days of termination</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">10. Disclaimers</h2>
            <p className="mb-4 text-foreground-secondary">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DO NOT GUARANTEE THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">11. Limitation of Liability</h2>
            <p className="mb-4 text-foreground-secondary">
              IN NO EVENT SHALL PHOTOPROOS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">12. Indemnification</h2>
            <p className="mb-4 text-foreground-secondary">
              You agree to indemnify and hold PhotoProOS harmless from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">13. Changes to Terms</h2>
            <p className="mb-4 text-foreground-secondary">
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes via email or through the Service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">14. Governing Law</h2>
            <p className="mb-4 text-foreground-secondary">
              These Terms shall be governed by the laws of the State of Delaware, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">15. Contact</h2>
            <p className="mb-4 text-foreground-secondary">
              Questions about these Terms? Contact us at legal@photoproos.com
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-[var(--card-border)] pt-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/privacy" className="text-sm text-[var(--primary)] hover:underline">
              Privacy Policy
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
