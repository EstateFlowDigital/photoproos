import Link from "next/link";

export function PortalFooter() {
  return (
    <footer className="mt-auto border-t border-[#262626] py-6">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm text-[#7c7c7c]">
          Powered by{" "}
          <Link href="/" className="font-medium text-[#3b82f6] hover:underline">
            PhotoProOS
          </Link>
        </p>
      </div>
    </footer>
  );
}
