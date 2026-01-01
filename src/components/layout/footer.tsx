"use client";

import * as React from "react";
import Link from "next/link";
import { PhotoProOSLogo } from "@/components/ui/photoproos-logo";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  badge?: string;
  external?: boolean;
}

function FooterLink({ href, children, badge, external }: FooterLinkProps) {
  const linkProps = external ? { rel: "noreferrer", target: "_blank" } : {};

  return (
    <li className="flex items-center gap-3 py-1">
      <Link
        href={href}
        className="text-foreground-secondary transition-colors hover:text-foreground"
        {...linkProps}
      >
        {children}
      </Link>
      {badge && (
        <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
          {badge}
        </span>
      )}
    </li>
  );
}

interface FooterColumnProps {
  title: string;
  children: React.ReactNode;
}

function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <div>
      <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
        {title}
      </p>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--card-border)] bg-[var(--background)]">
      <div className="mx-auto max-w-[1512px] px-6 py-16 lg:px-[124px]">
        {/* Main Footer Grid */}
        <div className="grid gap-12 lg:grid-cols-6 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <PhotoProOSLogo size="md" className="mb-6" />
            <p className="mb-6 max-w-xs text-sm text-foreground-secondary">
              The Business OS for Professional Photographers. Deliver stunning galleries,
              collect payments automatically, and run your entire photography business from one platform.
            </p>
            {/* Newsletter Signup */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-medium text-foreground">Stay in the loop</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  Subscribe
                </button>
              </form>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <SocialLink href="https://twitter.com/photoproos" label="Twitter">
                <TwitterIcon className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="https://instagram.com/photoproos" label="Instagram">
                <InstagramIcon className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="https://linkedin.com/company/photoproos" label="LinkedIn">
                <LinkedInIcon className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="https://youtube.com/@photoproos" label="YouTube">
                <YouTubeIcon className="h-5 w-5" />
              </SocialLink>
            </div>
          </div>

          {/* Product Column */}
          <FooterColumn title="Product">
            <FooterLink href="/features/galleries">Client Galleries</FooterLink>
            <FooterLink href="/features/payments">Payment Processing</FooterLink>
            <FooterLink href="/features/clients">Client Management</FooterLink>
            <FooterLink href="/features/workflows">Workflow Automation</FooterLink>
            <FooterLink href="/features/analytics">Analytics & Reports</FooterLink>
            <FooterLink href="/features/contracts" badge="Soon">Contracts & E-Sign</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
          </FooterColumn>

          {/* Industries Column */}
          <FooterColumn title="Industries">
            <FooterLink href="/industries/real-estate">Real Estate</FooterLink>
            <FooterLink href="/industries/commercial">Commercial</FooterLink>
            <FooterLink href="/industries/architecture">Architecture</FooterLink>
            <FooterLink href="/industries/events">Events & Corporate</FooterLink>
            <FooterLink href="/industries/headshots">Headshots & Portraits</FooterLink>
            <FooterLink href="/industries/food">Food & Hospitality</FooterLink>
          </FooterColumn>

          {/* Resources Column */}
          <FooterColumn title="Resources">
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/guides">Guides & Tutorials</FooterLink>
            <FooterLink href="/webinars">Webinars</FooterLink>
            <FooterLink href="/changelog">Changelog</FooterLink>
            <FooterLink href="/roadmap">Product Roadmap</FooterLink>
            <FooterLink href="/api-docs" external>API Documentation</FooterLink>
          </FooterColumn>

          {/* Company Column */}
          <FooterColumn title="Company">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/press">Press Kit</FooterLink>
            <FooterLink href="/partners">Partner Program</FooterLink>
            <FooterLink href="/affiliates">Affiliates</FooterLink>
          </FooterColumn>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-[var(--card-border)] pt-8 lg:flex-row">
          {/* Copyright */}
          <p className="text-sm text-foreground-muted">
            © {new Date().getFullYear()} PhotoProOS. All rights reserved.
          </p>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/legal/terms" className="text-sm text-foreground-muted hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="text-sm text-foreground-muted hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/legal/cookies" className="text-sm text-foreground-muted hover:text-foreground">
              Cookie Policy
            </Link>
            <Link href="/security" className="text-sm text-foreground-muted hover:text-foreground">
              Security
            </Link>
            <Link href="/legal/dpa" className="text-sm text-foreground-muted hover:text-foreground">
              DPA
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5">
              <ShieldIcon className="h-4 w-4 text-green-500" />
              <span className="text-xs text-foreground-secondary">SOC 2</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5">
              <LockIcon className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-foreground-secondary">256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card)] text-foreground-secondary transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
      aria-label={label}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Z" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
  );
}
