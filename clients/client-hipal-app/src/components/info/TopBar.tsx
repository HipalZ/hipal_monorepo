"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import type { BusinessDetails } from "@/components/types/businessData";

interface TopBarProps {
  businessData: BusinessDetails;
}

export default function TopBar({ businessData }: TopBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact-section");
    contactSection?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const handlePhoneCall = () => {
    if (!businessData.phone) return;
    window.open(`tel:${businessData.phone}`, "_self");
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all",
        "border-b border-white/10",
        "bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/20",
        scrolled ? "shadow-[0_8px_30px_rgba(0,0,0,0.35)]" : "",
      ].join(" ")}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 lg:h-12 lg:w-12 rounded-xl overflow-hidden ring-1 ring-white/10 bg-white/5">
              <Image
                src={businessData.logoUrl || "/placeholder.svg"}
                alt={`${businessData.name} logo`}
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-lg lg:text-xl font-semibold text-white">
              {businessData.name}
            </h1>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {businessData.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePhoneCall}
                className="gap-2 bg-white/5 text-white border-white/20 hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                {businessData.phone}
              </Button>
            )}
            <Button
              onClick={scrollToContact}
              size="sm"
              className="text-white bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-500/90 hover:to-emerald-400/90 shadow-lg shadow-emerald-500/20"
            >
              Book a Site Visit
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen((s) => !s)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-3">
              {businessData.phone && (
                <Button
                  variant="outline"
                  onClick={handlePhoneCall}
                  className="gap-2 justify-start bg-white/5 text-white border-white/20 hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" />
                  {businessData.phone}
                </Button>
              )}
              <Button
                onClick={scrollToContact}
                className="text-white bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-500/90 hover:to-emerald-400/90 shadow-lg shadow-emerald-500/20"
              >
                Book a Site Visit
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
