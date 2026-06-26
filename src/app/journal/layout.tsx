import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JournalShell } from "@/components/dashboard/JournalShell";
import { SubscriptionStatusBanner } from "@/components/subscription/SubscriptionStatusBanner";
import { DASHBOARD_THEME_COOKIE_KEY, parseDashboardTheme } from "@/lib/dashboard-theme";
import { getSession } from "@/lib/server-auth";
import { getSubscriptionBannerState, requireActiveSubscription } from "@/lib/subscription";

export default async function JournalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await requireActiveSubscription();
  const banner = await getSubscriptionBannerState(session.user.id);
  const cookieStore = await cookies();
  const initialTheme = parseDashboardTheme(cookieStore.get(DASHBOARD_THEME_COOKIE_KEY)?.value);

  return (
    <JournalShell initialTheme={initialTheme}>
      {banner && (
        <SubscriptionStatusBanner
          title={banner.title}
          titleFa={banner.titleFa}
          tone={banner.tone as "info" | "warning" | "neutral"}
          href={banner.href}
          buttonText={banner.buttonText}
          buttonTextFa={banner.buttonTextFa}
          dismissible={false}
        />
      )}
      {children}
    </JournalShell>
  );
}
