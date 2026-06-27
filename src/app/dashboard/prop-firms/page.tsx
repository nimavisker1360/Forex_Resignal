import { PropFirmsManager } from "@/components/dashboard/PropFirmsManager";
import { getPropFirmChallengesForUser } from "@/lib/dashboard-data";
import { getSession } from "@/lib/server-auth";

export default async function PropFirmsPage() {
  const session = await getSession();
  const data = session?.user.id
    ? await getPropFirmChallengesForUser(session.user.id)
    : { accounts: [], challenges: [] };

  return (
    <PropFirmsManager
      initialAccounts={data.accounts}
      initialChallenges={data.challenges}
    />
  );
}
