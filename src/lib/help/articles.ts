// Help Center article data for PhotoProOS

export interface HelpArticle {
  slug: string;
  category: string;
  categorySlug: string;
  title: string;
  description: string;
  content: string;
  relatedArticles?: string[]; // slugs
}

export interface HelpCategory {
  slug: string;
  title: string;
  description: string;
  icon: string; // icon name reference
}

export const helpCategories: HelpCategory[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "New to PhotoProOS? Start here.",
    icon: "rocket",
  },
  {
    slug: "galleries",
    title: "Galleries",
    description: "Create and manage stunning photo galleries.",
    icon: "image",
  },
  {
    slug: "clients",
    title: "Clients & CRM",
    description: "Manage your client relationships.",
    icon: "users",
  },
  {
    slug: "payments",
    title: "Payments & Invoicing",
    description: "Get paid faster with seamless payments.",
    icon: "credit-card",
  },
  {
    slug: "bookings",
    title: "Bookings & Scheduling",
    description: "Streamline your booking process.",
    icon: "calendar",
  },
  {
    slug: "account",
    title: "Account & Billing",
    description: "Manage your subscription and settings.",
    icon: "settings",
  },
];

export const helpArticles: HelpArticle[] = [
  // Getting Started
  {
    slug: "quick-start",
    category: "Getting Started",
    categorySlug: "getting-started",
    title: "Quick Start Guide",
    description: "Get up and running with PhotoProOS in minutes.",
    relatedArticles: ["account-setup", "first-gallery", "branding"],
    content: `
## Welcome to PhotoProOS

PhotoProOS is the complete business operating system for professional photographers. This quick start guide will help you set up your account and create your first gallery in under 10 minutes.

## Step 1: Complete Your Profile

After signing up, head to **Settings > Profile** to:

1. Upload your logo or avatar
2. Add your business name
3. Set your primary contact email
4. Add your phone number (optional)

## Step 2: Set Up Your Branding

Your brand appears on all client-facing galleries. Go to **Settings > Branding** to:

- Upload your logo (recommended: transparent PNG, 200x50px)
- Choose your primary brand color
- Add a custom watermark (optional)
- Set your gallery cover image

## Step 3: Connect Your Payment Account

To accept payments, connect your Stripe account:

1. Go to **Settings > Payments**
2. Click "Connect with Stripe"
3. Complete the Stripe onboarding process
4. Once connected, you'll see your account status as "Active"

## Step 4: Add Your First Client

Before creating a gallery, add your client:

1. Navigate to **Clients** in the sidebar
2. Click "Add Client"
3. Enter their name and email
4. Add any additional details (company, phone, etc.)

## Step 5: Create Your First Gallery

Now you're ready to create a gallery:

1. Go to **Galleries** and click "New Gallery"
2. Name your gallery and select a client
3. Upload your photos (drag and drop or click to browse)
4. Set your pricing (free or paid)
5. Click "Create Gallery"

## Step 6: Share with Your Client

Once your gallery is ready:

1. Click the "Share" button on your gallery
2. Copy the gallery link or send directly via email
3. Your client will receive an email notification

## Next Steps

Congratulations! You've created your first gallery. Here's what to explore next:

- [Organizing Photos](/help/galleries/organize) - Learn to curate and arrange your galleries
- [Pay-to-Unlock](/help/payments/pay-to-unlock) - Set up paid gallery delivery
- [Customizing Branding](/help/getting-started/branding) - Make your galleries match your brand

## Need Help?

If you run into any issues, our support team is here to help:

- Email: support@photoproos.com
- Response time: Within 24 hours
`,
  },
  {
    slug: "account-setup",
    category: "Getting Started",
    categorySlug: "getting-started",
    title: "Setting Up Your Account",
    description: "Configure your account settings and preferences.",
    relatedArticles: ["quick-start", "branding"],
    content: `
## Account Settings Overview

Your account settings control how PhotoProOS works for you. Access settings by clicking the gear icon in the sidebar or navigating to **Settings**.

## Profile Settings

### Business Information

Fill out your business details:

- **Business Name** - Displayed on invoices and galleries
- **Email** - Your primary contact email
- **Phone** - Optional, shown on invoices
- **Address** - For invoicing purposes
- **Timezone** - Affects scheduling and notifications

### Profile Photo

Upload a professional headshot or your company logo. This appears:

- In the top navigation
- On gallery pages (optional)
- In email communications

## Notification Preferences

Control what emails you receive:

- **Gallery Views** - When clients view your galleries
- **Downloads** - When clients download photos
- **Payments** - Payment confirmations and failures
- **Weekly Summary** - Business metrics digest

## Security Settings

### Password

Change your password regularly:

1. Go to Settings > Security
2. Enter your current password
3. Enter and confirm your new password
4. Click "Update Password"

### Two-Factor Authentication

We strongly recommend enabling 2FA:

1. Go to Settings > Security
2. Click "Enable 2FA"
3. Scan the QR code with your authenticator app
4. Enter the verification code

## Connected Accounts

View and manage integrations:

- **Stripe** - Payment processing
- **Google Calendar** - Booking sync
- **Dropbox** - File backup (coming soon)

## Danger Zone

### Export Data

Download all your data:

- Client information
- Gallery data
- Payment history
- Account settings

### Delete Account

If you need to close your account:

1. Export your data first
2. Cancel any active subscriptions
3. Click "Delete Account"
4. Confirm the deletion

**Warning:** Account deletion is permanent and cannot be undone.
`,
  },
  {
    slug: "first-gallery",
    category: "Getting Started",
    categorySlug: "getting-started",
    title: "Uploading Your First Gallery",
    description: "Learn how to create and upload your first photo gallery.",
    relatedArticles: ["quick-start", "create", "organize"],
    content: `
## Creating Your First Gallery

This guide walks you through creating a beautiful, professional gallery for your client.

## Before You Start

Make sure you have:

- Edited and exported your photos (JPEG or PNG)
- Added your client to PhotoProOS
- Completed your branding setup

## Step 1: Start a New Gallery

1. Click **Galleries** in the sidebar
2. Click the **"New Gallery"** button
3. You'll see the gallery creation form

## Step 2: Gallery Details

Fill in the gallery information:

- **Gallery Name** - Something descriptive like "Smith Wedding - Reception"
- **Client** - Select from your client list
- **Description** - Optional note that appears on the gallery page

## Step 3: Upload Your Photos

### Drag and Drop

The easiest method:

1. Open your photos folder on your computer
2. Select the photos you want to upload
3. Drag them onto the upload area

### Click to Browse

Alternatively:

1. Click the "Browse Files" button
2. Navigate to your photos
3. Select multiple files (Cmd/Ctrl + click)
4. Click "Open"

### Upload Progress

You'll see:

- Individual file progress bars
- Overall upload status
- Any failed uploads (with retry option)

## Step 4: Set Pricing

Choose how clients access the gallery:

### Free Gallery

- Clients can view and download immediately
- Great for included services or proofs

### Paid Gallery

- Set a price to unlock downloads
- Client pays via Stripe checkout
- Photos available after payment

## Step 5: Review and Create

Before publishing:

1. Review your gallery details
2. Check the photo count
3. Preview how it will look
4. Click "Create Gallery"

## After Creation

Your gallery is now in **Draft** status. You can:

- Add or remove photos
- Reorder images
- Edit settings
- Delete and start over

## Publishing

When you're ready to share:

1. Click "Publish Gallery"
2. Choose your notification preference
3. Copy the share link or send directly

## Tips for Great Galleries

- **Curate carefully** - Quality over quantity
- **Order matters** - Put your best shots first
- **Name thoughtfully** - Clients see the gallery name
- **Test before sharing** - Open the client view yourself
`,
  },
  {
    slug: "branding",
    category: "Getting Started",
    categorySlug: "getting-started",
    title: "Customizing Your Branding",
    description: "Make your galleries match your brand identity.",
    relatedArticles: ["quick-start", "account-setup"],
    content: `
## Brand Customization

Your brand identity should be consistent across all client touchpoints. PhotoProOS lets you customize galleries to match your brand.

## Logo

### Requirements

- **Format:** PNG with transparency (recommended) or JPEG
- **Size:** Max 2MB
- **Dimensions:** 200x50px to 400x100px works best

### Uploading

1. Go to **Settings > Branding**
2. Click "Upload Logo"
3. Select your logo file
4. Adjust positioning if needed

### Where It Appears

Your logo shows on:

- Gallery header
- Gallery footer
- Email notifications
- Invoices

## Brand Colors

### Primary Color

Your main brand color is used for:

- Buttons and links
- Accent elements
- Loading indicators

To set your primary color:

1. Go to Settings > Branding
2. Click the color picker
3. Enter your hex code (e.g., #3B82F6)
4. Preview the result

### Secondary Colors

Currently, the system automatically generates complementary colors based on your primary choice.

## Cover Images

### Gallery Covers

Set a default cover image for your galleries:

1. Upload a cover image (16:9 ratio recommended)
2. This becomes the default for new galleries
3. Individual galleries can override this

### Cover Tips

- Use a representative image from your work
- Avoid busy or distracting images
- Ensure it looks good cropped

## Custom Domain (Pro Feature)

Instead of photoproos.com/g/your-gallery, use your own domain:

1. Go to Settings > Domains
2. Enter your custom domain
3. Follow DNS configuration steps
4. Wait for verification (up to 48 hours)

## Watermark Settings

### Adding a Watermark

1. Go to Settings > Branding > Watermark
2. Upload your watermark image
3. Set position (corner or center)
4. Adjust opacity (30-50% recommended)

### Watermark Tips

- Use white or light watermarks on most photos
- Keep watermarks subtle but visible
- Consider a text watermark as backup

## Preview Changes

Before saving:

1. Click "Preview" to see how changes look
2. Check on both desktop and mobile views
3. Send a test gallery to yourself
4. Make adjustments as needed

## Brand Consistency Checklist

- [ ] Logo uploaded and positioned correctly
- [ ] Brand color matches your website
- [ ] Cover image represents your work
- [ ] Watermark is subtle but visible
- [ ] Test gallery sent and reviewed
`,
  },
  // Galleries
  {
    slug: "create",
    category: "Galleries",
    categorySlug: "galleries",
    title: "Creating a Gallery",
    description: "Step-by-step guide to creating professional galleries.",
    relatedArticles: ["first-gallery", "organize", "privacy"],
    content: `
## Gallery Creation Process

Creating a gallery in PhotoProOS is straightforward. This guide covers all the options and best practices.

## Starting a New Gallery

### From the Dashboard

1. Click the **"New Gallery"** button in the top right
2. Or use the keyboard shortcut: **Cmd/Ctrl + N**

### From the Galleries Page

1. Navigate to **Galleries** in the sidebar
2. Click **"New Gallery"**

## Gallery Information

### Required Fields

- **Gallery Name** - Visible to clients, make it descriptive
- **Client** - Select an existing client or create new

### Optional Fields

- **Description** - Shown on the gallery page
- **Internal Notes** - Only visible to you
- **Tags** - For your organization

## Photo Upload

### Supported Formats

- JPEG/JPG (most common)
- PNG (for graphics with transparency)
- HEIC (converted automatically)

### File Size Limits

- Individual files: Up to 50MB
- Total gallery: No limit (depends on plan)
- Recommended: 5-15MB for web-optimized photos

### Upload Methods

**Drag and Drop**
Simply drag files or folders onto the upload area.

**File Browser**
Click "Browse" to open your file manager.

**Lightroom Plugin** (Coming Soon)
Export directly from Lightroom to PhotoProOS.

## Gallery Settings

### Visibility

- **Draft** - Only you can see it
- **Private** - Only people with the link
- **Password Protected** - Requires password to view

### Downloads

- **Enable Downloads** - Allow photo downloads
- **Download Quality** - Original or web-sized
- **Download Limit** - Restrict number of downloads

### Pricing

- **Free** - Immediate access
- **Paid** - Requires payment before downloads

## Advanced Options

### Cover Photo

The first photo becomes the cover by default. To change:

1. Click any photo in the gallery
2. Select "Set as Cover"

### Photo Order

Photos upload in filename order. To reorder:

1. Enable "Edit Mode"
2. Drag photos to new positions
3. Click "Save Order"

### Expiration

Set galleries to expire automatically:

1. Enable "Auto Expire"
2. Choose expiration period
3. Gallery becomes inaccessible after date

## Creating the Gallery

Once everything is set:

1. Review all settings
2. Click "Create Gallery"
3. Gallery is saved in Draft status

## Next Steps

After creation:

- [Organize your photos](/help/galleries/organize)
- [Set privacy options](/help/galleries/privacy)
- Share with your client
`,
  },
  {
    slug: "organize",
    category: "Galleries",
    categorySlug: "galleries",
    title: "Organizing Photos",
    description: "Learn to arrange and curate your galleries effectively.",
    relatedArticles: ["create", "downloads"],
    content: `
## Photo Organization

Well-organized galleries create a better client experience. Learn how to arrange photos effectively.

## Reordering Photos

### Drag and Drop

1. Open your gallery in edit mode
2. Click and hold any photo
3. Drag to the desired position
4. Release to drop

### Sort Options

Quick sorting options:

- **Filename** - Alphabetical by file name
- **Date Taken** - By EXIF date
- **Date Uploaded** - Most recent first

## Grouping Photos

### Creating Sections

Break large galleries into sections:

1. Click "Add Section"
2. Name the section (e.g., "Ceremony", "Reception")
3. Drag photos into sections

### Section Order

Reorder sections by:

1. Click the section header
2. Drag to new position
3. All photos in the section move together

## Selecting Photos

### Single Selection

Click a photo to select it.

### Multiple Selection

- **Cmd/Ctrl + Click** - Select individual photos
- **Shift + Click** - Select a range
- **Cmd/Ctrl + A** - Select all

### With Selection, You Can:

- Move to section
- Delete photos
- Download selected
- Set as cover

## Deleting Photos

### Individual Photos

1. Hover over the photo
2. Click the trash icon
3. Confirm deletion

### Bulk Delete

1. Select multiple photos
2. Click "Delete Selected"
3. Confirm deletion

**Note:** Deleted photos are permanently removed. There is no recycle bin.

## Favorites and Highlights

### Client Favorites

Clients can mark favorites while viewing. You can:

- See which photos they liked
- Export favorite selections
- Create a highlights gallery

### Photographer Picks

Mark your recommended photos:

1. Select photos
2. Click "Mark as Highlight"
3. Highlights appear with a star

## Gallery Cover

### Automatic

By default, the first photo becomes the cover.

### Manual Selection

1. Right-click any photo
2. Select "Set as Cover"
3. Cover updates immediately

### Cover Tips

- Choose a strong, representative image
- Consider how it looks cropped
- Avoid text-heavy images

## Bulk Operations

### Available Actions

- Move to section
- Delete photos
- Download selected
- Copy to another gallery

### Performance Tips

- Work with selections of 100 or fewer
- Large galleries may have slight delays
- Wait for operations to complete before starting new ones

## Best Practices

1. **Curate ruthlessly** - Don't include every photo
2. **Lead with your best** - First impressions matter
3. **Group logically** - Use sections for large shoots
4. **Consider flow** - Tell a visual story
5. **End strong** - Save a great shot for last
`,
  },
  {
    slug: "privacy",
    category: "Galleries",
    categorySlug: "galleries",
    title: "Gallery Privacy Settings",
    description: "Control who can access and view your galleries.",
    relatedArticles: ["create", "downloads"],
    content: `
## Privacy Options

PhotoProOS gives you full control over who can access your galleries.

## Visibility Levels

### Draft (Private to You)

- Only you can see the gallery
- Does not appear in any lists
- Cannot be accessed by link
- Use for work in progress

### Private Link

- Anyone with the link can view
- Link is not guessable (secure URL)
- Good for most client delivery
- Can be combined with password

### Password Protected

- Requires password to view
- You set the password
- Share password separately from link
- Best for sensitive content

## Password Protection

### Setting a Password

1. Go to Gallery Settings
2. Enable "Password Protection"
3. Enter your desired password
4. Save changes

### Password Tips

- Use something memorable
- Don't use sensitive info
- Share via separate message
- Consider client's email domain

### Changing the Password

1. Go to Gallery Settings
2. Enter new password
3. Old password stops working immediately

## Link Settings

### Gallery Links

Each gallery has a unique link like:
**photoproos.com/g/abc123xyz**

### Custom Slugs

Make links more memorable:
**photoproos.com/g/smith-wedding-2024**

To set a custom slug:

1. Go to Gallery Settings
2. Enter your preferred URL slug
3. Check availability
4. Save changes

## Expiration Settings

### Auto-Expire Galleries

Set galleries to become inaccessible:

1. Enable "Auto Expire"
2. Choose duration (30, 60, 90 days, etc.)
3. Gallery access ends on that date

### After Expiration

- Link returns "Gallery Expired" message
- Photos are NOT deleted
- You can re-enable access anytime
- Paid galleries remain accessible

## Download Controls

### Disable Downloads

If you only want viewing:

1. Go to Gallery Settings
2. Disable "Allow Downloads"
3. Clients can view but not download

### Download Limits

Restrict download counts:

1. Enable "Download Limits"
2. Set maximum downloads per photo or gallery
3. Counter resets if you choose

## Watermarking

### Force Watermarks

Ensure photos always have watermarks:

1. Go to Gallery Settings
2. Enable "Require Watermark"
3. All views show watermarked versions

### Watermark-Free Downloads

Offer watermark-free after purchase:

1. Enable Pay-to-Unlock
2. Watermarked previews shown
3. Clean originals after payment

## Client Access Reports

### View Access Logs

See who accessed your gallery:

1. Open the gallery
2. Click "Analytics"
3. View access history

### Available Data

- View timestamps
- Download events
- Location (approximate)
- Device type

## Security Best Practices

1. Use password protection for sensitive content
2. Set appropriate expiration dates
3. Monitor access logs regularly
4. Don't reuse gallery passwords
5. Update passwords if shared broadly
`,
  },
  {
    slug: "downloads",
    category: "Galleries",
    categorySlug: "galleries",
    title: "Download Options",
    description: "Configure how clients download their photos.",
    relatedArticles: ["organize", "privacy", "pay-to-unlock"],
    content: `
## Download Configuration

Control how clients download photos from your galleries.

## Download Types

### Individual Photos

Clients can download one photo at a time:

- Click on any photo
- Click the download button
- Photo downloads immediately

### Batch Downloads

Download multiple photos at once:

1. Client selects multiple photos
2. Clicks "Download Selected"
3. Photos download as a ZIP file

### Full Gallery

Download the entire gallery:

1. Click "Download All"
2. System generates ZIP archive
3. Download link sent via email (for large galleries)

## Quality Settings

### Original Quality

Delivers the exact file you uploaded:

- Full resolution
- Original file size
- Includes EXIF data
- Best for print purposes

### Web Optimized

Smaller files for faster downloads:

- 2048px long edge
- JPEG quality 85%
- Faster downloads
- Good for social media

### Multiple Options

Let clients choose their preferred quality:

1. Enable "Quality Selection"
2. Both options appear to client
3. They choose at download time

## File Format

### Default Behavior

Files download in their original format (usually JPEG).

### Conversion Options

- JPEG (default)
- PNG (if uploaded)
- Original format preserved

## Download Limits

### Per Photo

Limit downloads of individual photos:

1. Go to Gallery Settings
2. Set "Max Downloads per Photo"
3. Counter tracks usage

### Per Gallery

Limit total downloads from gallery:

1. Set "Max Gallery Downloads"
2. Applies to full gallery downloads
3. Individual photos count separately

### Unlimited

Default setting allows unlimited downloads.

## Download Experience

### Quick Downloads

For immediate downloads:

- Click download icon
- Browser downloads file
- No additional steps

### Email Delivery

For large downloads:

1. Client requests download
2. System generates archive
3. Email sent with download link
4. Link expires after 24 hours

## Download Analytics

### Track Downloads

View download statistics:

1. Open gallery
2. Go to "Analytics"
3. See download counts per photo

### Available Metrics

- Total downloads
- Downloads per photo
- Download dates
- Quality chosen

## Paid Downloads

### Pay-to-Unlock

Require payment before downloads:

1. Enable pricing on gallery
2. Clients can preview (watermarked)
3. Pay to unlock full resolution
4. Downloads available after payment

### After Payment

- All restrictions lifted
- Original quality available
- No watermarks
- Unlimited downloads (unless limited)

## Troubleshooting

### Download Won't Start

Common solutions:

- Check popup blocker settings
- Try a different browser
- Clear browser cache
- Contact support if persists

### Corrupt Downloads

If files are corrupted:

- Re-download the file
- Try individual instead of batch
- Check your internet connection
- File may have upload issues

### Slow Downloads

Improve download speeds:

- Download during off-peak hours
- Use wired internet connection
- Close other bandwidth-heavy apps
- Contact support for CDN issues
`,
  },
  // Clients
  {
    slug: "add",
    category: "Clients & CRM",
    categorySlug: "clients",
    title: "Adding Clients",
    description: "Create client records and keep your CRM organized.",
    relatedArticles: ["portal", "tags", "communication"],
    content: `
## Add a New Client

Create a client profile so every gallery, invoice, and booking stays connected.

### From the Clients Page

1. Go to **Clients** in the sidebar.
2. Click **Add Client**.
3. Enter name, email, and phone (optional).
4. Add company, address, and notes if needed.
5. Click **Save**.

### From a Gallery or Booking

You can also create a client while creating a gallery or booking:

1. Start the gallery or booking flow.
2. Choose **Create new client**.
3. Fill in the client details.
4. Continue the flow.

## Required Fields

- **Name** (first + last)
- **Email** (used for portal access and notifications)

## Tips for Clean Data

- Use consistent formatting for company names.
- Add phone numbers for SMS reminders.
- Keep notes short and actionable.
`,
  },
  {
    slug: "portal",
    category: "Clients & CRM",
    categorySlug: "clients",
    title: "Client Portal Access",
    description: "Invite clients into their portal and manage access.",
    relatedArticles: ["add", "communication", "tags"],
    content: `
## Client Portal Access

The client portal is where clients see their galleries, invoices, and bookings.

## Invite a Client

1. Open a client profile.
2. Click **Portal**.
3. Send the invite email or copy the portal link.
4. The client sets a password to log in.

## What Clients See

- Shared galleries and download status
- Open invoices and payment history
- Upcoming bookings and details
- Messages or notes you share

## Resend or Revoke Access

- Resend an invite from the client profile.
- Revoke access to remove portal visibility.

## Troubleshooting

- Confirm the client email address is correct.
- Ask the client to check spam or promotions folders.
- Re-send the invite if they did not receive it.
`,
  },
  {
    slug: "tags",
    category: "Clients & CRM",
    categorySlug: "clients",
    title: "Tags and Organization",
    description: "Segment clients with tags, filters, and saved views.",
    relatedArticles: ["add", "communication", "portal"],
    content: `
## Organize with Tags

Tags make it easy to segment your client list by type, location, or status.

## Create Tags

1. Go to **Clients**.
2. Select one or more clients.
3. Choose **Add Tag**.
4. Enter a tag name (e.g., "Real Estate", "VIP", "Retainer").

## Use Tags to Filter

- Filter the list by one or more tags.
- Save views for repeat workflows.
- Combine tags with status and date filters.

## Best Practices

- Keep tags short and consistent.
- Use a few core tags instead of dozens.
- Review tags quarterly and merge duplicates.
`,
  },
  {
    slug: "communication",
    category: "Clients & CRM",
    categorySlug: "clients",
    title: "Communication History",
    description: "Track notes, emails, and activity in one timeline.",
    relatedArticles: ["add", "portal", "tags"],
    content: `
## Communication History

Every client profile includes a timeline of activity so you never lose context.

## What Gets Logged

- Notes you add manually
- Booking and gallery activity
- Invoice events and payments
- Client portal access

## Add Internal Notes

1. Open a client profile.
2. Click **Add Note**.
3. Save key details or next steps.

## Email and Notification Tracking

You can see when reminders or delivery messages were sent. Use the timeline to confirm if a client was notified.

## Tips

- Keep notes specific and time-bound.
- Record key preferences (turnaround time, delivery format).
- Log follow-ups to avoid missed steps.
`,
  },
  // Payments
  {
    slug: "stripe-setup",
    category: "Payments & Invoicing",
    categorySlug: "payments",
    title: "Setting Up Stripe",
    description: "Connect your Stripe account to accept payments.",
    relatedArticles: ["invoices", "pay-to-unlock"],
    content: `
## Getting Started with Stripe

Stripe is the payment processor that powers PhotoProOS payments. You'll need a connected Stripe account to accept payments.

## Creating Your Stripe Account

If you don't have a Stripe account:

1. Go to **Settings > Payments**
2. Click "Connect with Stripe"
3. Click "Create New Stripe Account"
4. Fill in your business information

## Connecting an Existing Account

If you already have Stripe:

1. Go to **Settings > Payments**
2. Click "Connect with Stripe"
3. Sign in to your Stripe account
4. Authorize PhotoProOS access

## Required Information

Stripe needs:

### Business Details

- Legal business name
- Business address
- Business type (sole proprietor, LLC, etc.)
- Tax ID / EIN (or SSN for sole proprietors)

### Bank Account

- Account for receiving payouts
- Routing and account numbers
- Account must be in your name

### Identity Verification

- Government ID (for some account types)
- Proof of address (for some account types)

## Verification Process

### Instant Approval

Most accounts are approved instantly if:

- Information is accurate
- Common business type
- Good standing with Stripe

### Additional Review

Some accounts need review:

- High-risk categories
- Large expected volume
- Missing information

Review typically takes 1-3 business days.

## Account Status

### Active

You can accept payments immediately.

### Pending

Verification in progress. You can accept payments, but payouts are held.

### Restricted

Action required. Check email for details.

## Payout Settings

### Default Payout Schedule

Stripe pays out on a rolling basis:

- US: 2-day rolling
- Other countries vary

### Manual Payouts

To control when you receive funds:

1. Go to Stripe Dashboard
2. Settings > Payouts
3. Enable "Manual Payouts"

## Fees

### PhotoProOS Platform Fee

We take a small percentage of each transaction (varies by plan).

### Stripe Processing Fees

Standard Stripe fees apply:

- 2.9% + 30¢ per successful charge
- Varies by country

## Troubleshooting

### Connection Failed

If connection doesn't work:

1. Clear browser cache
2. Disable ad blockers
3. Try a different browser
4. Contact support

### Payouts Not Arriving

Check:

1. Bank account information is correct
2. No Stripe account restrictions
3. Minimum payout threshold met

### Customer Payments Failing

Common causes:

- Card declined by issuer
- Incorrect card details
- Insufficient funds
- Geographic restrictions

## Security

### Data Protection

- PhotoProOS never sees full card numbers
- All data encrypted in transit
- PCI DSS compliant infrastructure
- Stripe handles all sensitive data

### Fraud Protection

- Stripe Radar included
- Automatic fraud detection
- Chargeback protection available

## Getting Help

### PhotoProOS Support

For connection and integration issues.

### Stripe Support

For account, payout, and payment issues:

- support.stripe.com
- Stripe Dashboard help
`,
  },
  {
    slug: "invoices",
    category: "Payments & Invoicing",
    categorySlug: "payments",
    title: "Creating Invoices",
    description: "Generate and send professional invoices to clients.",
    relatedArticles: ["stripe-setup", "pay-to-unlock"],
    content: `
## Invoice Overview

PhotoProOS makes it easy to create professional invoices for your photography services.

## Creating an Invoice

### From the Dashboard

1. Click **"New Invoice"** in the sidebar
2. Select or create a client
3. Add line items
4. Review and send

### From a Client Profile

1. Open the client's profile
2. Click "Create Invoice"
3. Client info pre-filled
4. Add services and send

### From a Booking

1. Open the booking details
2. Click "Generate Invoice"
3. Services from booking pre-filled
4. Review and send

## Invoice Components

### Header

Automatically includes:

- Your business name and logo
- Your contact information
- Client name and details
- Invoice number (auto-generated)
- Invoice date
- Due date

### Line Items

Add items with:

- Description
- Quantity
- Unit price
- Total (auto-calculated)

### Summary

Shows:

- Subtotal
- Tax (if applicable)
- Discounts (if any)
- Total due

## Line Item Types

### Services

Pre-defined photography services:

1. Click "Add Service"
2. Select from your service list
3. Adjust quantity if needed
4. Price populates automatically

### Custom Items

Add one-time items:

1. Click "Add Custom Item"
2. Enter description
3. Set price
4. Add quantity

### Travel Fees

Include travel expenses:

1. Add travel line item
2. Enter miles or fixed fee
3. Description auto-generated

## Discounts

### Percentage Discount

Apply a percentage off:

1. Click "Add Discount"
2. Choose "Percentage"
3. Enter percentage
4. Applies to subtotal

### Fixed Amount

Apply a dollar discount:

1. Click "Add Discount"
2. Choose "Fixed Amount"
3. Enter discount amount

## Tax Settings

### Enable Tax

1. Go to Settings > Tax
2. Set your tax rate
3. Choose taxable services
4. Tax auto-calculated on invoices

### Tax-Exempt Clients

For clients exempt from tax:

1. Open client profile
2. Enable "Tax Exempt"
3. Add exemption reason

## Sending Invoices

### Email Delivery

1. Review the invoice
2. Click "Send Invoice"
3. Client receives email with:
   - Invoice PDF
   - Payment link
   - Your message (optional)

### Copy Link

Share a direct payment link:

1. Click "Copy Payment Link"
2. Send via your preferred method
3. Client clicks to pay

## Payment Options

### Online Payment

Clients pay via Stripe:

- Credit/debit card
- Apple Pay / Google Pay
- Bank transfer (ACH)

### Manual Payment

Record offline payments:

1. Open the invoice
2. Click "Record Payment"
3. Enter payment details
4. Invoice marked as paid

## Invoice Status

### Draft

Not yet sent. Editable.

### Sent

Delivered to client. Awaiting payment.

### Viewed

Client has opened the invoice.

### Paid

Payment received. Complete.

### Overdue

Past due date. Unpaid.

## Payment Reminders

### Automatic Reminders

Enable automatic follow-ups:

1. Go to Settings > Invoices
2. Enable "Payment Reminders"
3. Set reminder schedule

### Manual Reminders

Send a reminder anytime:

1. Open the invoice
2. Click "Send Reminder"
3. Client receives follow-up email

## Invoice Templates

### Default Template

Professional design with your branding.

### Customization

Adjust template settings:

- Logo placement
- Color scheme
- Footer notes
- Terms and conditions
`,
  },
  {
    slug: "pay-to-unlock",
    category: "Payments & Invoicing",
    categorySlug: "payments",
    title: "Pay-to-Unlock Galleries",
    description: "Require payment before clients can download photos.",
    relatedArticles: ["stripe-setup", "invoices", "privacy"],
    content: `
## Pay-to-Unlock Overview

Pay-to-unlock galleries require clients to pay before downloading full-resolution photos. This is perfect for:

- Event photography
- Portrait sessions
- Commercial shoots
- Any work delivered digitally

## How It Works

### Client Experience

1. Client receives gallery link
2. Views watermarked previews
3. Browses and reviews photos
4. Clicks "Unlock Gallery"
5. Completes payment via Stripe
6. Immediately accesses downloads

### Photographer Experience

1. Upload photos to gallery
2. Set gallery price
3. Share link with client
4. Receive payment notification
5. Funds deposited to your Stripe

## Setting Up Pay-to-Unlock

### New Gallery

1. Create a new gallery
2. Add your photos
3. Under "Pricing," select "Paid"
4. Enter the price
5. Create the gallery

### Existing Gallery

1. Open gallery settings
2. Change pricing to "Paid"
3. Enter the price
4. Save changes

## Pricing Options

### Flat Rate

Charge one price for the entire gallery:

- Best for most situations
- Simple for clients to understand
- Clear value proposition

### Variable Pricing

Different pricing options available:

- **Per-photo pricing**: Charge per image downloaded
- **Tiered packages**: Offer bundles with different photo counts
- **Add-on services**: Include retouching, prints, or rush delivery

## Preview Options

### Watermarked Previews

Default behavior:

- Low-resolution previews shown
- Your watermark overlaid
- Protects your work
- Client can evaluate photos

### Blurred Previews

Alternative option:

- Photos shown with blur effect
- Tease the content
- Maximum protection

## After Payment

### Immediate Access

Once payment clears:

- Watermarks removed
- Full resolution available
- Download options enabled
- No expiration (unless set)

### Payment Confirmation

Client receives:

- Payment receipt email
- Updated gallery link
- Access confirmation

You receive:

- Payment notification
- Client payment details
- Gallery status update

## Partial Payments

### Deposits

Accept partial payments for galleries:

- Set a deposit amount in gallery settings
- Client pays the deposit first
- Pays remaining balance to unlock full gallery
- Track payment progress in the dashboard

### Payment Plans

Create structured payment plans:

1. Go to **Invoices** → **Payment Plans**
2. Set the number of installments
3. Choose frequency (weekly, biweekly, monthly)
4. Automatic reminders sent for each installment

## Handling Issues

### Payment Failed

If payment fails:

1. Client sees error message
2. Can retry with different card
3. Contact support if persistent

### Refund Requests

To issue a refund:

1. Go to Payments dashboard
2. Find the transaction
3. Click "Issue Refund"
4. Gallery access revoked

### Disputes

If client disputes the charge:

1. You're notified immediately
2. Provide evidence in Stripe
3. Stripe handles the dispute
4. Follow their resolution process

## Best Practices

### Clear Communication

- State pricing before the shoot
- Include in your contract
- Remind before gallery delivery
- Explain what's included

### Fair Pricing

- Research competitor rates
- Value your work appropriately
- Consider client budgets
- Offer payment plans if needed

### Professional Presentation

- Use high-quality watermarks
- Show enough to entice
- Deliver promptly after payment
- Follow up with thank you

## Combining with Other Features

### With Favorites

Clients can favorite photos before paying:

1. View and browse gallery
2. Mark favorites
3. Pay to unlock
4. Download favorites easily

### With Download Limits

Set limits even after payment:

1. Enable pay-to-unlock
2. Set download limit
3. Client pays to unlock
4. Limited downloads available

### With Expiration

Galleries can expire after payment:

1. Set expiration date
2. Client has limited time to download
3. Encourages timely downloads
4. You can extend if needed
`,
  },
  {
    slug: "reports",
    category: "Payments & Invoicing",
    categorySlug: "payments",
    title: "Payment Reports",
    description: "Track your earnings and payment history.",
    relatedArticles: ["stripe-setup", "invoices"],
    content: `
## Payment Reporting

PhotoProOS provides comprehensive payment reports to help you track your business finances.

## Dashboard Overview

Your payment dashboard shows:

- Total revenue (all time)
- Revenue this month
- Pending payments
- Recent transactions

## Revenue Reports

### Time Periods

View revenue by:

- Today
- This week
- This month
- This year
- Custom date range

### Revenue Breakdown

See where your money comes from:

- By client
- By service type
- By gallery
- By payment method

## Transaction History

### Viewing Transactions

1. Go to Payments > History
2. See all transactions
3. Filter and search
4. Export as needed

### Transaction Details

Each transaction shows:

- Amount
- Client name
- Date and time
- Payment method
- Status (paid, pending, refunded)
- Associated gallery or invoice

## Filtering & Search

### Filter Options

- Date range
- Client
- Status
- Payment method
- Amount range

### Search

Find specific transactions by:

- Client name
- Transaction ID
- Invoice number
- Gallery name

## Exporting Data

### Export Options

Download your payment data:

- **CSV** - For spreadsheets
- **PDF** - For records/accountant
- **QuickBooks** - Direct integration (coming soon)

### What's Included

Export contains:

- Transaction date
- Client name
- Description
- Amount
- Fees
- Net amount
- Status

## Understanding Fees

### Fee Breakdown

For each transaction:

- **Gross Amount** - What client paid
- **Stripe Fee** - Processing fee (2.9% + 30¢)
- **Platform Fee** - PhotoProOS fee (varies by plan)
- **Net Amount** - What you receive

### Fee Reports

View total fees paid:

1. Go to Payments > Fees
2. Select date range
3. See fee breakdown

## Payouts

### Payout Schedule

View when funds hit your bank:

1. Go to Payments > Payouts
2. See scheduled payouts
3. View completed payouts

### Payout Details

Each payout shows:

- Amount
- Date initiated
- Date expected
- Status
- Included transactions

## Tax Reporting

### Annual Summary

End-of-year tax report:

1. Go to Payments > Tax Report
2. Select tax year
3. Download summary

### 1099 Information

If you process enough volume, Stripe provides 1099 forms through their dashboard.

## Custom Reports

### Creating Reports

Build custom reports:

1. Go to Payments > Reports
2. Click "New Report"
3. Select metrics
4. Choose date range
5. Generate report

### Saving Reports

Save frequently used reports:

1. Create your report
2. Click "Save Report"
3. Name it
4. Access from your saved reports

## Scheduled Reports

### Automatic Reports

Receive reports automatically:

1. Create a report
2. Click "Schedule"
3. Choose frequency (weekly, monthly)
4. Select recipients
5. Reports sent via email

## Troubleshooting

### Missing Transactions

If a transaction is missing:

1. Check all date filters
2. Clear any active filters
3. Search by client name
4. Check Stripe dashboard directly
5. Contact support if still missing

### Incorrect Amounts

If amounts seem wrong:

1. Check for refunds
2. Verify fee calculations
3. Compare with Stripe dashboard
4. Contact support for discrepancies
`,
  },
  // Bookings
  {
    slug: "availability",
    category: "Bookings & Scheduling",
    categorySlug: "bookings",
    title: "Setting Up Availability",
    description: "Configure your available times for client bookings.",
    relatedArticles: ["forms", "calendar", "reminders"],
    content: `
## Availability Settings

Control when clients can book your services.

## Default Schedule

### Setting Regular Hours

1. Go to **Scheduling > Availability**
2. Set your typical working hours
3. Select available days
4. Save as default

### Example Schedule

- Monday-Friday: 9 AM - 5 PM
- Saturday: 10 AM - 3 PM
- Sunday: Unavailable

## Buffer Time

### Between Bookings

Add buffer time between appointments:

1. Go to Availability settings
2. Set "Buffer Time"
3. Choose duration (15, 30, 60 min)

This prevents back-to-back bookings and gives you travel/prep time.

## Blocking Time

### Vacation/Time Off

Block dates when you're unavailable:

1. Go to Scheduling > Calendar
2. Click on the date
3. Select "Block Time"
4. Add reason (optional)

### Recurring Blocks

For regular unavailable times:

1. Create a block
2. Enable "Repeat"
3. Choose frequency
4. Set end date (optional)

## Minimum Notice

### Lead Time

Require advance notice for bookings:

1. Go to Availability settings
2. Set "Minimum Notice"
3. Choose time (24h, 48h, 1 week, etc.)

Clients can't book within this window.

## Maximum Future Booking

### How Far Ahead

Limit how far in advance clients can book:

1. Set "Maximum Advance"
2. Choose limit (1 month, 3 months, 6 months)

Prevents bookings too far in the future.

## Multiple Booking Types

### Different Availability per Service

If different services have different availability:

1. Create service-specific availability
2. Assign to relevant services
3. Each shows appropriate times

## Integration

### Calendar Sync

Sync with external calendars:

1. Go to Settings > Integrations
2. Connect Google Calendar or Outlook
3. Two-way sync enabled
4. Blocked times auto-update

### Conflicts

When external events conflict:

- Time automatically blocked
- Client sees updated availability
- No double-booking possible
`,
  },
  {
    slug: "forms",
    category: "Bookings & Scheduling",
    categorySlug: "bookings",
    title: "Booking Forms",
    description: "Create custom booking forms for client inquiries.",
    relatedArticles: ["availability", "calendar"],
    content: `
## Booking Forms

Custom booking forms capture the information you need from clients.

## Default Form Fields

Every booking form includes:

- Client name
- Email address
- Phone number
- Preferred date/time
- Service selection

## Custom Fields

### Adding Fields

1. Go to Scheduling > Forms
2. Click "Add Field"
3. Choose field type
4. Configure options

### Field Types

- **Text** - Short answer
- **Textarea** - Long answer
- **Select** - Dropdown options
- **Checkbox** - Yes/no questions
- **Radio** - Single choice from options
- **Date** - Date picker
- **File** - Upload capability

## Form Logic

### Conditional Fields

Show fields based on answers:

1. Add a field
2. Click "Add Condition"
3. Set trigger (if X, show Y)
4. Save logic

Example: Show "Wedding Details" only if "Wedding Photography" selected.

## Required Fields

### Making Fields Required

1. Edit the field
2. Enable "Required"
3. Client must complete to submit

## Embedding Forms

### On Your Website

Get embed code:

1. Go to Forms
2. Click "Embed"
3. Copy the code
4. Paste into your website

### Direct Link

Share the form directly:

1. Click "Share"
2. Copy the link
3. Send to clients or post on social

## Form Notifications

### New Submission Alerts

When someone submits:

1. You receive email notification
2. Submission appears in dashboard
3. Client receives confirmation

### Customizing Notifications

1. Go to Form settings
2. Edit notification template
3. Add team recipients if needed
`,
  },
  {
    slug: "calendar",
    category: "Bookings & Scheduling",
    categorySlug: "bookings",
    title: "Calendar Integration",
    description: "Sync your bookings with Google Calendar and more.",
    relatedArticles: ["availability", "reminders"],
    content: `
## Calendar Integration

Keep all your bookings synced with your existing calendar.

## Supported Calendars

- Google Calendar
- Microsoft Outlook
- Apple Calendar (via iCal)
- Any iCal-compatible calendar

## Connecting Google Calendar

### Setup

1. Go to Settings > Integrations
2. Click "Connect Google Calendar"
3. Sign in to Google
4. Grant calendar permissions
5. Select which calendars to sync

### Permissions Required

PhotoProOS needs access to:

- View your calendars
- Create events
- Update events
- Delete events (when bookings canceled)

## Two-Way Sync

### From PhotoProOS to Calendar

When a booking is created:

- Event added to your calendar
- Includes client details
- Location if provided
- Link back to PhotoProOS

### From Calendar to PhotoProOS

When you add events to Google:

- Time blocked in PhotoProOS
- Clients see updated availability
- Prevents double-booking

## Multiple Calendars

### Syncing Multiple Calendars

Sync several calendars for complete availability:

1. Add personal calendar
2. Add business calendar
3. All blocked times combine
4. Availability shows only open slots

## Calendar Settings

### Event Details

Configure what appears in calendar events:

- Client name
- Service type
- Location
- Notes
- PhotoProOS link

### Event Color

Set colors by booking type:

1. Go to Calendar settings
2. Assign colors to services
3. Easy visual identification

## Troubleshooting

### Sync Issues

If events don't appear:

1. Check connection status
2. Reconnect if needed
3. Wait 5-10 minutes for sync
4. Contact support if persists

### Conflicts

If you see double-bookings:

1. Check which calendar has priority
2. Manually block conflicting times
3. Review integration settings
`,
  },
  {
    slug: "reminders",
    category: "Bookings & Scheduling",
    categorySlug: "bookings",
    title: "Automated Reminders",
    description: "Set up automatic booking reminders for clients.",
    relatedArticles: ["availability", "calendar"],
    content: `
## Automatic Reminders

Never have a no-show again with automated booking reminders.

## Reminder Types

### Email Reminders

Sent to client's email:

- Confirmation after booking
- Reminder before appointment
- Follow-up after session

### SMS Reminders (Coming Soon)

Text message reminders:

- Higher open rates
- Immediate delivery
- Requires phone number

## Configuring Reminders

### Default Schedule

1. Go to Scheduling > Reminders
2. Set default reminder times
3. Enable/disable each type

### Common Schedule

- **1 week before** - Initial reminder
- **1 day before** - Detailed reminder
- **2 hours before** - Final reminder

## Reminder Content

### Customizing Messages

Edit reminder templates:

1. Click on reminder type
2. Edit subject and body
3. Use merge fields for personalization
4. Save changes

### Available Merge Fields

- {{client_name}}
- {{service_name}}
- {{date}}
- {{time}}
- {{location}}
- {{prep_instructions}}

## Per-Service Reminders

### Different Reminders per Service

Some services need different reminders:

1. Go to service settings
2. Override default reminders
3. Set custom schedule
4. Add service-specific content

## Managing Reminders

### Viewing Scheduled Reminders

1. Go to booking details
2. See "Scheduled Reminders"
3. View send times

### Canceling Reminders

If a booking changes:

- Reminders auto-cancel on booking cancellation
- Can manually cancel specific reminders
- Reschedules update reminder times

## Best Practices

### Reminder Tips

1. Don't over-remind (3 max)
2. Include essential info only
3. Add preparation instructions
4. Include easy reschedule option
5. Keep messages short
`,
  },
  // Account
  {
    slug: "upgrade",
    category: "Account & Billing",
    categorySlug: "account",
    title: "Upgrading Your Plan",
    description: "Move to a higher plan for more features.",
    relatedArticles: ["billing", "team"],
    content: `
## Upgrading Your Plan

As your business grows, upgrade to unlock more features and capacity.

## Available Plans

### Free

- 3 galleries per month
- Basic features
- PhotoProOS branding

### Pro

- Unlimited galleries
- Custom branding
- Priority support
- Advanced analytics

### Studio

- Everything in Pro
- Team collaboration
- API access
- White-label options

## How to Upgrade

### From Settings

1. Go to Settings > Billing
2. Click "Upgrade Plan"
3. Select your new plan
4. Enter payment details
5. Confirm upgrade

### Immediate Access

When you upgrade:

- New features activate immediately
- No downtime
- Prorated billing applied

## Plan Comparison

### Features by Plan

| Feature | Free | Pro | Studio |
|---------|------|-----|--------|
| Galleries | 3/mo | Unlimited | Unlimited |
| Storage | 5GB | 100GB | 500GB |
| Branding | No | Yes | Yes |
| Team | No | No | Yes |

## Billing

### Prorated Charges

When upgrading mid-cycle:

1. Current plan charges stop
2. New plan charges start immediately
3. You're charged the difference
4. Next bill at full new rate

### Annual Discount

Save by paying annually:

- 2 months free
- Paid upfront
- Auto-renews annually

## Downgrading

### To a Lower Plan

1. Go to Settings > Billing
2. Click "Change Plan"
3. Select lower plan
4. Changes at next billing cycle

### What Happens

- Features reduce at period end
- Data is preserved
- May need to reduce usage to fit limits

## Enterprise

For large teams or special needs:

1. Contact sales
2. Discuss requirements
3. Custom pricing available
4. Dedicated support
`,
  },
  {
    slug: "team",
    category: "Account & Billing",
    categorySlug: "account",
    title: "Managing Team Members",
    description: "Add and manage team members on your account.",
    relatedArticles: ["upgrade", "billing"],
    content: `
## Team Management

Add team members to collaborate on your PhotoProOS account.

## Adding Team Members

### Invite Process

1. Go to Settings > Team
2. Click "Invite Member"
3. Enter their email
4. Select their role
5. Send invitation

### Invitation Status

Track pending invites:

- Pending - Not yet accepted
- Accepted - Active member
- Expired - Re-send needed

## Team Roles

### Owner

Full account access:

- Billing management
- Delete account
- Manage all members
- All permissions

### Admin

Administrative access:

- Manage team members
- Access all features
- Cannot access billing
- Cannot delete account

### Member

Standard access:

- Create galleries
- Manage clients
- View analytics
- Limited settings access

## Role Permissions

### Permission Matrix

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| Create galleries | ✓ | ✓ | ✓ |
| Manage clients | ✓ | ✓ | ✓ |
| View analytics | ✓ | ✓ | ✓ |
| Manage team | ✓ | ✓ | ✗ |
| Billing | ✓ | ✗ | ✗ |
| Delete account | ✓ | ✗ | ✗ |

## Managing Members

### Changing Roles

1. Go to Team settings
2. Click member's role
3. Select new role
4. Confirm change

### Removing Members

1. Click member's menu (...)
2. Select "Remove"
3. Confirm removal
4. Access revoked immediately

## Activity Tracking

### Team Activity

View what team members do:

1. Go to Activity Log
2. Filter by team member
3. See recent actions

## Team Notifications

### Configuring Notifications

Each member can set their own:

1. Go to personal Settings
2. Notification preferences
3. Choose what to receive
`,
  },
  {
    slug: "billing",
    category: "Account & Billing",
    categorySlug: "account",
    title: "Billing & Invoices",
    description: "Manage your subscription and payment methods.",
    relatedArticles: ["upgrade", "cancellation"],
    content: `
## Billing Management

View and manage your PhotoProOS subscription billing.

## Current Plan

### Viewing Your Plan

1. Go to Settings > Billing
2. See current plan details
3. View next billing date
4. See usage statistics

## Payment Methods

### Adding a Card

1. Go to Billing > Payment Methods
2. Click "Add Card"
3. Enter card details
4. Set as default (optional)

### Updating a Card

1. Click existing card
2. Select "Update"
3. Enter new details
4. Save changes

### Removing a Card

1. Click card menu (...)
2. Select "Remove"
3. Must have at least one card on file

## Invoices

### Viewing Invoices

1. Go to Billing > Invoices
2. See all past invoices
3. Click to view details

### Downloading Invoices

1. Open invoice
2. Click "Download PDF"
3. Save for your records

### Invoice Details

Each invoice shows:

- Invoice number
- Date
- Plan details
- Amount charged
- Payment method

## Billing History

### Transaction History

View all billing transactions:

- Charges
- Refunds
- Credits applied
- Failed payments

## Billing Issues

### Failed Payment

If payment fails:

1. Email notification sent
2. 3-day grace period
3. Update payment method
4. Retry charge

### Past Due

If payment still fails:

1. Account in past due status
2. Features may be limited
3. Update payment to restore

## Tax Invoices

### Business Tax ID

Add your tax ID for invoices:

1. Go to Billing > Tax Info
2. Enter tax ID
3. Saved for future invoices

### Tax Exemption

If tax-exempt:

1. Contact support
2. Provide exemption certificate
3. Tax removed from billing
`,
  },
  {
    slug: "data-export",
    category: "Account & Billing",
    categorySlug: "account",
    title: "Exporting Your Data",
    description: "Download your client, gallery, and billing data.",
    relatedArticles: ["billing", "cancellation"],
    content: `
## Export Your Data

Download a copy of your account data for backups or audits.

## What You Can Export

- Client records
- Gallery metadata
- Invoices and payments
- Bookings and reminders
- Activity logs

## How to Export

1. Go to **Settings > Account**.
2. Click **Export Data**.
3. Choose the data types to include.
4. Click **Generate Export**.

## Delivery

- Large exports may take a few minutes.
- You will receive an email with a download link.
- Links expire after 24 hours for security.

## Tips

- Export before you cancel your subscription.
- Store the file in a secure location.
`,
  },
  {
    slug: "cancellation",
    category: "Account & Billing",
    categorySlug: "account",
    title: "Cancellation & Refunds",
    description: "How to cancel your subscription and refund policy.",
    relatedArticles: ["billing", "upgrade"],
    content: `
## Cancellation Policy

We're sorry to see you go. Here's how cancellation works.

## Canceling Your Subscription

### How to Cancel

1. Go to Settings > Billing
2. Click "Cancel Subscription"
3. Complete exit survey (optional)
4. Confirm cancellation

### When It Takes Effect

- Access continues until period end
- No prorated refunds for partial months
- Data preserved for 30 days after

## What Happens After

### Immediate

- Subscription stops renewing
- Access continues until end of period
- Can reactivate anytime

### At Period End

- Account downgrades to Free
- Features limited
- Data preserved
- Galleries remain accessible

### After 30 Days

- Unused data may be deleted
- Active galleries preserved
- Client access continues

## Data Retention

### What's Kept

- Client information
- Gallery links (if public)
- Payment history

### What's Removed

After 30 days of inactivity:

- Unused gallery uploads
- Draft content
- Temporary files

### Exporting Data

Before canceling:

1. Go to Settings > Data
2. Click "Export All Data"
3. Download your files
4. Save client information

## Refund Policy

### Monthly Plans

- No refunds for current period
- Cancel before renewal to avoid charges

### Annual Plans

- Prorated refund for unused months
- Must request within 30 days
- Contact support for processing

### How to Request

1. Email support@photoproos.com
2. Include account email
3. Explain refund reason
4. We'll respond within 48 hours

## Reactivating

### Coming Back

If you want to return:

1. Sign in to your account
2. Go to Billing
3. Select a plan
4. Enter payment details
5. Account reactivated

### Data Recovery

Within 30 days of cancellation:

- All data restored
- No re-upload needed
- Settings preserved

After 30 days:

- Start fresh required
- Previous data not recoverable

## Pause Instead

### Pausing Your Account

Not ready to cancel? Consider pausing:

1. Contact support
2. Request account pause
3. Reduced rate while paused
4. Resume anytime
`,
  },
];

// Helper functions
export function getHelpArticle(categorySlug: string, articleSlug: string): HelpArticle | undefined {
  return helpArticles.find(
    (article) => article.categorySlug === categorySlug && article.slug === articleSlug
  );
}

export function getArticlesByCategory(categorySlug: string): HelpArticle[] {
  return helpArticles.filter((article) => article.categorySlug === categorySlug);
}

export function getAllHelpArticles(): HelpArticle[] {
  return helpArticles;
}

export function getHelpCategory(slug: string): HelpCategory | undefined {
  return helpCategories.find((cat) => cat.slug === slug);
}

export function getAllHelpCategories(): HelpCategory[] {
  return helpCategories;
}

export function getRelatedArticles(currentSlug: string, limit = 3): HelpArticle[] {
  const current = helpArticles.find((a) => a.slug === currentSlug);
  if (!current?.relatedArticles) return [];

  return current.relatedArticles
    .map((slug) => helpArticles.find((a) => a.slug === slug))
    .filter((a): a is HelpArticle => a !== undefined)
    .slice(0, limit);
}

export function searchHelpArticles(query: string): HelpArticle[] {
  const lowercaseQuery = query.toLowerCase();
  return helpArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.description.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery)
  );
}
