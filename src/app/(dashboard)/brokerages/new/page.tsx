import { PageHeader, Breadcrumb } from "@/components/dashboard";
import Link from "next/link";
import { BrokerageForm } from "../brokerage-form";

export default function NewBrokeragePage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Brokerages", href: "/brokerages" },
          { label: "New Brokerage" },
        ]}
      />

      <PageHeader
        title="New Brokerage"
        subtitle="Add a new brokerage partner"
        actions={
          <Link
            href="/brokerages"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Cancel
          </Link>
        }
      />

      <div className="max-w-2xl">
        <BrokerageForm />
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}
