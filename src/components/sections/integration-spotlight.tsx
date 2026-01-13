"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// ============================================
// INTEGRATION SPOTLIGHT SECTION
// ============================================

export function IntegrationSpotlightSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="relative z-10 py-20 lg:py-28 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ai)] via-[#6d28d9] to-[var(--primary)]">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[var(--primary)]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Payment mockup */}
          <div
            className="order-2 lg:order-1"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateX(-40px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
            }}
          >
            <div className="relative">
              {/* Card stack effect */}
              <div className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm" />
              <div className="absolute -bottom-2 -right-2 h-full w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm" />

              {/* Main payment card */}
              <div className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 lg:p-8">
                {/* Stripe logo */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <StripeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Powered by Stripe</p>
                    <p className="text-xs text-white/60">Secure payment processing</p>
                  </div>
                </div>

                {/* Payment preview */}
                <div className="space-y-4">
                  <div className="rounded-lg bg-white/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/80">Order Summary</span>
                      <span className="text-xs text-white/60">Gallery: Sunset Wedding</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">12 Digital Downloads</span>
                        <span className="text-white">$180.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Album Add-on</span>
                        <span className="text-white">$75.00</span>
                      </div>
                      <div className="border-t border-white/20 pt-2 mt-2 flex justify-between">
                        <span className="font-medium text-white">Total</span>
                        <span className="font-bold text-white">$255.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Card input mockup */}
                  <div className="rounded-lg bg-white/10 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-12 items-center justify-center rounded bg-white/20">
                        <CreditCardIcon className="h-5 w-5 text-white/80" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-32 rounded bg-white/30" />
                        <div className="mt-1 h-2 w-16 rounded bg-white/20" />
                      </div>
                    </div>
                    <button className="w-full rounded-lg bg-white py-3 text-sm font-medium text-[var(--ai)]">
                      Pay $255.00
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <LockIcon className="h-3 w-3" />
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <ShieldIcon className="h-3 w-3" />
                      <span>PCI Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(20px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
              }}
            >
              <span className="text-sm text-white/90">
                <span className="font-medium text-white">Seamlessly integrated</span> with Stripe
              </span>
            </div>

            <h2
              className="text-3xl font-medium leading-tight tracking-[-1px] text-white lg:text-4xl lg:leading-tight"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "100ms",
              }}
            >
              Get paid instantly when clients download
            </h2>

            <p
              className="mt-4 text-white/80 leading-relaxed lg:text-lg"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "200ms",
              }}
            >
              Stripe's world-class payment processing built right in. Accept cards, Apple Pay, and more—with instant payouts directly to your bank account.
            </p>

            {/* Features */}
            <ul
              className="mt-6 space-y-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "300ms",
              }}
            >
              {integrationFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-white/80 mt-0.5" />
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div
              className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "400ms",
              }}
            >
              <Button asChild size="lg" className="bg-white text-[var(--ai)] hover:bg-white/90 shrink-0">
                <Link href="/features/payments">Learn about Payments</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 shrink-0">
                <Link href="/integrations">View All Integrations</Link>
              </Button>
            </div>

            {/* Partner logos */}
            <div
              className="mt-10 pt-8 border-t border-white/20"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "500ms",
              }}
            >
              <p className="text-xs text-white/60 mb-4 uppercase tracking-wider">
                Also integrates with
              </p>
              <div className="flex flex-wrap items-center gap-6">
                {integrationPartners.map((partner, index) => (
                  <div key={index} className="flex items-center gap-2 text-white/70">
                    <partner.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{partner.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// DATA
// ============================================

const integrationFeatures = [
  "Accept all major cards, Apple Pay, Google Pay",
  "Instant payouts to your bank account",
  "Automatic invoice generation",
  "Payment plans and deposit support",
  "International currency support",
];

const integrationPartners = [
  { name: "Zapier", icon: ZapierIcon },
  { name: "Google", icon: GoogleIcon },
  { name: "Slack", icon: SlackIcon },
  { name: "Calendly", icon: CalendlyIcon },
];

// ============================================
// ICONS
// ============================================

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
      <path fillRule="evenodd" d="M1.5 9.75v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5H1.5ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V15Zm3.75-.75a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h3.008a.75.75 0 0 0 .75-.75V15a.75.75 0 0 0-.75-.75H9.75Z" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ZapierIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.089l-2.462-2.461a.75.75 0 0 1 0-1.061l2.462-2.462a.75.75 0 0 0 0-1.06l-1.06-1.061a.75.75 0 0 0-1.061 0l-2.462 2.462a.75.75 0 0 1-1.06 0L9.788 6.984a.75.75 0 0 0-1.06 0l-1.061 1.06a.75.75 0 0 0 0 1.061l2.462 2.462a.75.75 0 0 1 0 1.06l-2.462 2.462a.75.75 0 0 0 0 1.06l1.06 1.061a.75.75 0 0 0 1.061 0l2.462-2.462a.75.75 0 0 1 1.06 0l2.462 2.462a.75.75 0 0 0 1.061 0l1.06-1.06a.75.75 0 0 0 0-1.061z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
    </svg>
  );
}

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zm-2.521 10.124a2.528 2.528 0 0 1 2.521 2.52A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.271a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z" />
    </svg>
  );
}

function CalendlyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.655 14.262c0 .096 0 .192-.012.276a5.482 5.482 0 0 1-5.457 5.196h-4.42a5.482 5.482 0 0 1-5.469-5.472V9.738a5.482 5.482 0 0 1 5.469-5.472h4.42a5.47 5.47 0 0 1 5.445 4.932h-2.652a2.88 2.88 0 0 0-2.793-2.196h-4.42a2.876 2.876 0 0 0-2.873 2.88v4.38a2.876 2.876 0 0 0 2.873 2.88h4.42a2.876 2.876 0 0 0 2.817-2.316h2.652v-.564z" />
    </svg>
  );
}
