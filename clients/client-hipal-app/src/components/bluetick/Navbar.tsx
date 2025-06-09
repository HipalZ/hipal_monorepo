"use client";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import hipalzHand from "@/assets/bluetick/hipalzc.svg";
import hipalz from "@/assets/bluetick/Hipal.png";

const navigationItems = [
  { name: "Product", href: "#product" },
  { name: "Services", href: "#services" },
  { name: "Customers", href: "#customers" },
  { name: "Resources", href: "#resources" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F9F5F0]">
      <nav className="px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <section className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <section className="flex items-center">
            <a
              href="#home"
              className="flex items-center space-x-2 text-xl font-semibold text-stone-900 hover:text-stone-700 transition-colors"
              onClick={(e) => handleSmoothScroll(e, "#home")}
              aria-label="Compally home"
            >
              <Image
                src={hipalz}
                alt="Hipalz logo"
                width={64}
                height={64}
                priority
                className=" w-auto h-auto"
              />
            </a>
          </section>

          {/* Desktop Navigation */}
          <section className="hidden md:block">
            {/* <ul className="flex items-center space-x-8">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className="text-stone-700 hover:text-stone-900 px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul> */}
          </section>

          {/* Profile Button & Mobile Menu Toggle */}
          <section className="flex items-center space-x-4">
            {/* Profile Button */}
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              aria-label="User profile"
            >
              <Image
                src={hipalzHand}
                alt="Hipalz hand"
                width={12}
                height={12}
                priority
                className=" w-auto h-auto p-4"
              />
            </Button>

            {/* Mobile Menu Button */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button> */}
          </section>
        </section>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <section className="md:hidden border-t border-stone-200">
            <nav
              className="px-2 pt-2 pb-3 space-y-1"
              aria-label="Mobile navigation"
            >
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={(e) => handleSmoothScroll(e, item.href)}
                      className="block px-3 py-2 text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>
        )}
      </nav>
    </header>
  );
}
