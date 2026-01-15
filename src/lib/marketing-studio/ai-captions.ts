"use server";

/**
 * AI Caption Generator for Marketing Studio
 *
 * Generates social media captions with customizable tone and style.
 * This implementation uses pre-built templates and can be extended
 * to use OpenAI or other AI providers in the future.
 */

import type { PlatformId } from "@/components/marketing-studio/types";

// ============================================================================
// TYPES
// ============================================================================

export type CaptionTone =
  | "professional"
  | "casual"
  | "inspirational"
  | "educational"
  | "promotional"
  | "storytelling";

export type CaptionLength = "short" | "medium" | "long";

export interface CaptionGeneratorOptions {
  platform: PlatformId;
  industry: string;
  tone: CaptionTone;
  length: CaptionLength;
  topic?: string;
  includeHashtags?: boolean;
  includeEmoji?: boolean;
  includeCallToAction?: boolean;
}

export interface GeneratedCaption {
  text: string;
  hashtags: string[];
  tone: CaptionTone;
}

// ============================================================================
// CAPTION TEMPLATES BY TONE AND INDUSTRY
// ============================================================================

const CAPTION_TEMPLATES: Record<CaptionTone, Record<string, string[]>> = {
  professional: {
    real_estate: [
      "Presenting this stunning property that perfectly balances modern design with timeless elegance. Every detail has been thoughtfully considered to create a space that truly feels like home.",
      "Excellence in real estate photography isn't just about capturing a space—it's about telling the story of a property's potential. Here's a glimpse into what makes this listing exceptional.",
      "Our commitment to showcasing properties in their best light helps sellers connect with the right buyers. This listing exemplifies the standard of quality we bring to every shoot.",
    ],
    commercial: [
      "Professional imagery that elevates your brand. This recent commercial project demonstrates the power of quality visual content in today's competitive market.",
      "Behind every successful brand is compelling visual storytelling. We're proud to have contributed to this client's marketing vision with our commercial photography services.",
      "Capturing the essence of your business through thoughtful commercial photography. This project showcases our dedication to delivering images that drive results.",
    ],
    events: [
      "Every event tells a story, and we're honored to capture those meaningful moments. This celebration was a testament to love, joy, and beautiful beginnings.",
      "Documenting life's most precious occasions with care and professionalism. This event was filled with unforgettable moments that will be treasured for years to come.",
      "The art of event photography lies in anticipating moments before they happen. We're grateful to have been part of this special celebration.",
    ],
    portraits: [
      "Portrait photography is about more than just taking pictures—it's about revealing the authentic essence of each individual. This session was a privilege.",
      "Creating timeless portraits that capture personality and presence. Every session is an opportunity to tell someone's unique story through imagery.",
      "The connection between photographer and subject creates magic. This portrait session resulted in images that truly reflect the individual's character.",
    ],
    food: [
      "Culinary photography that makes an impression. This shoot for our client demonstrates how professional food imagery can elevate brand perception and drive appetite appeal.",
      "The art of food photography requires understanding both the culinary craft and visual storytelling. This project brought together both elements beautifully.",
      "Professional food photography that serves your brand's vision. Every dish deserves to be presented in a way that reflects its quality and craftsmanship.",
    ],
    product: [
      "Product photography that converts. This shoot demonstrates our commitment to creating images that showcase products in their best light while driving sales.",
      "Clean, compelling product imagery is essential for e-commerce success. This project exemplifies our approach to professional product photography.",
      "Every product has a story to tell. Our photography helps brands communicate quality, craftsmanship, and value through powerful visual content.",
    ],
  },
  casual: {
    real_estate: [
      "Just wrapped up this beautiful listing and had to share! Can you imagine waking up to these views every day? 🏡",
      "This home has all the vibes! From the kitchen to the backyard, every corner is just *chef's kiss*. Who else is dreaming of a space like this?",
      "Behind the scenes of today's shoot! Love when a property has so much natural light to work with. The photos practically take themselves!",
    ],
    commercial: [
      "Another day, another awesome business to photograph! Loved working with this team and capturing their brand's personality.",
      "When the lighting hits just right and the shots come together perfectly... there's no better feeling! Here's a peek at today's commercial shoot.",
      "Love what I do! Getting to help businesses look their best through photography is seriously the best job ever.",
    ],
    events: [
      "The happy tears, the laughter, the dancing—this event had it all! So grateful to capture these beautiful memories.",
      "Events like this remind me why I picked up a camera in the first place. Pure joy captured in every frame!",
      "Behind every great party is a photographer catching all the candid moments nobody sees. Here's a favorite from this weekend!",
    ],
    portraits: [
      "When the session flows naturally and we get shots like THIS! Love when clients relax and let their personality shine through.",
      "Portrait days are the best days! Got to hang with some amazing people today and capture some seriously stunning images.",
      "That moment when you nail the shot and see the excitement in your client's eyes... priceless! Here's a sneak peek!",
    ],
    food: [
      "Making food look as good as it tastes! This dish was almost too pretty to eat... almost. 🍽️",
      "Food photography day = best day! Got to smell amazing food all day AND take cool photos. Win-win!",
      "When the food is this photogenic, my job becomes so easy! Just look at those colors!",
    ],
    product: [
      "Getting creative with today's product shoot! Love finding new angles and setups that make products pop.",
      "Behind the scenes of a fun product photography day! It's all about the details, lighting, and a little creativity.",
      "When a product photographs this well, you know it's going to be a good shoot day!",
    ],
  },
  inspirational: {
    real_estate: [
      "Home is not just a place—it's a feeling. May you find spaces that inspire your greatest dreams and comfort your weary soul.",
      "Every home holds the potential for countless stories, memories, and dreams. What story will yours tell?",
      "The right space doesn't just shelter you—it transforms you. Here's to finding the home that helps you become who you're meant to be.",
    ],
    commercial: [
      "Great brands are built on vision, passion, and the courage to stand out. May your business journey be filled with success beyond measure.",
      "Every business started with someone brave enough to chase a dream. Here's to the entrepreneurs making their vision reality.",
      "Your brand has a unique story to tell. May you find the courage to share it with the world in ways that inspire others.",
    ],
    events: [
      "Life's most precious moments deserve to be celebrated fully and remembered forever. Cherish every gathering, every milestone, every connection.",
      "In a world that moves so fast, moments like these remind us what truly matters—love, laughter, and togetherness.",
      "Some moments change everything. May you be blessed with many such moments, each one more beautiful than the last.",
    ],
    portraits: [
      "There is no one else in the world quite like you. Your story, your journey, your essence—all uniquely yours. Embrace it.",
      "Behind every portrait is a story of courage, growth, and the beautiful journey of becoming. May you always see your own light.",
      "You are worthy of being seen, celebrated, and remembered. Your presence matters more than you know.",
    ],
    food: [
      "Food brings people together in ways nothing else can. Every meal is an opportunity for connection, celebration, and love.",
      "Behind every dish is a story of tradition, creativity, and the simple joy of nourishing others. Here's to the magic of food.",
      "The best meals aren't just about what's on the plate—they're about the memories created around the table.",
    ],
    product: [
      "Every great product starts with someone who believed they could make something better. Here's to the dreamers and makers.",
      "Behind every product is a vision of making life a little easier, a little brighter, a little better. That matters.",
      "The things we create reflect who we are and what we value. May your work always align with your deepest purpose.",
    ],
  },
  educational: {
    real_estate: [
      "Did you know that properties with professional photography sell 32% faster? Here's why quality imagery matters in real estate marketing.",
      "Pro tip: The best time for real estate photography is during the 'golden hour' when natural light creates warm, inviting tones. Here's an example!",
      "Three key elements that make real estate photos stand out: proper staging, optimal lighting, and thoughtful composition. Let's break it down...",
    ],
    commercial: [
      "Why do successful brands invest in professional photography? Studies show that high-quality images increase customer trust by up to 67%.",
      "Commercial photography tip: Consistency across your brand imagery builds recognition and trust. Here's how we approach brand cohesion...",
      "Behind effective commercial photography: understanding your target audience, telling your brand story, and creating emotional connections.",
    ],
    events: [
      "Event photography tip: The best candid shots happen when people forget the camera is there. Here's how professional photographers capture authentic moments.",
      "Planning an event? Here's why a shot list and timeline discussion with your photographer can make all the difference in capturing key moments.",
      "The secret to great event photography: preparation, positioning, and patience. Let me share what goes into capturing memorable moments...",
    ],
    portraits: [
      "Portrait lighting tip: Soft, diffused light creates flattering images by reducing harsh shadows. Here's an example of using natural window light.",
      "Why do professional headshots matter? First impressions are formed in 7 seconds, and your photo is often the first thing people see online.",
      "Three tips for feeling confident in your portrait session: choose comfortable clothing, take deep breaths, and trust your photographer's guidance.",
    ],
    food: [
      "Food photography tip: Styling with odd numbers creates more visually interesting compositions. Notice how we used the 'rule of threes' here.",
      "The science of food photography: warm tones stimulate appetite, which is why we often use golden lighting for culinary shots.",
      "Pro tip: Fresh ingredients photograph better than cooked ones. That's why food stylists often work with raw or slightly undercooked items.",
    ],
    product: [
      "E-commerce insight: Products with multiple angle views see 40% higher conversion rates. Here's why comprehensive product photography matters.",
      "Product photography tip: A clean, consistent background keeps focus on the product and creates a professional, cohesive brand presence.",
      "The key to great product photos: understanding your target customer and showcasing features that matter most to them.",
    ],
  },
  promotional: {
    real_estate: [
      "Ready to sell your property faster? Our professional real estate photography packages are designed to make your listing stand out. Book your session today!",
      "Limited availability for Q1 real estate shoots! Secure your spot and give your listings the professional imagery they deserve. Link in bio to book.",
      "Special offer: First-time clients receive 20% off their real estate photography package. Let's make your listings shine! DM for details.",
    ],
    commercial: [
      "Elevate your brand with professional commercial photography. Limited spots available this month—book now and let's create content that converts!",
      "New year, new brand imagery? Our commercial photography packages are designed to help your business stand out. Get in touch to discuss your vision!",
      "Is your brand making the right impression? Let's create compelling visual content that drives results. Book your consultation today!",
    ],
    events: [
      "Booking now for 2026 events! Whether it's a wedding, corporate event, or celebration, let's capture your special moments. Limited dates available!",
      "Make your event unforgettable with professional photography. Our packages include everything you need for stunning memories. Inquire today!",
      "Early bird special: Book your event photography package this month and receive a complimentary engagement session. Don't miss out!",
    ],
    portraits: [
      "Your perfect portrait session awaits! Book now and receive professionally edited images that capture your authentic self. Link in bio!",
      "Update your headshots for the new year! Professional portrait sessions available now. DM to book your spot!",
      "Gift idea: Give the gift of professional portraits! Digital gift cards available for any amount. Perfect for holidays, birthdays, and special occasions.",
    ],
    food: [
      "Restaurant owners: Upgrade your menu imagery with professional food photography. Our packages are designed for maximum visual impact. Inquire today!",
      "Make your food irresistible! Professional culinary photography that drives hungry customers to your door. Book your session now!",
      "New menu items deserve new photos! Let's create stunning imagery that makes mouths water and drives orders. Link in bio to get started.",
    ],
    product: [
      "E-commerce brands: Is your product photography converting? Let's create images that sell! Book your product shoot today and see the difference.",
      "Launch your products with confidence! Our professional product photography packages ensure your items look their absolute best. Inquire now!",
      "First-time clients: 15% off product photography packages this month! Let's make your products shine. DM for details.",
    ],
  },
  storytelling: {
    real_estate: [
      "This home has witnessed 50 years of family dinners, holiday celebrations, and quiet Sunday mornings. Now it's ready to write a new chapter with its next owners.",
      "When the current owners first walked through this door, they knew they'd found something special. Ten years later, every corner holds a treasured memory.",
      "A home is just a house until someone fills it with life. This property's story is waiting to be continued—perhaps by you.",
    ],
    commercial: [
      "This brand started in a garage with one idea and a lot of determination. Today, they're changing their industry. We're honored to help tell their story.",
      "Behind this business is a team that believes in doing things differently. Their passion shows in every detail—and we captured it in every frame.",
      "Every successful business has a founding story. This one began with a simple question: 'What if we could do this better?' The answer changed everything.",
    ],
    events: [
      "They met in a coffee shop, bonded over terrible jokes, and five years later, they danced under the stars as husband and wife. This is their story.",
      "This wasn't just a celebration—it was years of love, challenges, and growth coming together in one perfect moment. We were honored to capture it.",
      "Some events mark endings, others mark beginnings. This one marked both—and every emotion in between was written on their faces.",
    ],
    portraits: [
      "Behind this smile is a woman who conquered her fears, changed careers at 40, and finally feels like herself. This portrait celebrates her journey.",
      "He almost didn't book this session. 'I'm not photogenic,' he said. But courage isn't about being comfortable—it's about showing up anyway.",
      "This portrait marks a milestone: the first time she saw herself the way others see her—confident, capable, beautiful.",
    ],
    food: [
      "This recipe has been passed down through four generations. Each dish carries the love, memories, and traditions of those who made it before.",
      "The chef calls this dish 'home.' It reminds them of their grandmother's kitchen, the smell of spices, and lessons learned at the stove.",
      "Food has a way of connecting us to people and places we've never known. This plate tells a story that spans continents and generations.",
    ],
    product: [
      "This product began as a sketch on a napkin during a sleepless night. Three years and countless prototypes later, it's changing lives.",
      "The founder created this product after their own frustrating search came up empty. 'If it doesn't exist, I'll make it,' they decided.",
      "Behind every great product is someone who refused to accept 'good enough.' This is the story of one such person and their vision.",
    ],
  },
};

// ============================================================================
// HASHTAG TEMPLATES BY INDUSTRY
// ============================================================================

const INDUSTRY_HASHTAGS: Record<string, string[]> = {
  real_estate: [
    "#realestate",
    "#realestatelife",
    "#realestatephotography",
    "#property",
    "#homesweethome",
    "#dreamhome",
    "#househunting",
    "#homedesign",
    "#interiordesign",
    "#architecture",
  ],
  commercial: [
    "#commercialphotography",
    "#branding",
    "#brandphotography",
    "#businessphotography",
    "#corporatephotography",
    "#marketing",
    "#visualcontent",
    "#brandstory",
    "#businessowner",
    "#entrepreneur",
  ],
  events: [
    "#eventphotography",
    "#weddingphotography",
    "#celebrations",
    "#partymoments",
    "#eventplanning",
    "#specialmoments",
    "#memoriesforlife",
    "#eventcoverage",
    "#weddingday",
    "#corporateevents",
  ],
  portraits: [
    "#portraitphotography",
    "#portraits",
    "#headshots",
    "#professionalphotography",
    "#portraitmode",
    "#photooftheday",
    "#portraiture",
    "#personalbranding",
    "#headshotphotographer",
    "#naturallightportrait",
  ],
  food: [
    "#foodphotography",
    "#foodstyling",
    "#foodie",
    "#culinaryphotography",
    "#restaurantphotography",
    "#instafood",
    "#foodstagram",
    "#delicious",
    "#gastronomia",
    "#cheflife",
  ],
  product: [
    "#productphotography",
    "#ecommerce",
    "#productshoot",
    "#commercialproduct",
    "#studioshoot",
    "#productphoto",
    "#brandphotography",
    "#packagingdesign",
    "#productdesign",
    "#amazonphotography",
  ],
};

// ============================================================================
// CALL TO ACTION TEMPLATES
// ============================================================================

const CALL_TO_ACTIONS = [
  "Link in bio to learn more!",
  "DM us to book your session!",
  "What do you think? Let us know in the comments!",
  "Double tap if you agree!",
  "Save this for later!",
  "Share with someone who needs to see this!",
  "Book your session today—link in bio!",
  "Follow for more content like this!",
  "Tag someone who would love this!",
  "Drop a comment below!",
];

// ============================================================================
// EMOJI SETS BY TONE
// ============================================================================

const TONE_EMOJIS: Record<CaptionTone, string[]> = {
  professional: ["📸", "✨", "🎯", "💼", "🏆"],
  casual: ["📷", "✨", "😍", "🔥", "💕", "🙌", "⭐"],
  inspirational: ["✨", "🌟", "💫", "🙏", "❤️", "🌅"],
  educational: ["📚", "💡", "🎓", "📝", "👆", "🔍"],
  promotional: ["🎉", "⭐", "🔥", "📣", "💥", "🎁"],
  storytelling: ["📖", "✨", "💭", "🌟", "❤️", "🎬"],
};

// ============================================================================
// CAPTION GENERATION FUNCTION
// ============================================================================

export async function generateCaption(
  options: CaptionGeneratorOptions
): Promise<GeneratedCaption> {
  const {
    tone,
    industry,
    length,
    includeHashtags = true,
    includeEmoji = true,
    includeCallToAction = false,
  } = options;

  // Simulate API delay for realistic UX
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

  // Get templates for the selected tone and industry
  const industryKey = industry.toLowerCase().replace(/\s+/g, "_");
  const templates =
    CAPTION_TEMPLATES[tone]?.[industryKey] || CAPTION_TEMPLATES[tone]?.commercial || [];

  // Select a random template
  let caption = templates[Math.floor(Math.random() * templates.length)] || "";

  // Adjust length
  if (length === "short" && caption.length > 150) {
    // Truncate to first sentence
    const firstSentence = caption.split(/[.!?]/)[0];
    caption = firstSentence ? firstSentence + "." : caption.substring(0, 140) + "...";
  } else if (length === "long") {
    // Add more context
    const additionalContext = templates[Math.floor(Math.random() * templates.length)];
    if (additionalContext && additionalContext !== caption) {
      caption = caption + "\n\n" + additionalContext;
    }
  }

  // Add emoji if enabled
  if (includeEmoji) {
    const emojis = TONE_EMOJIS[tone] || TONE_EMOJIS.casual;
    const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    caption = selectedEmoji + " " + caption;
  }

  // Add call to action if enabled
  if (includeCallToAction) {
    const cta = CALL_TO_ACTIONS[Math.floor(Math.random() * CALL_TO_ACTIONS.length)];
    caption = caption + "\n\n" + cta;
  }

  // Select hashtags
  let hashtags: string[] = [];
  if (includeHashtags) {
    const industryTags = INDUSTRY_HASHTAGS[industryKey] || INDUSTRY_HASHTAGS.commercial;
    // Select 5-8 random hashtags
    const shuffled = [...industryTags].sort(() => Math.random() - 0.5);
    hashtags = shuffled.slice(0, 5 + Math.floor(Math.random() * 4));

    // Add hashtags to caption
    caption = caption + "\n\n" + hashtags.join(" ");
  }

  return {
    text: caption,
    hashtags,
    tone,
  };
}

// ============================================================================
// CAPTION VARIATIONS GENERATOR
// ============================================================================

export async function generateCaptionVariations(
  options: CaptionGeneratorOptions,
  count: number = 3
): Promise<GeneratedCaption[]> {
  const variations: GeneratedCaption[] = [];

  for (let i = 0; i < count; i++) {
    const caption = await generateCaption(options);
    variations.push(caption);
  }

  return variations;
}
