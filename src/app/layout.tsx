import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import "tw-animate-css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import { LanguageProvider, type Language } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Signal Forex - Structured Forex Signals",
  description:
    "Structured forex signals with clear entry, exit, risk levels, and transparent tracking",
};

const LANGUAGE_COOKIE_KEY = "signal_forex_language";

function parseLanguage(value: string | undefined): Language {
  return value === "fa" ? "fa" : "en";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLanguage = parseLanguage(
    cookieStore.get(LANGUAGE_COOKIE_KEY)?.value
  );
  const initialDirection = initialLanguage === "fa" ? "rtl" : "ltr";

  return (
    <html
      className="bg-black"
      dir={initialDirection}
      lang={initialLanguage}
    >
      <head>
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
      <LanguageProvider initialLanguage={initialLanguage}>
        <body className="min-h-screen flex flex-col overflow-x-hidden bg-black text-white">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastProvider />
        </body>
      </LanguageProvider>
    </html>
  );
}
