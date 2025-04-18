"use client";

import Link from "next/link";
import { LineChart, Link2, Info, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black py-8 text-white" dir="ltr">
      <div className="container mx-auto px-4">
        <div className="w-4/4 mx-auto border-t"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 justify-center md:justify-start">
              <LineChart className="h-5 w-5 text-blue-400 mr-2" />
              Signal Forex
            </h3>
            <p className="text-white text-sm">
              Provider of the best forex signals with high accuracy and
              professional analysis
            </p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 justify-center md:justify-start">
              <Link2 className="h-5 w-5 text-blue-400 mr-2" />
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/signals"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  Signals
                </Link>
              </li>
              <li>
                <Link
                  href="/premium"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  Premium
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 justify-center md:justify-start">
              <Info className="h-5 w-5 text-blue-400 mr-2" />
              Information
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-blue-400 transition text-sm"
                >
                  Contact Us
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

          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 justify-center md:justify-start">
              <Phone className="h-5 w-5 text-blue-400 mr-2" />
              Contact Us
            </h3>
            <ul className="space-y-2 text-white text-sm">
              <li>Address: Turkey</li>
              <li>Phone: +90 552-6078900</li>
              <li>Email: nimabaghery@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-white text-center">
          <p>© {new Date().getFullYear()} Signal Forex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
