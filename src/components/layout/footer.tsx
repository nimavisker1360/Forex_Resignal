"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Info, LineChart, Link2, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";

export function Footer() {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/journal")) {
    return null;
  }

  const getTranslation = (key: string, fallback: string) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  const signalForex = getTranslation("footer.signalForex", "Signal Forex");
  const quickLinks = getTranslation("footer.quickLinks", "Quick Links");
  const information = getTranslation("footer.information", "Information");
  const contactUs = getTranslation("footer.contactUs", "Contact Us");
  const providerDesc = getTranslation(
    "footer.providerDescription",
    "Provider of structured forex signals with clear risk levels and transparent tracking"
  );
  const copyright = getTranslation(
    "footer.copyright",
    "© {year} Signal Forex. All rights reserved."
  ).replace("{year}", String(currentYear));
  const address = getTranslation("footer.address", "Address: Turkey");
  const email = getTranslation("footer.email", "Email: nimabaghery@gmail.com");

  return (
    <footer
      className="bg-black py-8 text-white"
      dir={language === "fa" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="mx-auto w-full border-t border-gray-800" />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <FooterColumn
            language={language}
            icon={<LineChart className="h-5 w-5 text-blue-400" />}
            title={signalForex}
          >
            <p className="text-sm leading-6 text-gray-300">{providerDesc}</p>
          </FooterColumn>

          <FooterColumn
            language={language}
            icon={<Link2 className="h-5 w-5 text-blue-400" />}
            title={quickLinks}
          >
            <ul className="space-y-2">
              <li>
                <FooterLink href="/">{t("home")}</FooterLink>
              </li>
              <li>
                <FooterLink href="/signals">{t("signals")}</FooterLink>
              </li>
              <li>
                <FooterLink href="/blog">{t("blog")}</FooterLink>
              </li>
            </ul>
          </FooterColumn>

          <FooterColumn
            language={language}
            icon={<Info className="h-5 w-5 text-blue-400" />}
            title={information}
          >
            <ul className="space-y-2">
              <li>
                <FooterLink href="/about">{t("about")}</FooterLink>
              </li>
              <li>
                <FooterLink href="/contact">{t("contact")}</FooterLink>
              </li>
            </ul>
          </FooterColumn>

          <FooterColumn
            language={language}
            icon={<Phone className="h-5 w-5 text-blue-400" />}
            title={contactUs}
          >
            <ul className="space-y-2 text-sm text-gray-300">
              <li>{address}</li>
              <li>{email}</li>
            </ul>
          </FooterColumn>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-300">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  language,
  icon,
  title,
  children,
}: {
  language: "en" | "fa";
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`text-center md:${language === "fa" ? "text-right" : "text-left"}`}
    >
      <h3
        className={`mb-4 flex items-center justify-center gap-2 text-lg font-bold md:${language === "fa" ? "justify-end" : "justify-start"}`}
      >
        {language === "fa" ? (
          <>
            {title}
            {icon}
          </>
        ) : (
          <>
            {icon}
            {title}
          </>
        )}
      </h3>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="text-sm text-white transition hover:text-blue-400">
      {children}
    </Link>
  );
}
