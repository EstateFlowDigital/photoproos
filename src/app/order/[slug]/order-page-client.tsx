"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Testimonial } from "@/lib/validations/order-pages";
import { CheckoutModal } from "@/components/order/checkout-modal";
import {
  PhoneIcon,
  EmailIcon,
  CheckIcon,
  ClockIcon,
  QuoteIcon,
  PackageIcon,
  CartIcon,
  CloseIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
} from "@/components/ui/icons";

// Pricing tier type
interface PricingTier {
  id: string;
  minSqft: number;
  maxSqft: number | null;
  priceCents: number;
  tierName: string | null;
}

// Cart item types
interface CartBundle {
  type: "bundle";
  id: string;
  name: string;
  priceCents: number;
  sqft?: number;
  pricingTierId?: string;
  pricingTierName?: string | null;
}

interface CartService {
  type: "service";
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
}

interface BundleService {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  isRequired: boolean;
}

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  bundleType: string;
  pricingMethod: string;
  pricePerSqftCents: number | null;
  minSqft: number | null;
  maxSqft: number | null;
  sqftIncrements: number | null;
  imageUrl: string | null;
  badgeText: string | null;
  originalPriceCents: number | null;
  savingsPercent: number | null;
  pricingTiers: PricingTier[];
  services: BundleService[];
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  duration: number;
  deliverables: string | null;
  category: string;
}

interface OrderPageData {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  subheadline: string | null;
  heroImageUrl: string | null;
  logoOverrideUrl: string | null;
  primaryColor: string | null;
  showPhone: boolean;
  showEmail: boolean;
  customPhone: string | null;
  customEmail: string | null;
  testimonials: Testimonial[] | null;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  bundles: Bundle[];
  services: Service[];
}

interface OrderPageClientProps {
  orderPage: OrderPageData;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
}

type CartItem = CartBundle | CartService;

export function OrderPageClient({ orderPage }: OrderPageClientProps) {
  const primaryColor = orderPage.primaryColor || "#3b82f6";
  const testimonials = orderPage.testimonials || [];

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sqft input modal state
  const [showSqftModal, setShowSqftModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [sqftInput, setSqftInput] = useState("");

  // Helper to check if bundle requires sqft input
  const requiresSqftInput = (bundle: Bundle) => {
    return bundle.pricingMethod === "per_sqft" || bundle.pricingMethod === "tiered";
  };

  // Calculate price for sqft-based bundle
  const calculateSqftPrice = (bundle: Bundle, sqft: number): { priceCents: number; tier?: PricingTier } => {
    if (bundle.pricingMethod === "per_sqft") {
      const pricePerSqft = bundle.pricePerSqftCents || 0;
      const minSqft = bundle.minSqft || 0;
      const maxSqft = bundle.maxSqft;
      const increments = bundle.sqftIncrements || 1;

      let adjustedSqft = Math.max(sqft, minSqft);
      if (maxSqft) {
        adjustedSqft = Math.min(adjustedSqft, maxSqft);
      }
      adjustedSqft = Math.ceil(adjustedSqft / increments) * increments;

      return { priceCents: adjustedSqft * pricePerSqft };
    }

    if (bundle.pricingMethod === "tiered" && bundle.pricingTiers.length > 0) {
      const tier = bundle.pricingTiers.find(
        (t) => sqft >= t.minSqft && (t.maxSqft === null || sqft <= t.maxSqft)
      );
      if (tier) {
        return { priceCents: tier.priceCents, tier };
      }
      // Use highest tier if no match
      const highestTier = bundle.pricingTiers[bundle.pricingTiers.length - 1];
      return { priceCents: highestTier.priceCents, tier: highestTier };
    }

    return { priceCents: bundle.priceCents };
  };

  // Cart calculations
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      if (item.type === "service") {
        return sum + item.priceCents * item.quantity;
      }
      return sum + item.priceCents;
    }, 0);

    const itemCount = cartItems.reduce((count, item) => {
      if (item.type === "service") {
        return count + item.quantity;
      }
      return count + 1;
    }, 0);

    return { subtotal, itemCount };
  }, [cartItems]);

  // Add bundle to cart
  const addBundle = (bundle: Bundle) => {
    const exists = cartItems.find(
      (item) => item.type === "bundle" && item.id === bundle.id
    );
    if (exists) return; // Only one of each bundle

    // Check if bundle requires sqft input
    if (requiresSqftInput(bundle)) {
      setSelectedBundle(bundle);
      setSqftInput("");
      setShowSqftModal(true);
      return;
    }

    // Fixed price bundle - add directly
    setCartItems((prev) => [
      ...prev,
      {
        type: "bundle",
        id: bundle.id,
        name: bundle.name,
        priceCents: bundle.priceCents,
      },
    ]);
    setIsCartOpen(true);
  };

  // Add bundle with sqft to cart
  const addBundleWithSqft = () => {
    if (!selectedBundle || !sqftInput) return;

    const sqft = parseInt(sqftInput, 10);
    if (isNaN(sqft) || sqft <= 0) return;

    const { priceCents, tier } = calculateSqftPrice(selectedBundle, sqft);

    setCartItems((prev) => [
      ...prev,
      {
        type: "bundle",
        id: selectedBundle.id,
        name: selectedBundle.name,
        priceCents,
        sqft,
        pricingTierId: tier?.id,
        pricingTierName: tier?.tierName,
      },
    ]);

    setShowSqftModal(false);
    setSelectedBundle(null);
    setSqftInput("");
    setIsCartOpen(true);
  };

  // Remove bundle from cart
  const removeBundle = (bundleId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.type === "bundle" && item.id === bundleId))
    );
  };

  // Check if bundle is in cart
  const isBundleInCart = (bundleId: string) =>
    cartItems.some((item) => item.type === "bundle" && item.id === bundleId);

  // Add service to cart
  const addService = (service: Service) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.type === "service" && item.id === service.id
      );

      if (existingIndex >= 0) {
        // Increment quantity
        const updated = [...prev];
        const existing = updated[existingIndex] as CartService;
        updated[existingIndex] = { ...existing, quantity: existing.quantity + 1 };
        return updated;
      }

      return [
        ...prev,
        {
          type: "service",
          id: service.id,
          name: service.name,
          priceCents: service.priceCents,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  // Update service quantity
  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) =>
        prev.filter((item) => !(item.type === "service" && item.id === serviceId))
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.type === "service" && item.id === serviceId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Get service quantity in cart
  const getServiceQuantity = (serviceId: string) => {
    const item = cartItems.find(
      (item) => item.type === "service" && item.id === serviceId
    ) as CartService | undefined;
    return item?.quantity || 0;
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {orderPage.logoOverrideUrl ? (
              <Image
                src={orderPage.logoOverrideUrl}
                alt={orderPage.organization.name}
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-white">
                {orderPage.organization.name}
              </span>
            )}
            <div className="flex items-center gap-4 text-sm text-[var(--foreground-secondary)]">
              {orderPage.showPhone && orderPage.customPhone && (
                <a
                  href={`tel:${orderPage.customPhone}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{orderPage.customPhone}</span>
                </a>
              )}
              {orderPage.showEmail && orderPage.customEmail && (
                <a
                  href={`mailto:${orderPage.customEmail}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <EmailIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{orderPage.customEmail}</span>
                </a>
              )}
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label={`Shopping cart${cartTotals.itemCount > 0 ? `, ${cartTotals.itemCount} items` : ''}`}
                className="relative flex items-center gap-1.5 rounded-lg bg-[var(--background-tertiary)] px-3 py-2 text-white transition-colors hover:bg-[var(--background-hover)]"
              >
                <CartIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartTotals.itemCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cartTotals.itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative border-b border-[var(--card-border)]"
        style={{
          background: orderPage.heroImageUrl
            ? undefined
            : `linear-gradient(135deg, ${primaryColor}15 0%, transparent 50%)`,
        }}
      >
        {orderPage.heroImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={orderPage.heroImageUrl}
              alt=""
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/80 via-[var(--background)]/60 to-[var(--background)]" />
          </div>
        )}
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            {orderPage.headline && (
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {orderPage.headline}
              </h1>
            )}
            {orderPage.subheadline && (
              <p className="mt-6 text-lg text-[var(--foreground-secondary)] sm:text-xl">
                {orderPage.subheadline}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        {/* Bundles Section */}
        {orderPage.bundles.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Service Packages
              </h2>
              <p className="mt-2 text-[var(--foreground-muted)]">
                Save more with our curated bundles
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {orderPage.bundles.map((bundle) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  primaryColor={primaryColor}
                  isInCart={isBundleInCart(bundle.id)}
                  onAdd={() => addBundle(bundle)}
                  onRemove={() => removeBundle(bundle.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Services Section */}
        {orderPage.services.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Individual Services
              </h2>
              <p className="mt-2 text-[var(--foreground-muted)]">
                Select exactly what you need
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {orderPage.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  primaryColor={primaryColor}
                  quantity={getServiceQuantity(service.id)}
                  onAdd={() => addService(service)}
                  onUpdateQuantity={(qty) => updateServiceQuantity(service.id, qty)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                What Our Clients Say
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {orderPage.bundles.length === 0 && orderPage.services.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--card-border)] py-16 text-center">
            <PackageIcon className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
            <h3 className="mt-4 text-lg font-medium text-white">
              No services available
            </h3>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Check back soon for our offerings.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              {orderPage.showPhone && orderPage.customPhone && (
                <a
                  href={`tel:${orderPage.customPhone}`}
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors"
                >
                  {orderPage.customPhone}
                </a>
              )}
              {orderPage.showEmail && orderPage.customEmail && (
                <a
                  href={`mailto:${orderPage.customEmail}`}
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors"
                >
                  {orderPage.customEmail}
                </a>
              )}
            </div>
            <p className="text-sm text-[var(--border-visible)]">
              Powered by{" "}
              <Link href="/" className="text-[var(--foreground-muted)] hover:text-white transition-colors">
                PhotoProOS
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[var(--card)] shadow-2xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] p-6">
                <div className="flex items-center gap-3">
                  <CartIcon className="h-6 w-6 text-white" />
                  <div>
                    <h2 className="text-lg font-semibold text-white">Your Cart</h2>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {cartTotals.itemCount} {cartTotals.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Close cart"
                  className="rounded-lg p-2 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-white"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CartIcon className="h-12 w-12 text-[var(--border-visible)]" />
                    <p className="mt-4 text-lg font-medium text-white">Your cart is empty</p>
                    <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                      Add services or bundles to get started
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Browse Services
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Bundles in Cart */}
                    {cartItems
                      .filter((item): item is CartBundle => item.type === "bundle")
                      .map((bundle) => (
                        <div
                          key={bundle.id}
                          className="flex items-start gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
                            <PackageIcon className="h-5 w-5 text-[var(--foreground-muted)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{bundle.name}</p>
                            <p className="text-sm text-[var(--foreground-muted)]">
                              {bundle.sqft ? (
                                <>
                                  {bundle.sqft.toLocaleString()} sqft
                                  {bundle.pricingTierName && (
                                    <span className="ml-1">• {bundle.pricingTierName}</span>
                                  )}
                                </>
                              ) : (
                                "Package"
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-white">
                              {formatPrice(bundle.priceCents)}
                            </p>
                            <button
                              onClick={() => removeBundle(bundle.id)}
                              aria-label={`Remove ${bundle.name} from cart`}
                              className="rounded-lg p-1.5 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-red-400"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* Services in Cart */}
                    {cartItems
                      .filter((item): item is CartService => item.type === "service")
                      .map((service) => (
                        <div
                          key={service.id}
                          className="flex items-start gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{service.name}</p>
                            <p className="text-sm text-[var(--foreground-muted)]">
                              {formatPrice(service.priceCents)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)]">
                              <button
                                onClick={() =>
                                  updateServiceQuantity(service.id, service.quantity - 1)
                                }
                                aria-label={`Decrease ${service.name} quantity`}
                                className="rounded-l-lg px-2.5 py-1 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-white"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-white" aria-label={`${service.name} quantity`}>
                                {service.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateServiceQuantity(service.id, service.quantity + 1)
                                }
                                aria-label={`Increase ${service.name} quantity`}
                                className="rounded-r-lg px-2.5 py-1 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-white"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="w-20 text-right font-medium text-white">
                              {formatPrice(service.priceCents * service.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}

                    {/* Clear Cart */}
                    <button
                      onClick={clearCart}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] py-2.5 text-sm text-[var(--foreground-muted)] transition-colors hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Clear cart
                    </button>
                  </div>
                )}
              </div>

              {/* Footer with Total & Checkout */}
              {cartItems.length > 0 && (
                <div className="border-t border-[var(--card-border)] p-6">
                  <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
                    <span className="text-[var(--foreground-muted)]">Subtotal</span>
                    <span className="text-xl font-bold text-white">
                      {formatPrice(cartTotals.subtotal)}
                    </span>
                  </div>
                  <button
                    className="w-full rounded-lg py-3.5 text-base font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    Proceed to Checkout
                  </button>
                  <p className="mt-3 text-center text-xs text-[var(--foreground-muted)]">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {cartTotals.itemCount > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          aria-label={`View cart, ${cartTotals.itemCount} items, ${formatPrice(cartTotals.subtotal)} total`}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-lg transition-all hover:scale-105 sm:hidden"
          style={{ backgroundColor: primaryColor }}
        >
          <CartIcon className="h-5 w-5" />
          <span className="font-medium">{formatPrice(cartTotals.subtotal)}</span>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-1.5 text-sm font-medium">
            {cartTotals.itemCount}
          </span>
        </button>
      )}

      {/* Square Footage Input Modal */}
      {showSqftModal && selectedBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setShowSqftModal(false);
              setSelectedBundle(null);
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
            <div className="border-b border-[var(--card-border)] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Enter Property Size
              </h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                {selectedBundle.name}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Pricing Method Info */}
              {selectedBundle.pricingMethod === "per_sqft" && (
                <div className="rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-4">
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Price: <span className="font-semibold text-white">{formatPrice(selectedBundle.pricePerSqftCents || 0)}/sqft</span>
                  </p>
                  {selectedBundle.minSqft && selectedBundle.minSqft > 0 && (
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                      Minimum: {selectedBundle.minSqft.toLocaleString()} sqft
                    </p>
                  )}
                </div>
              )}

              {selectedBundle.pricingMethod === "tiered" && selectedBundle.pricingTiers.length > 0 && (
                <div className="rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-4">
                  <p className="text-sm font-medium text-white mb-2">Pricing Tiers</p>
                  <div className="space-y-1.5">
                    {selectedBundle.pricingTiers.map((tier) => (
                      <div key={tier.id} className="flex items-start justify-between gap-4 flex-wrap text-sm">
                        <span className="text-[var(--foreground-secondary)]">
                          {tier.minSqft.toLocaleString()} - {tier.maxSqft ? tier.maxSqft.toLocaleString() : "∞"} sqft
                          {tier.tierName && <span className="text-[var(--foreground-muted)] ml-1">({tier.tierName})</span>}
                        </span>
                        <span className="font-medium text-white">{formatPrice(tier.priceCents)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sqft Input */}
              <div>
                <label htmlFor="sqft" className="block text-sm font-medium text-white mb-2">
                  Square Footage
                </label>
                <input
                  type="number"
                  id="sqft"
                  value={sqftInput}
                  onChange={(e) => setSqftInput(e.target.value)}
                  placeholder="e.g., 2500"
                  min={selectedBundle.minSqft || 1}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-lg text-white placeholder:text-[var(--foreground-muted)] focus:border-[var(--border-visible)] focus:outline-none focus:ring-1 focus:ring-[var(--border-visible)]"
                  autoFocus
                />
              </div>

              {/* Calculated Price Preview */}
              {sqftInput && parseInt(sqftInput, 10) > 0 && (
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm text-[var(--foreground-muted)]">Estimated Price</p>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(calculateSqftPrice(selectedBundle, parseInt(sqftInput, 10)).priceCents)}
                      </p>
                    </div>
                    {calculateSqftPrice(selectedBundle, parseInt(sqftInput, 10)).tier && (
                      <div className="text-right">
                        <p className="text-xs text-[var(--foreground-muted)]">Tier</p>
                        <p className="text-sm font-medium" style={{ color: primaryColor }}>
                          {calculateSqftPrice(selectedBundle, parseInt(sqftInput, 10)).tier?.tierName || "Standard"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSqftModal(false);
                    setSelectedBundle(null);
                  }}
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--background-tertiary)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addBundleWithSqft}
                  disabled={!sqftInput || parseInt(sqftInput, 10) <= 0}
                  className="flex-1 rounded-lg py-3 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        orderPageId={orderPage.id}
        cartItems={cartItems}
        subtotalCents={cartTotals.subtotal}
        primaryColor={primaryColor}
      />
    </div>
  );
}

// Bundle Card Component
function BundleCard({
  bundle,
  primaryColor,
  isInCart,
  onAdd,
  onRemove,
}: {
  bundle: Bundle;
  primaryColor: string;
  isInCart: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden transition-all hover:border-[var(--border-visible)]">
      {/* Badge */}
      {bundle.badgeText && (
        <div
          className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {bundle.badgeText}
        </div>
      )}

      {/* Image */}
      {bundle.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={bundle.imageUrl}
            alt={bundle.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-white">{bundle.name}</h3>
        {bundle.description && (
          <p className="mt-2 text-sm text-[var(--foreground-secondary)] line-clamp-2">
            {bundle.description}
          </p>
        )}

        {/* Included Services */}
        <div className="mt-4 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
            Includes
          </p>
          <ul className="space-y-1.5">
            {bundle.services.slice(0, 4).map((service) => (
              <li
                key={service.id}
                className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]"
              >
                <CheckIcon
                  className="h-4 w-4 shrink-0"
                  style={{ color: primaryColor }}
                />
                <span className="truncate">
                  {service.quantity > 1 && `${service.quantity}x `}
                  {service.name}
                </span>
              </li>
            ))}
            {bundle.services.length > 4 && (
              <li className="text-xs text-[var(--foreground-muted)]">
                +{bundle.services.length - 4} more
              </li>
            )}
          </ul>
        </div>

        {/* Pricing */}
        <div className="mt-6 flex items-end justify-between border-t border-[var(--card-border)] pt-4">
          <div>
            {bundle.pricingMethod === "per_sqft" ? (
              <>
                <p className="text-sm text-[var(--foreground-muted)]">Starting at</p>
                <p className="text-2xl font-bold text-white">
                  {formatPrice(bundle.pricePerSqftCents || 0)}<span className="text-sm font-normal text-[var(--foreground-muted)]">/sqft</span>
                </p>
                {bundle.minSqft && bundle.minSqft > 0 && (
                  <p className="text-xs text-[var(--foreground-muted)]">
                    Min {bundle.minSqft.toLocaleString()} sqft
                  </p>
                )}
              </>
            ) : bundle.pricingMethod === "tiered" && bundle.pricingTiers.length > 0 ? (
              <>
                <p className="text-sm text-[var(--foreground-muted)]">From</p>
                <p className="text-2xl font-bold text-white">
                  {formatPrice(Math.min(...bundle.pricingTiers.map((t) => t.priceCents)))}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {bundle.pricingTiers.length} tier{bundle.pricingTiers.length > 1 ? "s" : ""} by sqft
                </p>
              </>
            ) : (
              <>
                {bundle.originalPriceCents && bundle.savingsPercent && bundle.savingsPercent > 0 && (
                  <p className="text-sm text-[var(--foreground-muted)] line-through">
                    {formatPrice(bundle.originalPriceCents)}
                  </p>
                )}
                <p className="text-2xl font-bold text-white">
                  {formatPrice(bundle.priceCents)}
                </p>
                {bundle.savingsPercent && bundle.savingsPercent > 0 && (
                  <p className="text-sm font-medium" style={{ color: primaryColor }}>
                    Save {Math.round(bundle.savingsPercent)}%
                  </p>
                )}
              </>
            )}
          </div>
          {isInCart ? (
            <button
              onClick={onRemove}
              aria-label={`Remove ${bundle.name} from cart`}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[var(--background-hover)]"
            >
              <CheckIcon className="h-4 w-4" style={{ color: primaryColor }} />
              Added
            </button>
          ) : (
            <button
              onClick={onAdd}
              aria-label={`Select ${bundle.name} package`}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({
  service,
  primaryColor,
  quantity,
  onAdd,
  onUpdateQuantity,
}: {
  service: Service;
  primaryColor: string;
  quantity: number;
  onAdd: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-visible)]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-white truncate">{service.name}</h3>
          {service.category && (
            <span className="shrink-0 rounded-full bg-[var(--background-tertiary)] px-2 py-0.5 text-xs text-[var(--foreground-muted)]">
              {service.category.replace(/_/g, " ")}
            </span>
          )}
        </div>
        {service.description && (
          <p className="mt-1 text-sm text-[var(--foreground-secondary)] line-clamp-1">
            {service.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
          {service.duration > 0 && (
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              {formatDuration(service.duration)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <p className="text-lg font-bold text-white">
          {formatPrice(service.priceCents)}
        </p>
        {quantity > 0 ? (
          <div className="flex items-center gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)]" role="group" aria-label={`${service.name} quantity controls`}>
            <button
              onClick={() => onUpdateQuantity(quantity - 1)}
              aria-label={`Decrease ${service.name} quantity`}
              className="rounded-l-lg px-2.5 py-1.5 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-white"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-white" aria-live="polite">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(quantity + 1)}
              aria-label={`Increase ${service.name} quantity`}
              className="rounded-r-lg px-2.5 py-1.5 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-white"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
            aria-label={`Add ${service.name} to cart`}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <QuoteIcon className="h-8 w-8 text-[var(--card-border)] mb-4" />
      <p className="flex-1 text-[var(--foreground-secondary)] italic">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-3">
        {testimonial.photoUrl ? (
          <Image
            src={testimonial.photoUrl}
            alt={testimonial.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--background-tertiary)] text-white">
            {testimonial.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium text-white">{testimonial.name}</p>
          {testimonial.company && (
            <p className="text-sm text-[var(--foreground-muted)]">{testimonial.company}</p>
          )}
        </div>
      </div>
    </div>
  );
}

