"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative bg-gradient-to-r from-black to-black/95 w-full z-30 border-b border-gray-800/30">
      <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-16 lg:px-24 mx-auto max-w-[1400px] relative z-10">
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="outline"
            asChild
            className="bg-blue-700/40 text-white border-blue-700/30 hover:bg-blue-700/50 rounded-lg"
          >
            <Link href="https://t.me/+uRJNzAveahQ0NjM0" className="flex items-center gap-1">
              Telegram Bot <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          {/* <Button
            asChild
            className="bg-blue-600/80 text-white hover:bg-blue-700 rounded-lg"
          >
            <Link href="/register" className="flex items-center gap-1">
              Register <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button> */}
          <Button
            variant="outline"
            size="sm"
            className="border border-gray-600 text-white rounded-full px-4"
          >
            <span className="flex items-center gap-1">
              <Image
                src="/images/uk-flag.svg"
                alt="English"
                width={20}
                height={20}
                className="rounded-full"
                onError={(e) => {
                  e.currentTarget.src = "https://flagcdn.com/w20/gb.png";
                }}
              />
              en
            </span>
          </Button>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-16">
            <Link
              href="/contact"
              className="text-white hover:text-blue-300 transition"
            >
              Contact
            </Link>
            {/* <Link
              href="/plans"
              className="text-white hover:text-blue-300 transition"
            >
              Plans
            </Link> */}
            <Link
              href="/about"
              className="text-white hover:text-blue-300 transition"
            >
              About Us
            </Link>
            <Link
              href="/blog"
              className="text-white hover:text-blue-300 transition"
            >
              Blogs
            </Link>
            <Link
              href="/"
              className="text-white hover:text-blue-300 transition"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div>
              <span className="text-2xl font-bold text-white">
                Signal<span className="text-blue-400">Max</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-gray-800/50 p-4 relative z-10 w-full text-left">
          <div className="flex flex-col space-y-4 w-full">
            <Link
              href="/"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {/* <Link
              href="/plans"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Plans
            </Link> */}
            <Link
              href="/about"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/blog"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-2 flex flex-col space-y-2">
              {/* <Button
                variant="outline"
                asChild
                className="bg-blue-700/40 text-white border-blue-700/30 w-full"
              >
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1"
                >
                  Login <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button> */}
              <Button asChild className="bg-blue-600/80 text-white w-full">
                <Link
                  href="https://t.me/+uRJNzAveahQ0NjM0"
                  className="flex items-center justify-center gap-1"
                >
                  Telegram Bot <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
