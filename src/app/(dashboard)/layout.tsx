import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SubscriptionStatusBanner } from "@/components/subscription/SubscriptionStatusBanner";
import { getCurrentUser, getSession, isAdminUser } from "@/lib/server-auth";
import { getSubscriptionBannerState, requireActiveSubscription } from "@/lib/subscription";

export default async function DashboardRouteGroupLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await requireActiveSubscription();
  const user = await getCurrentUser();
  const banner = await getSubscriptionBannerState(session.user.id);

  return (
    <DashboardShell showAdmin={isAdminUser(user)}>
      {banner && (
        <SubscriptionStatusBanner
          title={banner.title}
          titleFa={banner.titleFa}
          tone={banner.tone as "info" | "warning" | "neutral"}
          href={banner.href}
          buttonText={banner.buttonText}
          buttonTextFa={banner.buttonTextFa}
        />
      )}
      {children}
    </DashboardShell>
  );
}
