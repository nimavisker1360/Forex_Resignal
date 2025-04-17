"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-custom sticky top-0 w-full z-30 border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">SignalForex</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/signals" className="hover:text-primary transition">
            Signals
          </Link>
          <Link href="/premium" className="hover:text-primary transition">
            Premium
          </Link>
          <Link href="/about" className="hover:text-primary transition">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-primary transition">
            Contact Us
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Sun className="h-5 w-5" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-custom border-t p-4">
          <div className="flex flex-col space-y-4">
            <Link
              href="/signals"
              className="hover:text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Signals
            </Link>
            <Link
              href="/premium"
              className="hover:text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Premium
            </Link>
            <Link
              href="/about"
              className="hover:text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="hover:text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
            <div className="pt-2 flex flex-col space-y-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
