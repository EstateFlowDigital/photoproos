export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes | Field App",
  description: "Quick notes and observations from the field",
};

export default async function NotesPage() {
  return (
    <div className="min-h-screen bg-background p-4" data-element="field-notes-page">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Field Notes</h1>
        <p className="text-foreground-muted mb-8">Capture notes and observations during shoots</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted max-w-md mx-auto mb-8">
            Quick notes with voice-to-text, photo attachments, and project sync.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Quick text notes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Voice-to-text dictation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Photo annotations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Link notes to photos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Sync to project timeline</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Offline note capture</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/field" className="btn btn-secondary text-sm">Field Home</a>
            <a href="/field/upload" className="btn btn-secondary text-sm">Upload</a>
            <a href="/field/checklist" className="btn btn-secondary text-sm">Checklist</a>
          </div>
        </div>
      </div>
    </div>
  );
}
