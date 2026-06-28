import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { getDashboardOverviewData } from "@/lib/dashboard-data";
import { getSession } from "@/lib/server-auth";
import { getSubscriptionDashboardState } from "@/lib/subscription";

export default async function DashboardPage() {
  const session = await getSession();
  const [data, subscription] = session?.user.id
    ? await Promise.all([
        getDashboardOverviewData(session.user.id),
        getSubscriptionDashboardState(session.user.id),
      ])
    : [
        {
          accounts: [],
          trades: [],
          stats: { totalTrades: 0, totalPnl: 0, winRate: 0, openTrades: 0, notReviewedTrades: 0 },
        },
        null,
      ];

  return (
    <DashboardOverview
      userId={session?.user.id}
      subscription={subscription}
      initialAccounts={data.accounts}
      initialTrades={data.trades}
      initialStats={data.stats}
    />
  );
}
