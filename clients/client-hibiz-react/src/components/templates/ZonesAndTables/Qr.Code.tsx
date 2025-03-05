import { useState, useRef, useEffect, type FC } from "react"
import { useDrag } from "@use-gesture/react"

interface QrCodeProps {
  setSize: (size: number) => void
  children: React.ReactNode
}

const QrCode: FC<QrCodeProps> = ({  setSize, children }) => {
  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 })
  const [localSize, setLocalSize] = useState(100)
  const containerRef = useRef<HTMLDivElement>(null)

  const bind = useDrag(({ offset: [x, y] }) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const newX = Math.max(0, Math.min(x, containerRect.width - localSize))
      const newY = Math.max(0, Math.min(y, containerRect.height - localSize))
      setLocalPosition({ x: newX, y: newY })
    }
  })

  useEffect(() => {
    const handleResize = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault()
        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)
        const newSize = Math.max(50, Math.min(200, distance))
        setLocalSize(newSize)
        setSize(newSize)
      }
    }

    document.addEventListener("touchmove", handleResize)
    return () => {
      document.removeEventListener("touchmove", handleResize)
    }
  }, [setSize])

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ touchAction: "none" }}>
      <div
        {...bind()}
        style={{
          position: "absolute",
          left: localPosition.x,
          top: localPosition.y,
          width: localSize,
          height: localSize,
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "move",
          padding: "4px",
          borderRadius: "4px",
          zIndex: 15,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default QrCode

