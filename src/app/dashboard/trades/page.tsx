import { TradesManager } from "@/components/dashboard/TradesManager";
import { getTradesPageData } from "@/lib/dashboard-data";
import { getSession } from "@/lib/server-auth";
import { getUserPlanLimits } from "@/lib/subscription";

export default async function TradesPage() {
  const session = await getSession();
  const data = session?.user.id
    ? await getTradesPageData(session.user.id)
    : { accounts: [], tags: [], trades: [] };
  const access = session?.user.id ? await getUserPlanLimits(session.user.id) : null;

  return (
    <TradesManager
      userId={session?.user.id}
      initialAccounts={data.accounts}
      initialTags={data.tags}
      initialTrades={data.trades}
      aiAnalysisEnabled={Boolean(access?.limits.aiAnalysis)}
    />
  );
}
