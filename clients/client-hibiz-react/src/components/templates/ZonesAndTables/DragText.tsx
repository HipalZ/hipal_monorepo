import { useState, useRef, useEffect, type FC } from "react"
import { useDrag } from "@use-gesture/react"
import { useQr } from "@/components/store/useQr"

interface DraggableTextProps {
  setSize?: (size: number) => void
  initialPosition?: { x: number; y: number }
  initialSize?: number
  className?: string
    children: React.ReactNode
}

const DraggableText: FC<DraggableTextProps> = ({
  setSize,
  initialPosition = { x: 25, y: 100 },
  initialSize = 16,
  className = "",
  children
}) => {
  // Get styling from the store
  const {
    textColor,
    textFont,
    hasBackground,
    backgroundColor,
    textSize,
    fontWeight,
    isItalic,
    isUnderlined,
  } = useQr((state) => ({
    tableName: state.tableName || "Table Name",
    textColor: state.textColor || "#000000",
    textFont: state.textFont || "font-sans",
    hasBackground: state.hasBackground || false,
    backgroundColor: state.backgroundColor || "#FFFFFF",
    textSize: state.textSize || initialSize,
    fontWeight: state.fontWeight || "font-normal",
    isItalic: state.isItalic || false,
    isUnderlined: state.isUnderlined || false,
  }))

  const [localPosition, setLocalPosition] = useState(initialPosition)
  const [localSize, setLocalSize] = useState(textSize || initialSize)
  const containerRef = useRef<HTMLDivElement>(null)

  const bind = useDrag(({ offset: [x, y] }) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const textElement = containerRef.current.firstElementChild as HTMLElement
      const textWidth = textElement?.offsetWidth || 0
      const textHeight = textElement?.offsetHeight || 0

      const newX = Math.max(0, Math.min(x, containerRect.width - textWidth))
      const newY = Math.max(0, Math.min(y, containerRect.height - textHeight))
      setLocalPosition({ x: newX, y: newY })
    }
  })

  useEffect(() => {
    if (!setSize) return

    const handleResize = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault()
        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)
        // Scale the distance to a reasonable font size range
        const newSize = Math.max(10, Math.min(36, distance / 10))
        setLocalSize(newSize)
        setSize(newSize)
      }
    }

    document.addEventListener("touchmove", handleResize)
    return () => {
      document.removeEventListener("touchmove", handleResize)
    }
  }, [setSize])

  // Update local size when textSize changes in the store
  useEffect(() => {
    if (textSize) {
      setLocalSize(textSize)
    }
  }, [textSize])

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ touchAction: "none" }}>
      <div
        {...bind()}
        style={{
          position: "absolute",
          left: localPosition.x,
          top: localPosition.y,
          fontSize: `${textSize}px`,
          cursor: "move",
          zIndex: 20,
          color: textColor,
          backgroundColor: hasBackground ? backgroundColor : "transparent",
          padding: hasBackground ? "0.5rem 1rem" : "0.5rem",
          borderRadius: hasBackground ? "0.25rem" : "0",
          fontStyle: isItalic ? "italic" : "normal",
          textDecoration: isUnderlined ? "underline" : "none",
        }}
        className={`${textFont} ${fontWeight} ${className}`}
      >
       {children}
      </div>
    </div>
  )
}

export default DraggableText

