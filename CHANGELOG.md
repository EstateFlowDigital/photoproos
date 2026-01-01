# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed (Landing Page Polish)
- Updated all section eyebrow text from `font-mono` to styled badge design with border and background for visual consistency across:
  - Testimonials section
  - Pricing section
  - How It Works section
  - Security section
  - Integrations section
  - Roadmap section
  - FAQ section
- Updated all section headings to use two-tone typography (secondary color for introductory text, primary color for emphasis) across all sections
- Updated FAQ accordion icons from chevron to plus/minus icons with color state change for better expandability indication
- FAQ expand icons now highlight with primary color when section is open

### Added (Portal Infrastructure - Sprint 1)
- Installed core dependencies: `@clerk/nextjs`, `@prisma/client`, `stripe`, `zod`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `resend`
- Created comprehensive Prisma schema with 25 models:
  - Core: `Organization`, `User`, `OrganizationMember`
  - Clients: `Client`, `ClientSession`
  - Galleries: `Project`, `Asset`, `DeliveryLink`, `GalleryFavorite`, `GalleryComment`
  - Payments: `Payment`
  - Bookings: `BookingType`, `Booking`, `BookingReminder`
  - Invoices: `Invoice`, `InvoiceLineItem`
  - Contracts: `ContractTemplate`, `Contract`, `ContractSigner`, `ContractAuditLog`
  - Activity: `ActivityLog`, `Notification`
  - Usage: `UsageMeter`, `OnboardingProgress`
- Created 10 enums for type safety: `PlanName`, `ProjectStatus`, `PaymentStatus`, `BookingStatus`, `InvoiceStatus`, `ContractStatus`, `ClientIndustry`, `ActivityType`, `NotificationType`, `MemberRole`
- Created database utility (`src/lib/db.ts`) with Prisma singleton pattern
- Created Clerk authentication utilities:
  - `src/lib/auth/clerk.ts` - `getAuthContext()` for organization-scoped auth
  - `src/lib/auth/with-org.ts` - Higher-order functions for API route protection (`withOrganization`, `withAdmin`, `withOwner`)
- Created Clerk middleware (`src/middleware.ts`) with public route matching
- Created comprehensive seed data script (`prisma/seed.ts`) with 50+ realistic records:
  - 3 Organizations (Studio, Pro, Free tiers)
  - 5 Users with organization memberships
  - 15 Clients matching hero demo (Premier Realty, Tech Solutions, etc.)
  - 25 Projects/Galleries with various statuses
  - 23 Payments (paid, pending, overdue)
  - 4 Booking Types and 12 Bookings
  - 10 Invoices with line items
  - 2 Contract Templates and 5 Contracts
  - Activity logs and notifications
- Created environment variables template (`.env.example`) with all required config
- Added database scripts to package.json: `db:generate`, `db:push`, `db:migrate`, `db:seed`, `db:studio`, `db:reset`
- Renamed project from `dovetail-landing` to `photoproos`

### Added (Code Quality & Performance)
- Created shared icons file (`src/components/ui/icons.tsx`) with 9 reusable icon components to reduce duplication across sections
- Added hero-specific CSS animation classes (`hero-animate`, `hero-animate-1` through `hero-animate-6`) for cleaner staggered entry animations
- Added section transition utilities: `section-divider`, `section-fade-in`, `hover-lift`, `stagger-1` through `stagger-6`
- Added `text-shimmer` animation for gradient text effects on hero heading
- Added `section-reveal` animation class for scroll-triggered section animations
- Added section dividers between all major landing page sections for smoother visual flow

### Changed (Performance & Code Cleanup)
- Refactored Hero section to use CSS animation classes instead of inline JavaScript state-based animations (reduced component complexity)
- Updated all page metadata from Dovetail to PhotoProOS branding (title, description, OpenGraph, Twitter cards, icons, manifest)
- Removed unused `isLoaded` state from Hero section - animations now trigger via CSS on mount

### Removed (Dead Code Cleanup)
- Deleted unused legacy section components:
  - `src/components/sections/enterprise.tsx`
  - `src/components/sections/product-showcase.tsx`
  - `src/components/sections/stats.tsx`
  - `src/components/sections/roi-section.tsx`

### Fixed (Layout Stability & Design Consistency)
- Fixed content shifting (CLS) in Hero demo tabs by using fixed height instead of min-height and absolute positioning for demo content
- Fixed content shifting in How It Works section by removing grid-rows animation and using opacity-only transitions for step features
- Fixed content shifting in Testimonials section by adding fixed min-height to quote content area with absolute positioning
- Fixed content shifting in Use Cases section by removing grid-rows animation and using opacity-only transitions for feature lists
- Standardized section header spacing to `mb-12 lg:mb-16` across Features and How It Works sections
- Standardized grid background pattern to 64px with rgba(255,255,255,0.03) across all sections for visual consistency
- Fixed ShimmerButton type error by adding `size` prop support (sm, default, lg) to match GradientButton interface
- Fixed "Coming Soon" badge not displaying on Contracts & E-Sign feature card by adding `badge` prop to FeatureCard component

### Changed (PhotoProOS Rebrand)
- **BREAKING**: Complete content rebrand from Dovetail to PhotoProOS - "The Business OS for Professional Photographers"
- Created new PhotoProOS logo component with dynamic camera aperture design (icon, text, and full variants in sm/md/lg/xl sizes)
- Rewritten Hero section with interactive demo showing Dashboard, Galleries, Clients, and Payments tabs with auto-rotation
- Updated Navbar with PhotoProOS branding, Features dropdown (Client Galleries, Payment Processing, etc.), and Industries dropdown (6 photography verticals)
- Rewritten Features section with 6 core product features: Client Galleries, Payment Processing, Client Management, Workflow Automation, Analytics & Reports, Contracts & E-Sign
- Updated Value Proposition section ("Why PhotoProOS") with before/after visualization showing consolidation from 6 tools to 1 platform
- Created new Pricing section with 4 tiers: Free ($0), Pro ($29/mo), Studio ($79/mo), Enterprise (custom) with annual/monthly toggle
- Created new Use Cases section covering 6 photography verticals: Real Estate, Commercial, Architecture & Interiors, Events & Corporate, Headshots & Portraits, Food & Hospitality
- Created new Roadmap section showing completed, in-progress, upcoming, and planned features with timeline visualization
- Rewritten Testimonials section with 4 photography-focused testimonials including stats badges and progress indicators
- Updated FAQ section with 8 PhotoProOS-specific questions about delivery, payments, security, storage, branding, and contracts
- Rewritten CTA section with photography-focused messaging and stats (47% revenue increase, 15+ hrs saved, 3x faster payments)
- Updated Footer with PhotoProOS branding, newsletter signup, social links (Twitter, Instagram, LinkedIn, YouTube), and photography-focused navigation
- Updated Logos section with photography business stats (2,500+ photographers, 150,000+ galleries, $12M+ payments) and review badges
- Reorganized page.tsx with optimized section flow: Hero → Logos → Value Prop → Features → Use Cases → Pricing → Testimonials → Roadmap → FAQ → CTA → Footer

### Added (Landing Page Enhancements)
- Created new **How It Works** section with interactive 3-step process (Upload, Share, Get Paid) including:
  - Auto-rotating step cards with progress indicators
  - Interactive demo mockups for each step
  - Feature badges for each step
  - Browser chrome simulation for realistic demo preview
- Created new **Integrations** section showcasing 8 popular integrations:
  - Stripe, Adobe Lightroom, Google Drive, Dropbox, Calendly, Mailchimp, QuickBooks, Zapier
  - Category filtering (Payments, Editing, Storage, Marketing, Calendar)
  - "Popular" badges for most-used integrations
  - API documentation link
- Created new **Security & Trust** section featuring:
  - 6 security features with icons (256-bit SSL, SOC 2, GDPR, 99.9% Uptime, Backups, 2FA)
  - Certification badges (SOC 2 Type II, GDPR, CCPA, ISO 27001)
  - Trust stats (0 data breaches, 99.9% uptime, 24/7 monitoring)
  - Trust banner with data ownership guarantees
- Enhanced **Pricing** section with feature comparison table:
  - 14 feature rows comparing Free, Pro, Studio, Enterprise
  - Check/X icons for boolean features
  - Text values for limits and descriptions
  - Responsive horizontal scroll on mobile
- Added `animate-progress-bar` CSS animation for step indicators

### Changed (Design System v4.1.0)
- **BREAKING**: Updated muted text color from `#7C7C7C` to `#8b8b8b` for WCAG AA compliance (5.1:1 contrast ratio)
- **BREAKING**: Updated secondary text color from `#A7A7A7` to `#a3a3a3` for improved consistency
- Upgraded Lumos Design System from v4.0.0 to v4.1.0 with comprehensive token restructuring
- Replaced all hardcoded hex colors in Button, Badge, Input, Textarea, Navbar, Hero, Features, FAQ, Footer, Enterprise, Product Showcase, Noise-to-Knowledge, ROI Section, Testimonials, Stats, CTA, Logos, ScrollProgress, GradientButton, ShimmerButton, PulseButton, and OptimizedImage components with CSS variables
- Standardized transition durations using `--duration-fast`, `--duration-base`, `--duration-slow` tokens
- Standardized border radius using `--button-radius`, `--input-radius`, `--badge-radius` component tokens
- Improved hover states to use `--background-hover` and `--ghost-hover` semantic tokens

### Added (Design System)
- New primitive color tokens: `--blue-400`, `--green-400`, `--orange-400`, `--red-400`, `--purple-400`, `--yellow-500`, `--yellow-400`
- New semantic tokens for interactive states: `--primary-active`, `--secondary-active`, `--ghost-hover`, `--ghost-active`
- New background tokens: `--background-selected` for selected state styling
- New border tokens: `--input-border`, `--input-border-focus` for form elements
- New focus tokens: `--focus-ring`, `--focus-ring-inset`, `--shadow-focus` for accessible focus states
- New status text tokens: `--success-text`, `--warning-text`, `--error-text`, `--ai-text` (AA compliant on dark backgrounds)
- Comprehensive typography scale: `--text-xs` through `--text-8xl` with corresponding line heights
- Font weight tokens: `--font-normal`, `--font-medium`, `--font-semibold`, `--font-bold`
- Letter spacing tokens: `--tracking-tighter` through `--tracking-widest`
- Extended spacing scale with half-step values: `--space-0-5`, `--space-1-5`, `--space-2-5`, etc.
- New transition tokens: `--duration-instant`, `--duration-slower`, `--ease-spring`
- Component-specific tokens: `--card-radius`, `--button-radius`, `--input-radius`, `--badge-radius`
- Accessibility token: `--touch-target-min` (44px) for minimum touch target size
- New z-index token: `--z-toast` for toast notifications

### Fixed (Accessibility)
- Fixed color contrast ratio for muted text to meet WCAG AA 4.5:1 requirement
- Added `aria-hidden="true"` to all decorative SVG icons in Navbar (ChevronDown, ChevronRight, Menu, Close)
- Added `aria-hidden="true"` to all decorative SVG icons in Hero (ArrowRight, Star, ShieldCheck)
- Added `aria-hidden="true"` to Hero visualization SVG with `role="presentation"`
- Added `aria-hidden="true"` to Dovetail logo SVG in Footer
- Added `aria-hidden="true"` to decorative icon wrappers in Input component
- Added `aria-hidden="true"` to all decorative SVG icons in Features (ArrowRight, Doc, Bot, Puzzle, etc.)
- Added `aria-hidden="true"` to chevron icon wrapper and icon in FAQ accordion
- Added `aria-hidden="true"` to social media icons in Footer (Twitter, LinkedIn, YouTube, Arrow)
- Added `aria-hidden="true"` to DovetailLogoLarge in Noise-to-Knowledge section
- Added `aria-hidden="true"` to ArrowIcon in ROI section
- Added `aria-hidden="true"` to company logos in Testimonials section (Breville, Canva, Atlassian)
- Added `aria-hidden="true"` to CheckIcon in CTA section
- Added `aria-hidden="true"` to all decorative icons in Enterprise section (ShieldIcon, CheckIcon)
- Added `aria-hidden="true"` to all decorative icons in Product Showcase section (SparklesIcon, ChartIcon, SearchIcon, DocIcon, TrendIcon)
- Added `aria-hidden="true"` to ChevronUpIcon in BackToTop component
- Added `aria-invalid` and `aria-describedby` attributes to Input and Textarea for error states
- Added `role="alert"` to error messages in form components
- Added `aria-controls` to mobile menu button linking to menu element
- Added `role="dialog"` and `aria-modal="true"` to mobile menu overlay
- Added `aria-label` to star rating container for screen readers
- Improved focus ring styling using semantic `--ring` and `--ring-offset` tokens
- Added `motion-reduce:transition-none` and `motion-reduce:transform-none` classes to all animated elements

### Changed (Components)
- Button component now uses semantic color tokens instead of hardcoded hex values
- Button component now includes `motion-reduce:transform-none` and `motion-reduce:transition-none` for reduced motion support
- Badge component now uses semantic tokens for all color variants
- Badge component sizes now use consistent height values (h-4, h-5, h-6)
- Input/Textarea components now use semantic tokens for borders, backgrounds, and text colors
- Navbar dropdowns now use `--card-border` and `--background-secondary` tokens
- Hero section now uses semantic tokens for all colors and backgrounds
- Features section cards now use `--card`, `--card-border`, `--border-hover` semantic tokens
- Features section icon backgrounds now use `--background-elevated` token
- FAQ section accordion now uses `--card-border`, `--background-elevated`, `--background-hover` tokens
- FAQ section text now uses `text-foreground-secondary` and `text-foreground-muted` classes
- Footer section now uses semantic tokens for borders, backgrounds, and text colors
- Footer badges now use `--badge-radius` and `--border` tokens
- Social links in Footer now use semantic color tokens with reduced motion support
- All navigation links now use consistent token-based styling
- Enterprise section now uses `--card`, `--card-border`, `--background-elevated` semantic tokens
- Enterprise section security certifications use `--background-hover` and semantic text colors
- Product Showcase section dashboard mockup uses `--card`, `--card-border`, `--background-secondary` tokens
- Product Showcase section bar chart tooltips use semantic tokens for backgrounds and text
- Noise-to-Knowledge section DataCard components use `--card`, `--card-border`, `--background-elevated` tokens
- Noise-to-Knowledge section benefit list uses `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`
- ROI Section stat card uses `--card`, `--card-border`, `--border-hover` semantic tokens
- ROI Section navigation and progress indicators use `--border-visible` and semantic text colors
- Testimonials section quote and author info use `text-foreground` and `text-foreground-muted`
- Testimonials section navigation uses `--border-visible` semantic token
- Stats section uses `--card-border` and `--background` semantic tokens
- CTA section uses `text-foreground`, `text-foreground-secondary`, `text-foreground-muted` semantic classes
- Logos section uses `--card-border`, `--background` semantic tokens for borders and backgrounds
- BackToTop component uses `--background-elevated`, `--card-border`, `--background-hover`, `--border-hover`, `--ring` tokens
- BackToTop component includes `motion-reduce:transition-none` and `motion-reduce:transform-none`
- GradientButton component uses `--background`, `--background-secondary`, `--ring` semantic tokens
- GradientButton outline variant uses semantic tokens for focus states
- ShimmerButton uses `bg-foreground` and `text-[var(--background)]` for proper theming
- PulseButton uses `--primary`, `--primary-hover` semantic tokens
- CardSkeleton uses `--card-border`, `--card` semantic tokens
- Footer links and legal links now use `text-foreground` and `hover:text-foreground` instead of `text-white`

### Added (Animations)
- Enhanced hover animations for FeatureShowcase cards with lift effect (`hover:-translate-y-1 hover:scale-[1.01]`), gradient glow overlay, and improved image scaling
- Enhanced hover animations for FeatureCard components with lift effect, gradient glow overlay, and icon scale animations
- Floating animation for DataCard components in Noise-to-Knowledge section with staggered delays (0-1250ms)
- Pulse glow animation (`animate-pulse-glow-orange`) for center insight card in knowledge visualization
- Hover scale and shadow effects on all DataCard variants
- All new animations include `motion-reduce:animate-none` and `motion-reduce:transform-none` for accessibility

### Added
- `ScrollProgress` component with customizable gradient color and height for reading progress indication
- `BackToTop` floating button with smooth scroll and visibility threshold
- `TiltCard` component with 3D perspective tilt effect, glare overlay, and configurable tilt angles
- `Typewriter` component for typing animation effect with cursor and loop support
- `SplitText` component for staggered word/character reveal animations
- `AnimatedGradientText` component for animated gradient text effects
- `TextReveal` component for slide-up text reveal animations
- `Marquee` and `VerticalMarquee` components for infinite scrolling content strips
- `useMousePosition` hook for tracking mouse coordinates
- `useCursorSpotlight` hook for radial gradient spotlight following cursor
- `useFocusTrap` hook for trapping focus within modals/dialogs
- `useRestoreFocus` hook for returning focus after modal close
- `useModalFocus` combined hook for complete modal focus management
- CSS `.link-underline` class for animated slide-in underline effect on hover
- CSS `.text-highlight` class for animated background highlight on hover
- CSS `.ripple` class for button ripple click effects
- CSS `.text-glow` and `.border-glow` classes for glow effects
- CSS `.animate-glow` keyframe animation
- `GradientButton` component with animated gradient border on hover
- `ShimmerButton` component with shine effect on hover
- `PulseButton` component with glow pulse animation
- CSS animations for gradient buttons (`.animate-gradient-border`, `.animate-gradient-bg`, `.shimmer-container`)
- Skip to main content link for keyboard/screen reader accessibility
- Keyboard navigation for dropdown menus with arrow key support (ArrowUp, ArrowDown, Escape, Enter)
- Parallax scrolling effect in hero section for grid background and geometric visualization
- Navbar blur/transparency effect on scroll with smooth transition
- Smooth number counting animation for ROI section stats with easing
- Custom `useCountAnimation` hook for animated number displays
- Custom `useParallax` hook for scroll-based parallax effects
- Shimmer loading effect CSS classes for image loading states
- `OptimizedImage` component with shimmer loading animation
- `Skeleton`, `CardSkeleton`, `AvatarSkeleton`, and `TextBlockSkeleton` components for loading states
- ARIA attributes for dropdown menus (aria-expanded, aria-haspopup, role="menu", role="menuitem")
- Focus ring styles for dropdown trigger buttons
- Gradient text utilities (`.text-gradient`, `.text-gradient-primary`, `.text-gradient-rainbow`)
- Pure CSS tooltip system with hover animations
- `MagneticButton` component with cursor-following effect for prominent CTAs
- `Input` and `Textarea` components with animated focus states and labels
- `Badge` component with multiple variants (default, primary, success, warning, error, ai, new, beta)
- `PageTransitionProvider` and `AnimatedPage` components for smooth page transitions
- Stagger animation delay classes (`.stagger-1` through `.stagger-8`)
- Tooltips for social media icons in footer ("Follow us on X", "Connect on LinkedIn", "Watch on YouTube")
- Social icon hover scale effect (110%)

### Changed
- Testimonials section now features smooth directional slide animations with scale and opacity transitions
- CTA section now uses `ShimmerButton` and `GradientButton` for enhanced visual appeal
- Navbar now has glass-morphism effect when scrolled (background blur + semi-transparent background)
- Dropdown items now support keyboard focus states with visual ring indicator
- ROI section stats now animate with counting effect when scrolled into view
- Improved accessibility with proper tabIndex handling in dropdown items
- CTA section now uses `MagneticButton` for primary actions
- FAQ accordion items now have proper ARIA attributes (aria-controls, role="region", aria-labelledby)
- FAQ chevron icon now animates color on open/close state
- FAQ items have improved group hover states

### Added (Previous)
- Button micro-interactions with hover scale (1.02x) and press feedback (0.98x)
- Card hover effects with elevation (translateY, shadow) and optional interactive variant
- Reduced motion support for all new animations
- Scroll entrance animations for all major sections (hero, logos, noise-to-knowledge, product-showcase, features, ROI, testimonials, enterprise, CTA, FAQ)
- Custom `useScrollAnimation` hook with Intersection Observer for triggering animations on scroll
- `ScrollReveal` and `StaggerContainer` reusable components for scroll-triggered animations
- Mobile navigation menu with full-screen overlay, section-based navigation, and smooth animations
- Hamburger/close icon toggle for mobile menu
- Body scroll lock when mobile menu is open
- Comprehensive SEO meta tags including:
  - Title templates for consistent page titles
  - Enhanced OpenGraph and Twitter Card metadata
  - Structured keywords array
  - Robot directives for search engines
  - Viewport configuration with theme color
  - Favicon and Apple touch icon configuration
  - Web app manifest link
  - Font preconnect headers

### Changed
- Improved focus ring styling with 2px ring, 2px offset, and proper dark mode contrast
- Enhanced Button component with visible focus states using focus-visible:ring-2
- Outline button now shows enhanced border on hover (0.24 → 0.4 opacity)
- Default button now has subtle shadow that increases on hover
- Hero section now has staggered entrance animation on page load
- Logos section logos animate in with staggered delays
- Product showcase dashboard and feature cards animate in on scroll
- Features section cards animate in sequentially
- ROI section stats and graph animate in with staggered timing
- Testimonials section animates in when scrolled into view
- Enterprise section header and certifications animate in with staggered timing
- Noise-to-knowledge benefits list items animate in on scroll
- CTA section content animates in with staggered timing
- FAQ section header and questions animate in on scroll
- Mobile menu button now toggles a full overlay menu instead of linking to /menu
- Enhanced layout.tsx with comprehensive SEO configuration

### Added (Previous)
- Initial Next.js 15.5.9 project setup with TypeScript
- Integrated Lumos Design System v4.0 (Dovetail-inspired tokens and styles)
- Tailwind CSS configuration with custom design tokens
- Core UI components:
  - Button component with variants (default, secondary, ghost, outline, link)
- Layout components:
  - Navbar with responsive mobile menu and dropdown menus for Product/Resources
  - Footer with multi-column links, social icons, and Explore Outlier featured article
- Landing page sections:
  - Hero section with grid background, geometric data visualization SVG, announcement badge and CTA buttons
  - Logos section with real company SVG logos (AWS, Atlassian, Deloitte, Okta, Canva, Shopify, Intel, Breville, Notion, Lovable)
  - "From noise to knowledge" section with animated knowledge flow visualization and benefit bullet points
  - Product showcase section with interactive dashboard mockup, bar chart visualization, and feature cards
  - Features section with product screenshot showcases (AI Analysis, Chat and Search, Dashboards) and icon-based cards
  - ROI section with 2.3x return stats, animated graph visualization, and Forrester study link
  - Testimonials section with carousel navigation, company logos (Breville, Canva, Atlassian), and author details
  - Enterprise "Single source of truth" section with security certifications (SOC 2, HIPAA, ISO 27001, etc.) and feature visualizations
  - CTA section for conversion
  - FAQ section with accordion-style questions and answers
- Product images in public/images folder (AI_Analysis.png, Chat_and_Search.png, Dashboards.png, Docs.png, hero images, testimonial avatars)
- Real SVG company logos in public/logos folder (AWS, Atlassian, Breville, Canva, Shopify, Notion, Lovable)
- Animated SVG visualizations throughout (hero, ROI graph, knowledge flow)
- Global styles with dark-first design approach
- Responsive design for mobile, tablet, and desktop
- Accessibility features including focus states and semantic HTML

### Changed
- Updated navbar with hover-based dropdown menus for Product and Resources
- Enhanced hero section with grid background pattern and geometric visualization
- Improved features section layout with featured product screenshot cards
- Redesigned testimonials section with carousel-style navigation and company branding
- Updated enterprise section with "Single source of truth" messaging and certification badges
- Enhanced footer with "Explore Outlier" featured article section
- Added Cookie preferences button and Trust Center link to footer legal links
- Updated logos section to use actual SVG logo files with Image component
- Updated features section to use PNG product screenshots
- Updated footer Explore Outlier section with real article image
- Made ROI section tabs fully interactive with 4 different stats (ROI, Time Saved, Faster Decisions, Team Adoption)
- Made "From noise to knowledge" benefits list interactive with expandable descriptions
- Testimonials section now switches content based on active tab selection
- Added auto-cycling to testimonials section (6s interval) with animated progress indicator and pause on hover
- Added auto-cycling to ROI stats section (5s interval) with progress bar and pause on interaction
- Enhanced product showcase bar chart with hover tooltips, animated bar loading, and scale effects
- Enhanced CTA section with animated gradient background, grid pattern, and trust indicators
- Added comprehensive CSS animations (numberPop, pulseSlow, float, drawLine, glowPulse, gradientShift)
- Added reduced motion support for accessibility (@media prefers-reduced-motion)
