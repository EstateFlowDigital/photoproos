import { getFAQsForPage } from "@/lib/marketing/content";
import { FAQSection, FAQSectionProps } from "./faq";

interface FAQWithCMSProps extends Omit<FAQSectionProps, 'faqs'> {
  /** The page identifier to fetch FAQs for (e.g., "homepage", "pricing") */
  page: string;
}

/**
 * Server component wrapper that fetches FAQs from CMS and passes to client FAQSection.
 * Falls back to hardcoded FAQs if CMS returns empty.
 */
export async function FAQWithCMS({ page, heading, subheading }: FAQWithCMSProps) {
  // Fetch FAQs targeted to this page from CMS
  const cmsFaqs = await getFAQsForPage(page);

  // Transform CMS FAQs to the format expected by FAQSection
  const faqs = cmsFaqs.length > 0
    ? cmsFaqs.map(faq => ({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      }))
    : undefined; // Let FAQSection use fallback

  return <FAQSection faqs={faqs} heading={heading} subheading={subheading} />;
}
