import { TradesManager } from "@/components/dashboard/TradesManager";

type TradesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TradesPage({ searchParams }: TradesPageProps) {
  const params = (await searchParams) || {};

  return <TradesManager userId={first(params.userId)} />;
}
