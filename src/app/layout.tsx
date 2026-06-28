import type { Metadata } from "next";
import "./globals.css";
import "tw-animate-css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import {
  DASHBOARD_THEME_COOKIE_KEY,
  DASHBOARD_THEME_STORAGE_KEY,
} from "@/lib/dashboard-theme";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Signal Forex - Structured Forex Signals",
  description:
    "Structured forex signals with clear entry, exit, risk levels, and transparent tracking",
};

const dashboardThemeScript = `
(function () {
  try {
    var path = window.location.pathname;
    var isDashboardRoute = /^\\/(dashboard|journal|admin|economic-calendar)(\\/|$)/.test(path);
    if (!isDashboardRoute) return;

    var storedTheme = window.localStorage.getItem("${DASHBOARD_THEME_STORAGE_KEY}");
    var cookieMatch = document.cookie.match(/(?:^|; )${DASHBOARD_THEME_COOKIE_KEY}=(light|dark)(?:;|$)/);
    var theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : cookieMatch
        ? cookieMatch[1]
        : "dark";
    var root = document.documentElement;
    root.dataset.dashboardTheme = theme;
    root.classList.toggle("dark", theme === "dark");
  } catch (error) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLanguage = "en";

  return (
    <html
      className="bg-black"
      dir="ltr"
      lang={initialLanguage}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: dashboardThemeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden bg-black text-white">
        <LanguageProvider initialLanguage={initialLanguage}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastProvider />
        </LanguageProvider>
      </body>
    </html>
  );
}
