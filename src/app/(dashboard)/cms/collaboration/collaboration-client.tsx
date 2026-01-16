"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  ChevronLeft,
  Circle,
  Wifi,
  WifiOff,
  Copy,
  ExternalLink,
  Info,
  MousePointer2,
  Type,
  FileText,
} from "lucide-react";
import {
  CollaborativeEditor,
  ParticipantAvatars,
  CollabStatus,
  CollabField,
  CollabInput,
  CollabPanel,
  useCollabOptional,
} from "@/components/cms";

interface CollaborationPageClientProps {
  userId: string;
}

export function CollaborationPageClient({ userId }: CollaborationPageClientProps) {
  const [userName, setUserName] = useState(`User ${userId.slice(-4)}`);
  const [entityId, setEntityId] = useState("demo-page-001");
  const [isEditorActive, setIsEditorActive] = useState(false);

  // Demo content
  const [title, setTitle] = useState("Summer Photography Sale");
  const [description, setDescription] = useState("Book your summer session today and save 20% on all packages.");
  const [body, setBody] = useState("Our professional photographers are ready to capture your special moments.");

  const demoUrl = typeof window !== "undefined"
    ? `${window.location.origin}/cms/collaboration?entity=${entityId}`
    : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/cms"
          className="p-2 hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-green-500" />
            Collaborative Editing
          </h1>
          <p className="text-foreground-secondary text-sm">
            Real-time multi-user editing with presence tracking
          </p>
        </div>
      </div>

      {/* Instructions Panel */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-500 mb-1">How to Test Collaboration</p>
            <ol className="list-decimal list-inside space-y-1 text-foreground-secondary">
              <li>Click &quot;Start Editing&quot; below to join the collaboration session</li>
              <li>Open this same page in another browser or incognito window</li>
              <li>Both users will see each other&apos;s presence and cursor positions</li>
              <li>Edit any field - changes sync every 2 seconds</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Session Setup */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Session Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isEditorActive}
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Document ID</label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                disabled={isEditorActive}
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm disabled:opacity-50"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Use the same ID in multiple windows to collaborate
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-[var(--background-tertiary)] rounded-lg">
              <span className="text-xs text-foreground-muted flex-1 truncate">
                {demoUrl}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(demoUrl)}
                className="p-1.5 hover:bg-[var(--background-hover)] rounded"
                title="Copy URL"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.open(demoUrl, "_blank")}
                className="p-1.5 hover:bg-[var(--background-hover)] rounded"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsEditorActive(!isEditorActive)}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isEditorActive
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {isEditorActive ? "Leave Session" : "Start Editing"}
            </button>
          </div>
        </div>

        {/* Visual Guide */}
        <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
          <h2 className="text-lg font-semibold mb-4">What You&apos;ll See</h2>

          <div className="space-y-4">
            <FeaturePreview
              icon={Users}
              color="text-blue-500"
              title="Participant Avatars"
              description="See who else is editing this document in real-time"
            />
            <FeaturePreview
              icon={MousePointer2}
              color="text-green-500"
              title="Cursor Tracking"
              description="See which field each user is editing with colored indicators"
            />
            <FeaturePreview
              icon={Wifi}
              color="text-purple-500"
              title="Live Sync Status"
              description="Connection indicator shows sync status and last update time"
            />
            <FeaturePreview
              icon={Type}
              color="text-orange-500"
              title="Collaborative Fields"
              description="Each input shows cursor presence from other editors"
            />
          </div>
        </div>
      </div>

      {/* Live Editor */}
      {isEditorActive ? (
        <CollaborativeEditor
          entityType="DemoPage"
          entityId={entityId}
          user={{
            id: userId,
            name: userName,
          }}
          pollInterval={2000}
        >
          <LiveEditorContent
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            body={body}
            setBody={setBody}
          />
        </CollaborativeEditor>
      ) : (
        <div className="p-12 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-center">
          <WifiOff className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Editor Not Active</p>
          <p className="text-foreground-secondary mb-4">
            Click &quot;Start Editing&quot; above to join the collaboration session
          </p>
        </div>
      )}

      {/* Cursor Color Reference */}
      <div className="p-4 bg-[var(--background-tertiary)] rounded-lg">
        <h3 className="text-sm font-medium mb-3">Cursor Color Palette</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { color: "#3b82f6", name: "Blue" },
            { color: "#22c55e", name: "Green" },
            { color: "#f97316", name: "Orange" },
            { color: "#8b5cf6", name: "Purple" },
            { color: "#ec4899", name: "Pink" },
            { color: "#14b8a6", name: "Teal" },
            { color: "#eab308", name: "Yellow" },
            { color: "#ef4444", name: "Red" },
          ].map((c) => (
            <div key={c.color} className="flex items-center gap-2">
              <Circle className="w-4 h-4" style={{ color: c.color, fill: c.color }} />
              <span className="text-xs text-foreground-muted">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function LiveEditorContent({
  title,
  setTitle,
  description,
  setDescription,
  body,
  setBody,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
}) {
  const collab = useCollabOptional();

  return (
    <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-foreground-muted" />
          <span className="font-medium">Demo Page Editor</span>
        </div>
        <div className="flex items-center gap-4">
          <ParticipantAvatars maxVisible={5} showNames />
          <CollabStatus showVersion />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        <CollabField fieldId="title">
          <label className="block text-sm font-medium mb-2">Page Title</label>
          <CollabInput
            fieldId="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg"
            placeholder="Enter page title..."
          />
        </CollabField>

        <CollabField fieldId="description">
          <label className="block text-sm font-medium mb-2">Description</label>
          <CollabInput
            fieldId="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg"
            placeholder="Enter description..."
          />
        </CollabField>

        <CollabField fieldId="body">
          <label className="block text-sm font-medium mb-2">Body Content</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg resize-none"
            placeholder="Enter body content..."
            onFocus={() => collab?.updateCursor("body", 0)}
          />
        </CollabField>
      </div>

      {/* Participants Panel */}
      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <CollabPanel />
      </div>
    </div>
  );
}

function FeaturePreview({
  icon: Icon,
  color,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-[var(--background-tertiary)] rounded-lg">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-foreground-secondary">{description}</p>
      </div>
    </div>
  );
}
