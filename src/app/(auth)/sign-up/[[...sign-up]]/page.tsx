import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "w-full",
        },
      }}
      fallbackRedirectUrl="/dashboard"
      signInUrl="/sign-in"
    />
  );
}
