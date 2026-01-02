# Product & E-commerce Module

## Overview

The Product module is built for photographers specializing in product photography for e-commerce, catalogs, and marketing. Features include batch processing, SKU management, image specifications compliance, and bulk delivery workflows.

---

## Module ID

```
product
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Product catalogs with SKU organization | Enabled |
| Scheduling | Batch session booking | Enabled |
| Invoices | Per-product and batch pricing | Enabled |
| Clients | Brand/retailer management | Enabled |
| Services | Product photography packages | Enabled |
| Batch Processing | Bulk image management | Enabled |
| Licensing | Commercial usage rights | Enabled |
| SKU Management | Product organization by SKU | Enabled |

---

## Unique Features

### 1. SKU-Based Product Management

```typescript
interface ProductCatalog {
  id: string;
  clientId: string;
  name: string;                    // "Spring 2024 Collection"
  products: Product[];
  status: "planning" | "shooting" | "editing" | "delivered";
}

interface Product {
  id: string;
  catalogId: string;
  sku: string;
  name: string;
  category?: string;
  variants?: ProductVariant[];
  photos: ProductPhoto[];
  status: "pending" | "shot" | "edited" | "approved" | "delivered";
  requiredAngles: string[];
  notes?: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  name: string;                    // "Red - Large"
  color?: string;
  size?: string;
  photos: ProductPhoto[];
}

interface ProductPhoto {
  id: string;
  photoId: string;
  angle: ProductAngle;
  isPrimary: boolean;
  status: "raw" | "edited" | "approved" | "rejected";
  retouchNotes?: string;
  version: number;
}

type ProductAngle =
  | "front"
  | "back"
  | "side_left"
  | "side_right"
  | "detail"
  | "45_degree"
  | "flat_lay"
  | "lifestyle"
  | "scale"
  | "packaging";
```

### 2. Image Specification Compliance

E-commerce platform requirements:

```typescript
interface ImageSpecification {
  id: string;
  name: string;                    // "Amazon Main Image"
  platform?: string;               // "Amazon", "Shopify", etc.
  requirements: {
    minWidth: number;
    minHeight: number;
    maxWidth?: number;
    maxHeight?: number;
    aspectRatio?: string;          // "1:1", "4:3"
    format: string[];              // ["jpg", "png"]
    maxFileSize?: number;          // bytes
    colorSpace: string;            // "sRGB"
    dpi?: number;
    backgroundColor?: string;      // "#FFFFFF"
    productFill?: string;          // "85%"
  };
  validation: SpecValidation[];
}

interface SpecValidation {
  rule: string;
  message: string;
  severity: "error" | "warning";
}

// Pre-built platform specs
const platformSpecs = {
  amazon: {
    main: {
      minWidth: 1000,
      minHeight: 1000,
      aspectRatio: "1:1",
      backgroundColor: "#FFFFFF",
      productFill: "85%",
    },
    variant: {
      minWidth: 1000,
      minHeight: 1000,
    },
  },
  shopify: {
    product: {
      aspectRatio: "1:1",
      maxWidth: 4472,
      maxHeight: 4472,
    },
  },
  etsy: {
    listing: {
      minWidth: 2000,
      aspectRatio: "4:3",
    },
  },
};
```

### 3. Batch Processing Workflow

```typescript
interface BatchJob {
  id: string;
  catalogId: string;
  type: "edit" | "resize" | "export" | "watermark";
  settings: BatchSettings;
  items: BatchItem[];
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;                // 0-100
  startedAt?: Date;
  completedAt?: Date;
  errors?: BatchError[];
}

interface BatchSettings {
  outputFormat?: string;
  outputQuality?: number;
  resize?: {
    width: number;
    height: number;
    mode: "fit" | "fill" | "exact";
  };
  watermark?: {
    enabled: boolean;
    position: string;
    opacity: number;
  };
  naming?: {
    pattern: string;              // "{sku}_{angle}_{variant}"
  };
}

interface BatchItem {
  id: string;
  photoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  outputUrl?: string;
  error?: string;
}
```

### 4. Bulk Delivery System

```typescript
interface BulkDelivery {
  id: string;
  clientId: string;
  catalogId?: string;
  name: string;
  photos: DeliveryPhoto[];
  format: DeliveryFormat;
  status: "preparing" | "ready" | "delivered";
  downloadUrl?: string;
  expiresAt?: Date;
  downloadCount: number;
  maxDownloads?: number;
}

interface DeliveryPhoto {
  photoId: string;
  fileName: string;               // Custom naming
  sku?: string;
}

interface DeliveryFormat {
  fileFormat: "jpg" | "png" | "tiff";
  quality?: number;
  colorSpace: "sRGB" | "AdobeRGB" | "ProPhotoRGB";
  resolution: number;             // DPI
  longestEdge?: number;           // pixels
  includeMetadata: boolean;
  folderStructure: "flat" | "by_sku" | "by_category" | "by_angle";
}
```

---

## Service Templates

### Per-Product Pricing

```typescript
// Basic Product Shot
{
  name: "Basic Product Photo",
  description: "Single angle on white background",
  basePrice: 2500, // $25
  estimatedDuration: 10,
  deliverables: ["1 edited image", "Web resolution"],
  volumeDiscounts: [
    { quantity: 25, discount: 15 },
    { quantity: 50, discount: 20 },
    { quantity: 100, discount: 25 },
    { quantity: 250, discount: 30 }
  ]
}

// Multi-Angle Package
{
  name: "Multi-Angle Package",
  description: "Complete product coverage",
  basePrice: 7500, // $75
  estimatedDuration: 30,
  deliverables: ["5 angles", "Front, back, sides, detail"],
  includes: ["Basic retouching", "White background"]
}

// Lifestyle Shot
{
  name: "Lifestyle Product Shot",
  description: "In-context/styled imagery",
  basePrice: 15000, // $150
  estimatedDuration: 45,
  deliverables: ["1 styled image"],
  includes: ["Props", "Styling", "Advanced editing"]
}
```

### Batch/Volume Packages

```typescript
// Starter Package
{
  name: "E-commerce Starter",
  description: "Small catalog photography",
  basePrice: 50000, // $500
  productCount: 25,
  anglesPerProduct: 3,
  includes: ["White background", "Basic retouching", "Web delivery"]
}

// Standard Package
{
  name: "E-commerce Standard",
  description: "Medium catalog photography",
  basePrice: 175000, // $1,750
  productCount: 100,
  anglesPerProduct: 3,
  includes: ["White background", "Full retouching", "Multiple formats"]
}

// Enterprise Package
{
  name: "E-commerce Enterprise",
  description: "Large catalog photography",
  basePrice: 400000, // $4,000
  productCount: 250,
  anglesPerProduct: 4,
  includes: ["White + lifestyle", "Full retouching", "Platform-specific exports"]
}
```

### Day Rate Options

```typescript
// Studio Day
{
  name: "Studio Day Rate",
  description: "Full day in studio",
  basePrice: 180000, // $1,800
  estimatedDuration: 480,
  estimatedProducts: "30-50 depending on complexity",
  includes: ["Equipment", "Basic styling", "Editing"]
}

// On-Location Day
{
  name: "On-Location Day",
  description: "Full day at client location",
  basePrice: 250000, // $2,500
  estimatedDuration: 480,
  includes: ["Travel within 25mi", "Equipment", "Editing"]
}
```

---

## Booking Flow Customizations

### Step 1: Project Type
- New product launch
- Catalog refresh
- Seasonal update
- One-off products

### Step 2: Product Details
- Number of products
- Number of variants
- Required angles per product
- Special requirements (ghost mannequin, etc.)

### Step 3: Specifications
- Target platform(s)
- Image specifications
- File delivery format

### Step 4: Product List Import
- CSV/Excel upload
- SKU list
- Product names
- Variants

### Step 5: Scheduling
- Studio availability
- Products per day estimate
- Rush options

---

## Gallery Customizations

### Product Gallery Organization

```typescript
interface ProductGalleryView {
  mode: "grid" | "catalog" | "comparison";
  groupBy: "sku" | "category" | "status" | "angle";
  sortBy: "sku" | "name" | "date" | "status";
  filters: {
    status?: string[];
    category?: string[];
    hasVariants?: boolean;
  };
}
```

### Approval Workflow

```typescript
interface ProductApproval {
  catalogId: string;
  products: ProductApprovalItem[];
  approver: {
    name: string;
    email: string;
  };
  deadline?: Date;
  status: "pending" | "in_review" | "approved" | "revision_needed";
}

interface ProductApprovalItem {
  productId: string;
  sku: string;
  photos: PhotoApproval[];
  overallStatus: "pending" | "approved" | "rejected" | "revision";
  feedback?: string;
}

interface PhotoApproval {
  photoId: string;
  angle: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
}
```

### Comparison View

Side-by-side comparison for variants:
- Color consistency check
- Size reference comparison
- Before/after editing

---

## Invoice Customizations

### Product Photography Line Items
- Per-product rate × quantity
- Setup/styling fee
- Rush processing fee
- Platform-specific exports
- Lifestyle shots
- Retouching upgrades

### Volume Discounts

```typescript
interface VolumeDiscount {
  minQuantity: number;
  discountPercent: number;
}

const defaultVolumeDiscounts: VolumeDiscount[] = [
  { minQuantity: 25, discountPercent: 15 },
  { minQuantity: 50, discountPercent: 20 },
  { minQuantity: 100, discountPercent: 25 },
  { minQuantity: 250, discountPercent: 30 },
  { minQuantity: 500, discountPercent: 35 },
];
```

### Add-On Services
- Ghost mannequin editing: $15/image
- Shadow creation: $5/image
- Color correction (per color): $10/variant
- Background swap: $10/image
- 360° spin: $75/product

---

## Settings (Module-Specific)

Located at `/settings/product`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default angles | Per product | 3 |
| Base per-product rate | Cents | 2500 |
| Volume discounts | Enable/configure | true |
| Default background | Color/type | #FFFFFF |
| File naming pattern | Template | {sku}_{angle} |
| Default delivery format | Export settings | jpg/sRGB/72dpi |
| Platform presets | Amazon, Shopify, etc. | Amazon |

---

## Dashboard Widgets

### Active Catalogs
- In-progress catalogs
- Product counts
- Completion percentage

### Production Pipeline
- Products to shoot
- In editing
- Awaiting approval
- Ready for delivery

### Client Activity
- Recent deliveries
- Pending approvals
- Upcoming shoots

---

## Implementation Checklist

### Phase 1: Product Catalog
- [ ] Product/SKU database model
- [ ] Catalog CRUD operations
- [ ] Product import (CSV)
- [ ] Variant management

### Phase 2: Image Specifications
- [ ] Spec template library
- [ ] Platform presets
- [ ] Validation engine
- [ ] Compliance checker

### Phase 3: Batch Processing
- [ ] Batch job queue
- [ ] Resize processor
- [ ] Export processor
- [ ] Progress tracking

### Phase 4: Delivery System
- [ ] Bulk download builder
- [ ] Custom naming
- [ ] Folder structure options
- [ ] Delivery tracking

### Phase 5: Workflow
- [ ] Approval workflow
- [ ] Status tracking
- [ ] Client portal
- [ ] Revision management

---

## API Reference

### Server Actions

```typescript
// Catalog Management
createCatalog(data: CatalogInput): Promise<ProductCatalog>
importProducts(catalogId: string, csv: File): Promise<ImportResult>
updateProductStatus(productId: string, status: string): Promise<Product>

// Batch Processing
createBatchJob(data: BatchJobInput): Promise<BatchJob>
getBatchJobProgress(jobId: string): Promise<BatchProgress>
cancelBatchJob(jobId: string): Promise<void>

// Specifications
validateImage(photoId: string, specId: string): Promise<ValidationResult>
applySpec(photoIds: string[], specId: string): Promise<BatchJob>

// Delivery
createDelivery(data: DeliveryInput): Promise<BulkDelivery>
getDeliveryUrl(deliveryId: string): Promise<string>
trackDownload(deliveryId: string): Promise<void>

// Approval
sendForApproval(catalogId: string, approverEmail: string): Promise<Approval>
submitApprovalFeedback(approvalId: string, feedback: ApprovalFeedback): Promise<void>
```

---

## CSV Import Format

### Product Import Template

```csv
sku,name,category,color,size,angles_required,notes
SHIRT-001,Classic Cotton Tee,Apparel,White,S,front;back;detail,Main product shot
SHIRT-001-BLK,Classic Cotton Tee,Apparel,Black,S,front;back;detail,Color variant
SHOE-100,Running Sneaker,Footwear,Blue/White,10,front;side;back;sole;lifestyle,Hero product
```

### Export Naming Patterns

```
Available variables:
{sku}       - Product SKU
{name}      - Product name
{category}  - Category
{angle}     - Shot angle
{variant}   - Variant name
{color}     - Color
{size}      - Size
{date}      - Date shot
{seq}       - Sequence number

Examples:
{sku}_{angle}           → SHIRT-001_front
{category}/{sku}_{angle} → Apparel/SHIRT-001_front
{sku}_{color}_{angle}   → SHIRT-001_Black_front
```

---

## Platform Integration (Future)

### Shopify Integration
- Direct upload to Shopify
- SKU matching
- Variant syncing
- Alt text population

### Amazon Integration
- Compliance checking
- Direct upload via API
- Listing enhancement

### General E-commerce
- API-based uploads
- Webhook notifications
- Inventory syncing

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Batch Processing](./docs/batch-processing.md) - Batch operations details
- [Image Specifications](./docs/image-specifications.md) - Platform requirements
- [Delivery System](./docs/delivery-system.md) - Bulk delivery features
