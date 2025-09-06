import type { Metadata } from "next";
import "./globals.css";
import "tw-animate-css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Signal Forex - Provider of the Best Trading Signals",
  description:
    "Get accurate forex signals with professional analysis and 24/7 support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="bg-black" dir="ltr" lang="en">
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
      <LanguageProvider>
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
