import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { StrategyPerformanceSummary } from "@/components/journal/StrategyPerformanceSummary";
import { cn } from "@/lib/utils";
import type { PlaybookStrategyDto } from "@/types/playbooks";

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "green" | "amber" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : tone === "amber"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : tone === "blue"
          ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
          : "border-slate-700 bg-slate-900 text-slate-300";

  return (
    <span className={cn("inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold", toneClass)}>
      {children}
    </span>
  );
}

export function PlaybookCard({
  playbook,
  onDelete,
}: {
  playbook: PlaybookStrategyDto;
  onDelete: (playbook: PlaybookStrategyDto) => void;
}) {
  return (
    <article className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-white">{playbook.name}</h2>
            <Badge tone={playbook.isActive ? "green" : "amber"}>
              {playbook.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">
            {playbook.description || "No description"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/journal/playbooks/${playbook.id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
            aria-label="View playbook"
            title="View playbook"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/journal/playbooks/${playbook.id}/edit`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
            aria-label="Edit playbook"
            title="Edit playbook"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(playbook)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 text-[#EF4444] hover:bg-red-500/10"
            aria-label="Delete playbook"
            title="Delete playbook"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{playbook.marketType || "Custom market"}</Badge>
        <Badge>{playbook.symbols || "All symbols"}</Badge>
        <Badge>{playbook.timeframes || "All timeframes"}</Badge>
        <Badge tone="blue">{playbook.linkedChecklistCount} checklists</Badge>
        <Badge>{playbook.ruleCount} rules</Badge>
      </div>

      <div className="mt-4">
        <StrategyPerformanceSummary analytics={playbook.analytics} compact />
      </div>
    </article>
  );
}
