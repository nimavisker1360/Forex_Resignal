"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Award, Users, TrendingUp, Zap } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 lg:px-24 py-12 relative max-w-[1400px] overflow-hidden">
      <div
        className="absolute inset-0 bg-[url('/images/back.jpg')] bg-contain bg-center opacity-20 z-0"
        style={{
          width: "100%",
          height: "100%",
          transform: "rotate(-8deg) scale(1.3)",
        }}
      ></div>

      <div className="relative z-10">
        <div className="max-w-3xl mx-auto mb-16 text-center bg-black/50 p-6 rounded-lg">
          <h1 className="text-4xl font-bold mb-6 text-blue-500">
            {t("aboutPage.title")}
          </h1>
          <p className="text-lg">{t("aboutPage.introduction")}</p>
        </div>

        {/* Who We Are */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <div className="relative rounded-lg overflow-hidden border border-zinc-800 shadow-xl">
              <Image
                src="/images/AboutUs.jpg"
                alt={t("aboutPage.teamImageAlt")}
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>
          <div className="text-left p-6 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-blue-500">
              {t("aboutPage.whoWeAreTitle")}
            </h2>
            <p className="mb-4">{t("aboutPage.whoWeAreText1")}</p>
            <p className="mb-4">{t("aboutPage.whoWeAreText2")}</p>
            <div className="mt-8 flex justify-end ">
              <Button asChild className="bg-primary hover:bg-primary/80 ">
                <Link href="/signals">
                  {t("aboutPage.viewSignalsButton")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Our Mission */}
        <div className="bg-card border border-zinc-800 rounded-lg p-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6 text-blue-500">
              {t("aboutPage.ourMissionTitle")}
            </h2>
            <p className="text-lg max-w-2xl mx-auto">
              {t("aboutPage.ourMissionText")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t("aboutPage.qualityTitle")}
              </h3>
              <p>{t("aboutPage.qualityText")}</p>
            </div>

            <div className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t("aboutPage.educationTitle")}
              </h3>
              <p>{t("aboutPage.educationText")}</p>
            </div>

            <div className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t("aboutPage.innovationTitle")}
              </h3>
              <p>{t("aboutPage.innovationText")}</p>
            </div>

            <div className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t("aboutPage.supportTitle")}
              </h3>
              <p>{t("aboutPage.supportText")}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          <div className="bg-card border border-zinc-800 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">+8</div>
            <p>{t("aboutPage.yearsActive")}</p>
          </div>

          <div className="bg-card border border-zinc-800 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">+5000</div>
            <p>{t("aboutPage.activeUsers")}</p>
          </div>

          <div className="bg-card border border-zinc-800 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">+85%</div>
            <p>{t("aboutPage.successRate")}</p>
          </div>

          <div className="bg-card border border-zinc-800 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">24/7</div>
            <p>{t("aboutPage.support")}</p>
          </div>
        </div>

        {/* CTA */}
        {/* <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t("aboutPage.joinUsTitle")}</h2>
          <p className="text-lg max-w-2xl mx-auto mb-6">
            {t("aboutPage.joinUsText")}
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/80">
            <Link href="/sign-up">{t("aboutPage.getStartedButton")}</Link>
          </Button>
        </div> */}
      </div>
    </div>
  );
}
