# Stripe Product Catalog Sync

This document explains how to set up and use the automatic Stripe Product Catalog sync for Services and ServiceBundles.

## Overview

When you create or update a Service or ServiceBundle in ListingLens, it automatically syncs to your Stripe Product Catalog. This means:

- Products appear in your Stripe Dashboard under Products
- Checkout sessions can use Stripe Price IDs for better reporting
- Price changes are handled automatically (old prices archived, new prices created)

## Setup

### 1. Environment Variables

Ensure you have your Stripe secret key configured in `.env`:

```env
STRIPE_SECRET_KEY=sk_live_xxx  # or sk_test_xxx for testing
```

### 2. Run Database Migration

The feature requires new fields on the Service and ServiceBundle models. Run the Prisma migration:

```bash
npx prisma migrate dev --name add-stripe-product-sync-fields
```

Or if you're deploying to production:

```bash
npx prisma migrate deploy
```

### 3. Sync Existing Products (Optional)

If you have existing services and bundles that were created before this feature, you can bulk sync them to Stripe.

Create a one-time script or use the Next.js API route:

```typescript
// Example: Create an API route at /api/admin/sync-stripe-products

import { syncAllServicesToStripe, syncAllBundlesToStripe } from "@/lib/stripe/product-sync";
import { requireOrganizationId } from "@/lib/actions/auth-helper";

export async function POST() {
  const organizationId = await requireOrganizationId();

  const [servicesResult, bundlesResult] = await Promise.all([
    syncAllServicesToStripe(organizationId),
    syncAllBundlesToStripe(organizationId),
  ]);

  return Response.json({
    services: servicesResult,
    bundles: bundlesResult,
  });
}
```

## How It Works

### Automatic Sync on CRUD Operations

| Action | What Happens in Stripe |
|--------|------------------------|
| **Create Service/Bundle** | Creates Stripe Product with Price |
| **Update Name/Description** | Updates Stripe Product metadata |
| **Update Price** | Archives old Price, creates new Price |
| **Delete/Archive** | Archives Stripe Product and Price |
| **Toggle Active Status** | Activates/deactivates Stripe Product |
| **Duplicate** | Creates new Stripe Product for the copy |

### Stripe Price Immutability

Stripe Prices cannot be modified once created. When you change a service's price:

1. The old Price is archived (still visible in Stripe, but inactive)
2. A new Price is created with the new amount
3. The new Price ID is stored in the database

### Checkout Integration

When processing orders, the system:

1. Checks if the service/bundle has a synced Stripe Price ID
2. Verifies the stored price matches the order item price
3. Uses the Stripe Price ID if available (better for Stripe reporting)
4. Falls back to inline `price_data` if prices don't match or no sync exists

This ensures flexibility for custom pricing while leveraging Stripe's product catalog.

## Database Fields

### Service Model

```prisma
model Service {
  // ... existing fields ...

  stripeProductId String?    // Stripe Product ID (prod_xxx)
  stripePriceId   String?    // Stripe Price ID (price_xxx)
  stripeSyncedAt  DateTime?  // Last successful sync timestamp
}
```

### ServiceBundle Model

```prisma
model ServiceBundle {
  // ... existing fields ...

  stripeProductId String?    // Stripe Product ID (prod_xxx)
  stripePriceId   String?    // Stripe Price ID (price_xxx)
  stripeSyncedAt  DateTime?  // Last successful sync timestamp
}
```

## API Reference

### syncServiceToStripe(service, organizationId)

Syncs a single service to Stripe. Called automatically on create/update.

```typescript
import { syncServiceToStripe } from "@/lib/stripe/product-sync";

const result = await syncServiceToStripe(service, organizationId);
// { success: true, stripeProductId: "prod_xxx", stripePriceId: "price_xxx" }
```

### syncBundleToStripe(bundle, organizationId)

Syncs a single bundle to Stripe. Called automatically on create/update.

```typescript
import { syncBundleToStripe } from "@/lib/stripe/product-sync";

const result = await syncBundleToStripe(bundle, organizationId);
// { success: true, stripeProductId: "prod_xxx", stripePriceId: "price_xxx" }
```

### archiveStripeProduct(stripeProductId, stripePriceId)

Archives a product and its price in Stripe. Called when deleting/deactivating.

```typescript
import { archiveStripeProduct } from "@/lib/stripe/product-sync";

await archiveStripeProduct("prod_xxx", "price_xxx");
```

### reactivateStripeProduct(stripeProductId, stripePriceId)

Reactivates an archived product. Called when re-enabling a service/bundle.

```typescript
import { reactivateStripeProduct } from "@/lib/stripe/product-sync";

await reactivateStripeProduct("prod_xxx", "price_xxx");
```

### syncAllServicesToStripe(organizationId)

Bulk syncs all active services for an organization.

```typescript
import { syncAllServicesToStripe } from "@/lib/stripe/product-sync";

const result = await syncAllServicesToStripe(organizationId);
// { synced: 15, failed: 2, errors: ["Service X: error message"] }
```

### syncAllBundlesToStripe(organizationId)

Bulk syncs all active bundles for an organization.

```typescript
import { syncAllBundlesToStripe } from "@/lib/stripe/product-sync";

const result = await syncAllBundlesToStripe(organizationId);
// { synced: 5, failed: 0, errors: [] }
```

### checkStripeSyncStatus(items)

Check if items are synced to Stripe before checkout.

```typescript
import { checkStripeSyncStatus } from "@/lib/stripe/product-sync";

const status = await checkStripeSyncStatus([
  { type: "service", id: "service_123" },
  { type: "bundle", id: "bundle_456" },
]);
// { allSynced: false, unsyncedItems: [{ type: "service", id: "...", name: "..." }] }
```

## Stripe Dashboard

After syncing, you'll see your products in the Stripe Dashboard:

1. Go to **Products** in your Stripe Dashboard
2. Products are labeled with metadata:
   - `listinglens_service_id` or `listinglens_bundle_id`
   - `listinglens_organization_id`
   - `type`: "service" or "bundle"
   - `category` (for services)
   - `bundle_type` (for bundles)

## Troubleshooting

### Products Not Syncing

1. Check that `STRIPE_SECRET_KEY` is set correctly
2. Verify the service/bundle was created/updated after this feature was deployed
3. Check server logs for "Failed to sync" error messages
4. Manually trigger sync using `syncServiceToStripe()` or `syncBundleToStripe()`

### Price Mismatch in Checkout

If checkout falls back to inline `price_data`:

- The order item price doesn't match the current service/bundle price
- This is expected behavior for custom-priced orders
- The product still appears correctly in Stripe

### Viewing Sync Status

Check if a service is synced:

```typescript
const service = await prisma.service.findUnique({
  where: { id: "..." },
  select: {
    stripeProductId: true,
    stripePriceId: true,
    stripeSyncedAt: true,
  },
});

if (service.stripePriceId) {
  console.log(`Synced at ${service.stripeSyncedAt}`);
} else {
  console.log("Not synced to Stripe");
}
```

## Notes

- Sync operations are **non-blocking** - they run in the background after the local database operation completes
- If Stripe sync fails, the local operation still succeeds (logged as an error)
- Archived Stripe products can be viewed in the Stripe Dashboard under "Archived"
- Each organization's products are tagged with `listinglens_organization_id` for filtering
