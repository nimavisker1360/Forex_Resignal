"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Calendar, Tag, User } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  publishTime: string;
  url: string;
  imageUrl?: string;
}

export default function BlogPage() {
  const { t } = useLanguage();
  const translate = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/news-api");

        if (!response.ok) {
          throw new Error("Failed to fetch news data");
        }

        const data = await response.json();
        setNews(data.news || []);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("blogPage.loadError");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return translate("blogPage.recent", "Recent");
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategory = (item: NewsItem) => {
    const text = `${item.title} ${item.description}`.toLowerCase();

    if (text.includes("gold") || text.includes("xau")) {
      return translate("blogPage.goldTrading", "Gold Trading");
    }

    if (text.includes("risk") || text.includes("volatility")) {
      return translate("blogPage.riskManagement", "Risk Management");
    }

    if (text.includes("education") || text.includes("learn")) {
      return translate("blogPage.education", "Education");
    }

    return translate("blogPage.marketNews", "Market News");
  };

  return (
    <main className="relative min-h-screen bg-black pb-16 pt-20 text-white">
      <div
        className="absolute inset-0 z-0 bg-[url('/images/back.jpg')] bg-cover bg-center bg-no-repeat opacity-20"
        aria-hidden="true"
      />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            {translate("blogPage.title", "Financial News & Market Updates")}
          </h1>
          <p className="mx-auto max-w-2xl text-gray-400">
            {translate(
              "blogPage.subtitle",
              "Practical market updates, trading education, and risk management notes for forex and gold traders."
            )}
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-700 bg-red-900/20 p-8 text-center text-red-300">
            {translate(error, "Failed to fetch news. Please try again later.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 9).map((item) => (
              <article
                key={item.id}
                className="flex min-h-[460px] flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-950/90 transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.28)]"
              >
                <Link href={`/blog/${item.id}`} className="block">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="absolute h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.45),transparent_35%),linear-gradient(135deg,#020617,#111827_55%,#0f172a)]">
                        <span className="rounded-md border border-blue-500/25 bg-black/30 px-4 py-2 text-sm font-semibold text-blue-100">
                          {translate("blogPage.financialNews", "Financial News")}
                        </span>
                      </div>
                    )}
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-600/90 px-2.5 py-1 text-xs font-semibold text-white">
                      <Tag className="h-3 w-3" />
                      {getCategory(item)}
                    </span>
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-6 text-left">
                  <div className="mb-3 flex items-center text-sm text-gray-400">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(item.publishTime)}</span>
                    <span className="mx-2">/</span>
                    <User size={14} className="mr-1" />
                    <span className="truncate">{item.source}</span>
                  </div>

                  <Link href={`/blog/${item.id}`} className="block">
                    <h2 className="mb-3 line-clamp-2 text-xl font-bold transition-colors hover:text-blue-400">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="mb-5 line-clamp-3 text-gray-400">
                    {item.description}
                  </p>

                  <Link
                    href={`/blog/${item.id}`}
                    className="mt-auto inline-flex items-center text-blue-400 transition-colors hover:text-blue-300"
                  >
                    {translate("blogPage.readMore", "Read more")}{" "}
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
