import { AccountsManager } from "@/components/dashboard/AccountsManager";
import { getAccountsPageData } from "@/lib/dashboard-data";
import { getSession } from "@/lib/server-auth";

export default async function AccountsPage() {
  const session = await getSession();
  const accounts = session?.user.id ? await getAccountsPageData(session.user.id) : [];

  return <AccountsManager userId={session?.user.id} initialAccounts={accounts} />;
}
