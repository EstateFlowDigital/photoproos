import { Metadata } from "next";
import { MapPin, Clock, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Your Photographer | PhotoProOS",
  description: "Real-time tracking for your photography session",
};

export default function TrackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mx-auto max-w-md">
        <div className="rounded-full bg-primary/10 p-6 mx-auto w-fit">
          <MapPin className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Real-Time Tracking
        </h1>
        <p className="mt-3 text-foreground-muted">
          Track your photographer in real-time on the day of your shoot.
        </p>
        <div className="mt-8 space-y-4 text-left">
          <div className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">ETA Updates</h3>
              <p className="text-sm text-foreground-muted">
                Get real-time arrival estimates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Live Location</h3>
              <p className="text-sm text-foreground-muted">
                See your photographer&apos;s location on a map
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Camera className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Session Status</h3>
              <p className="text-sm text-foreground-muted">
                Know when your shoot begins and ends
              </p>
            </div>
          </div>
        </div>
        <p className="mt-8 text-sm text-foreground-muted">
          You&apos;ll receive a tracking link via SMS on the day of your scheduled shoot.
        </p>
      </div>
    </div>
  );
}
