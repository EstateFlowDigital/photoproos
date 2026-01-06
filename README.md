# PhotoProOS

The Business OS for Professional Photographers

## Overview

PhotoProOS is a comprehensive business management platform for professional photographers. It handles everything from client management and scheduling to gallery delivery and payments.

## Features

### Core Features (Implemented)
- **Client Management** - Full CRM with client profiles and history
- **Gallery Delivery** - Upload, organize, and deliver photo galleries
- **Invoicing & Payments** - Create invoices, accept payments via Stripe
- **Scheduling** - Book appointments with calendar management
- **Property Websites** - Generate single-property marketing sites
- **Client Portal** - Self-service portal for clients
- **Team Management** - Multi-user with roles and permissions
- **Equipment Tracking** - Manage photography gear inventory
- **Discount Codes** - Promotional codes with usage tracking
- **Payment Plans** - Installment-based payment options
- **Watermarking** - Configurable watermark settings
- **Analytics** - Revenue forecasting and client LTV metrics

### Recently Shipped
- **Equipment Checklists** - Per-booking-type equipment lists with check-off tracking
- **Multi-Day Events** - Support for weddings, conferences, and other multi-day events with session management
- **Buffer Time** - Automatic travel/prep time between bookings with conflict detection
- **Booking Reminders** - Automated email reminders 24h and 1h before sessions
- **Recurring Bookings** - Create repeating appointments (daily, weekly, biweekly, monthly, custom)
- **Command Palette** - Global search and navigation with ⌘K/Ctrl+K
- **Time-Off Management** - Request and approve team time-off with pending badges
- **Contract Templates** - Reusable contract templates with variables
- **Multi-Service Galleries** - Attach multiple services to a single gallery
- **Onboarding Checklist** - Guided setup for new organizations

### Roadmap

#### Phase 1: Scheduling & Automation (Q1 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Recurring Bookings | Create repeating appointments | ✅ Shipped |
| Booking Reminders | SMS/email reminders (24h, 1h before) | ✅ Shipped |
| Buffer Time | Automatic travel/prep time between bookings | ✅ Shipped |
| Multi-Day Events | Support for weddings, conferences | ✅ Shipped |
| Equipment Checklists | Per-booking-type equipment lists | ✅ Shipped |
| Second Shooter Assignment | Team member scheduling per booking | Planned |
| Weather Integration | Forecast display on booking details | Planned |

#### Phase 2: Gallery & Delivery (Q1-Q2 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Bulk Upload | Drag & drop multi-file upload | Planned |
| AI Photo Culling | Smart selection suggestions | Planned |
| Watermark Templates | Multiple watermark presets | Planned |
| Client Favorites | Allow clients to mark favorites | Planned |
| Download Tracking | Per-photo download analytics | Planned |
| Gallery Expiration | Auto-expire gallery access | Planned |
| Password Protection | Optional gallery passwords | Planned |
| Photo Comments | Client feedback on photos | Planned |
| Lightroom Plugin | Direct gallery publishing | Planned |
| Slideshow Mode | Fullscreen client presentations | Planned |

#### Phase 3: Client Experience (Q2 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Client Portal v2 | Enhanced self-service portal | Planned |
| Communication Timeline | Full message history | Planned |
| Client Merge | Combine duplicate records | Planned |
| CSV Import | Bulk client import | Planned |
| Referral Tracking | Track client referrals | Planned |
| Birthday Reminders | Automated anniversary outreach | Planned |
| Satisfaction Surveys | Post-session feedback | Planned |
| Custom Fields | Organization-defined fields | Planned |
| VIP Tiers | Client segmentation levels | Planned |
| Preference Profiles | Style/location preferences | Planned |

#### Phase 4: Payments & Business (Q2-Q3 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Recurring Invoices | Subscription billing | Planned |
| Payment Installments | Multi-payment schedules | Planned |
| Late Payment Reminders | Automated follow-ups | Planned |
| PDF Customization | Custom invoice templates | Planned |
| Multi-Currency | International payments | Planned |
| Expense Tracking | Business expense logging | Planned |
| Profit Margins | Per-project profitability | Planned |
| Promo Codes | Promotional discounts | Planned |
| Tips/Gratuity | Client tip acceptance | Planned |
| Revenue Reports | Financial analytics | Planned |

#### Phase 5: Contracts & Legal (Q3 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| E-Signature Drawing | Touch/mouse signature capture | Planned |
| Contract Versioning | Track document changes | Planned |
| Model Releases | Built-in release templates | Planned |
| Venue Agreements | Location contract templates | Planned |
| Bulk Contract Send | Mass contract distribution | Planned |
| Open Rate Tracking | Contract view analytics | Planned |
| Expiration Alerts | Contract deadline notifications | Planned |
| Counter-Signatures | Multi-party signing | Planned |

#### Phase 6: Properties & Real Estate (Q3-Q4 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Virtual Tour Embed | 360° tour integration | Planned |
| Floor Plans | Floorplan upload/display | Planned |
| Property Comparison | Side-by-side views | Planned |
| Lead Forms | Custom capture forms | Planned |
| Social Cards | Auto-generated share images | Planned |
| SEO Tools | Meta tag optimization | Planned |
| Custom Domains | Vanity URLs per property | Planned |
| MLS Integration | Listing data sync | Planned |
| Agent Branding | Co-branding options | Planned |

#### Phase 7: AI & Automation (Q4 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Workflow Builder | Visual automation designer | Planned |
| AI Descriptions | Auto-generate photo captions | Planned |
| Smart Pricing | Dynamic pricing suggestions | Planned |
| Auto Gallery Delivery | Trigger-based delivery | Planned |
| Email Personalization | Dynamic content insertion | Planned |
| Client Onboarding | Automated sequences | Planned |
| Task Automation | Rule-based task creation | Planned |
| Busy Period Predictions | Demand forecasting | Planned |
| AI Client Matching | Style-based matching | Planned |

#### Phase 8: Enterprise (2026)
| Feature | Description | Status |
|---------|-------------|--------|
| Public API | RESTful API access | Planned |
| Webhooks | Event notifications | Planned |
| White-Label | Custom branding | Planned |
| SSO/SAML | Enterprise authentication | Planned |
| Audit Logs | Compliance logging | Planned |
| Custom Roles | Granular permissions | Planned |
| Multi-Location | Branch management | Planned |
| Marketplace | Third-party integrations | Planned |

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL with Prisma ORM |
| Authentication | Clerk |
| Payments | Stripe (Payments + Connect) |
| Storage | Cloudflare R2 |
| Email | Resend |
| Styling | Tailwind CSS |
| Deployment | Railway |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account
- Clerk account
- Cloudflare R2 bucket

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/photoproos.git
cd photoproos
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure your `.env` file with required values:
```env
# Database
DATABASE_URL=postgresql://...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ACCOUNT_ID=
R2_PUBLIC_URL=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up the database
```bash
npx prisma generate
npx prisma db push
```

6. Start the development server
```bash
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Authenticated dashboard routes
│   │   ├── clients/       # Client management
│   │   ├── galleries/     # Gallery management
│   │   ├── invoices/      # Invoice management
│   │   ├── payments/      # Payment tracking
│   │   ├── properties/    # Property websites
│   │   ├── scheduling/    # Booking management
│   │   ├── services/      # Service configuration
│   │   └── settings/      # Organization settings
│   ├── (client-portal)/   # Client portal routes
│   ├── (marketing)/       # Marketing/public pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Primitives (button, input, etc.)
│   ├── dashboard/        # Dashboard-specific components
│   ├── portal/           # Client portal components
│   └── onboarding/       # Onboarding wizard
├── lib/
│   ├── actions/          # Server actions (33+ files)
│   ├── db.ts            # Prisma client
│   ├── storage.ts       # R2 storage utilities
│   └── utils.ts         # Utility functions
├── emails/               # React Email templates
└── styles/              # Global styles
```

## Database Schema

### Core Models
- `Organization` - Multi-tenant organization
- `User` - User accounts
- `OrganizationMember` - Team membership

### Client Management
- `Client` - Client profiles
- `ClientSession` - Portal authentication sessions

### Services & Galleries
- `Service` - Photography services
- `Project` - Galleries/projects
- `Asset` - Photo assets with EXIF data
- `DeliveryLink` - Gallery delivery URLs

### Payments & Invoicing
- `Payment` - Payment records
- `PaymentPlan` - Installment plans
- `Invoice` - Invoices
- `InvoiceLineItem` - Invoice line items
- `DiscountCode` - Promotional codes

### Scheduling
- `BookingType` - Booking categories
- `Booking` - Scheduled appointments
- `BookingReminder` - Automated reminders

### Contracts
- `ContractTemplate` - Contract templates
- `Contract` - Signed contracts
- `ContractSigner` - Signature records

### Properties
- `PropertyWebsite` - Property listing pages
- `PropertyLead` - Lead submissions
- `PropertyAnalytics` - Page analytics

See `prisma/schema.prisma` for the complete schema.

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload/presigned-url` | POST | Get S3 presigned upload URL |
| `/api/upload/complete` | POST | Mark upload complete |
| `/api/download/[assetId]` | GET | Download single asset |
| `/api/download/batch` | POST | Batch download as ZIP |
| `/api/gallery/favorite` | POST | Toggle gallery favorite |
| `/api/gallery/comment` | POST/GET/DELETE | Manage gallery comments |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/api/auth/client` | POST/GET | Client portal authentication |
| `/api/cron/late-fees` | GET/POST | Late fee automation (cron) |

## Cron Jobs

PhotoProOS includes automated background jobs that should be scheduled to run periodically.

### Late Fee Automation

**Endpoint:** `GET /api/cron/late-fees`

**Recommended Schedule:** Daily at midnight (00:00 UTC)

**What it does:**
1. Marks all invoices past their due date as "overdue"
2. Applies late fees to invoices where late fees are enabled
3. Prevents duplicate fees (30-day minimum between applications)

**Railway Setup:**

1. Create a new service in Railway with type "Cron Job"
2. Configure the cron expression: `0 0 * * *` (daily at midnight)
3. Set the command:
   ```bash
   curl -X GET "https://your-domain.railway.app/api/cron/late-fees" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
4. Add `CRON_SECRET` environment variable (any secure random string)
5. Add the same `CRON_SECRET` to your main app's environment variables

**Manual Testing:**
```bash
curl -X GET "http://localhost:3000/api/cron/late-fees" \
  -H "Authorization: Bearer your-cron-secret"
```

**Response:**
```json
{
  "success": true,
  "overdueMarked": 5,
  "lateFeesApplied": 3,
  "totalFeesAppliedCents": 15000,
  "totalFeesFormatted": "$150.00"
}
```

## Server Actions

PhotoProOS uses Next.js Server Actions for data mutations. Key action files:

| File | Purpose |
|------|---------|
| `clients.ts` | Client CRUD operations |
| `galleries.ts` | Gallery management |
| `bookings.ts` | Scheduling operations |
| `invoices.ts` | Invoice management |
| `payments.ts` | Payment processing |
| `property-websites.ts` | Property site management |
| `discount-codes.ts` | Promotional codes |
| `payment-plans.ts` | Installment plans |
| `watermark-settings.ts` | Watermark configuration |
| `analytics.ts` | Revenue and LTV metrics |

## Development

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Database Migrations
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Create a migration
npx prisma migrate dev --name your_migration_name
```

### Linting
```bash
npm run lint
```

## Deployment

PhotoProOS is configured for Railway deployment:

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main

### Required Environment Variables for Production

```env
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_ACCOUNT_ID
R2_PUBLIC_URL
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
CRON_SECRET
```

## Architecture Decisions

### Multi-Tenancy
PhotoProOS uses organization-based multi-tenancy. Each organization has its own clients, galleries, invoices, and settings. Users can belong to multiple organizations with different roles.

### File Storage
Files are stored in Cloudflare R2 with presigned URLs for secure uploads and downloads. Thumbnails and optimized versions are generated on upload.

### Payment Processing
Stripe Connect is used for payment processing, allowing photographers to receive payments directly while the platform takes a commission.

### Authentication
- **Dashboard:** Clerk authentication with organizations
- **Client Portal:** Magic link authentication with session tokens

### Rate Limiting
Public API endpoints use Upstash Redis for rate limiting to prevent abuse.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing patterns for server actions
- Use Tailwind CSS for styling
- Follow the Lumos Design System guidelines

## License

Proprietary - All rights reserved

## Support

For support, email support@photoproos.com

---

Built with Next.js, Prisma, Stripe, and Clerk.
