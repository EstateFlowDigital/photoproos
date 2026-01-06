import { PageHeader, Breadcrumb } from "@/components/dashboard";
import { getBrokerage } from "@/lib/actions/brokerages";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BrokerageForm } from "../../brokerage-form";

interface EditBrokeragePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrokeragePage({ params }: EditBrokeragePageProps) {
  const { id } = await params;

  const result = await getBrokerage(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const brokerage = result.data;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Brokerages", href: "/brokerages" },
          { label: brokerage.name, href: `/brokerages/${id}` },
          { label: "Edit" },
        ]}
      />

      <PageHeader
        title="Edit Brokerage"
        subtitle={`Editing ${brokerage.name}`}
        actions={
          <Link
            href={`/brokerages/${id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Cancel
          </Link>
        }
      />

      <div className="max-w-2xl">
        <BrokerageForm brokerage={brokerage} />
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
