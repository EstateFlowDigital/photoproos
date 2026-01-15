import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isSuperAdmin } from "@/lib/auth/super-admin";

// Types for AI generation requests
interface GenerateRequest {
  field: string;
  currentValue?: string;
  context: {
    pageType: string;
    pageTitle?: string;
    topic?: string;
    industry?: string;
    tone?: "professional" | "casual" | "friendly" | "formal";
  };
}

// Field-specific prompts
const FIELD_PROMPTS: Record<string, (context: GenerateRequest["context"], currentValue?: string) => string> = {
  metaTitle: (context, currentValue) => `
Generate 3 SEO-optimized page titles for a ${context.pageType} page${context.topic ? ` about ${context.topic}` : ""}.
${context.pageTitle ? `Page title: "${context.pageTitle}"` : ""}
${currentValue ? `Current meta title: "${currentValue}"` : ""}
${context.industry ? `Industry: ${context.industry}` : ""}

Requirements:
- 50-60 characters each
- Include primary keyword naturally
- Make it compelling and click-worthy
- Don't use clickbait or ALL CAPS
- Include the brand name "PhotoProOS" if appropriate

Return exactly 3 suggestions, one per line, no numbering or bullet points.
`,

  metaDescription: (context, currentValue) => `
Generate 3 compelling meta descriptions for a ${context.pageType} page${context.topic ? ` about ${context.topic}` : ""}.
${context.pageTitle ? `Page title: "${context.pageTitle}"` : ""}
${currentValue ? `Current meta description: "${currentValue}"` : ""}
${context.industry ? `Industry: ${context.industry}` : ""}

Requirements:
- 150-160 characters each
- Include a clear call-to-action
- Highlight key benefits
- Use active voice
- Make it engaging without being clickbaity

Return exactly 3 suggestions, one per line, no numbering or bullet points.
`,

  headline: (context, currentValue) => `
Generate 3 attention-grabbing headlines for a ${context.pageType} page${context.topic ? ` about ${context.topic}` : ""}.
${context.pageTitle ? `Page title: "${context.pageTitle}"` : ""}
${currentValue ? `Current headline: "${currentValue}"` : ""}
${context.industry ? `Industry: ${context.industry}` : ""}
Tone: ${context.tone || "professional"}

Requirements:
- Clear and concise (max 10 words)
- Communicate the core value proposition
- Use power words that resonate with photographers
- Avoid jargon and buzzwords
- Make it memorable

Return exactly 3 suggestions, one per line, no numbering or bullet points.
`,

  subheadline: (context, currentValue) => `
Generate 3 supporting subheadlines for a ${context.pageType} page${context.topic ? ` about ${context.topic}` : ""}.
${context.pageTitle ? `Page title: "${context.pageTitle}"` : ""}
${currentValue ? `Current subheadline: "${currentValue}"` : ""}
${context.industry ? `Industry: ${context.industry}` : ""}
Tone: ${context.tone || "professional"}

Requirements:
- 15-25 words each
- Expand on the headline's promise
- Include specific benefits or outcomes
- Address the target audience's pain points
- Use conversational but professional language

Return exactly 3 suggestions, one per line, no numbering or bullet points.
`,

  ctaText: (context, currentValue) => `
Generate 3 call-to-action button texts for a ${context.pageType} page${context.topic ? ` about ${context.topic}` : ""}.
${currentValue ? `Current CTA: "${currentValue}"` : ""}

Requirements:
- 2-5 words each
- Action-oriented (start with a verb)
- Create urgency without being pushy
- Clear about what happens next
- Avoid generic phrases like "Learn More" or "Click Here"

Return exactly 3 suggestions, one per line, no numbering or bullet points.
`,

  featureTitle: (context, currentValue) => `
Generate 3 feature titles for a ${context.pageType} page${context.topic ? ` about ${context.topic}` : ""}.
${currentValue ? `Current title: "${currentValue}"` : ""}
${context.industry ? `Industry: ${context.industry}` : ""}

Requirements:
- 3-6 words each
- Clear and benefit-focused
- Avoid technical jargon
- Use active voice
- Make it scannable

Return exactly 3 suggestions, one per line, no numbering or bullet points.
`,

  featureDescription: (context, currentValue) => `
Generate 3 feature descriptions for a ${context.pageType} page${context.topic ? ` about ${context.topic}` : ""}.
${currentValue ? `Current description: "${currentValue}"` : ""}
${context.industry ? `Industry: ${context.industry}` : ""}

Requirements:
- 15-30 words each
- Focus on benefits, not just features
- Use "you" to address the reader
- Include specific outcomes when possible
- Keep it scannable

Return exactly 3 suggestions, one per line, no numbering or bullet points.
`,
};

// Generic content improvement prompt
const GENERIC_PROMPT = (field: string, context: GenerateRequest["context"], currentValue?: string) => `
Improve this content for a ${context.pageType} page${context.topic ? ` about ${context.topic}` : ""}.
Field: ${field}
${currentValue ? `Current content: "${currentValue}"` : ""}
${context.industry ? `Industry: ${context.industry}` : ""}
Tone: ${context.tone || "professional"}

Generate 3 improved versions that are:
- Clear and compelling
- Professional but approachable
- Benefit-focused
- Appropriate for a B2B photography software

Return exactly 3 suggestions, one per line, no numbering or bullet points.
`;

/**
 * POST /api/cms/ai/generate
 * Generate AI content suggestions
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json() as GenerateRequest;
    const { field, currentValue, context } = body;

    if (!field || !context) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the appropriate prompt
    const promptFn = FIELD_PROMPTS[field];
    const prompt = promptFn
      ? promptFn(context, currentValue)
      : GENERIC_PROMPT(field, context, currentValue);

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return mock suggestions for development
      return NextResponse.json({
        suggestions: generateMockSuggestions(field, context),
        source: "mock",
      });
    }

    // Call Anthropic API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Split into individual suggestions
    const suggestions = content.text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 3);

    return NextResponse.json({
      suggestions,
      source: "anthropic",
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

/**
 * Generate mock suggestions for development/testing
 */
function generateMockSuggestions(
  field: string,
  context: GenerateRequest["context"]
): string[] {
  const mockData: Record<string, string[]> = {
    metaTitle: [
      `${context.pageType === "pricing" ? "Pricing Plans" : context.pageTitle || "Photography Business"} | PhotoProOS`,
      `Professional ${context.topic || "Photography"} Software - PhotoProOS`,
      `${context.topic || "Grow Your Photography Business"} | PhotoProOS Platform`,
    ],
    metaDescription: [
      `Streamline your photography business with PhotoProOS. Manage clients, deliver galleries, and get paid faster. Start your free trial today.`,
      `The all-in-one platform for professional photographers. Client management, gallery delivery, and payment processing in one place.`,
      `Join thousands of photographers who use PhotoProOS to run their business. Easy setup, powerful features, exceptional support.`,
    ],
    headline: [
      "Run Your Photography Business Smarter",
      "Everything You Need in One Platform",
      "Focus on Photography, Not Paperwork",
    ],
    subheadline: [
      "Manage clients, deliver stunning galleries, and collect payments automatically with the platform built for professional photographers.",
      "Stop juggling multiple tools. PhotoProOS brings everything together so you can focus on what you love - taking amazing photos.",
      "Join 10,000+ photographers who've simplified their workflow and grown their business with our all-in-one platform.",
    ],
    ctaText: [
      "Start Free Trial",
      "Get Started Free",
      "Try PhotoProOS Free",
    ],
    featureTitle: [
      "Smart Gallery Delivery",
      "Automated Payments",
      "Client Management",
    ],
    featureDescription: [
      "Deliver beautiful galleries that wow your clients. They'll love browsing, sharing, and purchasing prints directly from your branded portal.",
      "Set it and forget it. Automatic payment reminders, flexible payment plans, and secure checkout mean you get paid on time, every time.",
      "Keep all your client information organized in one place. Track projects, communications, and preferences with ease.",
    ],
  };

  return mockData[field] || [
    "Professional content suggestion 1",
    "Professional content suggestion 2",
    "Professional content suggestion 3",
  ];
}
