import { cn } from "@/lib/utils"
import Image from "next/image"
import type { ReactNode } from "react"
import HotelBackground from "@/assets/hotel/hotel background.png"


interface ContainerProps {
  children: ReactNode
  className?: string
}

export function ViewPortContainer({ children, className }: ContainerProps) {
  return <div className={cn("w-full max-w-[1280px] overflow-hidden", className)}>{children}</div>
}

interface HotelBackgroundContainerProps {
  children: ReactNode
  className?: string
  overlayOpacity?: number // Optional prop to control the overlay darkness
}

export function HotelBackgroundContainer({
  children,
  className,
  overlayOpacity = 0.1 // Default overlay opacity
}: HotelBackgroundContainerProps) {
  return (
      <div className={cn("relative w-full overflow-hidden", className)}>
          {/* Background Image */}
          <div className="absolute -z-10 opacity-10">
              <Image
                  src={HotelBackground || "/placeholder.svg"}
                  alt="Hotel background"
                  priority
                  width={1980}
                  height={1980}
                  className="object-contain object-top w-[1980px] h-[1980px]"
                  sizes="100vw"
              />
          </div>

          {/* Content Container */}
          <div className="relative z-10 w-full max-w-[1280px] mx-auto">
              {children}
          </div>
      </div>
  )
}