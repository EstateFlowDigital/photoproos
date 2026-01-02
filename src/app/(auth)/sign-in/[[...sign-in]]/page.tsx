import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "w-full",
        },
      }}
      fallbackRedirectUrl="/dashboard"
      signUpUrl="/sign-up"
    />
  );
}
