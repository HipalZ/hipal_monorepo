"use client"

import { memo, useCallback } from "react"
import ShimmerImage from "../atoms/imageshimmer"
import type { BusinessDetails } from "../types/businessData"
import { Card, CardContent } from "@/components/ui/card"
import { useScreenSize } from "../hooks/useScreenSize"
import { MdOutlineCall } from "react-icons/md"
import { FaWhatsapp } from "react-icons/fa"
import { GrLocation } from "react-icons/gr"
import { Button } from "../ui/button"

interface HotelInfoSectionProps {
    business: BusinessDetails
    className?: string
}

export const HotelInfoSection = memo(function HotelInfoSection({ business, className = "" }: HotelInfoSectionProps) {
    const { logoUrl, name, tags = [], description, phone, location } = business


    const screenSize = useScreenSize()

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
            {
                screenSize === "xs" ? (
                    <section className="relative w-full text-h-primary h-auto min-h-[15rem]">
                        <Card
                            className={`border-none shadow-none w-full max-w-[30rem] absolute -top-[5rem] rounded-3xl bg-h-base-100 ${className}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between gap-4">
                                    {/* Logo Section */}
                                    <div className="w-32">
                                        <div className="relative w-24 h-24 overflow-hidden rounded-xl border-h-primary">
                                            {logoUrl ? (
                                                <ShimmerImage
                                                    src={logoUrl}
                                                    alt={name || "Business logo"}
                                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                                    width={96}
                                                    height={96}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full bg-h-base-200">
                                                    <span className="text-sm text-base-content/60">No logo</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="w-full space-y-2">
                                        {/* Business Name */}
                                        <h1 className="text-4xl font-[500] tracking-normal text-h-primary font-playfair">{name}</h1>
                                        {tags?.length > 0 ? (
                                            <div className="gap-2 font-semibold capitalize opacity-60 text-primary">{tags?.join(" | ")}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="p-2 mt-4 text-sm text-h-base-content h-[6rem]">
                                    <p>✨ {description || "Experience luxury and comfort at our premium hotel establishment."}</p>
                                </div>

                                {/* Action Buttons - First Row */}
                                <section className="flex flex-row justify-around gap-2 pb-12 -ml-2">
                                    <Button
                                        onClick={callTheOwner}
                                        style={{
                                            color: 'var(--s)'
                                        }}
                                        className="px-3 py-4 transition-colors rounded-full bg-primary"
                                        type="button"
                                        aria-label="Call"
                                    >
                                        <MdOutlineCall size="24" />
                                        Call
                                    </Button>
                                    <Button
                                        onClick={whatsappOwner}
                                        style={{
                                            color: 'var(--s)'
                                        }}
                                        className="px-3 py-4 transition-colors rounded-full bg-primary"
                                        type="button"
                                        aria-label="WhatsApp"
                                    >
                                        <FaWhatsapp size="24" /> Whatsapp
                                    </Button>
                                    <Button
                                        onClick={goToLocation}
                                        style={{
                                            color: 'var(--s)'
                                        }}
                                        className="px-3 py-4 transition-colors rounded-full bg-primary"
                                        type="button"
                                        aria-label="Location"
                                    >
                                        <GrLocation size="24" /> Location
                                    </Button>
                                </section>

                            </CardContent>
                        </Card>
                    </section>
                ) : null
            }
            {
                screenSize !== "xs" ? (
                    <section className="flex flex-row justify-around pt-12 pb-2">
                        <Button
                            onClick={callTheOwner}
                            style={{
                                color: 'var(--s)'
                            }}
                            className="p-4 transition-colors rounded-full text-secondary bg-primary"
                            type="button"
                            aria-label="Call"
                        >
                            <MdOutlineCall size="24" />
                            Call
                        </Button>
                        <Button
                            style={{
                                color: 'var(--s)'
                            }}
                            onClick={whatsappOwner}
                            className="p-4 transition-colors rounded-full text-secondary bg-primary"
                            type="button"
                            aria-label="WhatsApp"
                        >
                            <FaWhatsapp size="24" /> Whatsapp
                        </Button>
                        <Button
                            style={{
                                color: 'var(--s)'
                            }}
                            onClick={goToLocation}
                            className="p-4 transition-colors rounded-full text-secondary bg-primary"
                            type="button"
                            aria-label="Location"
                        >
                            <GrLocation size="24" /> Location
                        </Button>
                    </section>
                ) : null
            }
        </>
    )
})

