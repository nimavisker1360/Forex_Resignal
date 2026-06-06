import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) || {};

  return <DashboardOverview userId={first(params.userId)} />;
}
