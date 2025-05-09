"use client";

import { memo, useCallback } from "react";
import ShimmerImage from "../atoms/imageshimmer";
import type { BusinessDetails } from "../types/businessData";
import { Card, CardContent } from "@/components/ui/card";
import { useScreenSize } from "../hooks/useScreenSize";
import { MdOutlineCall } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { GrLocation } from "react-icons/gr";
import { Button } from "../ui/button";
import { Navigation } from "lucide-react";

interface BookingInfoSectionProps {
  business: BusinessDetails;
  className?: string;
}

export const BookingInfoSection = memo(function BookingInfoSection({
  business,
  className = "",
}: BookingInfoSectionProps) {
  const { logoUrl, name, tags = [], description, phone, location } = business;

  const screenSize = useScreenSize();

  const goToLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(location, "_blank");
  }, [location]);
  const callTheOwner = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(`tel:${phone}`);
  }, [phone]);
  const whatsappOwner = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(`https://wa.me/+91${phone}`);
  }, [phone]);

  return (
    <>
      {screenSize === "xs" ? (
        <section className="relative w-full text-primary min-h-[12rem] max-h-[15rem]">
          <Card
            className={`border-none shadow-none w-full max-w-[30rem] absolute -top-[5rem] rounded-3xl bg-base-100 ${className}`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between gap-4">
                {/* Logo Section */}
                <div className="w-32">
                  <div className="relative w-24 h-24 overflow-hidden rounded-xl border-primary">
                    {logoUrl ? (
                      <ShimmerImage
                        src={logoUrl}
                        alt={name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        width={96}
                        height={96}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-base-200">
                        <span className="text-sm text-primary">No logo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="w-full space-y-2">
                  {/* Business Name */}
                  <h1 className="text-4xl font-[500] tracking-normal text-primary font-playfair">
                    {name}
                  </h1>
                  {tags?.length > 0 ? (
                    <div className="gap-2 font-semibold capitalize opacity-60 text-primary">
                      {tags?.join(" | ")}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Description */}
              <div className="p-2 mt-4 text-sm text-base-content min-h-[4rem] max-h-[6rem]">
                <p className="line-clamp-3 font-play">
                  ✨{" "}
                  {description ||
                    "Experience luxury and comfort at our premium hotel establishment."}
                     {description ||
                    "Experience luxury and comfort at our premium hotel establishment."}
                </p>
              </div>

              {/* Action Buttons - First Row */}
              <section className="flex flex-row justify-around gap-2 pb-12 pt-2 -ml-2">
                <Button
                  onClick={goToLocation}
                  className="transition-colors rounded-lg text-secondary bg-primary"
                  type="button"
                  aria-label="Call"
                  size="sm"
                >
                  <Navigation strokeWidth={1.5} />
                  Directions
                </Button>
                <Button
                  onClick={callTheOwner}
                  className="transition-colors rounded-lg text-secondary bg-primary"
                  type="button"
                  aria-label="Call"
                  size="sm"
                >
                  <MdOutlineCall size="24" /> Call Now
                </Button>
                <Button
                  onClick={whatsappOwner}
                  className="transition-colors rounded-lg text-secondary bg-primary"
                  type="button"
                  aria-label="WhatsApp"
                  size="sm"
                >
                  <FaWhatsapp size="24" /> Whatsapp
                </Button>
              </section>
            </CardContent>
          </Card>
        </section>
      ) : null}
      {screenSize !== "xs" ? (
        <section className="flex flex-row justify-around pt-6 pb-2">
          <Button
            onClick={goToLocation}
            className="transition-colors rounded-full text-secondary bg-primary"
            type="button"
            aria-label="Call"
            size="sm"
          >
            <Navigation strokeWidth={1.5} />
            Directions
          </Button>
          <Button
            onClick={callTheOwner}
            className="transition-colors rounded-full text-secondary bg-primary"
            type="button"
            aria-label="Call"
            size="sm"
          >
            <MdOutlineCall size="24" /> Call Now
          </Button>
          <Button
            onClick={whatsappOwner}
            className="transition-colors rounded-full text-secondary bg-primary"
            type="button"
            aria-label="WhatsApp"
            size="sm"
          >
            <FaWhatsapp size="24" /> Whatsapp
          </Button>
        </section>
      ) : null}
    </>
  );
});
