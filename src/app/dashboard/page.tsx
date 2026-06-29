import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { getDashboardOverviewData } from "@/lib/dashboard-data";
import { getSession } from "@/lib/server-auth";

export default async function DashboardPage() {
  const session = await getSession();
  const data = session?.user.id
    ? await getDashboardOverviewData(session.user.id)
    : {
        accounts: [],
        trades: [],
        stats: { totalTrades: 0, closedTrades: 0, totalPnl: 0, winRate: 0, openTrades: 0, notReviewedTrades: 0 },
      };

  return (
    <DashboardOverview
      userId={session?.user.id}
      initialAccounts={data.accounts}
      initialTrades={data.trades}
      initialStats={data.stats}
    />
  );
}
