import { cn } from "@/lib/utils";

export function TradeStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold",
        status === "OPEN" && "border-blue-500/30 bg-blue-500/10 text-blue-300",
        status === "CLOSED" &&
          "border-emerald-500/30 bg-emerald-500/10 text-[#10B981]",
        status === "CANCELLED" &&
          "border-slate-700 bg-slate-900 text-slate-300"
      )}
    >
      {status}
    </span>
  );
}
