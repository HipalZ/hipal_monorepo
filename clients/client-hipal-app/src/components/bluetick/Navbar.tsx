"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import hipalzHand from "@/assets/bluetick/hipalzc.svg";
import hipalz from "@/assets/bluetick/Hipal.png";
import { useCallback } from "react";

export default function Navbar() {
  const openWhatsApp = useCallback(() => {
    window.open("https://wa.me/917075179325", "_blank", "noopener,noreferrer");
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full bg-[#F9F5F0] lg:px-12">
      <nav className="px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <section className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <section className="flex items-center">
            <Image
              src={hipalz}
              alt="Hipalz logo"
              width={64}
              height={64}
              priority
              className="w-auto h-auto"
            />
          </section>

          <section className="flex items-center space-x-4">
            <Button
              onClick={openWhatsApp}
              size="icon"
              className="w-full rounded-xl bg-[#703BF7] hover:bg-[#703BF7] text-white px-4"
              aria-label="User profile"
            >
              <Image
                src={hipalzHand}
                alt="Hipalz hand"
                width={12}
                height={12}
                priority
                className=" w-4 h-12"
              />
              Get started
            </Button>
          </section>
        </section>
      </nav>
    </header>
  );
}
