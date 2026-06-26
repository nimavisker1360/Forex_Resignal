"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import {
  type ApiResult,
  type TagDto,
} from "@/components/dashboard/types";

export function TradeTagsCard({
  tradeId,
  currentTags,
}: {
  tradeId: string;
  currentTags: Array<{ tagId: string; tag: Omit<TagDto, "createdAt"> & { createdAt: string | Date } }>;
  userId?: string;
}) {
  const router = useRouter();
  const [tags, setTags] = useState<TagDto[]>([]);
  const { t } = useLanguage();
  const currentTagIds = useMemo(
    () => new Set(currentTags.map((item) => item.tagId)),
    [currentTags]
  );

  useEffect(() => {
    fetch("/api/tags")
      .then((response) => response.json() as Promise<ApiResult<TagDto[]>>)
      .then((json) => setTags(json.data || []))
      .catch(() => setTags([]));
  }, []);

  async function addTag(formData: FormData) {
    const tagId = String(formData.get("tagId") || "");

    if (!tagId) {
      return;
    }

    await fetch(`/api/trades/${tradeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tagIds: Array.from(new Set([...Array.from(currentTagIds), tagId])),
      }),
    });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{t("dashboard.form.tags")}</h3>
          <p className="text-sm text-slate-400">{t("dashboard.tags.subtitle")}</p>
        </div>
        <form action={addTag} className="flex gap-2">
          <select
            name="tagId"
            className="h-10 rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm text-[#E5E7EB] outline-none focus:border-blue-600"
          >
            <option value="">{t("dashboard.trades.addTag")}</option>
            {tags
              .filter((tag) => !currentTagIds.has(tag.id))
              .map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
          </select>
          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white hover:bg-blue-500"
            aria-label={t("dashboard.trades.addTag")}
            title={t("dashboard.trades.addTag")}
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2">
        {currentTags.map((item) => (
          <span
            key={item.tagId}
            className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#111827] px-3 py-1.5 text-sm text-slate-200"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.tag.color || "#60a5fa" }}
            />
            {item.tag.name}
          </span>
        ))}
        {currentTags.length === 0 ? (
          <span className="text-sm text-slate-400">{t("dashboard.tags.noneAssigned")}</span>
        ) : null}
      </div>
    </div>
  );
}
