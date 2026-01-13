"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface Photo {
  id: string;
  url: string;
  filename: string;
}

// ============================================
// CLIENT PORTAL DEMO - Matches real portal UI
// ============================================

export function ClientPortalDemo() {
  const [activeTab, setActiveTab] = React.useState<"galleries" | "invoices" | "downloads">("galleries");
  const [selectedGallery, setSelectedGallery] = React.useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = React.useState<Photo | null>(null);
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set(["photo-1", "photo-4"]));

  const handleToggleFavorite = (photoId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Portal Header */}
      <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-muted">Welcome back</p>
            <p className="text-sm font-medium text-foreground">Sarah Mitchell</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted">Premier Realty</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-medium text-white">
              SM
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-[var(--card-border)]">
        <div className="rounded-lg bg-[var(--background-secondary)] p-2 text-center">
          <p className="text-lg font-bold text-foreground">3</p>
          <p className="text-[10px] text-foreground-muted">Galleries</p>
        </div>
        <div className="rounded-lg bg-[var(--background-secondary)] p-2 text-center">
          <p className="text-lg font-bold text-foreground">96</p>
          <p className="text-[10px] text-foreground-muted">Photos</p>
        </div>
        <div className="rounded-lg bg-[var(--background-secondary)] p-2 text-center">
          <p className="text-lg font-bold text-[var(--success)]">$1,250</p>
          <p className="text-[10px] text-foreground-muted">Paid</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--card-border)]">
        {(["galleries", "invoices", "downloads"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors",
              activeTab === tab
                ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "galleries" && !selectedGallery && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground-muted mb-2">Your Galleries</p>
            {portalGalleries.map((gallery) => (
              <button
                key={gallery.id}
                onClick={() => setSelectedGallery(gallery.id)}
                className="w-full flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2 text-left transition-all hover:border-[var(--primary)] hover:shadow-md"
              >
                <div className="h-12 w-16 rounded overflow-hidden bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ai)]/20">
                  <img
                    src={gallery.coverUrl}
                    alt={gallery.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{gallery.name}</p>
                  <p className="text-xs text-foreground-muted">{gallery.photoCount} photos</p>
                </div>
                <div className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  gallery.status === "delivered"
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : "bg-[var(--warning)]/10 text-[var(--warning)]"
                )}>
                  {gallery.status}
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "galleries" && selectedGallery && (
          <div className="space-y-3">
            {/* Back button */}
            <button
              onClick={() => setSelectedGallery(null)}
              className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to galleries
            </button>

            {/* Gallery info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {portalGalleries.find((g) => g.id === selectedGallery)?.name}
                </p>
                <p className="text-xs text-foreground-muted">Click photos to view or favorite</p>
              </div>
              <button className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary)]/90 transition-colors">
                Download All
              </button>
            </div>

            {/* Photo grid - INTERACTIVE */}
            <div className="grid grid-cols-3 gap-1.5">
              {galleryPhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative aspect-square rounded overflow-hidden bg-[var(--background-secondary)]"
                >
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Favorite indicator */}
                  <div className={cn(
                    "absolute top-1 right-1 transition-opacity",
                    favorites.has(photo.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <HeartIcon
                      className={cn(
                        "h-4 w-4",
                        favorites.has(photo.id) ? "text-red-500 fill-red-500" : "text-white drop-shadow"
                      )}
                    />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground-muted mb-2">Your Invoices</p>
            {portalInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{invoice.description}</p>
                  <p className="text-xs text-foreground-muted">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{invoice.amount}</span>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    invoice.status === "paid"
                      ? "bg-[var(--success)]/10 text-[var(--success)]"
                      : "bg-[var(--warning)]/10 text-[var(--warning)]"
                  )}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "downloads" && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground-muted">Download Options</p>
            <div className="space-y-2">
              <DownloadOption
                icon={<ZipIcon className="h-5 w-5" />}
                title="All Photos (ZIP)"
                description="Full resolution, 96 photos"
                size="245 MB"
              />
              <DownloadOption
                icon={<WebIcon className="h-5 w-5" />}
                title="Web-Size Photos"
                description="Optimized for web sharing"
                size="48 MB"
              />
              <DownloadOption
                icon={<HeartIcon className="h-5 w-5" />}
                title="Favorites Only"
                description={`${favorites.size} selected photos`}
                size="24 MB"
              />
            </div>
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          isFavorite={favorites.has(selectedPhoto.id)}
          onClose={() => setSelectedPhoto(null)}
          onToggleFavorite={() => handleToggleFavorite(selectedPhoto.id)}
        />
      )}
    </div>
  );
}

// ============================================
// PHOTO LIGHTBOX
// ============================================

interface PhotoLightboxProps {
  photo: Photo;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
}

function PhotoLightbox({ photo, isFavorite, onClose, onToggleFavorite }: PhotoLightboxProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
      >
        <XIcon className="h-5 w-5" />
      </button>

      {/* Photo */}
      <img
        src={photo.url}
        alt={photo.filename}
        className="max-h-[80%] max-w-[90%] object-contain rounded-lg shadow-2xl"
      />

      {/* Actions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <button
          onClick={onToggleFavorite}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            isFavorite
              ? "bg-red-500 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <HeartIcon className={cn("h-4 w-4", isFavorite && "fill-current")} />
          {isFavorite ? "Favorited" : "Favorite"}
        </button>
        <button className="flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors">
          <DownloadIcon className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  );
}

// ============================================
// PAYMENT DEMO WITH CONFETTI
// ============================================

export function PaymentDemo() {
  const [step, setStep] = React.useState<"invoice" | "card" | "processing" | "success">("invoice");
  const [cardNumber, setCardNumber] = React.useState("");

  const handlePayNow = () => {
    setStep("card");
  };

  const handleSubmitPayment = () => {
    setStep("processing");
    // Simulate payment processing
    setTimeout(() => {
      setStep("success");
    }, 1500);
  };

  const handleReset = () => {
    setStep("invoice");
    setCardNumber("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Payment</p>
        <p className="text-xs text-foreground-muted">Secure checkout powered by Stripe</p>
      </div>

      <div className="flex-1 p-4">
        {step === "invoice" && (
          <div className="space-y-4">
            {/* Invoice preview */}
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Invoice #INV-2024-087</p>
                  <p className="text-xs text-foreground-muted">Luxury Estate Photography</p>
                </div>
                <span className="rounded-full bg-[var(--warning)]/10 text-[var(--warning)] px-2 py-0.5 text-[10px] font-medium">
                  PENDING
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Professional Photography</span>
                  <span className="text-foreground">$350.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Twilight Session</span>
                  <span className="text-foreground">$150.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Drone Aerials</span>
                  <span className="text-foreground">$125.00</span>
                </div>
                <div className="border-t border-[var(--card-border)] pt-2 mt-2 flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">$625.00</span>
                </div>
              </div>

              <button
                onClick={handlePayNow}
                className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
              >
                Pay Now
              </button>
            </div>

            <p className="text-center text-xs text-foreground-muted">
              🔒 256-bit SSL encryption
            </p>
          </div>
        )}

        {step === "card" && (
          <div className="space-y-4">
            {/* Mock credit card input */}
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-sm font-medium text-foreground mb-3">Card Details</p>

              {/* Card number input */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-foreground-muted block mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const formatted = val.replace(/(\d{4})/g, "$1 ").trim();
                        setCardNumber(formatted);
                      }}
                      placeholder="4242 4242 4242 4242"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                    />
                    <CreditCardIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-foreground-muted block mb-1">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="12/27"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-foreground-muted block mb-1">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      defaultValue="123"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex justify-between items-center">
                <span className="text-sm text-foreground-muted">Amount:</span>
                <span className="text-lg font-bold text-foreground">$625.00</span>
              </div>
            </div>

            <button
              onClick={handleSubmitPayment}
              className="w-full rounded-lg bg-[var(--success)] py-2.5 text-sm font-medium text-white hover:bg-[var(--success)]/90 transition-colors"
            >
              Pay $625.00
            </button>

            <button
              onClick={() => setStep("invoice")}
              className="w-full text-sm text-foreground-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        )}

        {step === "processing" && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin mb-4" />
            <p className="text-sm font-medium text-foreground">Processing payment...</p>
            <p className="text-xs text-foreground-muted mt-1">Please wait</p>
          </div>
        )}

        {step === "success" && (
          <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
            {/* Confetti */}
            <Confetti />

            {/* Success content */}
            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/10">
                <CheckCircleIcon className="h-10 w-10 text-[var(--success)]" />
              </div>
              <p className="text-lg font-semibold text-foreground">Payment Successful!</p>
              <p className="text-sm text-foreground-muted mt-1">$625.00 paid</p>
              <p className="text-xs text-foreground-muted mt-3">
                Receipt sent to sarah@premierrealty.com
              </p>

              <button
                onClick={handleReset}
                className="mt-6 rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
              >
                View Gallery
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// CONFETTI ANIMATION
// ============================================

function Confetti() {
  const colors = ["#22c55e", "#3b82f6", "#8b5cf6", "#f97316", "#eab308"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => {
        const color = colors[i % colors.length];
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 0.5}s`;
        const duration = `${1 + Math.random() * 1}s`;
        const size = 6 + Math.random() * 6;

        return (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left,
              top: "-10px",
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              animationDelay: delay,
              animationDuration: duration,
            }}
          />
        );
      })}
    </div>
  );
}

// ============================================
// ENHANCED GALLERY DEMO WITH INTERACTIONS
// ============================================

export function EnhancedGalleryDemo() {
  const [selectedPhoto, setSelectedPhoto] = React.useState<Photo | null>(null);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Galleries</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              viewMode === "grid" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-foreground-muted hover:text-foreground"
            )}
          >
            <GridIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              viewMode === "list" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-foreground-muted hover:text-foreground"
            )}
          >
            <ListIcon className="h-4 w-4" />
          </button>
          <button className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary)]/90 transition-colors">
            + New Gallery
          </button>
        </div>
      </div>

      {viewMode === "grid" && (
        <div className="grid grid-cols-2 gap-3">
          {enhancedGalleryData.map((gallery) => (
            <div
              key={gallery.id}
              className="group cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 transition-all duration-200 hover:border-[var(--primary)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="mb-2 aspect-video rounded-md overflow-hidden relative">
                <img
                  src={gallery.coverUrl}
                  alt={gallery.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Photo count badge */}
                <div className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {gallery.photoCount} photos
                </div>
              </div>
              <h4 className="truncate text-sm font-medium text-foreground">{gallery.name}</h4>
              <p className="text-xs text-foreground-muted">{gallery.client}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                  gallery.status === "delivered"
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : gallery.status === "pending"
                    ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                    : "bg-[var(--background)] text-foreground-muted"
                )}>
                  {gallery.status}
                </span>
                {gallery.revenue && (
                  <span className="text-sm font-semibold text-[var(--success)]">{gallery.revenue}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="rounded-lg border border-[var(--card-border)] divide-y divide-[var(--card-border)]">
          {enhancedGalleryData.map((gallery) => (
            <div
              key={gallery.id}
              className="flex items-center gap-3 p-3 hover:bg-[var(--background-hover)] transition-colors"
            >
              <div className="h-12 w-16 rounded overflow-hidden shrink-0">
                <img
                  src={gallery.coverUrl}
                  alt={gallery.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{gallery.name}</p>
                <p className="text-xs text-foreground-muted">{gallery.client} · {gallery.photoCount} photos</p>
              </div>
              <span className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                gallery.status === "delivered"
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--warning)]/10 text-[var(--warning)]"
              )}>
                {gallery.status}
              </span>
              {gallery.revenue && (
                <span className="shrink-0 text-sm font-semibold text-[var(--success)]">{gallery.revenue}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// DOWNLOAD OPTION COMPONENT
// ============================================

function DownloadOption({ icon, title, description, size }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  size: string;
}) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-full flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 text-left transition-all hover:border-[var(--primary)] hover:shadow-md disabled:opacity-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
        {isDownloading ? (
          <div className="h-4 w-4 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
        ) : (
          icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <span className="shrink-0 text-xs text-foreground-muted">{size}</span>
    </button>
  );
}

// ============================================
// DATA
// ============================================

const portalGalleries = [
  {
    id: "g1",
    name: "Luxury Estate - Twilight",
    photoCount: 48,
    status: "delivered" as const,
    coverUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=150&fit=crop&q=80",
  },
  {
    id: "g2",
    name: "Modern Penthouse Suite",
    photoCount: 32,
    status: "delivered" as const,
    coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=150&fit=crop&q=80",
  },
  {
    id: "g3",
    name: "Beachfront Villa",
    photoCount: 16,
    status: "pending" as const,
    coverUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=150&fit=crop&q=80",
  },
];

const galleryPhotos: Photo[] = [
  { id: "photo-1", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=400&fit=crop&q=80", filename: "exterior-front.jpg" },
  { id: "photo-2", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop&q=80", filename: "living-room.jpg" },
  { id: "photo-3", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop&q=80", filename: "kitchen.jpg" },
  { id: "photo-4", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=400&fit=crop&q=80", filename: "master-bedroom.jpg" },
  { id: "photo-5", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop&q=80", filename: "bathroom.jpg" },
  { id: "photo-6", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=400&fit=crop&q=80", filename: "pool-area.jpg" },
];

const portalInvoices = [
  { id: "inv1", description: "Luxury Estate Photography", amount: "$625.00", status: "paid" as const, date: "Dec 15, 2025" },
  { id: "inv2", description: "Modern Penthouse Suite", amount: "$475.00", status: "paid" as const, date: "Dec 8, 2025" },
  { id: "inv3", description: "Beachfront Villa", amount: "$750.00", status: "pending" as const, date: "Dec 20, 2025" },
];

const enhancedGalleryData = [
  {
    id: "eg1",
    name: "Luxury Estate - Twilight",
    client: "Premier Realty",
    photoCount: 32,
    status: "delivered" as const,
    revenue: "$475",
    coverUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "eg2",
    name: "Modern Penthouse Suite",
    client: "Berkshire Properties",
    photoCount: 24,
    status: "pending" as const,
    revenue: "$650",
    coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "eg3",
    name: "Beachfront Villa Sunset",
    client: "Coastal Living Realty",
    photoCount: 48,
    status: "delivered" as const,
    revenue: "$890",
    coverUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "eg4",
    name: "Downtown Loft - Dusk",
    client: "Urban Spaces Co",
    photoCount: 36,
    status: "draft" as const,
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&q=80",
  },
];

// ============================================
// ICONS
// ============================================

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function ZipIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 3.75a.75.75 0 0 1 1.5 0v1h.5a.75.75 0 0 1 0 1.5h-.5v1a.75.75 0 0 1-1.5 0v-1h-.5a.75.75 0 0 1 0-1.5h.5v-1Z" clipRule="evenodd" />
    </svg>
  );
}

function WebIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
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

function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4.167a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 4.166a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 4.167a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

// ============================================
// PILLAR DEMOS - Interactive demos for Five Pillars Section
// ============================================

// OPERATE PILLAR - CRM & Client Management Demo
export function OperatePillarDemo() {
  const [selectedClient, setSelectedClient] = React.useState<string | null>(null);
  const [activeView, setActiveView] = React.useState<"clients" | "calendar" | "projects">("clients");

  const clients = [
    { id: "c1", name: "Premier Realty", email: "contact@premier.com", status: "active", projects: 12, avatar: "PR" },
    { id: "c2", name: "Sarah Mitchell", email: "sarah@email.com", status: "active", projects: 3, avatar: "SM" },
    { id: "c3", name: "Tech Solutions Inc", email: "info@techsol.com", status: "lead", projects: 0, avatar: "TS" },
    { id: "c4", name: "Bella Cucina", email: "hello@bella.com", status: "active", projects: 5, avatar: "BC" },
  ];

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Mini tabs */}
      <div className="flex gap-1 p-2 border-b border-[var(--card-border)]">
        {(["clients", "calendar", "projects"] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={cn(
              "px-2 py-1 rounded text-[10px] font-medium transition-colors",
              activeView === view
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {activeView === "clients" && (
        <div className="flex-1 p-2 space-y-1.5">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(selectedClient === client.id ? null : client.id)}
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all",
                selectedClient === client.id
                  ? "bg-[var(--primary)]/10 border border-[var(--primary)]"
                  : "bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--border-visible)]"
              )}
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                {client.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{client.name}</p>
                <p className="text-foreground-muted truncate">{client.email}</p>
              </div>
              <span className={cn(
                "shrink-0 px-1.5 py-0.5 rounded text-[8px] font-medium",
                client.status === "active" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"
              )}>
                {client.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {activeView === "calendar" && (
        <div className="flex-1 p-2">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-[8px] text-foreground-muted">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 3;
              const hasEvent = [5, 12, 15, 22, 28].includes(day);
              const isToday = day === 15;
              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded flex items-center justify-center text-[9px] relative",
                    day < 1 || day > 31 ? "text-foreground/20" : "text-foreground",
                    isToday && "bg-[var(--primary)] text-white",
                    hasEvent && !isToday && "font-bold"
                  )}
                >
                  {day > 0 && day <= 31 ? day : ""}
                  {hasEvent && !isToday && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[var(--primary)]" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 p-1.5 rounded bg-[var(--primary)]/10 border-l-2 border-[var(--primary)]">
              <span className="text-[9px] text-foreground-muted">2:00 PM</span>
              <span className="text-[9px] font-medium text-foreground">Corporate Headshots</span>
            </div>
          </div>
        </div>
      )}

      {activeView === "projects" && (
        <div className="flex-1 p-2 space-y-1.5">
          {[
            { name: "Wedding - Johnson", status: "In Progress", progress: 75 },
            { name: "Real Estate Bundle", status: "Delivered", progress: 100 },
            { name: "Corporate Event", status: "Editing", progress: 40 },
          ].map((project, i) => (
            <div key={i} className="p-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-foreground">{project.name}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[8px]",
                  project.progress === 100 ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"
                )}>
                  {project.status}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// DELIVER PILLAR - Gallery Delivery Demo
export function DeliverPillarDemo() {
  const [selectedPhoto, setSelectedPhoto] = React.useState<number | null>(null);
  const [downloadStarted, setDownloadStarted] = React.useState(false);

  const photos = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=150&h=150&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&h=150&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=150&h=150&fit=crop&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=150&h=150&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=150&h=150&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=150&h=150&fit=crop&q=80",
  ];

  const handleDownload = () => {
    setDownloadStarted(true);
    setTimeout(() => setDownloadStarted(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Gallery header */}
      <div className="flex items-center justify-between p-2 border-b border-[var(--card-border)]">
        <div>
          <p className="text-[10px] font-medium text-foreground">Luxury Estate</p>
          <p className="text-[8px] text-foreground-muted">32 photos • 245 MB</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloadStarted}
          className={cn(
            "px-2 py-1 rounded text-[9px] font-medium transition-all",
            downloadStarted
              ? "bg-[var(--success)] text-white"
              : "bg-[var(--ai)] text-white hover:bg-[var(--ai)]/90"
          )}
        >
          {downloadStarted ? "✓ Downloading..." : "Download All"}
        </button>
      </div>

      {/* Photo grid */}
      <div className="flex-1 p-2">
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelectedPhoto(selectedPhoto === i ? null : i)}
              className={cn(
                "relative aspect-square rounded overflow-hidden transition-all",
                selectedPhoto === i && "ring-2 ring-[var(--ai)] ring-offset-1 ring-offset-[var(--background)]"
              )}
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
              {selectedPhoto === i && (
                <div className="absolute inset-0 bg-[var(--ai)]/20 flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-white drop-shadow" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selection bar */}
      {selectedPhoto !== null && (
        <div className="p-2 border-t border-[var(--card-border)] bg-[var(--ai)]/5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-foreground">1 photo selected</span>
            <div className="flex gap-1">
              <button className="px-2 py-1 rounded bg-[var(--card)] border border-[var(--card-border)] text-[8px] hover:bg-[var(--background-hover)]">
                <HeartIcon className="h-3 w-3 inline mr-0.5" /> Favorite
              </button>
              <button className="px-2 py-1 rounded bg-[var(--ai)] text-white text-[8px]">
                <DownloadIcon className="h-3 w-3 inline mr-0.5" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// GET PAID PILLAR - Invoice & Payment Demo
export function GetPaidPillarDemo() {
  const [selectedInvoice, setSelectedInvoice] = React.useState<string | null>(null);

  const invoices = [
    { id: "INV-087", client: "Premier Realty", amount: 625, status: "paid", date: "Dec 15" },
    { id: "INV-088", client: "Sarah Mitchell", amount: 450, status: "pending", date: "Dec 18" },
    { id: "INV-089", client: "Tech Solutions", amount: 1250, status: "overdue", date: "Dec 10" },
  ];

  const totalRevenue = 12450;
  const pendingAmount = 1700;

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 p-2 border-b border-[var(--card-border)]">
        <div className="p-2 rounded-lg bg-[var(--success)]/10">
          <p className="text-[8px] text-foreground-muted">This Month</p>
          <p className="text-base font-bold text-[var(--success)]">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--warning)]/10">
          <p className="text-[8px] text-foreground-muted">Pending</p>
          <p className="text-base font-bold text-[var(--warning)]">${pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoice list */}
      <div className="flex-1 p-2 space-y-1.5">
        {invoices.map((inv) => (
          <button
            key={inv.id}
            onClick={() => setSelectedInvoice(selectedInvoice === inv.id ? null : inv.id)}
            className={cn(
              "w-full p-2 rounded-lg text-left transition-all",
              selectedInvoice === inv.id
                ? "bg-[var(--success)]/10 border border-[var(--success)]"
                : "bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--border-visible)]"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-foreground">{inv.id}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[8px] font-medium uppercase",
                inv.status === "paid" && "bg-[var(--success)]/10 text-[var(--success)]",
                inv.status === "pending" && "bg-[var(--warning)]/10 text-[var(--warning)]",
                inv.status === "overdue" && "bg-[var(--error)]/10 text-[var(--error)]"
              )}>
                {inv.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">{inv.client}</span>
              <span className="font-semibold text-foreground">${inv.amount}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Mini chart */}
      <div className="p-2 border-t border-[var(--card-border)]">
        <p className="text-[8px] text-foreground-muted mb-1">Revenue Trend</p>
        <div className="flex items-end gap-1 h-8">
          {[40, 55, 45, 70, 65, 80, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-[var(--success)]/30 hover:bg-[var(--success)]/50 transition-colors cursor-pointer"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// GROW PILLAR - Analytics & Marketing Demo
export function GrowPillarDemo() {
  const [activeMetric, setActiveMetric] = React.useState<"clients" | "revenue" | "reviews">("clients");

  const metrics = {
    clients: { value: 847, change: "+23%", data: [30, 45, 42, 58, 65, 72, 85] },
    revenue: { value: "$12.4k", change: "+18%", data: [40, 35, 55, 48, 62, 70, 78] },
    reviews: { value: "4.9", change: "+0.2", data: [4.5, 4.6, 4.7, 4.7, 4.8, 4.8, 4.9] },
  };

  const current = metrics[activeMetric];

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Metric tabs */}
      <div className="flex gap-1 p-2 border-b border-[var(--card-border)]">
        {(["clients", "revenue", "reviews"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setActiveMetric(m)}
            className={cn(
              "flex-1 px-2 py-1.5 rounded text-[9px] font-medium transition-colors",
              activeMetric === m
                ? "bg-[var(--warning)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Main metric */}
      <div className="p-3 text-center">
        <p className="text-2xl font-bold text-foreground">{current.value}</p>
        <p className="text-[var(--success)] text-[10px] font-medium">{current.change} vs last month</p>
      </div>

      {/* Chart */}
      <div className="flex-1 px-3">
        <div className="h-full flex items-end gap-1.5">
          {current.data.map((value, i) => {
            const normalizedHeight = activeMetric === "reviews"
              ? ((value - 4) / 1) * 100
              : (value / Math.max(...current.data)) * 100;
            return (
              <div
                key={i}
                className="flex-1 rounded-t bg-[var(--warning)]/30 hover:bg-[var(--warning)]/50 transition-colors cursor-pointer"
                style={{ height: `${normalizedHeight}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day} className="text-[7px] text-foreground-muted">{day}</span>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-1 p-2 border-t border-[var(--card-border)]">
        <div className="text-center p-1 rounded bg-[var(--background-secondary)]">
          <p className="text-[10px] font-bold text-foreground">156</p>
          <p className="text-[7px] text-foreground-muted">New Leads</p>
        </div>
        <div className="text-center p-1 rounded bg-[var(--background-secondary)]">
          <p className="text-[10px] font-bold text-foreground">89%</p>
          <p className="text-[7px] text-foreground-muted">Retention</p>
        </div>
        <div className="text-center p-1 rounded bg-[var(--background-secondary)]">
          <p className="text-[10px] font-bold text-foreground">32</p>
          <p className="text-[7px] text-foreground-muted">Referrals</p>
        </div>
      </div>
    </div>
  );
}

// AUTOMATE PILLAR - Workflow Builder Demo
export function AutomatePillarDemo() {
  const [activeWorkflow, setActiveWorkflow] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);

  const workflows = [
    { name: "New Booking", trigger: "Booking Created", actions: ["Send confirmation", "Create project", "Add to calendar"] },
    { name: "Gallery Ready", trigger: "Gallery Published", actions: ["Email client", "SMS notification", "Create invoice"] },
    { name: "Payment Received", trigger: "Invoice Paid", actions: ["Send receipt", "Unlock downloads", "Update status"] },
  ];

  const runWorkflow = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Workflow selector */}
      <div className="flex gap-1 p-2 border-b border-[var(--card-border)] overflow-x-auto">
        {workflows.map((wf, i) => (
          <button
            key={i}
            onClick={() => setActiveWorkflow(i)}
            className={cn(
              "px-2 py-1 rounded whitespace-nowrap text-[9px] font-medium transition-colors",
              activeWorkflow === i
                ? "bg-[var(--error)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            {wf.name}
          </button>
        ))}
      </div>

      {/* Workflow visualization */}
      <div className="flex-1 p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 p-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30">
            <p className="text-[8px] text-foreground-muted">Trigger</p>
            <p className="text-[10px] font-medium text-foreground">{workflows[activeWorkflow].trigger}</p>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-foreground-muted shrink-0" />
        </div>

        {/* Actions chain */}
        <div className="space-y-2">
          {workflows[activeWorkflow].actions.map((action, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border transition-all",
                isRunning && i <= Math.floor(Date.now() / 500) % 3
                  ? "bg-[var(--success)]/10 border-[var(--success)]"
                  : "bg-[var(--card)] border-[var(--card-border)]"
              )}
            >
              <div className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0",
                isRunning && i <= Math.floor(Date.now() / 500) % 3
                  ? "bg-[var(--success)] text-white"
                  : "bg-[var(--error)]/20 text-[var(--error)]"
              )}>
                {i + 1}
              </div>
              <span className="text-[10px] text-foreground">{action}</span>
              {isRunning && i <= Math.floor(Date.now() / 500) % 3 && (
                <CheckCircleIcon className="h-3 w-3 text-[var(--success)] ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Test button */}
      <div className="p-2 border-t border-[var(--card-border)]">
        <button
          onClick={runWorkflow}
          disabled={isRunning}
          className={cn(
            "w-full py-2 rounded-lg text-[10px] font-medium transition-all",
            isRunning
              ? "bg-[var(--success)] text-white"
              : "bg-[var(--error)] text-white hover:bg-[var(--error)]/90"
          )}
        >
          {isRunning ? "Running automation..." : "Test Workflow"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// TOOL REPLACEMENT SECTION - Interactive Calculator
// ============================================

export function ToolReplacementCalculator() {
  const [selectedTools, setSelectedTools] = React.useState<Set<string>>(new Set(["gallery", "payments", "crm", "email"]));

  const tools = [
    { id: "gallery", name: "Gallery Software", cost: 29 },
    { id: "payments", name: "Payment Processing", cost: 25 },
    { id: "crm", name: "CRM Tool", cost: 35 },
    { id: "email", name: "Email Marketing", cost: 20 },
    { id: "scheduling", name: "Scheduling App", cost: 15 },
    { id: "contracts", name: "Contract Tool", cost: 25 },
    { id: "accounting", name: "Accounting", cost: 30 },
    { id: "storage", name: "Cloud Storage", cost: 15 },
  ];

  const toggleTool = (id: string) => {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const currentCost = tools
    .filter((t) => selectedTools.has(t.id))
    .reduce((sum, t) => sum + t.cost, 0);

  const photoProOSCost = 49;
  const savings = currentCost - photoProOSCost;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 lg:p-6">
      <h4 className="text-lg font-semibold text-foreground mb-4">Calculate Your Savings</h4>

      {/* Tool grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => toggleTool(tool.id)}
            className={cn(
              "p-3 rounded-lg border text-left transition-all",
              selectedTools.has(tool.id)
                ? "bg-[var(--primary)]/10 border-[var(--primary)]"
                : "bg-[var(--background)] border-[var(--card-border)] hover:border-[var(--border-visible)]"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">{tool.name}</span>
              {selectedTools.has(tool.id) && (
                <CheckCircleIcon className="h-4 w-4 text-[var(--primary)]" />
              )}
            </div>
            <span className="text-sm font-semibold text-foreground-muted">${tool.cost}/mo</span>
          </button>
        ))}
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--background-secondary)]">
        <div className="text-center">
          <p className="text-xs text-foreground-muted mb-1">Current Tools</p>
          <p className="text-2xl font-bold text-[var(--error)]">${currentCost}</p>
          <p className="text-[10px] text-foreground-muted">/month</p>
        </div>
        <div className="flex items-center justify-center">
          <ArrowRightIcon className="h-6 w-6 text-foreground-muted" />
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground-muted mb-1">PhotoProOS</p>
          <p className="text-2xl font-bold text-[var(--success)]">${photoProOSCost}</p>
          <p className="text-[10px] text-foreground-muted">/month</p>
        </div>
      </div>

      {/* Savings highlight */}
      {savings > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 text-center">
          <p className="text-sm text-foreground-muted">You could save</p>
          <p className="text-3xl font-bold text-[var(--success)]">${savings}/month</p>
          <p className="text-xs text-foreground-muted">(${savings * 12}/year)</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// CASE STUDY EXPANDED DEMO
// ============================================

export function CaseStudyMetricsDemo({ photographer }: { photographer: {
  name: string;
  business: string;
  image: string;
  beforeMetrics: { revenue: string; hours: string; tools: string };
  afterMetrics: { revenue: string; hours: string; tools: string };
  quote: string;
}}) {
  const [showAfter, setShowAfter] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowAfter(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={photographer.image}
          alt={photographer.name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-foreground">{photographer.name}</p>
          <p className="text-sm text-foreground-muted">{photographer.business}</p>
        </div>
      </div>

      {/* Metrics comparison */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricCompare
          label="Revenue"
          before={photographer.beforeMetrics.revenue}
          after={photographer.afterMetrics.revenue}
          showAfter={showAfter}
        />
        <MetricCompare
          label="Admin Hours"
          before={photographer.beforeMetrics.hours}
          after={photographer.afterMetrics.hours}
          showAfter={showAfter}
          inverted
        />
        <MetricCompare
          label="Tools Used"
          before={photographer.beforeMetrics.tools}
          after={photographer.afterMetrics.tools}
          showAfter={showAfter}
          inverted
        />
      </div>

      {/* Quote */}
      <blockquote className="text-sm italic text-foreground-muted border-l-2 border-[var(--primary)] pl-3">
        "{photographer.quote}"
      </blockquote>
    </div>
  );
}

function MetricCompare({ label, before, after, showAfter, inverted = false }: {
  label: string;
  before: string;
  after: string;
  showAfter: boolean;
  inverted?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-foreground-muted mb-1">{label}</p>
      <div className="relative h-8 overflow-hidden">
        <p className={cn(
          "text-lg font-bold transition-all duration-500",
          showAfter ? "opacity-0 -translate-y-full" : "opacity-100 translate-y-0",
          "text-foreground-muted"
        )}>
          {before}
        </p>
        <p className={cn(
          "absolute inset-0 text-lg font-bold transition-all duration-500",
          showAfter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full",
          inverted ? "text-[var(--success)]" : "text-[var(--primary)]"
        )}>
          {after}
        </p>
      </div>
      <p className="text-[8px] text-foreground-muted">
        {showAfter ? "After PhotoProOS" : "Before"}
      </p>
    </div>
  );
}

// ============================================
// CONTRACT SIGNING DEMO
// ============================================

export function ContractSigningDemo() {
  const [step, setStep] = React.useState<"review" | "signing" | "signed">("review");
  const [signatureDrawn, setSignatureDrawn] = React.useState(false);

  const handleSign = () => {
    setStep("signing");
    setTimeout(() => {
      setSignatureDrawn(true);
      setTimeout(() => setStep("signed"), 500);
    }, 1000);
  };

  const handleReset = () => {
    setStep("review");
    setSignatureDrawn(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Contract header */}
      <div className="p-3 border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Photography Services Agreement</p>
            <p className="text-xs text-foreground-muted">Premier Realty • Wedding Package</p>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-[10px] font-medium",
            step === "signed"
              ? "bg-[var(--success)]/10 text-[var(--success)]"
              : "bg-[var(--warning)]/10 text-[var(--warning)]"
          )}>
            {step === "signed" ? "Signed" : "Pending"}
          </span>
        </div>
      </div>

      {/* Contract content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {step === "review" && (
          <div className="space-y-3 text-xs">
            <div className="p-2 rounded bg-[var(--background-secondary)]">
              <p className="font-medium text-foreground mb-1">Services</p>
              <p className="text-foreground-muted">Full day wedding photography coverage (8 hours)</p>
            </div>
            <div className="p-2 rounded bg-[var(--background-secondary)]">
              <p className="font-medium text-foreground mb-1">Deliverables</p>
              <p className="text-foreground-muted">500+ edited photos, online gallery, print rights</p>
            </div>
            <div className="p-2 rounded bg-[var(--background-secondary)]">
              <p className="font-medium text-foreground mb-1">Investment</p>
              <p className="text-foreground-muted">$2,500 (50% deposit due upon signing)</p>
            </div>
          </div>
        )}

        {step === "signing" && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-[200px] aspect-[3/1] rounded border-2 border-dashed border-[var(--border-visible)] bg-[var(--background)] relative overflow-hidden">
              {signatureDrawn && (
                <svg viewBox="0 0 200 60" className="absolute inset-0 w-full h-full animate-draw-signature">
                  <path
                    d="M 20 40 Q 40 20 60 40 T 100 40 T 140 35 T 180 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-foreground"
                  />
                </svg>
              )}
            </div>
            <p className="text-xs text-foreground-muted mt-2">Signing...</p>
          </div>
        )}

        {step === "signed" && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center mb-3">
              <CheckCircleIcon className="h-6 w-6 text-[var(--success)]" />
            </div>
            <p className="text-sm font-medium text-foreground">Contract Signed!</p>
            <p className="text-xs text-foreground-muted mt-1">
              A copy has been sent to your email
            </p>
            <button
              onClick={handleReset}
              className="mt-3 text-xs text-[var(--primary)] hover:underline"
            >
              View another demo
            </button>
          </div>
        )}
      </div>

      {/* Sign button */}
      {step === "review" && (
        <div className="p-3 border-t border-[var(--card-border)]">
          <button
            onClick={handleSign}
            className="w-full py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
          >
            Sign Contract
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// BOOKING CALENDAR DEMO
// ============================================

export function BookingCalendarDemo() {
  const [selectedDate, setSelectedDate] = React.useState<number | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [booked, setBooked] = React.useState(false);

  const bookedDates = [8, 15, 22];
  const availableTimes = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      setSelectedDate(null);
      setSelectedTime(null);
    }, 3000);
  };

  if (booked) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Confetti />
        <div className="relative z-10">
          <div className="h-12 w-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center mb-3 mx-auto">
            <CheckCircleIcon className="h-6 w-6 text-[var(--success)]" />
          </div>
          <p className="text-sm font-medium text-foreground">Booking Confirmed!</p>
          <p className="text-xs text-foreground-muted mt-1">
            Dec {selectedDate} at {selectedTime}
          </p>
          <p className="text-[10px] text-foreground-muted mt-2">
            Confirmation email sent
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-2 border-b border-[var(--card-border)]">
        <p className="text-sm font-medium text-foreground">Book a Session</p>
        <p className="text-xs text-foreground-muted">December 2025</p>
      </div>

      {/* Calendar */}
      <div className="p-2">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[8px] text-foreground-muted">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 1;
            const isBooked = bookedDates.includes(day);
            const isSelected = selectedDate === day;
            const isValid = day >= 1 && day <= 31 && !isBooked;
            return (
              <button
                key={i}
                onClick={() => isValid && setSelectedDate(day)}
                disabled={!isValid}
                className={cn(
                  "aspect-square rounded text-[9px] flex items-center justify-center transition-all",
                  day < 1 || day > 31 && "invisible",
                  isBooked && "bg-[var(--error)]/10 text-[var(--error)] cursor-not-allowed",
                  isSelected && "bg-[var(--primary)] text-white",
                  isValid && !isSelected && "hover:bg-[var(--background-hover)] text-foreground"
                )}
              >
                {day > 0 && day <= 31 ? day : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="flex-1 p-2 border-t border-[var(--card-border)]">
          <p className="text-[10px] text-foreground-muted mb-2">Available Times</p>
          <div className="grid grid-cols-2 gap-1">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={cn(
                  "py-1.5 rounded text-[10px] font-medium transition-colors",
                  selectedTime === time
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-secondary)] text-foreground hover:bg-[var(--background-hover)]"
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Book button */}
      {selectedDate && selectedTime && (
        <div className="p-2 border-t border-[var(--card-border)]">
          <button
            onClick={handleBook}
            className="w-full py-2 rounded-lg bg-[var(--success)] text-white text-xs font-medium hover:bg-[var(--success)]/90 transition-colors"
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// MORE ICONS
// ============================================

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}

// ============================================
// INTERACTIVE CLIENT GALLERY DEMO (for phone mockup)
// ============================================

export function InteractiveClientGalleryDemo() {
  const [favorites, setFavorites] = React.useState<Set<number>>(new Set([0, 3]));
  const [selectedPhotos, setSelectedPhotos] = React.useState<Set<number>>(new Set());
  const [showCheckout, setShowCheckout] = React.useState(false);
  const [paymentComplete, setPaymentComplete] = React.useState(false);

  const photos = [
    { id: 0, gradient: "from-[var(--primary)]/60 to-[var(--ai)]/60" },
    { id: 1, gradient: "from-rose-500/60 to-pink-600/60" },
    { id: 2, gradient: "from-amber-500/60 to-orange-600/60" },
    { id: 3, gradient: "from-emerald-500/60 to-green-600/60" },
    { id: 4, gradient: "from-cyan-500/60 to-blue-600/60" },
    { id: 5, gradient: "from-violet-500/60 to-purple-600/60" },
    { id: 6, gradient: "from-[var(--primary)]/60 to-cyan-600/60" },
    { id: 7, gradient: "from-pink-500/60 to-rose-600/60" },
    { id: 8, gradient: "from-emerald-500/60 to-teal-600/60" },
  ];

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelect = (id: number) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    setTimeout(() => {
      setPaymentComplete(true);
      setTimeout(() => {
        setPaymentComplete(false);
        setShowCheckout(false);
        setSelectedPhotos(new Set());
      }, 2500);
    }, 1500);
  };

  const pricePerPhoto = 15;
  const total = selectedPhotos.size * pricePerPhoto;

  if (paymentComplete) {
    return (
      <div className="h-full bg-[var(--background)] flex flex-col items-center justify-center relative overflow-hidden">
        <Confetti />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success)]/10">
            <CheckCircleIcon className="h-6 w-6 text-[var(--success)]" />
          </div>
          <p className="text-sm font-semibold text-foreground">Payment Successful!</p>
          <p className="text-xs text-foreground-muted mt-1">{selectedPhotos.size} photos unlocked</p>
          <p className="text-[10px] text-foreground-muted mt-2">Downloading now...</p>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="h-full bg-[var(--background)] flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin mb-3" />
        <p className="text-xs font-medium text-foreground">Processing payment...</p>
        <p className="text-[10px] text-foreground-muted mt-1">Please wait</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--background)] text-foreground flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-3 py-2.5">
        <div>
          <p className="text-[9px] text-foreground-muted uppercase tracking-wider">Gallery</p>
          <p className="text-xs font-medium">Sunset Wedding</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="rounded-md bg-[var(--background-elevated)] p-1">
            <HeartIcon className="h-3.5 w-3.5 text-foreground-muted" />
          </button>
        </div>
      </div>

      {/* Photo grid */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="grid grid-cols-3 gap-1">
          {photos.map((photo, i) => {
            const isFavorited = favorites.has(photo.id);
            const isSelected = selectedPhotos.has(photo.id);
            return (
              <button
                key={photo.id}
                onClick={() => toggleSelect(photo.id)}
                className={cn(
                  "aspect-square rounded overflow-hidden relative group transition-all",
                  i === 0 && "col-span-2 row-span-2",
                  isSelected && "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--background)]"
                )}
              >
                <div className={cn("h-full w-full bg-gradient-to-br", photo.gradient)} />
                {/* Favorite button */}
                <button
                  onClick={(e) => toggleFavorite(photo.id, e)}
                  className={cn(
                    "absolute top-1 right-1 rounded-full p-0.5 transition-all",
                    isFavorited
                      ? "bg-[var(--error)] text-white"
                      : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                  )}
                >
                  <HeartIcon className={cn("h-3 w-3", isFavorited && "fill-current")} />
                </button>
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute bottom-1 left-1 rounded bg-[var(--primary)] p-0.5">
                    <CheckCircleIcon className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--card-border)] bg-[var(--card)] p-2.5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] text-foreground-muted">Selected</p>
            <p className="text-xs font-medium">{selectedPhotos.size} photos</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-foreground-muted">Total</p>
            <p className="text-sm font-bold text-[var(--success)]">${total.toFixed(2)}</p>
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={selectedPhotos.size === 0}
          className={cn(
            "w-full rounded-lg py-2 text-xs font-medium transition-all",
            selectedPhotos.size > 0
              ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
              : "bg-[var(--background-elevated)] text-foreground-muted cursor-not-allowed"
          )}
        >
          {selectedPhotos.size > 0 ? `Pay & Download` : "Select photos to download"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// INDUSTRY-SPECIFIC DEMOS
// ============================================

// Real Estate Demo - Property gallery with MLS-ready export
export function RealEstateDemo() {
  const [selectedView, setSelectedView] = React.useState<"photos" | "virtual" | "floor">("photos");
  const [exporting, setExporting] = React.useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  };

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Property header */}
      <div className="p-2 border-b border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">1234 Ocean View Dr</p>
            <p className="text-[10px] text-foreground-muted">32 photos • Delivered</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={cn(
              "px-2 py-1 rounded text-[9px] font-medium transition-all",
              exporting
                ? "bg-[var(--success)] text-white"
                : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
            )}
          >
            {exporting ? "✓ Exported" : "MLS Export"}
          </button>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex border-b border-[var(--card-border)]">
        {(["photos", "virtual", "floor"] as const).map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={cn(
              "flex-1 py-1.5 text-[9px] font-medium transition-colors",
              selectedView === view
                ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {view === "photos" ? "Photos" : view === "virtual" ? "360° Tour" : "Floor Plan"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-2">
        {selectedView === "photos" && (
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={cn(
                "aspect-square rounded overflow-hidden bg-gradient-to-br",
                i === 0 && "col-span-2 row-span-2",
                i % 3 === 0 ? "from-blue-500/50 to-cyan-500/50" : i % 3 === 1 ? "from-amber-500/50 to-orange-500/50" : "from-emerald-500/50 to-green-500/50"
              )} />
            ))}
          </div>
        )}
        {selectedView === "virtual" && (
          <div className="h-full rounded-lg bg-[var(--background-secondary)] flex items-center justify-center">
            <div className="text-center">
              <div className="h-10 w-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <p className="text-[10px] text-foreground-muted">Virtual Tour</p>
              <p className="text-[9px] text-foreground-muted">Click to launch</p>
            </div>
          </div>
        )}
        {selectedView === "floor" && (
          <div className="h-full rounded-lg bg-[var(--background-secondary)] p-3">
            <div className="h-full border-2 border-dashed border-[var(--border-visible)] rounded flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] text-foreground-muted">2,450 sq ft</p>
                <p className="text-[9px] text-foreground-muted">4 bed • 3 bath</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent info */}
      <div className="p-2 border-t border-[var(--card-border)] bg-[var(--background-secondary)]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[8px] font-bold text-white">
            PR
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-medium text-foreground">Premier Realty</p>
            <p className="text-[8px] text-foreground-muted">Agent branding included</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Commercial Demo - Corporate headshots batch
export function CommercialDemo() {
  const [selectedPerson, setSelectedPerson] = React.useState(0);
  const [downloading, setDownloading] = React.useState(false);

  const team = [
    { name: "John D.", role: "CEO", initials: "JD" },
    { name: "Sarah M.", role: "CTO", initials: "SM" },
    { name: "Mike R.", role: "CFO", initials: "MR" },
    { name: "Emily C.", role: "COO", initials: "EC" },
  ];

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Header */}
      <div className="p-2 border-b border-[var(--card-border)]">
        <p className="font-medium text-foreground">Tech Corp Headshots</p>
        <p className="text-[10px] text-foreground-muted">Executive Team • 24 photos</p>
      </div>

      {/* Team grid */}
      <div className="p-2">
        <div className="grid grid-cols-4 gap-1.5">
          {team.map((person, i) => (
            <button
              key={i}
              onClick={() => setSelectedPerson(i)}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center transition-all",
                selectedPerson === i
                  ? "bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]"
                  : "bg-[var(--background-secondary)] hover:bg-[var(--background-hover)]"
              )}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white mb-1">
                {person.initials}
              </div>
              <p className="text-[8px] text-foreground truncate">{person.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected person preview */}
      <div className="flex-1 p-2">
        <div className="h-full rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold text-white mb-2">
            {team[selectedPerson].initials}
          </div>
          <p className="text-sm font-medium text-foreground">{team[selectedPerson].name}</p>
          <p className="text-[10px] text-foreground-muted">{team[selectedPerson].role}</p>
        </div>
      </div>

      {/* Download options */}
      <div className="p-2 border-t border-[var(--card-border)]">
        <div className="grid grid-cols-2 gap-1.5">
          <button className="py-1.5 rounded bg-[var(--background-secondary)] text-[9px] hover:bg-[var(--background-hover)]">
            LinkedIn Size
          </button>
          <button
            onClick={() => {
              setDownloading(true);
              setTimeout(() => setDownloading(false), 1000);
            }}
            className="py-1.5 rounded bg-[var(--primary)] text-white text-[9px] hover:bg-[var(--primary)]/90"
          >
            {downloading ? "✓ Done" : "All Sizes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Events Demo - Event gallery with face search
export function EventsDemo() {
  const [searchActive, setSearchActive] = React.useState(false);
  const [foundPhotos, setFoundPhotos] = React.useState(0);

  const handleSearch = () => {
    setSearchActive(true);
    setFoundPhotos(0);
    const interval = setInterval(() => {
      setFoundPhotos((prev) => {
        if (prev >= 8) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 200);
    setTimeout(() => setSearchActive(false), 2000);
  };

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Header */}
      <div className="p-2 border-b border-[var(--card-border)]">
        <p className="font-medium text-foreground">Tech Conference 2025</p>
        <p className="text-[10px] text-foreground-muted">1,247 photos • Public gallery</p>
      </div>

      {/* Search box */}
      <div className="p-2 border-b border-[var(--card-border)]">
        <button
          onClick={handleSearch}
          className="w-full flex items-center gap-2 p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-hover)] transition-colors"
        >
          <svg className="h-4 w-4 text-foreground-muted" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] text-foreground-muted">
            {searchActive ? "Searching for your face..." : "Find your photos"}
          </span>
          {searchActive && (
            <div className="ml-auto h-3 w-3 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
          )}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 p-2">
        {foundPhotos > 0 ? (
          <div>
            <p className="text-[10px] text-foreground-muted mb-2">Found {foundPhotos} photos of you</p>
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: foundPhotos }, (_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded bg-gradient-to-br from-green-500/50 to-emerald-500/50 animate-in fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className={cn(
                "aspect-square rounded bg-gradient-to-br",
                i % 3 === 0 ? "from-green-500/30 to-emerald-500/30" : i % 3 === 1 ? "from-blue-500/30 to-cyan-500/30" : "from-purple-500/30 to-pink-500/30"
              )} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {foundPhotos > 0 && (
        <div className="p-2 border-t border-[var(--card-border)]">
          <button className="w-full py-1.5 rounded bg-[var(--success)] text-white text-[9px] font-medium">
            Download All ({foundPhotos} photos)
          </button>
        </div>
      )}
    </div>
  );
}

// Food/Hospitality Demo - Menu photography
export function FoodDemo() {
  const [selectedCategory, setSelectedCategory] = React.useState("appetizers");

  const categories = [
    { id: "appetizers", name: "Apps", count: 8 },
    { id: "mains", name: "Mains", count: 12 },
    { id: "desserts", name: "Desserts", count: 6 },
  ];

  const gradients = [
    "from-amber-500/50 to-orange-500/50",
    "from-rose-500/50 to-red-500/50",
    "from-green-500/50 to-emerald-500/50",
    "from-yellow-500/50 to-amber-500/50",
  ];

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Header */}
      <div className="p-2 border-b border-[var(--card-border)]">
        <p className="font-medium text-foreground">Bella Cucina</p>
        <p className="text-[10px] text-foreground-muted">Menu Photography • Spring 2025</p>
      </div>

      {/* Categories */}
      <div className="flex gap-1 p-2 border-b border-[var(--card-border)]">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex-1 py-1.5 rounded text-[9px] font-medium transition-colors",
              selectedCategory === cat.id
                ? "bg-[var(--warning)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Photo grid */}
      <div className="flex-1 p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-lg overflow-hidden bg-gradient-to-br",
                gradients[i]
              )}
            >
              <div className="h-full w-full flex items-end p-1.5">
                <div className="rounded bg-black/50 px-1.5 py-0.5">
                  <p className="text-[8px] text-white font-medium">
                    {selectedCategory === "appetizers" ? "Bruschetta" : selectedCategory === "mains" ? "Pasta" : "Tiramisu"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export options */}
      <div className="p-2 border-t border-[var(--card-border)]">
        <p className="text-[9px] text-foreground-muted mb-1.5">Export for:</p>
        <div className="grid grid-cols-3 gap-1">
          <button className="py-1 rounded bg-[var(--background-secondary)] text-[8px] hover:bg-[var(--background-hover)]">
            Menu
          </button>
          <button className="py-1 rounded bg-[var(--background-secondary)] text-[8px] hover:bg-[var(--background-hover)]">
            Instagram
          </button>
          <button className="py-1 rounded bg-[var(--warning)] text-white text-[8px]">
            All Sizes
          </button>
        </div>
      </div>
    </div>
  );
}

// Portrait Demo - Family favorites selection
export function PortraitDemo() {
  const [favorites, setFavorites] = React.useState<Set<number>>(new Set([0, 2]));
  const [showPrintOptions, setShowPrintOptions] = React.useState(false);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Header */}
      <div className="p-2 border-b border-[var(--card-border)]">
        <p className="font-medium text-foreground">Johnson Family Session</p>
        <p className="text-[10px] text-foreground-muted">Pick your favorites • 48 photos</p>
      </div>

      {/* Photo grid */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }, (_, i) => {
            const isFav = favorites.has(i);
            return (
              <button
                key={i}
                onClick={() => toggleFavorite(i)}
                className={cn(
                  "aspect-square rounded overflow-hidden relative group",
                  isFav && "ring-2 ring-[var(--error)]"
                )}
              >
                <div className={cn(
                  "h-full w-full bg-gradient-to-br",
                  i % 3 === 0 ? "from-rose-500/50 to-pink-500/50" : i % 3 === 1 ? "from-amber-500/50 to-orange-500/50" : "from-cyan-500/50 to-blue-500/50"
                )} />
                <div className={cn(
                  "absolute top-1 right-1 p-0.5 rounded-full transition-all",
                  isFav ? "bg-[var(--error)]" : "bg-black/50 opacity-0 group-hover:opacity-100"
                )}>
                  <HeartIcon className="h-2.5 w-2.5 text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Favorites summary */}
      <div className="p-2 border-t border-[var(--card-border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-foreground-muted">{favorites.size} favorites selected</span>
          <button
            onClick={() => setShowPrintOptions(!showPrintOptions)}
            className="text-[var(--primary)] text-[10px] hover:underline"
          >
            {showPrintOptions ? "Hide prints" : "View print options"}
          </button>
        </div>
        {showPrintOptions && (
          <div className="grid grid-cols-2 gap-1 mb-2">
            <div className="p-1.5 rounded bg-[var(--background-secondary)] text-center">
              <p className="text-[10px] font-medium text-foreground">8×10</p>
              <p className="text-[8px] text-foreground-muted">$25</p>
            </div>
            <div className="p-1.5 rounded bg-[var(--background-secondary)] text-center">
              <p className="text-[10px] font-medium text-foreground">Canvas</p>
              <p className="text-[8px] text-foreground-muted">$89</p>
            </div>
          </div>
        )}
        <button className="w-full py-1.5 rounded bg-[var(--primary)] text-white text-[9px] font-medium">
          Continue to checkout
        </button>
      </div>
    </div>
  );
}

// Architecture Demo - Portfolio presentation
export function ArchitectureDemo() {
  const [currentProject, setCurrentProject] = React.useState(0);

  const projects = [
    { name: "Modern Residence", type: "Residential", photos: 24 },
    { name: "Tech Campus", type: "Commercial", photos: 48 },
    { name: "Boutique Hotel", type: "Hospitality", photos: 36 },
  ];

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Header */}
      <div className="p-2 border-b border-[var(--card-border)]">
        <p className="font-medium text-foreground">Studio Portfolio</p>
        <p className="text-[10px] text-foreground-muted">Architecture Photography</p>
      </div>

      {/* Project carousel */}
      <div className="flex-1 p-2">
        <div className="h-full flex flex-col">
          {/* Main image */}
          <div className="flex-1 rounded-lg bg-gradient-to-br from-amber-500/40 to-orange-500/40 mb-2 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-white drop-shadow">{projects[currentProject].name}</p>
                <p className="text-[10px] text-white/80 drop-shadow">{projects[currentProject].type}</p>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-1">
            {projects.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentProject(i)}
                className={cn(
                  "flex-1 aspect-video rounded overflow-hidden bg-gradient-to-br from-amber-500/30 to-orange-500/30",
                  currentProject === i && "ring-2 ring-[var(--primary)]"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Project info */}
      <div className="p-2 border-t border-[var(--card-border)]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-medium text-foreground">{projects[currentProject].name}</p>
            <p className="text-[9px] text-foreground-muted">{projects[currentProject].photos} photos</p>
          </div>
          <span className="px-2 py-0.5 rounded text-[8px] bg-[var(--primary)]/10 text-[var(--primary)]">
            {projects[currentProject].type}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button className="py-1.5 rounded bg-[var(--background-secondary)] text-[9px] hover:bg-[var(--background-hover)]">
            View Gallery
          </button>
          <button className="py-1.5 rounded bg-[var(--primary)] text-white text-[9px]">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
