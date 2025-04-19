import { NextResponse } from "next/server";

// Define types for NewsAPI response
interface NewsAPISource {
  id: string | null;
  name: string;
}

interface NewsAPIArticle {
  source: NewsAPISource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

// Using NewsAPI.org to fetch financial news
export async function GET() {
  try {
    const API_KEY = process.env.NEWS_API_KEY;

    if (!API_KEY) {
      throw new Error("NEWS_API_KEY is not defined in environment variables");
    }

    // Get financial news with keywords for forex and trading
    // We can adjust these parameters based on what financial news we want to focus on
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=forex+OR+finance+OR+trading+OR+economy&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`);
    }

    const data = (await response.json()) as NewsAPIResponse;

    // Transform the response to match our expected format
    const news = data.articles.map((article, index) => ({
      id: `news-${index}`,
      title: article.title,
      description: article.description || "No description available",
      source: article.source.name,
      publishTime: article.publishedAt,
      url: article.url,
      imageUrl: article.urlToImage,
    }));

    return NextResponse.json({ news }, { status: 200 });
  } catch (error) {
    console.error("Error fetching news:", error);

    // Fallback to mock data if the API fails
    const mockNews = [
      {
        id: "news-1",
        title: "Federal Reserve Signals Interest Rate Cut",
        description:
          "The Federal Reserve has signaled a potential interest rate cut in the next meeting, impacting forex markets worldwide.",
        source: "Financial Times",
        publishTime: new Date().toISOString(),
        url: "https://example.com/news/federal-reserve",
        imageUrl:
          "https://images.unsplash.com/photo-1611324586758-17c1192ef510?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "news-2",
        title: "EUR/USD Reaches 3-Month High",
        description:
          "The EUR/USD pair has reached a 3-month high following strong economic data from the Eurozone.",
        source: "Bloomberg",
        publishTime: new Date().toISOString(),
        url: "https://example.com/news/eurusd",
        imageUrl:
          "https://images.unsplash.com/photo-1627163439134-7a8c47e08208?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "news-3",
        title: "Oil Prices Surge Amid Middle East Tensions",
        description:
          "Crude oil prices have surged amid escalating tensions in the Middle East, affecting currency pairs linked to oil-exporting nations.",
        source: "Reuters",
        publishTime: new Date().toISOString(),
        url: "https://example.com/news/oil-prices",
        imageUrl:
          "https://images.unsplash.com/photo-1605231081543-2c22858eeaf3?q=80&w=1000&auto=format&fit=crop",
      },
    ];

    return NextResponse.json({ news: mockNews }, { status: 200 });
  }
}
