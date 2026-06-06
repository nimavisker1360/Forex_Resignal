import type { Metadata } from "next";
import "./globals.css";
import "tw-animate-css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Signal Forex - Structured Forex Signals",
  description:
    "Structured forex signals with clear entry, exit, risk levels, and transparent tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="bg-black">
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
