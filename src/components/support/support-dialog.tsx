"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createSupportTicket } from "@/lib/actions/support-tickets";
import type { SupportTicketCategory } from "@prisma/client";

// Icons
function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function BugIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function MoreHorizontalIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

interface CategoryOption {
  value: SupportTicketCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  {
    value: "support_request",
    label: "General Support",
    description: "Get help with using the platform",
    icon: HelpCircleIcon,
  },
  {
    value: "report_issue",
    label: "Report an Issue",
    description: "Something isn't working correctly",
    icon: BugIcon,
  },
  {
    value: "billing",
    label: "Billing",
    description: "Questions about payments or subscriptions",
    icon: CreditCardIcon,
  },
  {
    value: "questions",
    label: "Question",
    description: "General questions about features",
    icon: MessageSquareIcon,
  },
  {
    value: "feature_request",
    label: "Feature Request",
    description: "Suggest a new feature or improvement",
    icon: LightbulbIcon,
  },
  {
    value: "other",
    label: "Other",
    description: "Something else",
    icon: MoreHorizontalIcon,
  },
];

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "category" | "details" | "success";

export function SupportDialog({ open, onOpenChange }: SupportDialogProps) {
  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] =
    useState<SupportTicketCategory | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCategorySelect = (category: SupportTicketCategory) => {
    setSelectedCategory(category);
    setStep("details");
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("category");
    }
  };

  const handleSubmit = () => {
    if (!selectedCategory || !subject.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await createSupportTicket({
        category: selectedCategory,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (result.success) {
        setStep("success");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create support ticket",
          variant: "destructive",
        });
      }
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setStep("category");
      setSelectedCategory(null);
      setSubject("");
      setMessage("");
    }, 200);
  };

  const selectedCategoryInfo = CATEGORIES.find(
    (c) => c.value === selectedCategory
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "category" && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle>How can we help?</DialogTitle>
                <DialogDescription>
                  Select a category that best describes your request
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 py-4 px-4">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategorySelect(category.value)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg text-left",
                      "bg-[var(--background-tertiary)]",
                      "border border-[var(--border)]",
                      "hover:border-[var(--border-hover)] hover:bg-[var(--background-elevated)]",
                      "transition-all duration-200",
                      "group"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center",
                        "w-10 h-10 rounded-lg",
                        "bg-[var(--primary)]/10 text-[var(--primary)]",
                        "group-hover:bg-[var(--primary)]/20",
                        "transition-colors"
                      )}
                    >
                      <category.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--foreground)]">
                        {category.label}
                      </div>
                      <div className="text-sm text-[var(--foreground-muted)]">
                        {category.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "details" && selectedCategoryInfo && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBack}
                    className={cn(
                      "flex items-center justify-center",
                      "w-8 h-8 rounded-lg",
                      "hover:bg-[var(--background-elevated)]",
                      "transition-colors"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center justify-center",
                        "w-8 h-8 rounded-lg",
                        "bg-[var(--primary)]/10 text-[var(--primary)]"
                      )}
                    >
                      <selectedCategoryInfo.icon className="w-4 h-4" />
                    </div>
                    <DialogTitle>{selectedCategoryInfo.label}</DialogTitle>
                  </div>
                </div>
                <DialogDescription>
                  Tell us more about your request
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 p-5">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief summary of your request"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your request in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    disabled={isPending}
                    className="resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isPending}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isPending || !subject.trim() || !message.trim()
                    }
                  >
                    {isPending ? (
                      <>
                        <LoaderIcon className="w-4 h-4 mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="py-8"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className={cn(
                    "flex items-center justify-center",
                    "w-16 h-16 rounded-full",
                    "bg-[var(--success)]/10 text-[var(--success)]",
                    "mb-4"
                  )}
                >
                  <CheckCircleIcon className="w-8 h-8" />
                </motion.div>

                <DialogTitle className="mb-2">Message Sent!</DialogTitle>
                <DialogDescription className="mb-6">
                  We&apos;ve received your message and will get back to you as
                  soon as possible. You&apos;ll receive a notification when we
                  respond.
                </DialogDescription>

                <Button onClick={handleClose}>Done</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
