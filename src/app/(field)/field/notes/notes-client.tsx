"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, MicOff, Plus, Trash2, Calendar, Clock, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { FieldBooking, FieldNote } from "@/lib/actions/field-operations";
import { createFieldNote, deleteFieldNote } from "@/lib/actions/field-operations";

interface NotesClientProps {
  notes: FieldNote[];
  todaysBookings: FieldBooking[];
}

export function NotesClient({ notes: initialNotes, todaysBookings }: NotesClientProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState(initialNotes);
  const [isComposing, setIsComposing] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setNoteContent((prev) => prev + finalTranscript + " ");
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          showToast("Microphone access denied", "error");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [showToast]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!noteContent.trim()) {
      showToast("Please enter a note", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createFieldNote({
        content: noteContent.trim(),
        bookingId: selectedBookingId || undefined,
      });

      if (result.success && result.data) {
        const selectedBooking = todaysBookings.find((b) => b.id === selectedBookingId);
        const newNote: FieldNote = {
          id: result.data.id,
          content: noteContent.trim(),
          createdAt: new Date(),
          bookingId: selectedBookingId,
          bookingTitle: selectedBooking?.title || null,
          clientName: selectedBooking?.clientName || null,
        };
        setNotes([newNote, ...notes]);
        setNoteContent("");
        setSelectedBookingId(null);
        setIsComposing(false);
        showToast("Note saved", "success");
      } else {
        showToast(result.error || "Failed to save note", "error");
      }
    } catch {
      showToast("Failed to save note", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      const result = await deleteFieldNote(noteId);
      if (result.success) {
        setNotes(notes.filter((n) => n.id !== noteId));
        showToast("Note deleted", "success");
      } else {
        showToast(result.error || "Failed to delete note", "error");
      }
    } catch {
      showToast("Failed to delete note", "error");
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-background/95 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/field">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Field Notes</h1>
          </div>
          <Button onClick={() => setIsComposing(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Note
          </Button>
        </div>
      </header>

      {/* Compose Modal */}
      {isComposing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-lg rounded-t-2xl bg-[var(--card)] p-4 sm:rounded-2xl sm:m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">New Note</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsComposing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Booking Selector */}
            {todaysBookings.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground-muted mb-2 block">
                  Link to booking (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBookingId(null)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedBookingId === null
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--background-tertiary)] text-foreground-muted hover:bg-[var(--card-border)]"
                    }`}
                  >
                    No booking
                  </button>
                  {todaysBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBookingId(booking.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedBookingId === booking.id
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--background-tertiary)] text-foreground-muted hover:bg-[var(--card-border)]"
                      }`}
                    >
                      {booking.clientName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Note Input */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note or tap the mic to dictate..."
                rows={5}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-4 py-3 pr-12 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                disabled={isSubmitting}
              />
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  className={`absolute right-3 top-3 rounded-full p-2 transition-colors ${
                    isListening
                      ? "bg-[var(--error)] text-white animate-pulse"
                      : "bg-[var(--background-tertiary)] text-foreground-muted hover:bg-[var(--card-border)]"
                  }`}
                  title={isListening ? "Stop listening" : "Start voice dictation"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
            </div>

            {isListening && (
              <p className="mt-2 text-xs text-[var(--error)] animate-pulse">
                Listening... Speak now
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsComposing(false);
                  setNoteContent("");
                  setSelectedBookingId(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !noteContent.trim()}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Save Note
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <main className="flex-1 p-4">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-[var(--background-tertiary)] p-4">
              <Calendar className="h-8 w-8 text-foreground-muted" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">No notes yet</h2>
            <p className="mt-2 text-sm text-foreground-muted max-w-xs">
              Capture observations, reminders, and details from your shoots.
            </p>
            <Button onClick={() => setIsComposing(true)} className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Create your first note
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {note.clientName && (
                      <p className="text-xs font-medium text-[var(--primary)] mb-1">
                        {note.clientName}
                        {note.bookingTitle && ` - ${note.bookingTitle}`}
                      </p>
                    )}
                    <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-foreground-muted">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(note.createdAt)} at {formatTime(note.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="shrink-0 rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-tertiary)] hover:text-[var(--error)] transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Quick Add FAB */}
      <button
        onClick={() => setIsComposing(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg hover:bg-[var(--primary)]/90 transition-colors"
        aria-label="New note"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
