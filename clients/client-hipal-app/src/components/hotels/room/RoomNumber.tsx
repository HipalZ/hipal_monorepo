import Image from "next/image"
import RoomImage from "@/assets/hotel/roomImage.jpeg"

interface RoomCardProps {
  roomNumber: string | number
  className?: string
}

export default function RoomCard({ roomNumber, className }: RoomCardProps) {
  return (
    <div
      className={`relative w-full max-w-[30rem] h-[180px] rounded-lg overflow-hidden flex ${className || ""}`}
      style={{
        background: "linear-gradient(to right, #000000, #1a1a1a)",
      }}
    >
      {/* Left side - Room number */}
      <div className="w-[45%] h-full flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-sm tracking-wider uppercase opacity-70">Room Number</div>
          <div className="mt-2 text-3xl font-bold font-play">{roomNumber}</div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="w-[55%] h-full relative">
        <Image
          src={RoomImage}
          alt="Room Image"
          fill
          className="object-cover"
          sizes="(max-width: 30rem) 60vw, 18rem"
        />
      </div>
    </div>
  )
}

