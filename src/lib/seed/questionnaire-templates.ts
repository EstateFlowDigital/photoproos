// @ts-nocheck
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { Industry, FormFieldType, LegalAgreementType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

type TemplateField = {
  label: string;
  type: FormFieldType;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  section?: string;
  sectionOrder?: number;
  validation?: Record<string, unknown>;
  conditionalOn?: string;
  conditionalValue?: string;
};

type TemplateAgreement = {
  agreementType: LegalAgreementType;
  title: string;
  content: string;
  isRequired: boolean;
  requiresSignature: boolean;
};

type SystemTemplate = {
  name: string;
  slug: string;
  description: string;
  industry: Industry;
  fields: TemplateField[];
  agreements: TemplateAgreement[];
};

// ============================================================================
// LEGAL AGREEMENT CONTENT
// ============================================================================

const PROPERTY_ACCESS_AGREEMENT = `
## Property Access Authorization

By completing this form, you authorize the photographer and their team to access the property at the address provided for the purpose of capturing professional photographs.

**Terms:**
1. Access will be limited to the scheduled appointment time
2. The photographer will treat the property with respect and care
3. All personal items photographed will be handled carefully
4. The property owner/agent assumes responsibility for securing valuables

**Liability:**
The photographer is not responsible for any items left unsecured during the photo session.
`;

const PHOTO_LICENSING_AGREEMENT = `
## Photography Licensing Agreement

**Grant of License:**
The photographer grants the client a non-exclusive license to use the delivered photographs for:
- Marketing and advertising the listed property
- MLS and real estate listing platforms
- Print and digital marketing materials
- Social media promotion of the listing

**Restrictions:**
- Photos may not be resold or transferred to third parties
- Photos may not be used for purposes other than marketing the specific property
- Photographer retains copyright to all images
- Credit to the photographer is appreciated but not required

**Duration:**
This license remains valid for as long as the property is actively listed or for a period of 2 years, whichever comes first.
`;

const MODEL_RELEASE_AGREEMENT = `
## Model Release Agreement

I hereby grant permission to the photographer to use my likeness, image, and/or photograph in any and all forms of media, including but not limited to print, digital, social media, and advertising.

**Terms:**
1. I understand that my image may be edited, altered, or modified
2. I waive any right to inspect or approve the finished product
3. I release the photographer from any liability arising from the use of my image
4. I confirm I am over 18 years of age or have parental consent

**Compensation:**
No additional compensation is required beyond any previously agreed upon for the photo session.
`;

const WEDDING_CONTRACT_AGREEMENT = `
## Wedding Photography Agreement

**Coverage:**
The photographer agrees to provide professional photography coverage for your wedding event as discussed and confirmed in the booking.

**Terms:**
1. A non-refundable retainer is required to secure your date
2. Full payment is due 2 weeks before the wedding date
3. The photographer will deliver images within the agreed timeframe
4. The number of final edited images is approximate

**Cancellation Policy:**
- More than 90 days: Full refund minus retainer
- 30-90 days: 50% refund
- Less than 30 days: No refund

**Force Majeure:**
In the event of circumstances beyond either party's control, both parties will work in good faith to reschedule.
`;

const COMMERCIAL_LICENSE_AGREEMENT = `
## Commercial Photography License Agreement

**Usage Rights:**
The client is granted a license to use the delivered photographs for commercial purposes as specified in the project brief.

**Scope of License:**
- Duration: As specified in project agreement
- Territory: As specified in project agreement
- Media: All media including print, digital, web, and social
- Exclusivity: Non-exclusive unless otherwise agreed

**Restrictions:**
- Images may not be sublicensed without written permission
- Images may not be used in defamatory or illegal contexts
- Photographer retains copyright to all images

**Credit:**
Photo credit should be given where practical: "Photo by [Photographer Name]"
`;

const LIABILITY_WAIVER_AGREEMENT = `
## Liability Waiver

I understand and acknowledge that:

1. Photography sessions may involve physical activity and movement
2. The photographer is not responsible for injuries during the session
3. Outdoor sessions are subject to weather conditions
4. The client assumes all risks associated with the photo session location

**Release:**
I hereby release the photographer from any and all claims, damages, or liability arising from my participation in this photo session.

**Medical Conditions:**
I confirm that I have disclosed any medical conditions that may affect my ability to safely participate in the photo session.
`;

const SHOOT_CHECKLIST_AGREEMENT = `
## Pre-Shoot Checklist Confirmation

Please confirm you have completed the following preparations:

**For Property Shoots:**
- [ ] All lights working and turned on
- [ ] Property is clean and staged
- [ ] Personal items and clutter removed
- [ ] Pets secured or removed from property
- [ ] Parking available for photographer

**For Portrait Sessions:**
- [ ] Wardrobe selected and prepared
- [ ] Hair and makeup done (if applicable)
- [ ] Props gathered (if applicable)
- [ ] Location confirmed and accessible

**For Events:**
- [ ] Timeline finalized and shared
- [ ] Key contacts identified
- [ ] Special moments noted
- [ ] Vendor coordination confirmed

By checking this box, you confirm all preparations are complete.
`;

// ============================================================================
// REAL ESTATE TEMPLATES
// ============================================================================

const REAL_ESTATE_STANDARD: SystemTemplate = {
  name: "Standard Property Details",
  slug: "real-estate-standard",
  description: "Essential property information for residential real estate photography",
  industry: "real_estate",
  fields: [
    // Property Information Section
    {
      label: "Property Address",
      type: "address",
      placeholder: "Enter the full property address",
      isRequired: true,
      section: "Property Information",
      sectionOrder: 1,
    },
    {
      label: "Property Type",
      type: "select",
      isRequired: true,
      section: "Property Information",
      sectionOrder: 1,
      validation: {
        options: ["Single Family Home", "Townhouse", "Condo", "Multi-Family", "Land/Lot", "Commercial", "Other"],
      },
    },
    {
      label: "Square Footage",
      type: "number",
      placeholder: "e.g., 2500",
      helpText: "Approximate living space in square feet",
      isRequired: false,
      section: "Property Information",
      sectionOrder: 1,
    },
    {
      label: "Bedrooms",
      type: "number",
      isRequired: false,
      section: "Property Information",
      sectionOrder: 1,
    },
    {
      label: "Bathrooms",
      type: "number",
      helpText: "Include half baths (e.g., 2.5)",
      isRequired: false,
      section: "Property Information",
      sectionOrder: 1,
    },
    {
      label: "Year Built",
      type: "number",
      placeholder: "e.g., 1995",
      isRequired: false,
      section: "Property Information",
      sectionOrder: 1,
    },
    {
      label: "Listing Price",
      type: "text",
      placeholder: "$000,000",
      isRequired: false,
      section: "Property Information",
      sectionOrder: 1,
    },
    // Agent Information Section
    {
      label: "Agent Name",
      type: "text",
      isRequired: true,
      section: "Agent Information",
      sectionOrder: 2,
    },
    {
      label: "Agent Email",
      type: "email",
      isRequired: true,
      section: "Agent Information",
      sectionOrder: 2,
    },
    {
      label: "Agent Phone",
      type: "phone",
      isRequired: true,
      section: "Agent Information",
      sectionOrder: 2,
    },
    {
      label: "MLS Number",
      type: "text",
      placeholder: "If already listed",
      isRequired: false,
      section: "Agent Information",
      sectionOrder: 2,
    },
    {
      label: "Brokerage",
      type: "text",
      isRequired: false,
      section: "Agent Information",
      sectionOrder: 2,
    },
    // Access Information Section
    {
      label: "Lockbox Code",
      type: "text",
      helpText: "Enter code if property has a lockbox",
      isRequired: false,
      section: "Access Information",
      sectionOrder: 3,
    },
    {
      label: "Gate/Community Code",
      type: "text",
      helpText: "If property is in a gated community",
      isRequired: false,
      section: "Access Information",
      sectionOrder: 3,
    },
    {
      label: "Parking Instructions",
      type: "textarea",
      placeholder: "Where should the photographer park?",
      isRequired: false,
      section: "Access Information",
      sectionOrder: 3,
    },
    {
      label: "Is the property currently occupied?",
      type: "radio",
      isRequired: true,
      section: "Access Information",
      sectionOrder: 3,
      validation: { options: ["Yes - Occupied", "No - Vacant", "Partially (Some furniture)"] },
    },
    {
      label: "Are there pets at the property?",
      type: "radio",
      isRequired: true,
      section: "Access Information",
      sectionOrder: 3,
      validation: { options: ["No pets", "Yes - will be secured", "Yes - will be removed"] },
    },
    // Shoot Requirements Section
    {
      label: "Areas to Highlight",
      type: "textarea",
      placeholder: "Any special features or rooms you want emphasized?",
      helpText: "e.g., renovated kitchen, pool, view, etc.",
      isRequired: false,
      section: "Shoot Requirements",
      sectionOrder: 4,
    },
    {
      label: "Is the property fully staged?",
      type: "radio",
      isRequired: true,
      section: "Shoot Requirements",
      sectionOrder: 4,
      validation: { options: ["Yes - Fully staged", "Partially staged", "Not staged - use virtual staging"] },
    },
    {
      label: "Do you need twilight photos?",
      type: "radio",
      isRequired: false,
      section: "Shoot Requirements",
      sectionOrder: 4,
      validation: { options: ["Yes", "No", "Maybe - depends on property"] },
    },
    {
      label: "Additional Notes",
      type: "textarea",
      placeholder: "Any other information we should know?",
      isRequired: false,
      section: "Shoot Requirements",
      sectionOrder: 4,
    },
  ],
  agreements: [
    {
      agreementType: "property_release",
      title: "Property Access Authorization",
      content: PROPERTY_ACCESS_AGREEMENT,
      isRequired: true,
      requiresSignature: false,
    },
    {
      agreementType: "licensing_agreement",
      title: "Photo Licensing Agreement",
      content: PHOTO_LICENSING_AGREEMENT,
      isRequired: true,
      requiresSignature: false,
    },
  ],
};

const REAL_ESTATE_LUXURY: SystemTemplate = {
  name: "Luxury Property Details",
  slug: "real-estate-luxury",
  description: "Comprehensive questionnaire for luxury and high-end property photography",
  industry: "real_estate",
  fields: [
    // All standard fields plus luxury-specific
    ...REAL_ESTATE_STANDARD.fields,
    // Premium Features Section
    {
      label: "Marketing Go-Live Date",
      type: "date",
      helpText: "When will this property be listed?",
      isRequired: false,
      section: "Marketing Timeline",
      sectionOrder: 5,
    },
    {
      label: "Marketing Deadline",
      type: "date",
      helpText: "When do you need all deliverables?",
      isRequired: true,
      section: "Marketing Timeline",
      sectionOrder: 5,
    },
    {
      label: "Premium Features",
      type: "multiselect",
      helpText: "Select all premium features to highlight",
      isRequired: false,
      section: "Premium Features",
      sectionOrder: 6,
      validation: {
        options: [
          "Wine Cellar",
          "Home Theater",
          "Smart Home System",
          "Outdoor Kitchen",
          "Infinity Pool",
          "Tennis Court",
          "Guest House",
          "Home Gym",
          "Elevator",
          "Rooftop Deck",
        ],
      },
    },
    {
      label: "Target Buyer Profile",
      type: "textarea",
      placeholder: "Describe your ideal buyer...",
      helpText: "This helps us capture the right aesthetic",
      isRequired: false,
      section: "Marketing Strategy",
      sectionOrder: 7,
    },
    {
      label: "Drone Photography Required?",
      type: "radio",
      isRequired: true,
      section: "Premium Features",
      sectionOrder: 6,
      validation: { options: ["Yes - Full aerial coverage", "Yes - Limited shots", "No"] },
    },
    {
      label: "Video Walkthrough Required?",
      type: "radio",
      isRequired: true,
      section: "Premium Features",
      sectionOrder: 6,
      validation: { options: ["Yes - Cinematic video", "Yes - Basic walkthrough", "No"] },
    },
  ],
  agreements: REAL_ESTATE_STANDARD.agreements,
};

const REAL_ESTATE_COMMERCIAL: SystemTemplate = {
  name: "Commercial Property Details",
  slug: "real-estate-commercial",
  description: "Specialized questionnaire for commercial and industrial property photography",
  industry: "real_estate",
  fields: [
    {
      label: "Property Name/Building Name",
      type: "text",
      isRequired: true,
      section: "Property Information",
      sectionOrder: 1,
    },
    {
      label: "Property Address",
      type: "address",
      isRequired: true,
      section: "Property Information",
      sectionOrder: 1,
    },
    {
      label: "Property Type",
      type: "select",
      isRequired: true,
      section: "Property Information",
      sectionOrder: 1,
      validation: {
        options: ["Office", "Retail", "Industrial", "Warehouse", "Mixed-Use", "Medical", "Hospitality", "Other"],
      },
    },
    {
      label: "Total Square Footage",
      type: "number",
      isRequired: true,
      section: "Property Information",
      sectionOrder: 1,
    },
    {
      label: "Number of Units/Suites",
      type: "number",
      isRequired: false,
      section: "Property Information",
      sectionOrder: 1,
    },
    {
      label: "Property Manager Name",
      type: "text",
      isRequired: true,
      section: "Contact Information",
      sectionOrder: 2,
    },
    {
      label: "Property Manager Email",
      type: "email",
      isRequired: true,
      section: "Contact Information",
      sectionOrder: 2,
    },
    {
      label: "Property Manager Phone",
      type: "phone",
      isRequired: true,
      section: "Contact Information",
      sectionOrder: 2,
    },
    {
      label: "Building Hours",
      type: "text",
      placeholder: "e.g., Mon-Fri 8am-6pm",
      helpText: "When can we access the building?",
      isRequired: true,
      section: "Access Information",
      sectionOrder: 3,
    },
    {
      label: "Security Requirements",
      type: "textarea",
      placeholder: "Any security protocols we should know?",
      isRequired: false,
      section: "Access Information",
      sectionOrder: 3,
    },
    {
      label: "Elevator Access Available?",
      type: "radio",
      isRequired: true,
      section: "Access Information",
      sectionOrder: 3,
      validation: { options: ["Yes - Freight elevator", "Yes - Passenger only", "No elevator"] },
    },
    {
      label: "Loading Dock Access",
      type: "radio",
      isRequired: false,
      section: "Access Information",
      sectionOrder: 3,
      validation: { options: ["Yes", "No", "Not applicable"] },
    },
    {
      label: "Tenant Occupied Spaces",
      type: "textarea",
      placeholder: "List any spaces that cannot be photographed",
      isRequired: false,
      section: "Restrictions",
      sectionOrder: 4,
    },
  ],
  agreements: [
    {
      agreementType: "property_release",
      title: "Commercial Property Access Authorization",
      content: PROPERTY_ACCESS_AGREEMENT,
      isRequired: true,
      requiresSignature: true,
    },
    {
      agreementType: "licensing_agreement",
      title: "Commercial Photo Licensing",
      content: COMMERCIAL_LICENSE_AGREEMENT,
      isRequired: true,
      requiresSignature: false,
    },
  ],
};

// ============================================================================
// WEDDING/EVENTS TEMPLATES
// ============================================================================

const WEDDING_BASIC: SystemTemplate = {
  name: "Wedding Basic Information",
  slug: "wedding-basic",
  description: "Essential wedding details and couple information",
  industry: "events",
  fields: [
    {
      label: "Partner 1 Full Name",
      type: "text",
      isRequired: true,
      section: "Couple Information",
      sectionOrder: 1,
    },
    {
      label: "Partner 1 Phone",
      type: "phone",
      isRequired: true,
      section: "Couple Information",
      sectionOrder: 1,
    },
    {
      label: "Partner 1 Email",
      type: "email",
      isRequired: true,
      section: "Couple Information",
      sectionOrder: 1,
    },
    {
      label: "Partner 2 Full Name",
      type: "text",
      isRequired: true,
      section: "Couple Information",
      sectionOrder: 1,
    },
    {
      label: "Partner 2 Phone",
      type: "phone",
      isRequired: false,
      section: "Couple Information",
      sectionOrder: 1,
    },
    {
      label: "Partner 2 Email",
      type: "email",
      isRequired: false,
      section: "Couple Information",
      sectionOrder: 1,
    },
    {
      label: "Wedding Date",
      type: "date",
      isRequired: true,
      section: "Event Details",
      sectionOrder: 2,
    },
    {
      label: "Ceremony Venue",
      type: "text",
      isRequired: true,
      section: "Event Details",
      sectionOrder: 2,
    },
    {
      label: "Ceremony Address",
      type: "address",
      isRequired: true,
      section: "Event Details",
      sectionOrder: 2,
    },
    {
      label: "Reception Venue",
      type: "text",
      helpText: "Leave blank if same as ceremony",
      isRequired: false,
      section: "Event Details",
      sectionOrder: 2,
    },
    {
      label: "Reception Address",
      type: "address",
      isRequired: false,
      section: "Event Details",
      sectionOrder: 2,
    },
    {
      label: "Estimated Guest Count",
      type: "number",
      isRequired: true,
      section: "Event Details",
      sectionOrder: 2,
    },
    {
      label: "Wedding Style/Theme",
      type: "select",
      isRequired: false,
      section: "Style Preferences",
      sectionOrder: 3,
      validation: {
        options: ["Classic/Traditional", "Modern/Minimalist", "Rustic/Bohemian", "Glamorous/Luxury", "Beach/Destination", "Garden/Outdoor", "Other"],
      },
    },
    {
      label: "Color Palette",
      type: "text",
      placeholder: "e.g., Blush pink, gold, ivory",
      isRequired: false,
      section: "Style Preferences",
      sectionOrder: 3,
    },
    {
      label: "Any photography restrictions at the venue?",
      type: "textarea",
      helpText: "e.g., no flash during ceremony, restricted areas",
      isRequired: false,
      section: "Style Preferences",
      sectionOrder: 3,
    },
  ],
  agreements: [
    {
      agreementType: "terms_of_service",
      title: "Wedding Photography Contract",
      content: WEDDING_CONTRACT_AGREEMENT,
      isRequired: true,
      requiresSignature: true,
    },
  ],
};

const WEDDING_TIMELINE: SystemTemplate = {
  name: "Wedding Detailed Timeline",
  slug: "wedding-timeline",
  description: "Comprehensive wedding day timeline and logistics",
  industry: "events",
  fields: [
    // Getting Ready Section
    {
      label: "Partner 1 Getting Ready Location",
      type: "text",
      isRequired: true,
      section: "Getting Ready",
      sectionOrder: 1,
    },
    {
      label: "Partner 1 Getting Ready Address",
      type: "address",
      isRequired: true,
      section: "Getting Ready",
      sectionOrder: 1,
    },
    {
      label: "Partner 1 Getting Ready Start Time",
      type: "time",
      helpText: "When should the photographer arrive?",
      isRequired: true,
      section: "Getting Ready",
      sectionOrder: 1,
    },
    {
      label: "Partner 2 Getting Ready Location",
      type: "text",
      isRequired: true,
      section: "Getting Ready",
      sectionOrder: 1,
    },
    {
      label: "Partner 2 Getting Ready Address",
      type: "address",
      isRequired: true,
      section: "Getting Ready",
      sectionOrder: 1,
    },
    {
      label: "Partner 2 Getting Ready Start Time",
      type: "time",
      isRequired: true,
      section: "Getting Ready",
      sectionOrder: 1,
    },
    // Ceremony Section
    {
      label: "Ceremony Start Time",
      type: "time",
      isRequired: true,
      section: "Ceremony",
      sectionOrder: 2,
    },
    {
      label: "Expected Ceremony Duration",
      type: "select",
      isRequired: true,
      section: "Ceremony",
      sectionOrder: 2,
      validation: { options: ["15-20 minutes", "20-30 minutes", "30-45 minutes", "45-60 minutes", "Over 1 hour"] },
    },
    {
      label: "Is it an unplugged ceremony?",
      type: "radio",
      helpText: "Guests are asked to put away phones/cameras",
      isRequired: false,
      section: "Ceremony",
      sectionOrder: 2,
      validation: { options: ["Yes", "No", "Partial (during vows only)"] },
    },
    // Reception Section
    {
      label: "Cocktail Hour Start Time",
      type: "time",
      isRequired: false,
      section: "Reception Timeline",
      sectionOrder: 3,
    },
    {
      label: "Reception Doors Open",
      type: "time",
      isRequired: true,
      section: "Reception Timeline",
      sectionOrder: 3,
    },
    {
      label: "First Dance Time",
      type: "time",
      isRequired: false,
      section: "Reception Timeline",
      sectionOrder: 3,
    },
    {
      label: "Cake Cutting Time",
      type: "time",
      isRequired: false,
      section: "Reception Timeline",
      sectionOrder: 3,
    },
    {
      label: "Bouquet/Garter Toss Time",
      type: "time",
      isRequired: false,
      section: "Reception Timeline",
      sectionOrder: 3,
    },
    {
      label: "Grand Exit/Send-off Time",
      type: "time",
      isRequired: false,
      section: "Reception Timeline",
      sectionOrder: 3,
    },
    // Special Moments
    {
      label: "Cultural/Religious Traditions",
      type: "textarea",
      placeholder: "Describe any special traditions we should capture",
      isRequired: false,
      section: "Special Moments",
      sectionOrder: 4,
    },
    {
      label: "Any Surprise Moments?",
      type: "textarea",
      placeholder: "Surprise dance, proposal, announcement, etc.",
      helpText: "We'll keep it secret!",
      isRequired: false,
      section: "Special Moments",
      sectionOrder: 4,
    },
    {
      label: "Must-Capture Moments",
      type: "textarea",
      placeholder: "Specific shots or moments that are important to you",
      isRequired: false,
      section: "Special Moments",
      sectionOrder: 4,
    },
  ],
  agreements: [],
};

const WEDDING_PARTY: SystemTemplate = {
  name: "Wedding Party & Family",
  slug: "wedding-party-family",
  description: "Wedding party details, family information, and vendor contacts",
  industry: "events",
  fields: [
    // Wedding Party
    {
      label: "Maid/Matron of Honor Name",
      type: "text",
      isRequired: false,
      section: "Wedding Party",
      sectionOrder: 1,
    },
    {
      label: "Best Man Name",
      type: "text",
      isRequired: false,
      section: "Wedding Party",
      sectionOrder: 1,
    },
    {
      label: "Number of Bridesmaids",
      type: "number",
      isRequired: false,
      section: "Wedding Party",
      sectionOrder: 1,
    },
    {
      label: "Number of Groomsmen",
      type: "number",
      isRequired: false,
      section: "Wedding Party",
      sectionOrder: 1,
    },
    {
      label: "Flower Girl/Ring Bearer?",
      type: "radio",
      isRequired: false,
      section: "Wedding Party",
      sectionOrder: 1,
      validation: { options: ["Yes", "No"] },
    },
    // Family Information
    {
      label: "Partner 1 Parents Names",
      type: "text",
      placeholder: "e.g., John & Jane Smith",
      isRequired: false,
      section: "Family Information",
      sectionOrder: 2,
    },
    {
      label: "Partner 1 Parents Divorced?",
      type: "radio",
      isRequired: false,
      section: "Family Information",
      sectionOrder: 2,
      validation: { options: ["No", "Yes", "Prefer not to say"] },
    },
    {
      label: "Partner 2 Parents Names",
      type: "text",
      placeholder: "e.g., Robert & Mary Johnson",
      isRequired: false,
      section: "Family Information",
      sectionOrder: 2,
    },
    {
      label: "Partner 2 Parents Divorced?",
      type: "radio",
      isRequired: false,
      section: "Family Information",
      sectionOrder: 2,
      validation: { options: ["No", "Yes", "Prefer not to say"] },
    },
    {
      label: "VIP Guests to Photograph",
      type: "textarea",
      placeholder: "Grandparents, special guests, etc.",
      isRequired: false,
      section: "Family Information",
      sectionOrder: 2,
    },
    {
      label: "Required Family Group Shots",
      type: "textarea",
      placeholder: "List the formal family group photos you need",
      isRequired: false,
      section: "Family Information",
      sectionOrder: 2,
    },
    // Vendor Information
    {
      label: "Wedding Planner Name & Phone",
      type: "text",
      isRequired: false,
      section: "Vendor Contacts",
      sectionOrder: 3,
    },
    {
      label: "Florist Name & Phone",
      type: "text",
      isRequired: false,
      section: "Vendor Contacts",
      sectionOrder: 3,
    },
    {
      label: "DJ/Band Name & Phone",
      type: "text",
      isRequired: false,
      section: "Vendor Contacts",
      sectionOrder: 3,
    },
    {
      label: "Caterer Name & Phone",
      type: "text",
      isRequired: false,
      section: "Vendor Contacts",
      sectionOrder: 3,
    },
    {
      label: "Videographer Name & Phone",
      type: "text",
      isRequired: false,
      section: "Vendor Contacts",
      sectionOrder: 3,
    },
  ],
  agreements: [],
};

// ============================================================================
// PORTRAIT/HEADSHOT TEMPLATES
// ============================================================================

const PORTRAIT_INDIVIDUAL: SystemTemplate = {
  name: "Individual Portrait Session",
  slug: "portrait-individual",
  description: "Information for individual portrait and headshot sessions",
  industry: "portraits",
  fields: [
    {
      label: "Full Name",
      type: "text",
      isRequired: true,
      section: "Personal Information",
      sectionOrder: 1,
    },
    {
      label: "Email",
      type: "email",
      isRequired: true,
      section: "Personal Information",
      sectionOrder: 1,
    },
    {
      label: "Phone",
      type: "phone",
      isRequired: true,
      section: "Personal Information",
      sectionOrder: 1,
    },
    {
      label: "Purpose of Photos",
      type: "select",
      isRequired: true,
      section: "Session Details",
      sectionOrder: 2,
      validation: {
        options: ["LinkedIn/Professional", "Corporate Website", "Acting/Modeling Portfolio", "Personal Branding", "Social Media", "Dating Profile", "Other"],
      },
    },
    {
      label: "Preferred Background",
      type: "select",
      isRequired: false,
      section: "Style Preferences",
      sectionOrder: 3,
      validation: {
        options: ["Solid White", "Solid Gray", "Solid Black", "Natural/Outdoor", "Office/Professional Setting", "No Preference"],
      },
    },
    {
      label: "Preferred Mood/Style",
      type: "select",
      isRequired: false,
      section: "Style Preferences",
      sectionOrder: 3,
      validation: {
        options: ["Friendly & Approachable", "Professional & Serious", "Creative & Artistic", "Casual & Relaxed", "Corporate & Formal"],
      },
    },
    {
      label: "Number of Outfit Changes",
      type: "select",
      isRequired: false,
      section: "Style Preferences",
      sectionOrder: 3,
      validation: { options: ["1 outfit", "2 outfits", "3 outfits", "4+ outfits"] },
    },
    {
      label: "Wardrobe Description",
      type: "textarea",
      placeholder: "Describe what you plan to wear",
      isRequired: false,
      section: "Style Preferences",
      sectionOrder: 3,
    },
    {
      label: "Retouching Preferences",
      type: "select",
      isRequired: false,
      section: "Deliverables",
      sectionOrder: 4,
      validation: {
        options: ["Natural (minimal retouching)", "Standard (skin smoothing, blemish removal)", "Full (complete professional retouching)"],
      },
    },
    {
      label: "Specific Retouching Requests",
      type: "textarea",
      placeholder: "Any specific concerns or requests?",
      isRequired: false,
      section: "Deliverables",
      sectionOrder: 4,
    },
    {
      label: "How many final images do you need?",
      type: "number",
      helpText: "Approximate number of edited photos",
      isRequired: false,
      section: "Deliverables",
      sectionOrder: 4,
    },
    {
      label: "Delivery Deadline",
      type: "date",
      helpText: "When do you need the photos by?",
      isRequired: false,
      section: "Deliverables",
      sectionOrder: 4,
    },
  ],
  agreements: [
    {
      agreementType: "model_release",
      title: "Model Release",
      content: MODEL_RELEASE_AGREEMENT,
      isRequired: true,
      requiresSignature: true,
    },
    {
      agreementType: "licensing_agreement",
      title: "Usage License Agreement",
      content: PHOTO_LICENSING_AGREEMENT,
      isRequired: true,
      requiresSignature: false,
    },
  ],
};

const CORPORATE_HEADSHOTS: SystemTemplate = {
  name: "Corporate Team Headshots",
  slug: "corporate-team-headshots",
  description: "Information for corporate team and executive headshot sessions",
  industry: "portraits",
  fields: [
    {
      label: "Company Name",
      type: "text",
      isRequired: true,
      section: "Company Information",
      sectionOrder: 1,
    },
    {
      label: "Contact Person Name",
      type: "text",
      isRequired: true,
      section: "Company Information",
      sectionOrder: 1,
    },
    {
      label: "Contact Email",
      type: "email",
      isRequired: true,
      section: "Company Information",
      sectionOrder: 1,
    },
    {
      label: "Contact Phone",
      type: "phone",
      isRequired: true,
      section: "Company Information",
      sectionOrder: 1,
    },
    {
      label: "Brand Colors",
      type: "text",
      placeholder: "e.g., Navy blue, white, gold",
      isRequired: false,
      section: "Brand Guidelines",
      sectionOrder: 2,
    },
    {
      label: "Brand Guidelines URL",
      type: "url",
      placeholder: "Link to brand guidelines document",
      isRequired: false,
      section: "Brand Guidelines",
      sectionOrder: 2,
    },
    {
      label: "Number of Team Members",
      type: "number",
      isRequired: true,
      section: "Session Details",
      sectionOrder: 3,
    },
    {
      label: "Include Executives?",
      type: "radio",
      isRequired: false,
      section: "Session Details",
      sectionOrder: 3,
      validation: { options: ["Yes", "No"] },
    },
    {
      label: "Departments to Include",
      type: "textarea",
      placeholder: "List departments or groups",
      isRequired: false,
      section: "Session Details",
      sectionOrder: 3,
    },
    {
      label: "Session Location",
      type: "select",
      isRequired: true,
      section: "Session Details",
      sectionOrder: 3,
      validation: {
        options: ["At your office", "At our studio", "On-location (other)"],
      },
    },
    {
      label: "Time Per Person (minutes)",
      type: "select",
      isRequired: false,
      section: "Session Details",
      sectionOrder: 3,
      validation: { options: ["5 minutes", "10 minutes", "15 minutes", "20 minutes"] },
    },
    {
      label: "Need Individual Scheduling Links?",
      type: "radio",
      helpText: "We can send each team member their own booking link",
      isRequired: false,
      section: "Session Details",
      sectionOrder: 3,
      validation: { options: ["Yes", "No - we'll schedule internally"] },
    },
    {
      label: "Dress Code",
      type: "textarea",
      placeholder: "What should team members wear?",
      isRequired: true,
      section: "Style Guidelines",
      sectionOrder: 4,
    },
    {
      label: "Background Preference",
      type: "select",
      isRequired: true,
      section: "Style Guidelines",
      sectionOrder: 4,
      validation: {
        options: ["Solid White", "Solid Gray", "Solid Black", "Company Logo Backdrop", "Office Environment", "Other"],
      },
    },
    {
      label: "Consistency Requirements",
      type: "textarea",
      placeholder: "Any specific requirements for visual consistency?",
      isRequired: false,
      section: "Style Guidelines",
      sectionOrder: 4,
    },
  ],
  agreements: [
    {
      agreementType: "terms_of_service",
      title: "Corporate Photography Agreement",
      content: COMMERCIAL_LICENSE_AGREEMENT,
      isRequired: true,
      requiresSignature: true,
    },
    {
      agreementType: "model_release",
      title: "Multi-Person Release Agreement",
      content: MODEL_RELEASE_AGREEMENT,
      isRequired: true,
      requiresSignature: false,
    },
  ],
};

// ============================================================================
// COMMERCIAL/BRAND TEMPLATES
// ============================================================================

const BRAND_PHOTOGRAPHY: SystemTemplate = {
  name: "Brand Photography Brief",
  slug: "brand-photography-brief",
  description: "Comprehensive brief for brand and commercial photography projects",
  industry: "commercial",
  fields: [
    {
      label: "Brand Name",
      type: "text",
      isRequired: true,
      section: "Brand Information",
      sectionOrder: 1,
    },
    {
      label: "Industry/Category",
      type: "text",
      placeholder: "e.g., Fashion, Tech, Food, Beauty",
      isRequired: true,
      section: "Brand Information",
      sectionOrder: 1,
    },
    {
      label: "Target Audience",
      type: "textarea",
      placeholder: "Describe your ideal customer",
      isRequired: true,
      section: "Brand Information",
      sectionOrder: 1,
    },
    {
      label: "Brand Values",
      type: "textarea",
      placeholder: "What does your brand stand for?",
      isRequired: false,
      section: "Brand Information",
      sectionOrder: 1,
    },
    {
      label: "Brand Colors",
      type: "text",
      placeholder: "Primary brand colors",
      isRequired: false,
      section: "Brand Guidelines",
      sectionOrder: 2,
    },
    {
      label: "Brand Guidelines Document",
      type: "url",
      placeholder: "Link to brand guidelines",
      isRequired: false,
      section: "Brand Guidelines",
      sectionOrder: 2,
    },
    {
      label: "Reference Images/Mood Board",
      type: "url",
      placeholder: "Pinterest board, Google Drive, etc.",
      isRequired: false,
      section: "Brand Guidelines",
      sectionOrder: 2,
    },
    {
      label: "Types of Photos Needed",
      type: "multiselect",
      isRequired: true,
      section: "Project Scope",
      sectionOrder: 3,
      validation: {
        options: ["Product Shots", "Lifestyle Images", "Behind-the-Scenes", "Team/People", "Location/Environment", "Flat Lay", "Social Media Content"],
      },
    },
    {
      label: "Number of Images Needed",
      type: "number",
      isRequired: true,
      section: "Project Scope",
      sectionOrder: 3,
    },
    {
      label: "Aspect Ratios Needed",
      type: "multiselect",
      isRequired: false,
      section: "Project Scope",
      sectionOrder: 3,
      validation: { options: ["1:1 (Square)", "4:5 (Instagram Portrait)", "9:16 (Stories)", "16:9 (Landscape)", "Custom"] },
    },
    {
      label: "License Duration",
      type: "select",
      isRequired: true,
      section: "Licensing",
      sectionOrder: 4,
      validation: { options: ["1 Year", "2 Years", "5 Years", "Perpetual/Unlimited"] },
    },
    {
      label: "Geographic Scope",
      type: "select",
      isRequired: true,
      section: "Licensing",
      sectionOrder: 4,
      validation: { options: ["Local/Regional", "National", "North America", "Global"] },
    },
    {
      label: "Exclusivity Required?",
      type: "radio",
      isRequired: true,
      section: "Licensing",
      sectionOrder: 4,
      validation: { options: ["Yes - Exclusive rights", "No - Non-exclusive"] },
    },
  ],
  agreements: [
    {
      agreementType: "licensing_agreement",
      title: "Commercial Photography License",
      content: COMMERCIAL_LICENSE_AGREEMENT,
      isRequired: true,
      requiresSignature: true,
    },
  ],
};

const MARKETING_CAMPAIGN: SystemTemplate = {
  name: "Marketing Campaign Brief",
  slug: "marketing-campaign-brief",
  description: "Project brief for marketing campaign photography",
  industry: "commercial",
  fields: [
    {
      label: "Campaign Name",
      type: "text",
      isRequired: true,
      section: "Campaign Overview",
      sectionOrder: 1,
    },
    {
      label: "Campaign Objective",
      type: "textarea",
      placeholder: "What is the goal of this campaign?",
      isRequired: true,
      section: "Campaign Overview",
      sectionOrder: 1,
    },
    {
      label: "Campaign Launch Date",
      type: "date",
      isRequired: true,
      section: "Campaign Overview",
      sectionOrder: 1,
    },
    {
      label: "Key Message",
      type: "textarea",
      placeholder: "What's the main message to communicate?",
      isRequired: true,
      section: "Campaign Overview",
      sectionOrder: 1,
    },
    {
      label: "Visual Style",
      type: "select",
      isRequired: true,
      section: "Creative Direction",
      sectionOrder: 2,
      validation: {
        options: ["Clean & Minimal", "Bold & Vibrant", "Moody & Dramatic", "Natural & Authentic", "Luxury & Elegant", "Playful & Fun"],
      },
    },
    {
      label: "Mood/Emotion",
      type: "text",
      placeholder: "e.g., Inspiring, Energetic, Calm",
      isRequired: false,
      section: "Creative Direction",
      sectionOrder: 2,
    },
    {
      label: "Inspiration/Reference Links",
      type: "textarea",
      placeholder: "Links to inspiration images or campaigns",
      isRequired: false,
      section: "Creative Direction",
      sectionOrder: 2,
    },
    {
      label: "Props Needed",
      type: "textarea",
      placeholder: "List any props required for the shoot",
      isRequired: false,
      section: "Production Requirements",
      sectionOrder: 3,
    },
    {
      label: "Talent Requirements",
      type: "textarea",
      placeholder: "Models, actors, or real people needed?",
      isRequired: false,
      section: "Production Requirements",
      sectionOrder: 3,
    },
    {
      label: "Location Requirements",
      type: "textarea",
      placeholder: "Studio, outdoor, specific locations?",
      isRequired: true,
      section: "Production Requirements",
      sectionOrder: 3,
    },
    {
      label: "Number of Deliverables",
      type: "number",
      isRequired: true,
      section: "Deliverables",
      sectionOrder: 4,
    },
    {
      label: "Retouching Level",
      type: "select",
      isRequired: true,
      section: "Deliverables",
      sectionOrder: 4,
      validation: { options: ["Basic", "Standard", "High-End/Extensive"] },
    },
    {
      label: "Turnaround Time",
      type: "select",
      isRequired: true,
      section: "Deliverables",
      sectionOrder: 4,
      validation: { options: ["Rush (3-5 days)", "Standard (1-2 weeks)", "Extended (3-4 weeks)"] },
    },
  ],
  agreements: [
    {
      agreementType: "licensing_agreement",
      title: "Campaign Usage Rights",
      content: COMMERCIAL_LICENSE_AGREEMENT,
      isRequired: true,
      requiresSignature: true,
    },
  ],
};

// ============================================================================
// FOOD/PRODUCT TEMPLATES
// ============================================================================

const RESTAURANT_MENU: SystemTemplate = {
  name: "Restaurant Menu Photography",
  slug: "restaurant-menu-photography",
  description: "Information for restaurant and food photography sessions",
  industry: "food",
  fields: [
    {
      label: "Restaurant Name",
      type: "text",
      isRequired: true,
      section: "Restaurant Information",
      sectionOrder: 1,
    },
    {
      label: "Cuisine Type",
      type: "text",
      placeholder: "e.g., Italian, Mexican, Asian Fusion",
      isRequired: true,
      section: "Restaurant Information",
      sectionOrder: 1,
    },
    {
      label: "Restaurant Address",
      type: "address",
      isRequired: true,
      section: "Restaurant Information",
      sectionOrder: 1,
    },
    {
      label: "Website",
      type: "url",
      isRequired: false,
      section: "Restaurant Information",
      sectionOrder: 1,
    },
    {
      label: "Number of Dishes to Photograph",
      type: "number",
      isRequired: true,
      section: "Shoot Details",
      sectionOrder: 2,
    },
    {
      label: "Menu Sections",
      type: "multiselect",
      isRequired: true,
      section: "Shoot Details",
      sectionOrder: 2,
      validation: {
        options: ["Appetizers", "Main Courses", "Desserts", "Drinks/Cocktails", "Breakfast", "Lunch Specials", "Full Menu"],
      },
    },
    {
      label: "Signature Dishes to Highlight",
      type: "textarea",
      placeholder: "List your must-have hero shots",
      isRequired: false,
      section: "Shoot Details",
      sectionOrder: 2,
    },
    {
      label: "Photography Style",
      type: "select",
      isRequired: true,
      section: "Style Preferences",
      sectionOrder: 3,
      validation: {
        options: ["Clean & Minimal", "Rustic & Natural", "Moody & Dark", "Bright & Fresh", "Overhead/Flat Lay", "Mixed Styles"],
      },
    },
    {
      label: "Will you provide props/surfaces?",
      type: "radio",
      isRequired: true,
      section: "Style Preferences",
      sectionOrder: 3,
      validation: { options: ["Yes - we have props", "No - photographer provides", "Mix of both"] },
    },
    {
      label: "Food Stylist Provided?",
      type: "radio",
      isRequired: true,
      section: "Production",
      sectionOrder: 4,
      validation: { options: ["Yes - we have a stylist", "No - photographer handles styling", "Need recommendation"] },
    },
    {
      label: "Best Time for Shoot",
      type: "select",
      helpText: "When is the kitchen least busy?",
      isRequired: true,
      section: "Production",
      sectionOrder: 4,
      validation: {
        options: ["Morning (before opening)", "Afternoon (between services)", "Evening (after closing)", "Flexible"],
      },
    },
    {
      label: "Special Requirements",
      type: "textarea",
      placeholder: "Any specific needs or restrictions?",
      isRequired: false,
      section: "Production",
      sectionOrder: 4,
    },
  ],
  agreements: [
    {
      agreementType: "licensing_agreement",
      title: "Food Photography License",
      content: PHOTO_LICENSING_AGREEMENT,
      isRequired: true,
      requiresSignature: false,
    },
  ],
};

const PRODUCT_PHOTOGRAPHY: SystemTemplate = {
  name: "Product Photography Brief",
  slug: "product-photography-brief",
  description: "Detailed brief for e-commerce and product photography",
  industry: "product",
  fields: [
    {
      label: "Product Name",
      type: "text",
      isRequired: true,
      section: "Product Information",
      sectionOrder: 1,
    },
    {
      label: "Product Category",
      type: "text",
      placeholder: "e.g., Jewelry, Electronics, Apparel",
      isRequired: true,
      section: "Product Information",
      sectionOrder: 1,
    },
    {
      label: "Product Description",
      type: "textarea",
      isRequired: false,
      section: "Product Information",
      sectionOrder: 1,
    },
    {
      label: "Product Dimensions",
      type: "text",
      placeholder: "Height x Width x Depth",
      isRequired: false,
      section: "Product Information",
      sectionOrder: 1,
    },
    {
      label: "Number of Products",
      type: "number",
      helpText: "Total SKUs to photograph",
      isRequired: true,
      section: "Scope",
      sectionOrder: 2,
    },
    {
      label: "Shots Per Product",
      type: "number",
      helpText: "How many angles/variations per item?",
      isRequired: true,
      section: "Scope",
      sectionOrder: 2,
    },
    {
      label: "Shot Types Needed",
      type: "multiselect",
      isRequired: true,
      section: "Scope",
      sectionOrder: 2,
      validation: {
        options: ["Hero/Main Image", "Multiple Angles", "Detail/Close-up", "Scale/Size Reference", "Lifestyle/In-Use", "Flat Lay", "360 Spin"],
      },
    },
    {
      label: "Background",
      type: "select",
      isRequired: true,
      section: "Style Requirements",
      sectionOrder: 3,
      validation: {
        options: ["Pure White", "Solid Color (specify)", "Gradient", "Lifestyle Setting", "Transparent/PNG"],
      },
    },
    {
      label: "Props Needed?",
      type: "textarea",
      placeholder: "Any styling props or accessories?",
      isRequired: false,
      section: "Style Requirements",
      sectionOrder: 3,
    },
    {
      label: "Is Color Accuracy Critical?",
      type: "radio",
      helpText: "Important for apparel, cosmetics, etc.",
      isRequired: true,
      section: "Style Requirements",
      sectionOrder: 3,
      validation: { options: ["Yes - Critical", "Somewhat Important", "Not Critical"] },
    },
    {
      label: "File Format",
      type: "multiselect",
      isRequired: true,
      section: "Technical Specifications",
      sectionOrder: 4,
      validation: { options: ["JPEG", "PNG", "TIFF", "PSD", "RAW"] },
    },
    {
      label: "Resolution/Dimensions",
      type: "text",
      placeholder: "e.g., 2000x2000px, 300dpi",
      isRequired: false,
      section: "Technical Specifications",
      sectionOrder: 4,
    },
    {
      label: "File Naming Convention",
      type: "text",
      placeholder: "e.g., SKU_angle_color.jpg",
      isRequired: false,
      section: "Technical Specifications",
      sectionOrder: 4,
    },
  ],
  agreements: [
    {
      agreementType: "licensing_agreement",
      title: "Product Photography License",
      content: COMMERCIAL_LICENSE_AGREEMENT,
      isRequired: true,
      requiresSignature: false,
    },
  ],
};

// ============================================================================
// ALL TEMPLATES
// ============================================================================

const ALL_TEMPLATES: SystemTemplate[] = [
  // Real Estate
  REAL_ESTATE_STANDARD,
  REAL_ESTATE_LUXURY,
  REAL_ESTATE_COMMERCIAL,
  // Wedding/Events
  WEDDING_BASIC,
  WEDDING_TIMELINE,
  WEDDING_PARTY,
  // Portrait/Headshot
  PORTRAIT_INDIVIDUAL,
  CORPORATE_HEADSHOTS,
  // Commercial/Brand
  BRAND_PHOTOGRAPHY,
  MARKETING_CAMPAIGN,
  // Food/Product
  RESTAURANT_MENU,
  PRODUCT_PHOTOGRAPHY,
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

/**
 * Seed system questionnaire templates
 * Run this to populate the database with pre-built industry templates
 */
export async function seedQuestionnaireTemplates(): Promise<{
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
}> {
  const result = {
    success: true,
    created: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const template of ALL_TEMPLATES) {
    try {
      // Check if template already exists
      const existing = await prisma.questionnaireTemplate.findFirst({
        where: {
          slug: template.slug,
          isSystemTemplate: true,
        },
      });

      if (existing) {
        result.skipped++;
        continue;
      }

      // Create template with fields and agreements
      await prisma.questionnaireTemplate.create({
        data: {
          organizationId: null, // System template
          name: template.name,
          slug: template.slug,
          description: template.description,
          industry: template.industry,
          isSystemTemplate: true,
          isActive: true,
          fields: {
            create: template.fields.map((field, index) => ({
              label: field.label,
              type: field.type,
              placeholder: field.placeholder || null,
              helpText: field.helpText || null,
              isRequired: field.isRequired,
              sortOrder: index,
              section: field.section || null,
              sectionOrder: field.sectionOrder || 0,
              validation: field.validation ? (field.validation as Prisma.InputJsonValue) : Prisma.DbNull,
              conditionalOn: field.conditionalOn || null,
              conditionalValue: field.conditionalValue || null,
            })),
          },
          legalAgreements: {
            create: template.agreements.map((agreement, index) => ({
              agreementType: agreement.agreementType,
              title: agreement.title,
              content: agreement.content,
              isRequired: agreement.isRequired,
              requiresSignature: agreement.requiresSignature,
              sortOrder: index,
            })),
          },
        },
      });

      result.created++;
    } catch (error) {
      result.success = false;
      result.errors.push(
        `Failed to create template "${template.name}": ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return result;
}

/**
 * Delete all system templates (for testing/reset purposes)
 */
export async function deleteSystemTemplates(): Promise<{ deleted: number }> {
  const result = await prisma.questionnaireTemplate.deleteMany({
    where: {
      isSystemTemplate: true,
    },
  });

  return { deleted: result.count };
}
