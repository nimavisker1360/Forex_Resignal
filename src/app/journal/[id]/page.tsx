import { notFound } from "next/navigation";
import {
  fetchJournalApi,
  type PrismaTradeResponse,
  type PrismaTradingAccountsResponse,
} from "@/app/journal/_lib/journal-api";
import { TradeDetailClient } from "@/app/journal/[id]/trade-detail-client";

export const dynamic = "force-dynamic";

type JournalTradeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JournalTradeDetailPage({
  params,
}: JournalTradeDetailPageProps) {
  const { id } = await params;
  const response = await fetchJournalApi<PrismaTradeResponse>(
    `/api/journal/trades/${id}`
  );
  const trade = response.data || response.trade;

  if (!trade) {
    notFound();
  }

  const accountsResponse = await fetchJournalApi<PrismaTradingAccountsResponse>(
    `/api/trading-accounts?userId=${encodeURIComponent(trade.userId)}`
  ).catch(
    (): PrismaTradingAccountsResponse => ({
      success: false,
    })
  );
  const accounts = accountsResponse.data || accountsResponse.accounts || [];

  return <TradeDetailClient initialTrade={trade} accounts={accounts} />;
}
