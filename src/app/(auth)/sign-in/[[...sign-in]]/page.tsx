import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "bg-[var(--card)] border border-[var(--card-border)] shadow-none",
          headerTitle: "text-foreground",
          headerSubtitle: "text-foreground-secondary",
          socialButtonsBlockButton:
            "bg-[var(--background-elevated)] border-[var(--card-border)] text-foreground hover:bg-[var(--background-hover)]",
          formFieldLabel: "text-foreground-secondary",
          formFieldInput:
            "bg-[var(--card)] border-[var(--card-border)] text-foreground focus:border-[var(--primary)] focus:ring-[var(--primary)]",
          footerActionLink: "text-[var(--primary)] hover:text-[var(--primary)]",
          formButtonPrimary:
            "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white",
          dividerLine: "bg-[var(--card-border)]",
          dividerText: "text-foreground-muted",
          identityPreviewText: "text-foreground",
          identityPreviewEditButton: "text-[var(--primary)]",
        },
      }}
      afterSignInUrl="/dashboard"
      signUpUrl="/sign-up"
    />
  );
}
