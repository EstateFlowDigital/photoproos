import { Suspense } from "react";
import { getAllUsers } from "@/lib/actions/super-admin";
import { UsersPageClient } from "./users-client";

interface SearchParams {
  search?: string;
  page?: string;
}

async function UsersLoader({ searchParams }: { searchParams: SearchParams }) {
  const result = await getAllUsers({
    search: searchParams.search,
    page: parseInt(searchParams.page || "1"),
    limit: 20,
  });

  const users = result.success ? result.data?.users || [] : [];
  const total = result.success ? result.data?.total || 0 : 0;

  return (
    <UsersPageClient
      users={users}
      total={total}
      currentPage={parseInt(searchParams.page || "1")}
      search={searchParams.search}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search skeleton */}
      <div className="h-10 w-64 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Users</h1>
        <p className="text-[var(--foreground-muted)]">
          Manage platform users and organizations
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <UsersLoader searchParams={params} />
      </Suspense>
    </div>
  );
}
