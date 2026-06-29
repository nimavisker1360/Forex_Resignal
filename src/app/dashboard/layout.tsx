import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SubscriptionStatusBanner } from "@/components/subscription/SubscriptionStatusBanner";
import { DASHBOARD_THEME_COOKIE_KEY, parseDashboardTheme } from "@/lib/dashboard-theme";
import { getCurrentUser, getSession, isAdminUser } from "@/lib/server-auth";
import {
  getSubscriptionBannerState,
  getSubscriptionDashboardState,
  requireActiveSubscription,
  SubscriptionAccessError,
} from "@/lib/subscription";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  try {
    await requireActiveSubscription();
  } catch (error) {
    if (error instanceof SubscriptionAccessError) {
      redirect("/premium?reason=subscription-required");
    }

    throw error;
  }
  const user = await getCurrentUser();
  const [banner, subscription] = await Promise.all([
    getSubscriptionBannerState(session.user.id),
    getSubscriptionDashboardState(session.user.id),
  ]);
  const cookieStore = await cookies();
  const initialTheme = parseDashboardTheme(cookieStore.get(DASHBOARD_THEME_COOKIE_KEY)?.value);

  return (
    <DashboardShell showAdmin={isAdminUser(user)} initialTheme={initialTheme} subscription={subscription}>
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
    </DashboardShell>
  );
}
