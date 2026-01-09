import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | PhotoProOS",
  description: "Learn how PhotoProOS uses cookies and similar technologies to improve your experience.",
};

export default function CookiePolicyPage() {
  const lastUpdated = "January 1, 2025";

  return (
    <main className="relative min-h-screen bg-background" data-element="legal-cookies-page">
      <article className="mx-auto max-w-4xl px-6 py-16 lg:py-24" data-element="legal-cookies-article">
        <header className="mb-12 border-b border-[var(--card-border)] pb-8" data-element="legal-cookies-header">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Cookie Policy
          </h1>
          <p className="text-foreground-secondary">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="prose prose-invert max-w-none" data-element="legal-cookies-content">
          <section className="mb-10" data-element="legal-cookies-what-section">
            <h2 className="mb-4 text-2xl font-bold text-foreground">What Are Cookies?</h2>
            <p className="mb-4 text-foreground-secondary">
              Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences, understand how you use the site, and improve your experience.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">How We Use Cookies</h2>
            <p className="mb-4 text-foreground-secondary">
              PhotoProOS uses cookies and similar technologies for several purposes:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly. These enable core features like user authentication, security, and account management.</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website by collecting anonymous analytics data.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings to provide a personalized experience.</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Types of Cookies We Use</h2>

            <div className="mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Essential Cookies</h3>
              <p className="mb-4 text-sm text-foreground-secondary">
                These cookies are necessary for the website to function and cannot be switched off.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--card-border)]">
                      <th className="pb-2 text-left font-medium text-foreground">Cookie</th>
                      <th className="pb-2 text-left font-medium text-foreground">Purpose</th>
                      <th className="pb-2 text-left font-medium text-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground-secondary">
                    <tr className="border-b border-[var(--card-border)]">
                      <td className="py-2">__session</td>
                      <td className="py-2">User authentication session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b border-[var(--card-border)]">
                      <td className="py-2">__clerk_*</td>
                      <td className="py-2">Authentication provider (Clerk)</td>
                      <td className="py-2">Varies</td>
                    </tr>
                    <tr>
                      <td className="py-2">csrf_token</td>
                      <td className="py-2">Security - prevents cross-site attacks</td>
                      <td className="py-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Performance Cookies</h3>
              <p className="mb-4 text-sm text-foreground-secondary">
                These cookies help us understand how visitors interact with our website.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--card-border)]">
                      <th className="pb-2 text-left font-medium text-foreground">Cookie</th>
                      <th className="pb-2 text-left font-medium text-foreground">Purpose</th>
                      <th className="pb-2 text-left font-medium text-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground-secondary">
                    <tr className="border-b border-[var(--card-border)]">
                      <td className="py-2">_ga, _gid</td>
                      <td className="py-2">Google Analytics</td>
                      <td className="py-2">2 years / 24 hours</td>
                    </tr>
                    <tr>
                      <td className="py-2">_vercel_*</td>
                      <td className="py-2">Performance monitoring</td>
                      <td className="py-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Functional Cookies</h3>
              <p className="mb-4 text-sm text-foreground-secondary">
                These cookies enable enhanced functionality and personalization.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--card-border)]">
                      <th className="pb-2 text-left font-medium text-foreground">Cookie</th>
                      <th className="pb-2 text-left font-medium text-foreground">Purpose</th>
                      <th className="pb-2 text-left font-medium text-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground-secondary">
                    <tr className="border-b border-[var(--card-border)]">
                      <td className="py-2">theme</td>
                      <td className="py-2">Remember theme preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2">locale</td>
                      <td className="py-2">Language preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Third-Party Cookies</h2>
            <p className="mb-4 text-foreground-secondary">
              Some cookies are placed by third-party services that appear on our pages:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
              <li><strong>Cloudflare:</strong> Security and performance optimization</li>
              <li><strong>Intercom:</strong> Customer support chat widget</li>
              <li><strong>Google Analytics:</strong> Website analytics and insights</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Managing Cookies</h2>
            <p className="mb-4 text-foreground-secondary">
              You can control and manage cookies in several ways:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites.</li>
              <li><strong>Cookie Banner:</strong> When you first visit our site, you can choose which types of cookies to accept.</li>
              <li><strong>Opt-Out Links:</strong> For analytics cookies, you can use Google's opt-out browser add-on.</li>
            </ul>
            <p className="mb-4 text-foreground-secondary">
              Please note that blocking essential cookies may impact the functionality of our website and prevent you from using certain features.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Browser-Specific Instructions</h2>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Updates to This Policy</h2>
            <p className="mb-4 text-foreground-secondary">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Contact Us</h2>
            <p className="mb-4 text-foreground-secondary">
              If you have questions about our use of cookies, please contact us at privacy@photoproos.com
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-[var(--card-border)] pt-8" data-element="legal-cookies-footer">
          <div className="flex flex-wrap gap-4" data-element="legal-cookies-footer-links">
            <Link href="/legal/privacy" className="text-sm text-[var(--primary)] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="text-sm text-[var(--primary)] hover:underline">
              Terms of Service
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
