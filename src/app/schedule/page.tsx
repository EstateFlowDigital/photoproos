import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Book a Session | PhotoProOS",
  description: "Schedule your photography session online",
};

export default function ScheduleLandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mx-auto max-w-md">
        <div className="rounded-full bg-primary/10 p-6 mx-auto w-fit">
          <Calendar className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Online Booking
        </h1>
        <p className="mt-3 text-foreground-muted">
          Schedule your photography session with just a few clicks.
        </p>
        <div className="mt-8 space-y-4 text-left">
          <div className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Camera className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Choose Your Service</h3>
              <p className="text-sm text-foreground-muted">
                Select from available photography packages
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Pick a Date</h3>
              <p className="text-sm text-foreground-muted">
                View real-time availability
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Instant Confirmation</h3>
              <p className="text-sm text-foreground-muted">
                Receive immediate booking confirmation
              </p>
            </div>
          </div>
        </div>
        <p className="mt-8 text-sm text-foreground-muted">
          To book a session, you&apos;ll need a booking link from your photographer.
        </p>
        <p className="mt-2 text-xs text-foreground-muted">
          Example: yourphotographer.photoproos.com/schedule
        </p>
      </div>
    </div>
  );
}
