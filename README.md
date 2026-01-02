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

### Coming Soon (Phase 1)
- Availability blocking and time-off management
- Two-way Google Calendar sync
- Client communication history and notes
- E-signature for contracts
- Client tags and segmentation

### Roadmap
- **Phase 2:** Client Experience (Gallery collections, Portal V2, Forms)
- **Phase 3:** Business Operations (Expenses, Workflows, Reporting)
- **Phase 4:** Marketing & Growth (Email campaigns, Lead pipeline)
- **Phase 5:** Advanced Features (E-commerce, AI, Mobile app)
- **Phase 6:** Enterprise (API, White-label, Marketplace)

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
