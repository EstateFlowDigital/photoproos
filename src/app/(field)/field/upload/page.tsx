export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload | Field App",
  description: "Quick photo upload from the field",
};

export default async function UploadPage() {
  return (
    <div className="min-h-screen bg-background p-4" data-element="field-upload-page">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Quick Upload</h1>
        <p className="text-foreground-muted mb-8">Upload photos directly from your device</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📤</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted max-w-md mx-auto mb-8">
            Upload photos from mobile, auto-tag to projects, and sync with galleries.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Direct camera upload</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Auto-tag to active project</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Batch photo selection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Background upload queue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Offline mode with sync</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>GPS and metadata capture</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/field" className="btn btn-secondary text-sm">Field Home</a>
            <a href="/field/notes" className="btn btn-secondary text-sm">Notes</a>
            <a href="/field/checklist" className="btn btn-secondary text-sm">Checklist</a>
          </div>
        </div>
      </div>
    </div>
  );
}
