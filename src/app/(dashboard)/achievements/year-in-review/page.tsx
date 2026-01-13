import { redirect } from "next/navigation";

export default async function YearInReviewRedirect({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const yearQuery = params.year ? `?year=${params.year}` : "";
  redirect(`/progress/year-in-review${yearQuery}`);
}
