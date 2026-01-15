import { Metadata } from "next";
import Link from "next/link";
import { getLegalContent } from "@/lib/marketing/content";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getLegalContent("dpa");
  return {
    title: meta.title || "Data Processing Agreement | PhotoProOS",
    description: meta.description || "Data Processing Agreement (DPA) for PhotoProOS services.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

export default function DPAPage() {
  const lastUpdated = "January 1, 2025";

  return (
    <main className="relative min-h-screen bg-background" data-element="legal-dpa-page">
      <article className="mx-auto max-w-4xl px-6 py-16 lg:py-24" data-element="legal-dpa-article">
        <header className="mb-12 border-b border-[var(--card-border)] pb-8" data-element="legal-dpa-header">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Data Processing Agreement
          </h1>
          <p className="text-foreground-secondary">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="prose prose-invert max-w-none" data-element="legal-dpa-content">
          <section className="mb-10" data-element="legal-dpa-intro-section">
            <p className="mb-4 text-foreground-secondary">
              This Data Processing Agreement ("DPA") forms part of the Terms of Service between PhotoProOS, Inc. ("Processor", "we", "us") and the customer agreeing to these terms ("Controller", "you"). This DPA applies to the processing of personal data by PhotoProOS on behalf of the Controller.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">1. Definitions</h2>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</li>
              <li><strong>"Data Subject"</strong> means the individual to whom Personal Data relates.</li>
              <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, storage, use, and deletion.</li>
              <li><strong>"Sub-processor"</strong> means any third party engaged by the Processor to process Personal Data on behalf of the Controller.</li>
              <li><strong>"Data Protection Laws"</strong> means all applicable laws relating to the processing of Personal Data, including GDPR, CCPA, and other relevant regulations.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">2. Scope and Purpose</h2>
            <p className="mb-4 text-foreground-secondary">
              This DPA applies when PhotoProOS processes Personal Data on behalf of the Controller in connection with the PhotoProOS services. The purpose of processing is to provide the photography business management platform services described in the Terms of Service.
            </p>
            <p className="mb-4 text-foreground-secondary">
              Categories of Personal Data processed may include:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Client contact information (names, email addresses, phone numbers)</li>
              <li>Client business information (company names, addresses)</li>
              <li>Photo metadata (file names, dates, locations)</li>
              <li>Payment and billing information</li>
              <li>Communication records</li>
              <li>Booking and scheduling data</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">3. Obligations of the Processor</h2>
            <p className="mb-4 text-foreground-secondary">
              PhotoProOS agrees to:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Process Personal Data only on documented instructions from the Controller</li>
              <li>Ensure that personnel authorized to process Personal Data are bound by confidentiality obligations</li>
              <li>Implement appropriate technical and organizational security measures</li>
              <li>Assist the Controller in responding to Data Subject requests</li>
              <li>Assist the Controller in ensuring compliance with security, breach notification, and impact assessment obligations</li>
              <li>Delete or return all Personal Data upon termination of services, at the Controller's choice</li>
              <li>Make available information necessary to demonstrate compliance with this DPA</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">4. Security Measures</h2>
            <p className="mb-4 text-foreground-secondary">
              PhotoProOS implements the following security measures:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>256-bit TLS encryption for all data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Multi-factor authentication for access controls</li>
              <li>Regular security assessments and penetration testing</li>
              <li>SOC 2 Type II certification</li>
              <li>Automated backup systems with geographic redundancy</li>
              <li>Access logging and monitoring</li>
              <li>Employee security training programs</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">5. Sub-processors</h2>
            <p className="mb-4 text-foreground-secondary">
              The Controller grants general authorization for PhotoProOS to engage Sub-processors. Current Sub-processors include:
            </p>
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="pb-2 text-left font-medium text-foreground">Sub-processor</th>
                    <th className="pb-2 text-left font-medium text-foreground">Purpose</th>
                    <th className="pb-2 text-left font-medium text-foreground">Location</th>
                  </tr>
                </thead>
                <tbody className="text-foreground-secondary">
                  <tr className="border-b border-[var(--card-border)]">
                    <td className="py-2">Cloudflare</td>
                    <td className="py-2">CDN and security</td>
                    <td className="py-2">Global</td>
                  </tr>
                  <tr className="border-b border-[var(--card-border)]">
                    <td className="py-2">Stripe</td>
                    <td className="py-2">Payment processing</td>
                    <td className="py-2">United States</td>
                  </tr>
                  <tr className="border-b border-[var(--card-border)]">
                    <td className="py-2">Clerk</td>
                    <td className="py-2">Authentication</td>
                    <td className="py-2">United States</td>
                  </tr>
                  <tr className="border-b border-[var(--card-border)]">
                    <td className="py-2">Railway</td>
                    <td className="py-2">Database hosting</td>
                    <td className="py-2">United States</td>
                  </tr>
                  <tr>
                    <td className="py-2">Resend</td>
                    <td className="py-2">Email delivery</td>
                    <td className="py-2">United States</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4 text-foreground-secondary">
              PhotoProOS will notify the Controller of any intended changes to Sub-processors, allowing the Controller to object to such changes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">6. Data Transfers</h2>
            <p className="mb-4 text-foreground-secondary">
              Personal Data may be transferred to countries outside the European Economic Area. Such transfers are protected by:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Adequacy decisions where applicable</li>
              <li>Additional supplementary measures as required</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">7. Data Subject Rights</h2>
            <p className="mb-4 text-foreground-secondary">
              PhotoProOS will assist the Controller in fulfilling its obligation to respond to Data Subject requests, including requests to:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Access their Personal Data</li>
              <li>Rectify inaccurate Personal Data</li>
              <li>Erase Personal Data</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">8. Data Breach Notification</h2>
            <p className="mb-4 text-foreground-secondary">
              In the event of a Personal Data breach, PhotoProOS will:
            </p>
            <ul className="mb-4 list-disc pl-6 text-foreground-secondary">
              <li>Notify the Controller without undue delay (and in any event within 72 hours) upon becoming aware of the breach</li>
              <li>Provide sufficient information to allow the Controller to meet any obligations to report or inform Data Subjects</li>
              <li>Take reasonable steps to mitigate the effects and minimize any damage</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">9. Audits</h2>
            <p className="mb-4 text-foreground-secondary">
              PhotoProOS will make available to the Controller all information necessary to demonstrate compliance with this DPA and allow for audits conducted by the Controller or an independent auditor. Such audits shall be subject to reasonable advance notice and shall not unreasonably interfere with PhotoProOS's business operations.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">10. Term and Termination</h2>
            <p className="mb-4 text-foreground-secondary">
              This DPA shall remain in effect for the duration of the Terms of Service. Upon termination, PhotoProOS will, at the Controller's choice, delete or return all Personal Data within 30 days, except where retention is required by applicable law.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-foreground">11. Contact</h2>
            <p className="mb-4 text-foreground-secondary">
              For questions about this DPA or to exercise your rights, contact us at:
            </p>
            <p className="mb-4 text-foreground-secondary">
              Email: privacy@photoproos.com<br />
              Address: PhotoProOS, Inc.
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-[var(--card-border)] pt-8" data-element="legal-dpa-footer">
          <div className="flex flex-wrap gap-4" data-element="legal-dpa-footer-links">
            <Link href="/legal/privacy" className="text-sm text-[var(--primary)] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="text-sm text-[var(--primary)] hover:underline">
              Terms of Service
            </Link>
            <Link href="/legal/security" className="text-sm text-[var(--primary)] hover:underline">
              Security
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
