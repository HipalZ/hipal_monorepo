import { useState, useRef, useCallback } from "react"
import QRCode from "react-qr-code"
import { toPng } from "html-to-image"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import PopUp from "@/components/atom/popUp"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import QrCode from "./Qr.Code"

type AspectRatio = "1:1" | "4:3" | "16:9" | "custom"

const QrCreation = () => {
  const [generateQr, setGenerateQr] = useState<boolean>(false)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1")
  const [width, setWidth] = useState<number>(300)
  const [height, setHeight] = useState<number>(300)
  const [isPortrait, setIsPortrait] = useState<boolean>(true)
  const [image, setImage] = useState<string | null>(null)
  const [qrPosition, setQrPosition] = useState({ x: 0, y: 0 })
  const [qrSize, setQrSize] = useState(100)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrContainerRef = useRef<HTMLDivElement>(null)

  const handleAspectRatioChange = (value: AspectRatio) => {
    setAspectRatio(value)
    if (value === "1:1") {
      setWidth(300)
      setHeight(300)
    } else if (value === "4:3") {
      setWidth(400)
      setHeight(300)
    } else if (value === "16:9") {
      setWidth(480)
      setHeight(270)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDownload = useCallback(async () => {
    if (qrContainerRef.current) {
      try {
        const dataUrl = await toPng(qrContainerRef.current, { quality: 1.0 })
        const link = document.createElement("a")
        link.download = "qr-code-image.png"
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error("Error generating image:", error)
      }
    }
  }, [])

  return (
    <div>
      {generateQr && (
        <PopUp show={generateQr} onClose={() => setGenerateQr(false)}>
          <div className="space-y-4">
            <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select aspect ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {aspectRatio === "custom" && (
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  placeholder="Width"
                />
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  placeholder="Height"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="orientation" checked={isPortrait} onCheckedChange={setIsPortrait} />
              <Label htmlFor="orientation">Portrait</Label>
            </div>

            <div
              ref={qrContainerRef}
              className="relative overflow-hidden bg-gray-200"
              style={{
                width: isPortrait ? width : height,
                height: isPortrait ? height : width,
              }}
            >
              {image && <img src={image || "/placeholder.svg"} alt="Uploaded" className="object-cover w-full h-full" />}
              <QrCode setPosition={setQrPosition} setSize={setQrSize}>
                <QRCode
                  value="https://example.com"
                  size={qrSize}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 ${qrSize} ${qrSize}`}
                />
              </QrCode>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <Button className="absolute bottom-2 right-2" onClick={() => fileInputRef.current?.click()}>
                Upload Image
              </Button>
            </div>
            <Button onClick={handleDownload} className="w-full">
              Download QR Code
            </Button>
          </div>
        </PopUp>
      )}
      <AdvancedBottomButton
        buttons={[
          {
            text: "Generate QR",
            onClick: () => {
              setGenerateQr(true)
            },
            color: "purple",
            className: "w-[25rem]",
          },
        ]}
      />
    </div>
  )
}

export default QrCreation

