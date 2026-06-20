import { TradesManager } from "@/components/dashboard/TradesManager";
import { getTradesPageData } from "@/lib/dashboard-data";
import { getSession } from "@/lib/server-auth";

export default async function TradesPage() {
  const session = await getSession();
  const data = session?.user.id
    ? await getTradesPageData(session.user.id)
    : { accounts: [], tags: [], trades: [] };

  return (
    <TradesManager
      userId={session?.user.id}
      initialAccounts={data.accounts}
      initialTags={data.tags}
      initialTrades={data.trades}
    />
  );
}
