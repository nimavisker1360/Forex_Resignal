import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          Contact us for any questions, suggestions, or collaboration requests
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Contact Info */}
        <div>
          <div className="bg-card border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">info@signalforex.com</p>
                  <p className="text-muted-foreground">
                    support@signalforex.com
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-muted-foreground">+1 234-567-8900</p>
                  <p className="text-muted-foreground">+1 234-567-8901</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-muted-foreground">
                    1234 Wall Street, Financial District, New York, 10005, USA
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Online Support</h3>
                  <p className="text-muted-foreground">
                    Our online support is available every day of the week from 8
                    AM to 8 PM to answer your questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="text-muted-foreground">8 AM - 8 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="text-muted-foreground">8 AM - 4 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-muted-foreground">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Contact Form</h2>

          <form className="space-y-6">
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
                  className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="w-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button className="w-full">Send Message</Button>
          </form>
        </div>
      </div>

      {/* Map */}
      <div className="mt-12">
        <div className="rounded-lg overflow-hidden border h-80 bg-muted flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Signal Forex Office Location Map
            <br />
            (In the final version, a Google map will be displayed here)
          </p>
        </div>
      </div>
    </div>
  );
}
