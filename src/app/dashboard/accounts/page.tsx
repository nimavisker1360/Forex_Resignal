import { AccountsManager } from "@/components/dashboard/AccountsManager";

type AccountsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  const params = (await searchParams) || {};

  return <AccountsManager userId={first(params.userId)} />;
}
