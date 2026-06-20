"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AdminCard,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
  TableWrap,
  daysRemaining,
  formatDate,
  inputClass,
  selectClass,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/AdminUI";

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [search, setSearch] = useState("");
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (plan) params.set("plan", plan);
    if (search) params.set("search", search);
    if (expiringSoon) params.set("expiringSoon", "true");
    const [subscriptionsResponse, plansResponse] = await Promise.all([
      fetch(`/api/admin/subscriptions?${params}`, { cache: "no-store" }),
      fetch("/api/admin/plans", { cache: "no-store" }),
    ]);
    const payload = await subscriptionsResponse.json();
    const plansPayload = await plansResponse.json();

    if (!subscriptionsResponse.ok) throw new Error(payload.message || "Failed to load subscriptions");
    setData(payload);
    if (plansResponse.ok) setPlans(plansPayload.plans || []);
  }, [expiringSoon, page, plan, search, status]);

  useEffect(() => {
    load().catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [load]);

  async function cancel(id: string) {
    if (!window.confirm("Cancel this subscription?")) return;
    const response = await fetch(`/api/admin/subscriptions/${id}/cancel`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) return toast.error(payload.message || "Failed to cancel subscription");
    toast.success("Subscription canceled");
    await load();
  }

  async function extend(subscription: any) {
    const planId = window.prompt("Plan ID", subscription.planId) || subscription.planId;
    const durationDays = Number(window.prompt("Duration days", "30") || "30");
    const note = window.prompt("Admin note", "Manual extension") || "";
    const response = await fetch("/api/admin/subscriptions/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: subscription.userId, planId, durationDays, note }),
    });
    const payload = await response.json();
    if (!response.ok) return toast.error(payload.message || "Failed to extend subscription");
    toast.success("Subscription extended");
    await load();
  }

  if (loading && !data) return <LoadingState label="Loading subscriptions" />;
  if (error) return <ErrorState message={error} onRetry={() => load().catch((err) => setError(err.message))} />;

  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-4">
      <AdminCard>
        <div className="grid gap-3 md:grid-cols-[1fr_160px_180px_150px_auto]">
          <input className={inputClass} placeholder="Search by user email" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          <select className={selectClass} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">All</option><option value="ACTIVE">ACTIVE</option><option value="TRIAL">TRIAL</option><option value="FREE">FREE</option><option value="MANUAL">MANUAL</option><option value="EXPIRED">EXPIRED</option><option value="CANCELED">CANCELED</option>
          </select>
          <select className={selectClass} value={plan} onChange={(event) => { setPlan(event.target.value); setPage(1); }}>
            <option value="">All Plans</option>
            {plans.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
          </select>
          <label className="flex h-9 items-center gap-2 rounded-md border border-slate-700 px-3 text-sm text-slate-200"><input type="checkbox" checked={expiringSoon} onChange={(event) => { setExpiringSoon(event.target.checked); setPage(1); }} /> Expiring Soon</label>
          <Button type="button" variant="outline" className="border-slate-700 text-slate-100 hover:bg-slate-800" onClick={() => load()}>Refresh</Button>
        </div>
      </AdminCard>

      <AdminCard>
        {!data?.subscriptions?.length ? <EmptyState label="No subscriptions match the selected filters." /> : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>User Email</th><th className={thClass}>Plan</th><th className={thClass}>Status</th><th className={thClass}>Started</th><th className={thClass}>Expires</th><th className={thClass}>Days</th><th className={thClass}>Payment ID</th><th className={thClass}>Last Payment</th><th className={thClass}>Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {data.subscriptions.map((subscription: any) => (
                  <tr key={subscription.id}>
                    <td className={tdClass}>{subscription.user?.email}</td>
                    <td className={tdClass}>{subscription.plan?.name}</td>
                    <td className={tdClass}><StatusBadge value={subscription.status} /></td>
                    <td className={tdClass}>{formatDate(subscription.startedAt)}</td>
                    <td className={tdClass}>{formatDate(subscription.expiresAt)}</td>
                    <td className={tdClass}>{daysRemaining(subscription.expiresAt)}</td>
                    <td className={`${tdClass} max-w-[180px] truncate`}>{subscription.paymentId || "Manual"}</td>
                    <td className={tdClass}><StatusBadge value={subscription.payment?.status || "N/A"} /></td>
                    <td className={tdClass}><div className="flex gap-2"><Button asChild size="sm"><Link href={`/admin/users/${subscription.userId}`}>User</Link></Button>{subscription.paymentId && <Button asChild size="sm" variant="outline"><Link href={`/admin/payments/${subscription.paymentId}`}>Payment</Link></Button>}<Button type="button" size="sm" onClick={() => extend(subscription)}>Extend</Button><Button type="button" size="sm" variant="destructive" onClick={() => cancel(subscription.id)}>Cancel</Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </AdminCard>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{pagination.total} subscriptions</span>
        <div className="flex gap-2"><Button type="button" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>Previous</Button><span className="px-2 py-1">Page {pagination.page} of {pagination.totalPages}</span><Button type="button" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>
      </div>
    </div>
  );
}
