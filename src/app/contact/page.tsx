"use client";

import { Button } from "@/components/ui/button";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || t("contactPage.successMessage"));
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(data.error || t("contactPage.errorMessage"));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("contactPage.errorMessage")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 text-left">
      <div className="max-w-3xl mx-auto mb-12 text-center ">
        <h1 className="text-4xl font-bold mb-4">{t("contactPage.title")}</h1>
        <p className="text-lg text-muted-foreground">
          {t("contactPage.subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start text-left">
        {/* Contact Info */}
        <div>
          <div className="bg-card border rounded-lg p-8 mb-8 text-left">
            <h2 className="text-2xl font-bold mb-6">
              {t("contactPage.contactInfo")}
            </h2>

            <div className="space-y-6">
              <div
                className={`flex items-start justify-start gap-4 ${language === "fa" ? "flex-row-reverse" : ""}`}
              >
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-left">
                    {t("contactPage.email")}
                  </h3>
                  <p className="text-muted-foreground text-left">
                    nimabaghery@gmail.com
                  </p>
                </div>
              </div>

              {/* <div className="flex items-start justify-start gap-4 flex-row-reverse">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-left">Phone</h3>
                  <p className="text-muted-foreground text-left">
                    +1 234-567-8900
                  </p>
                  <p className="text-muted-foreground text-left">
                    +1 234-567-8901
                  </p>
                </div>
              </div> */}

              <div
                className={`flex items-start justify-start gap-4 ${language === "fa" ? "flex-row-reverse" : ""}`}
              >
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-left">
                    {t("contactPage.address")}
                  </h3>
                  <p className="text-muted-foreground text-left">
                    {t("footer.address").replace("Address: ", "")}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start justify-start gap-4 ${language === "fa" ? "flex-row-reverse" : ""}`}
              >
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-left">
                    {t("contactPage.onlineSupport")}
                  </h3>
                  <p className="text-blue-500 text-left">
                    {t("contactPage.onlineSupportText")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-8 text-left">
            <h2 className="text-2xl font-bold mb-6">
              {t("contactPage.businessHours")}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className=" text-white">
                  {t("contactPage.weekdayHours")}
                </span>
                <span className="text-white">{t("contactPage.weekdays")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("contactPage.closed")}
                </span>
                <span>{t("contactPage.saturday")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("contactPage.closed")}
                </span>
                <span>{t("contactPage.sunday")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card border rounded-lg p-8 text-left">
          <h2 className="text-2xl font-bold mb-6">
            {t("contactPage.contactForm")}
          </h2>

          <form
            className="space-y-6 text-left"
            dir="ltr"
            onSubmit={handleSubmit}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contactPage.fullName")}
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-gray-500 text-black"
                  dir="ltr"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("contactPage.fullNamePlaceholder")}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contactPage.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-gray-500 text-black"
                  dir="ltr"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("contactPage.emailPlaceholder")}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium mb-2"
              >
                {t("contactPage.subject")}
              </label>
              <input
                id="subject"
                type="text"
                className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-gray-500 text-black"
                dir="ltr"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t("contactPage.subjectPlaceholder")}
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                {t("contactPage.message")}
              </label>
              <textarea
                id="message"
                rows={6}
                className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-gray-500 text-black"
                dir="ltr"
                value={formData.message}
                onChange={handleChange}
                placeholder={t("contactPage.messagePlaceholder")}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("contactPage.submitting")}
                </>
              ) : (
                t("contactPage.submit")
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Map */}
      {/* <div className="mt-12">
        <div className="rounded-lg overflow-hidden border h-80 bg-muted flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Signal Forex Office Location Map
            <br />
            (In the final version, a Google map will be displayed here)
          </p>
        </div>
      </div> */}
    </div>
  );
}
