"use client";

import { Button } from "@/components/ui/button";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
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
        toast.success(
          data.message || "Your message has been sent successfully!"
        );
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 text-left">
      <div className="max-w-3xl mx-auto mb-12 text-center ">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          Contact us for any questions, suggestions, or collaboration requests
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start text-left">
        {/* Contact Info */}
        <div>
          <div className="bg-card border rounded-lg p-8 mb-8 text-left">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

            <div className="space-y-6">
              <div className="flex items-start justify-start gap-4 flex-row-reverse">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-left">Email</h3>
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

              <div className="flex items-start justify-start gap-4 flex-row-reverse">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-left">Address</h3>
                  <p className="text-muted-foreground text-left">
                   Turkey
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-start gap-4 flex-row-reverse">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-left">
                    Online Support
                  </h3>
                  <p className="text-blue-500 text-left">
                    Our online support is available every day of the week from 8
                    AM to 8 PM to answer your questions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-8 text-left">
            <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className=" text-white">8 AM - 8 PM</span>
                <span className="text-white">Monday - Friday</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Closed</span>
                <span>Saturday</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Closed</span>
                <span>Sunday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card border rounded-lg p-8 text-left">
          <h2 className="text-2xl font-bold mb-6">Contact Form</h2>

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
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-gray-500 text-black"
                  dir="ltr"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-gray-500 text-black"
                  dir="ltr"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium mb-2"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-gray-500 text-black"
                dir="ltr"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter subject"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-gray-500 text-black"
                dir="ltr"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
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
                  Sending...
                </>
              ) : (
                "Send Message"
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
