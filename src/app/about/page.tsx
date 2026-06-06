"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

export default function AboutPage() {
  const { t } = useLanguage();
  const translate = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const principles = [
    {
      icon: LineChart,
      title: translate("aboutPage.missionTitle", "Mission"),
      text: translate(
        "aboutPage.missionText",
        "Help traders review structured forex and gold trade ideas with clear levels, timing, and outcome tracking."
      ),
    },
    {
      icon: BarChart3,
      title: translate("aboutPage.analysisMethodTitle", "Analysis method"),
      text: translate(
        "aboutPage.analysisMethodText",
        "Signals are built around market structure, price action, support and resistance, volatility, and session context."
      ),
    },
    {
      icon: ShieldCheck,
      title: translate("aboutPage.riskManagementTitle", "Risk management"),
      text: translate(
        "aboutPage.riskManagementText",
        "Every signal is designed around defined stop loss and take profit levels before it is published."
      ),
    },
    {
      icon: ClipboardCheck,
      title: translate("aboutPage.transparentTrackingTitle", "Transparent tracking"),
      text: translate(
        "aboutPage.transparentTrackingText",
        "Open and closed signals are shown with status and result data so users can review performance without exaggerated claims."
      ),
    },
  ];

  return (
    <main className="relative overflow-hidden bg-black py-12 text-white">
      <div
        className="absolute inset-0 z-0 bg-[url('/images/back.jpg')] bg-contain bg-center opacity-20"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 md:px-16 lg:px-24">
        <section className="mx-auto mb-14 max-w-4xl text-center">
          <div className="mb-4 inline-flex rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-200">
            SignalMax
          </div>
          <h1 className="mb-5 text-4xl font-bold text-blue-400 md:text-5xl">
            {translate(
              "aboutPage.heroTitle",
              "Practical Signal Analysis, Clear Risk, Transparent Results"
            )}
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-gray-300">
            {translate(
              "aboutPage.heroText",
              "We publish trade ideas with defined entry, stop loss, take profit, status, and tracked outcomes. The goal is not to promise easy profit; it is to make signal review disciplined, readable, and risk-aware."
            )}
          </p>
          <Button asChild className="mt-8 bg-blue-600 hover:bg-blue-500">
            <Link href="/signals">
              {translate("aboutPage.viewSignalsButton", "View Signals")}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        <section className="mb-16 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 shadow-xl">
            <Image
              src="/images/AboutUs.jpg"
              alt={t("aboutPage.teamImageAlt")}
              width={800}
              height={600}
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/80 p-6">
            <h2 className="mb-4 text-3xl font-bold text-blue-400">
              {translate("aboutPage.builtForUsersTitle", "Built for Signal Users")}
            </h2>
            <p className="mb-4 leading-7 text-gray-300">
              {translate(
                "aboutPage.builtForUsersText1",
                "A useful signal platform should make the important information easy to inspect: what to trade, where the entry is, where the trade is invalidated, what the target is, and how the idea was resolved."
              )}
            </p>
            <p className="leading-7 text-gray-300">
              {translate(
                "aboutPage.builtForUsersText2",
                "Our interface focuses on compact signal tables, mobile-friendly cards, live updates, and result tracking so users can follow the market without sorting through noisy claims."
              )}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {principles.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-lg border border-blue-500/15 bg-gray-950/85 p-6"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-blue-600">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-gray-400">{item.text}</p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
