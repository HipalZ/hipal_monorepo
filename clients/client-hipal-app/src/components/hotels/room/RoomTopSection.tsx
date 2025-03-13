import Image from "next/image"

interface ResponsiveImageProps {
  imageUrl: string
  alt?: string
  className?: string
}

export default function ResponsiveImage({ imageUrl, alt = "Image", className }: ResponsiveImageProps) {
  return (
    <div className="relative w-full max-w-[30rem] h-[110px]">
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt={alt}
        fill
        className={`object-cover ${className || ""}`}
        sizes="(max-width: 30rem) 100vw, 30rem"
      />
    </div>
  )
}

