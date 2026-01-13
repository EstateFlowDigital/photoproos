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
