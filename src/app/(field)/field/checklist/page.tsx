export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checklist | Field App",
  description: "Shoot checklist and task tracking",
};

export default async function ChecklistPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Shoot Checklist</h1>
        <p className="text-foreground-muted mb-8">Track tasks and equipment for your shoot</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted mb-8">
            Pre-shoot checklists, equipment lists, and task tracking for field use.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Pre-shoot equipment checklist</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Shot list with required angles and scenes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Post-shoot tasks (backup, upload, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Custom checklist templates by session type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Offline mode for on-location use</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/field" className="btn btn-secondary text-sm">Field Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
