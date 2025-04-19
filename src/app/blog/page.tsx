"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Calendar, User } from "lucide-react";
import Link from "next/link";

// NewsAPI news item interface
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Fetch news from our API endpoint
        const response = await fetch("/api/news-api");

        if (!response.ok) {
          throw new Error("Failed to fetch news data");
        }

        const data = await response.json();
        setNews(data.news);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to fetch news. Please try again later.");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-black text-white pt-20 pb-16 relative">
      <div
        className="absolute inset-0 mx-auto my-auto bg-[url('/images/back.jpg')] bg-cover bg-no-repeat bg-center opacity-20 z-0"
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: "url('/images/back.jpg')",
        }}
      ></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
            Financial News & Market Updates
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest financial news and market insights from
            around the world via NewsAPI.org
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-8 border border-red-700 rounded-lg bg-red-900/20">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.slice(0, 9).map((item) => (
              <div
                key={item.id}
                className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 border border-gray-800"
              >
                <Link href={`/blog/${item.id}`} className="block">
                  <div className="relative h-48 w-full">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover absolute"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center">
                        <span className="text-xl font-bold">
                          Financial News
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-6 text-left">
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(item.publishTime)}</span>
                    <span className="mx-2">•</span>
                    <User size={14} className="mr-1" />
                    <span>{item.source}</span>
                  </div>

                  <Link href={`/blog/${item.id}`} className="block">
                    <h2 className="text-xl font-bold mb-3 hover:text-blue-400 transition-colors">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  <Link
                    href={`/blog/${item.id}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read more <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
