"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-custom border-t py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Signal Forex</h3>
            <p className="text-muted">
              Provider of the best forex signals with high accuracy and
              professional analysis
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted hover:text-primary transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/signals"
                  className="text-muted hover:text-primary transition"
                >
                  Signals
                </Link>
              </li>
              <li>
                <Link
                  href="/premium"
                  className="text-muted hover:text-primary transition"
                >
                  Premium
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted hover:text-primary transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted hover:text-primary transition"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted hover:text-primary transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-muted">
              <li>Address: 1234 Wall Street, New York</li>
              <li>Phone: +1 234-567-8900</li>
              <li>Email: info@signalforex.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-muted">
          <p>© {new Date().getFullYear()} Signal Forex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
