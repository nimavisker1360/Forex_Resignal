import { NextResponse } from "next/server";

// This is a mock implementation as TradingView doesn't provide a public API
// In a real implementation, you would need to use appropriate APIs or web scraping
export async function GET() {
  try {
    // Mock data for demonstration - exactly 9 items
    const mockNews = [
      {
        id: "1",
        title: "Federal Reserve Signals Interest Rate Cut",
        description:
          "The Federal Reserve has signaled a potential interest rate cut in the next meeting, impacting forex markets worldwide.",
        source: "TradingView",
        publishTime: "2023-10-15T14:30:00Z",
        url: "https://www.tradingview.com/news/reuters.com,2023:newsml_L1N3GZ0G7:0-federal-reserve-signals-interest-rate-cut/",
        imageUrl:
          "https://images.unsplash.com/photo-1611324586758-17c1192ef510?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "2",
        title: "EUR/USD Reaches 3-Month High",
        description:
          "The EUR/USD pair has reached a 3-month high following strong economic data from the Eurozone.",
        source: "TradingView",
        publishTime: "2023-10-14T09:45:00Z",
        url: "https://www.tradingview.com/news/reuters.com,2023:newsml_L1N3GY1A2:0-eur-usd-reaches-3-month-high/",
        imageUrl:
          "https://images.unsplash.com/photo-1627163439134-7a8c47e08208?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "3",
        title: "Oil Prices Surge Amid Middle East Tensions",
        description:
          "Crude oil prices have surged amid escalating tensions in the Middle East, affecting currency pairs linked to oil-exporting nations.",
        source: "TradingView",
        publishTime: "2023-10-13T16:20:00Z",
        url: "https://www.tradingview.com/news/reuters.com,2023:newsml_L1N3GX2C3:0-oil-prices-surge-amid-middle-east-tensions/",
        imageUrl:
          "https://images.unsplash.com/photo-1605231081543-2c22858eeaf3?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "4",
        title: "Japanese Yen Weakens After Bank of Japan Decision",
        description:
          "The Japanese Yen has weakened following the Bank of Japan's decision to maintain its ultra-loose monetary policy.",
        source: "TradingView",
        publishTime: "2023-10-12T02:15:00Z",
        url: "https://www.tradingview.com/news/reuters.com,2023:newsml_L1N3GW3D4:0-japanese-yen-weakens-after-bank-of-japan-decision/",
        imageUrl:
          "https://images.unsplash.com/photo-1524673450801-b5aa9b621b76?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "5",
        title: "Gold Hits New All-Time High",
        description:
          "Gold prices have reached a new all-time high as investors seek safe-haven assets amid global economic uncertainty.",
        source: "TradingView",
        publishTime: "2023-10-11T11:10:00Z",
        url: "https://www.tradingview.com/news/reuters.com,2023:newsml_L1N3GV4E5:0-gold-hits-new-all-time-high/",
        imageUrl:
          "https://images.unsplash.com/photo-1610375461249-41db941ad886?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "6",
        title: "U.S. Dollar Index Shows Weakness Following Jobs Report",
        description:
          "The U.S. Dollar Index (DXY) has shown weakness following the release of the latest jobs report, which came in below economists' expectations.",
        source: "TradingView",
        publishTime: "2023-10-10T13:45:00Z",
        url: "https://www.tradingview.com/news/reuters.com,2023:newsml_L1N3GU5F6:0-us-dollar-index-shows-weakness-following-jobs-report/",
        imageUrl:
          "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "7",
        title: "Bitcoin Surpasses $69,000, Setting New All-Time High",
        description:
          "Bitcoin has surpassed $69,000, setting a new all-time high as institutional adoption continues to increase.",
        source: "TradingView",
        publishTime: "2023-10-09T08:30:00Z",
        url: "https://www.tradingview.com/news/reuters.com,2023:newsml_L1N3GT6G7:0-bitcoin-surpasses-69000-setting-new-all-time-high/",
        imageUrl:
          "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "8",
        title: "EU Inflation Data Impacts EUR Pairs",
        description:
          "The latest Eurozone inflation data has had a significant impact on EUR currency pairs, with the Euro strengthening against most major currencies.",
        source: "TradingView",
        publishTime: "2023-10-08T10:15:00Z",
        url: "https://www.tradingview.com/news/reuters.com,2023:newsml_L1N3GS7H8:0-eu-inflation-data-impacts-eur-pairs/",
        imageUrl:
          "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "9",
        title: "Bank of England Holds Interest Rates, GBP Reacts",
        description:
          "The Bank of England has decided to hold interest rates steady, causing a mixed reaction in GBP currency pairs.",
        source: "TradingView",
        publishTime: "2023-10-07T15:00:00Z",
        url: "https://www.tradingview.com/news/reuters.com,2023:newsml_L1N3GR8I9:0-bank-of-england-holds-interest-rates-gbp-reacts/",
        imageUrl:
          "https://images.unsplash.com/photo-1576224126089-1e2980425e2d?q=80&w=1000&auto=format&fit=crop",
      },
    ];

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json({ news: mockNews }, { status: 200 });
  } catch (error) {
    console.error("Error fetching TradingView news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news data" },
      { status: 500 }
    );
  }
}
