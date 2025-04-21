"use client";

import Link from "next/link";
import { LineChart, Link2, Info, Phone } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function Footer() {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Проверим наличие ключей локализации и используем запасные варианты если ключи не найдены
  const getTranslation = (key: string, fallback: string) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  // Заголовки на английском
  const signalForexEN = "Signal Forex";
  const quickLinksEN = "Quick Links";
  const informationEN = "Information";
  const contactUsEN = "Contact Us";

  // Заголовки на фарси
  const signalForexFA = "سیگنال فارکس";
  const quickLinksFA = "لینک‌های سریع";
  const informationFA = "اطلاعات";
  const contactUsFA = "تماس با ما";

  // Описания на английском и фарси
  const providerDescEN =
    "Provider of the best forex signals with high accuracy and professional analysis";
  const providerDescFA =
    "ارائه دهنده بهترین سیگنال‌های فارکس با دقت بالا و تحلیل حرفه‌ای";

  // Авторские права на английском и фарси
  const copyrightEN = `© ${currentYear} Signal Forex. All rights reserved.`;
  const copyrightFA = `© ${currentYear} سیگنال فارکس. تمامی حقوق محفوظ است.`;

  // Используем заголовки в зависимости от выбранного языка
  const signalForex = language === "fa" ? signalForexFA : signalForexEN;
  const quickLinks = language === "fa" ? quickLinksFA : quickLinksEN;
  const information = language === "fa" ? informationFA : informationEN;
  const contactUs = language === "fa" ? contactUsFA : contactUsEN;
  const providerDesc = language === "fa" ? providerDescFA : providerDescEN;
  const copyright = language === "fa" ? copyrightFA : copyrightEN;

  const address = getTranslation("footer.address", "Address: Turkey");
  const email = getTranslation("footer.email", "Email: nimabaghery@gmail.com");

  return (
    <footer
      className="bg-black py-8 text-white"
      dir={language === "fa" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="w-4/4 mx-auto border-t"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div
            className={`text-center md:${language === "fa" ? "text-right" : "text-left"}`}
          >
            <h3
              className={`text-lg font-bold mb-4 flex items-center gap-2 justify-center md:${language === "fa" ? "justify-end" : "justify-start"}`}
            >
              {language === "fa" ? (
                <>
                  {signalForex}
                  <LineChart className="h-5 w-5 text-blue-400 mr-2" />
                </>
              ) : (
                <>
                  <LineChart className="h-5 w-5 text-blue-400 mr-2" />
                  {signalForex}
                </>
              )}
            </h3>
            <p className="text-white text-sm">{providerDesc}</p>
          </div>

          <div
            className={`text-center md:${language === "fa" ? "text-right" : "text-left"}`}
          >
            <h3
              className={`text-lg font-bold mb-4 flex items-center gap-2 justify-center md:${language === "fa" ? "justify-end" : "justify-start"}`}
            >
              {language === "fa" ? (
                <>
                  {quickLinks}
                  <Link2 className="h-5 w-5 text-blue-400 mr-2" />
                </>
              ) : (
                <>
                  <Link2 className="h-5 w-5 text-blue-400 mr-2" />
                  {quickLinks}
                </>
              )}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/signals"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  {t("signals")}
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/premium"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  {t("premium")}
                </Link>
              </li> */}
            </ul>
          </div>

          <div
            className={`text-center md:${language === "fa" ? "text-right" : "text-left"}`}
          >
            <h3
              className={`text-lg font-bold mb-4 flex items-center gap-2 justify-center md:${language === "fa" ? "justify-end" : "justify-start"}`}
            >
              {language === "fa" ? (
                <>
                  {information}
                  <Info className="h-5 w-5 text-blue-400 mr-2" />
                </>
              ) : (
                <>
                  <Info className="h-5 w-5 text-blue-400 mr-2" />
                  {information}
                </>
              )}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div
            className={`text-center md:${language === "fa" ? "text-right" : "text-left"}`}
          >
            <h3
              className={`text-lg font-bold mb-4 flex items-center gap-2 justify-center md:${language === "fa" ? "justify-end" : "justify-start"}`}
            >
              {language === "fa" ? (
                <>
                  {contactUs}
                  <Phone className="h-5 w-5 text-blue-400 mr-2" />
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5 text-blue-400 mr-2" />
                  {contactUs}
                </>
              )}
            </h3>
            <ul className="space-y-2 text-white text-sm">
              <li>{address}</li>
              <li>{email}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-white text-center">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
