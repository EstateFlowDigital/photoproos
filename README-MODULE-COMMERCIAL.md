# Commercial & Corporate Module

## Overview

The Commercial module is designed for photographers serving businesses with headshots, office photography, product shots, and corporate event coverage. Features emphasize contracts, licensing, and corporate client management.

---

## Module ID

```
commercial
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Photo delivery with licensing options | Enabled |
| Scheduling | Corporate booking with contact management | Enabled |
| Invoices | Net-30/60 payment terms | Enabled |
| Clients | Company + contact hierarchies | Enabled |
| Services | Corporate packages with usage rights | Enabled |
| Contracts | Digital signing and licensing | Enabled |
| Multi-Contact | Multiple contacts per company | Enabled |

---

## Unique Features

### 1. Company + Contact Hierarchy

```typescript
interface CorporateClient {
  id: string;
  type: "company";
  companyName: string;
  industry?: string;
  website?: string;
  billingAddress?: Address;
  contacts: CorporateContact[];
  defaultPaymentTerms: "due_on_receipt" | "net_15" | "net_30" | "net_60";
}

interface CorporateContact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  isPrimary: boolean;
  canApproveInvoices: boolean;
}
```

### 2. Licensing & Usage Rights

Define how images can be used:

```typescript
interface LicenseTerms {
  type: "limited" | "unlimited" | "exclusive";
  duration: "1_year" | "3_year" | "perpetual";
  territory: "local" | "national" | "worldwide";
  usage: LicenseUsage[];
  exclusivity: boolean;
  transferable: boolean;
}

type LicenseUsage =
  | "web"
  | "social_media"
  | "print"
  | "advertising"
  | "editorial"
  | "internal"
  | "broadcast";
```

### 3. Corporate Contracts

Pre-built contract templates:
- Photography Agreement
- Model/Property Release
- Usage License Agreement
- Non-Disclosure Agreement

### 4. Batch Headshot Sessions

Manage multi-person shoots:

```typescript
interface HeadshotSession {
  id: string;
  companyId: string;
  date: Date;
  location: string;
  subjects: HeadshotSubject[];
  packagePerPerson: Service;
  totalPrice: number;
}

interface HeadshotSubject {
  id: string;
  name: string;
  email?: string;
  department?: string;
  scheduled: boolean;
  timeSlot?: string;
  photographed: boolean;
  approved: boolean;
  selectedPhotos: string[];
}
```

---

## Service Templates

### Headshot Packages

```typescript
// Individual Headshot
{
  name: "Professional Headshot",
  description: "Single executive headshot session",
  basePrice: 25000, // $250
  estimatedDuration: 30,
  deliverables: ["3 retouched images", "Web + print resolution"],
  includes: ["Basic retouching", "Background options"]
}

// Group Headshots (per person pricing)
{
  name: "Corporate Headshots",
  description: "Per-person rate for group sessions",
  basePrice: 15000, // $150 per person
  minimumQuantity: 5,
  estimatedDuration: 15, // per person
  deliverables: ["2 retouched images per person"],
  volumeDiscounts: [
    { quantity: 10, discount: 10 },
    { quantity: 25, discount: 15 },
    { quantity: 50, discount: 20 }
  ]
}
```

### Corporate Photography

```typescript
// Office/Environment
{
  name: "Office Photography",
  description: "Workplace and environment shots",
  basePrice: 150000, // $1,500
  estimatedDuration: 240,
  deliverables: ["40-60 edited images", "Interior + exterior"],
  usage: ["web", "print", "social_media"]
}

// Event Coverage
{
  name: "Corporate Event",
  description: "Business events, conferences, meetings",
  basePrice: 200000, // $2,000
  estimatedDuration: 480, // 8 hours
  deliverables: ["100+ edited images", "Same-week delivery"],
  additionalHourRate: 30000 // $300/hr
}
```

---

## Booking Flow Customizations

### Step 1: Company Selection
- Search existing companies
- Add new company with contacts
- Select billing contact

### Step 2: Project Type
- Headshots (individual/group)
- Office/environment
- Event coverage
- Product photography

### Step 3: Details (varies by type)

**For Headshots:**
- Number of subjects
- On-site vs studio
- Background preferences

**For Office:**
- Location(s)
- Specific areas needed
- Employee model releases

**For Events:**
- Event details
- Coverage hours
- Key moments list

### Step 4: Contract & Licensing
- Select contract template
- Define usage rights
- Send for signature

---

## Invoice Customizations

### Payment Terms

```typescript
type PaymentTerms =
  | "due_on_receipt"
  | "net_15"
  | "net_30"
  | "net_60"
  | "50_50_split"; // 50% deposit, 50% on delivery

interface CorporateInvoice extends Invoice {
  paymentTerms: PaymentTerms;
  purchaseOrderNumber?: string;
  billingContact: CorporateContact;
  licenseTerms?: LicenseTerms;
}
```

### Purchase Order Support
- PO number field
- PO document upload
- Reference on invoice

### Corporate Line Items
- Day rate options
- Per-person pricing
- Licensing fees
- Rush delivery surcharge

---

## Contract Features

### Template Library

| Template | Use Case |
|----------|----------|
| Photography Agreement | Main service contract |
| Model Release | Employee headshot consent |
| Property Release | Office/location permission |
| Usage License | Image licensing terms |
| NDA | Confidential projects |

### Digital Signing

```typescript
interface Contract {
  id: string;
  templateId: string;
  clientId: string;
  projectId?: string;
  status: "draft" | "sent" | "viewed" | "signed" | "expired";
  sentAt?: Date;
  viewedAt?: Date;
  signedAt?: Date;
  signerName?: string;
  signerEmail?: string;
  signatureImage?: string;
  ipAddress?: string;
}
```

### Variable Substitution

```typescript
const contractVariables = {
  "{{client_name}}": client.companyName,
  "{{client_contact}}": contact.fullName,
  "{{project_date}}": booking.date,
  "{{project_description}}": booking.description,
  "{{total_amount}}": formatCurrency(invoice.total),
  "{{usage_rights}}": formatLicenseTerms(license),
  "{{photographer_name}}": organization.name,
  "{{today_date}}": formatDate(new Date()),
};
```

---

## Gallery Customizations

### Corporate Gallery Features
- Password protection
- Download tracking
- Expiration dates
- Per-image licensing display

### Approval Workflow

```typescript
interface GalleryApproval {
  galleryId: string;
  approverEmail: string;
  approverName: string;
  status: "pending" | "approved" | "revision_requested";
  approvedAt?: Date;
  comments?: string;
  selectedImages?: string[];
}
```

---

## Settings (Module-Specific)

Located at `/settings/commercial`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default payment terms | Invoice due date | net_30 |
| Require PO number | For invoices | false |
| Default license type | Usage rights | limited |
| License duration | Default term | 1_year |
| Auto-send contracts | On booking | true |
| Watermark corporate | Preview images | true |

---

## Dashboard Widgets

### Active Contracts
- Pending signatures
- Recently signed
- Expiring soon

### Corporate Pipeline
- Upcoming shoots
- Pending invoices
- Outstanding balance

### Top Clients
- Revenue by company
- Booking frequency
- Average project size

---

## Implementation Checklist

### Phase 1: Client Hierarchy
- [ ] Company model with contacts
- [ ] Contact roles and permissions
- [ ] Company list/detail pages
- [ ] Contact management UI

### Phase 2: Contracts
- [ ] Contract template system
- [ ] Variable substitution
- [ ] Digital signature capture
- [ ] Email notifications

### Phase 3: Licensing
- [ ] License terms model
- [ ] License selection UI
- [ ] License display in gallery
- [ ] License agreement generation

### Phase 4: Corporate Features
- [ ] Batch headshot sessions
- [ ] Group booking flow
- [ ] PO number support
- [ ] Payment terms options

---

## API Reference

### Server Actions

```typescript
// Companies
createCompany(data: CreateCompanyInput): Promise<Company>
updateCompany(id: string, data: UpdateCompanyInput): Promise<Company>
addCompanyContact(companyId: string, contact: ContactInput): Promise<Contact>
setPrimaryContact(companyId: string, contactId: string): Promise<void>

// Contracts
createContract(data: CreateContractInput): Promise<Contract>
sendContract(contractId: string): Promise<void>
recordSignature(contractId: string, signature: SignatureInput): Promise<Contract>
getContractPdf(contractId: string): Promise<Buffer>

// Licensing
createLicense(data: CreateLicenseInput): Promise<License>
attachLicenseToGallery(galleryId: string, licenseId: string): Promise<void>
```

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Contracts System](./docs/contracts.md) - Contract management details
- [Licensing Guide](./docs/licensing.md) - Usage rights configuration
