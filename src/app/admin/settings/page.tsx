"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, ErrorState, LoadingState, StatusBadge } from "@/components/admin/AdminUI";

function SettingRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 py-3 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/settings", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Failed to load settings");
      setSettings(payload.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  if (loading) return <LoadingState label="Loading settings" />;
  if (error) return <ErrorState message={error} onRetry={() => load().catch(() => undefined)} />;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <AdminCard>
        <h2 className="mb-3 text-sm font-semibold text-white">Readonly Configuration</h2>
        <SettingRow label="USDT TRC20 wallet configured" value={<StatusBadge value={settings.configured.usdtWalletTRC20 ? "YES" : "NO"} />} />
        <SettingRow label="USDT TRC20 wallet" value={settings.wallets.TRC20 || "Not configured"} />
        <SettingRow label="USDT ERC20 wallet configured" value={<StatusBadge value={settings.configured.usdtWalletERC20 ? "YES" : "NO"} />} />
        <SettingRow label="USDT ERC20 wallet" value={settings.wallets.ERC20 || "Not configured"} />
        <SettingRow label="USDT BEP20 wallet configured" value={<StatusBadge value={settings.configured.usdtWalletBEP20 ? "YES" : "NO"} />} />
        <SettingRow label="USDT BEP20 wallet" value={settings.wallets.BEP20 || "Not configured"} />
        <SettingRow label="ADMIN_EMAILS configured" value={<StatusBadge value={settings.configured.adminEmails ? "YES" : "NO"} />} />
        <SettingRow label="Trial duration" value={`${settings.trialDurationDays} days`} />
        <SettingRow label="Free plan enabled" value={<StatusBadge value={settings.freePlanEnabled ? "YES" : "NO"} />} />
        <SettingRow label="Manual payment verification" value={<StatusBadge value={settings.manualPaymentVerification ? "ENABLED" : "DISABLED"} />} />
      </AdminCard>
      <AdminCard>
        <h2 className="mb-3 text-sm font-semibold text-white">Warnings</h2>
        {settings.warnings.length ? (
          <div className="space-y-2">{settings.warnings.map((warning: string) => <div key={warning} className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">{warning}</div>)}</div>
        ) : (
          <p className="text-sm text-slate-400">No configuration warnings.</p>
        )}
      </AdminCard>
    </div>
  );
}
