import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminUI";
import { getCurrentUser, isAdminUser } from "@/lib/server-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  return <AdminShell adminEmail={user.email}>{children}</AdminShell>;
}
