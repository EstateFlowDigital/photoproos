"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Testimonial } from "@/lib/validations/order-pages";
import { CheckoutModal } from "@/components/order/checkout-modal";

// Cart item types
interface CartBundle {
  type: "bundle";
  id: string;
  name: string;
  priceCents: number;
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
  imageUrl: string | null;
  badgeText: string | null;
  originalPriceCents: number | null;
  savingsPercent: number | null;
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626] bg-[#141414]">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-4 text-sm text-[#a7a7a7]">
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
                className="relative flex items-center gap-1.5 rounded-lg bg-[#262626] px-3 py-2 text-white transition-colors hover:bg-[#313131]"
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
        className="relative border-b border-[#262626]"
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
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a]" />
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
              <p className="mt-6 text-lg text-[#a7a7a7] sm:text-xl">
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
              <p className="mt-2 text-[#7c7c7c]">
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
              <p className="mt-2 text-[#7c7c7c]">
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
          <div className="rounded-xl border border-dashed border-[#262626] py-16 text-center">
            <PackageIcon className="mx-auto h-12 w-12 text-[#7c7c7c]" />
            <h3 className="mt-4 text-lg font-medium text-white">
              No services available
            </h3>
            <p className="mt-2 text-sm text-[#7c7c7c]">
              Check back soon for our offerings.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] bg-[#141414]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              {orderPage.showPhone && orderPage.customPhone && (
                <a
                  href={`tel:${orderPage.customPhone}`}
                  className="text-sm text-[#7c7c7c] hover:text-white transition-colors"
                >
                  {orderPage.customPhone}
                </a>
              )}
              {orderPage.showEmail && orderPage.customEmail && (
                <a
                  href={`mailto:${orderPage.customEmail}`}
                  className="text-sm text-[#7c7c7c] hover:text-white transition-colors"
                >
                  {orderPage.customEmail}
                </a>
              )}
            </div>
            <p className="text-sm text-[#454545]">
              Powered by{" "}
              <Link href="/" className="text-[#7c7c7c] hover:text-white transition-colors">
                ListingLens
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
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#141414] shadow-2xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#262626] p-6">
                <div className="flex items-center gap-3">
                  <CartIcon className="h-6 w-6 text-white" />
                  <div>
                    <h2 className="text-lg font-semibold text-white">Your Cart</h2>
                    <p className="text-sm text-[#7c7c7c]">
                      {cartTotals.itemCount} {cartTotals.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-lg p-2 text-[#7c7c7c] transition-colors hover:bg-[#262626] hover:text-white"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CartIcon className="h-12 w-12 text-[#454545]" />
                    <p className="mt-4 text-lg font-medium text-white">Your cart is empty</p>
                    <p className="mt-2 text-sm text-[#7c7c7c]">
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
                          className="flex items-start gap-4 rounded-lg border border-[#262626] bg-[#0a0a0a] p-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#262626]">
                            <PackageIcon className="h-5 w-5 text-[#7c7c7c]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{bundle.name}</p>
                            <p className="text-sm text-[#7c7c7c]">Package</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-white">
                              {formatPrice(bundle.priceCents)}
                            </p>
                            <button
                              onClick={() => removeBundle(bundle.id)}
                              className="rounded-lg p-1.5 text-[#7c7c7c] transition-colors hover:bg-[#262626] hover:text-red-400"
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
                          className="flex items-start gap-4 rounded-lg border border-[#262626] bg-[#0a0a0a] p-4"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{service.name}</p>
                            <p className="text-sm text-[#7c7c7c]">
                              {formatPrice(service.priceCents)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 rounded-lg border border-[#262626] bg-[#141414]">
                              <button
                                onClick={() =>
                                  updateServiceQuantity(service.id, service.quantity - 1)
                                }
                                className="rounded-l-lg px-2.5 py-1 text-[#7c7c7c] transition-colors hover:bg-[#262626] hover:text-white"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-white">
                                {service.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateServiceQuantity(service.id, service.quantity + 1)
                                }
                                className="rounded-r-lg px-2.5 py-1 text-[#7c7c7c] transition-colors hover:bg-[#262626] hover:text-white"
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
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#262626] py-2.5 text-sm text-[#7c7c7c] transition-colors hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Clear cart
                    </button>
                  </div>
                )}
              </div>

              {/* Footer with Total & Checkout */}
              {cartItems.length > 0 && (
                <div className="border-t border-[#262626] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[#7c7c7c]">Subtotal</span>
                    <span className="text-xl font-bold text-white">
                      {formatPrice(cartTotals.subtotal)}
                    </span>
                  </div>
                  <button
                    className="w-full rounded-lg py-3.5 text-base font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => {
                      // TODO: Integrate with Stripe checkout
                      alert("Checkout will be integrated with Stripe in the next phase.");
                    }}
                  >
                    Proceed to Checkout
                  </button>
                  <p className="mt-3 text-center text-xs text-[#7c7c7c]">
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
    <div className="group relative flex flex-col rounded-xl border border-[#262626] bg-[#141414] overflow-hidden transition-all hover:border-[#454545]">
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
          <p className="mt-2 text-sm text-[#a7a7a7] line-clamp-2">
            {bundle.description}
          </p>
        )}

        {/* Included Services */}
        <div className="mt-4 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[#7c7c7c] mb-2">
            Includes
          </p>
          <ul className="space-y-1.5">
            {bundle.services.slice(0, 4).map((service) => (
              <li
                key={service.id}
                className="flex items-center gap-2 text-sm text-[#a7a7a7]"
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
              <li className="text-xs text-[#7c7c7c]">
                +{bundle.services.length - 4} more
              </li>
            )}
          </ul>
        </div>

        {/* Pricing */}
        <div className="mt-6 flex items-end justify-between border-t border-[#262626] pt-4">
          <div>
            {bundle.originalPriceCents && bundle.savingsPercent && bundle.savingsPercent > 0 && (
              <p className="text-sm text-[#7c7c7c] line-through">
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
          </div>
          {isInCart ? (
            <button
              onClick={onRemove}
              className="flex items-center gap-2 rounded-lg border border-[#262626] bg-[#262626] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#313131]"
            >
              <CheckIcon className="h-4 w-4" style={{ color: primaryColor }} />
              Added
            </button>
          ) : (
            <button
              onClick={onAdd}
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
    <div className="group flex items-center gap-4 rounded-xl border border-[#262626] bg-[#141414] p-5 transition-all hover:border-[#454545]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-white truncate">{service.name}</h3>
          {service.category && (
            <span className="shrink-0 rounded-full bg-[#262626] px-2 py-0.5 text-xs text-[#7c7c7c]">
              {service.category.replace(/_/g, " ")}
            </span>
          )}
        </div>
        {service.description && (
          <p className="mt-1 text-sm text-[#a7a7a7] line-clamp-1">
            {service.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-[#7c7c7c]">
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
          <div className="flex items-center gap-1 rounded-lg border border-[#262626] bg-[#0a0a0a]">
            <button
              onClick={() => onUpdateQuantity(quantity - 1)}
              className="rounded-l-lg px-2.5 py-1.5 text-[#7c7c7c] transition-colors hover:bg-[#262626] hover:text-white"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-white">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(quantity + 1)}
              className="rounded-r-lg px-2.5 py-1.5 text-[#7c7c7c] transition-colors hover:bg-[#262626] hover:text-white"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
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
    <div className="flex flex-col rounded-xl border border-[#262626] bg-[#141414] p-6">
      <QuoteIcon className="h-8 w-8 text-[#262626] mb-4" />
      <p className="flex-1 text-[#a7a7a7] italic">
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#262626] text-white">
            {testimonial.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium text-white">{testimonial.name}</p>
          {testimonial.company && (
            <p className="text-sm text-[#7c7c7c]">{testimonial.company}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Icons
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function CheckIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5 3.871 3.871 0 0 1-2.748-1.179Zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5 3.871 3.871 0 0 1-2.748-1.179Z"
      />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}
