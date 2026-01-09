import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div data-element="sign-in-page">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
          },
        }}
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
