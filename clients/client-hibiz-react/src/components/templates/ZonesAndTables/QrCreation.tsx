import { useState, useRef, useCallback } from "react"
import QRCode from "react-qr-code"
import { toPng } from "html-to-image"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import PopUp from "@/components/atom/popUp"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCw } from "lucide-react"
import QrCode from "./Qr.Code"
import useZoneStore from "@/components/store/useZone"
import TableSelectionPopup from "./TableSelection"
import toast from "react-hot-toast"

type AspectRatio = "1:1" | "4:3" | "16:9" | "custom"

const QrCreation = () => {
  const [generateQr, setGenerateQr] = useState<boolean>(false)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1")
  const [width, setWidth] = useState<number>(300)
  const [height, setHeight] = useState<number>(300)
  const [isPortrait, setIsPortrait] = useState<boolean>(false)
  const [image, setImage] = useState<string | null>(null)
  const [imageRotation, setImageRotation] = useState<number>(0)
  const [qrSize, setQrSize] = useState(100)
  const [tableName, setTableName] = useState<string>("Test")
  const { selectedTableIds, toggleTableIds, allTables, setSelectedTableIds } = useZoneStore()
  const [currentQrValue, setCurrentQrValue] = useState<string>("https://example.com")
  const [showTables, setShowTables] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrContainerRef = useRef<HTMLDivElement>(null)

  const resetStates = useCallback(() => {
    setGenerateQr(false)
    setAspectRatio("1:1")
    setWidth(300)
    setHeight(300)
    setIsPortrait(false)
    setImage(null)
    setImageRotation(0)
    setQrSize(100)
    setTableName("Test")
    setCurrentQrValue("https://example.com")
    setShowTables(false)
    setSelectedTableIds([])
  },[])

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

  const getLinksFromTables = useCallback(() => {
    const selectedTables = allTables.filter((table) => selectedTableIds.includes(table._id))
    return selectedTables.map((table) => ({
      name: table.name,
      link: table.tableLink,
    }))
  }, [allTables, selectedTableIds])

  const handleDownloadAll = useCallback(async () => {
    const links = getLinksFromTables()
    for (const { name, link } of links) {
      setCurrentQrValue(link)
      setTableName(name)
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (qrContainerRef.current) {
        try {
          const dataUrl = await toPng(qrContainerRef.current, { quality: 1.0 })
          const downloadLink = document.createElement("a")
          downloadLink.download = `${name}.png`
          downloadLink.href = dataUrl
          downloadLink.click()
          toast.success(`Downloaded QR for ${name}`)
        } catch (error) {
          console.error("Error generating image for", link, error)
        }
      }
    }
    resetStates()
  }, [getLinksFromTables])

  const handleWidthChange = (value: number) => {
    const newWidth = Math.min(value, 500)
    setWidth(newWidth)
    if (!isPortrait) {
      setHeight(newWidth)
    }
  }

  const handleHeightChange = (value: number) => {
    const newHeight = Math.min(value, 500)
    setHeight(newHeight)
    if (isPortrait) {
      setWidth(newHeight)
    }
  }

  const handleRotateImage = () => {
    setImageRotation((prev) => (prev + 90) % 360)
  }




  const handleDownloadAllAndReset = async () => {
    await handleDownloadAll()
    resetStates()
  }

  return (
    <div>
      {generateQr && (
        <PopUp
          height="h-[100dvh] lg:h-[90dvh]"
          hide
          width="w-full max-w-[64rem]"
          show={generateQr}
          onClose={() => setGenerateQr(false)}
        >
          <div className="flex flex-col items-center p-4 space-y-6 overflow-hidden lg:flex-row lg:space-x-6 lg:space-y-0">
            <section className="flex-1 w-full space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)] lg:max-h-none">
              <div className="w-full">
                <h2 className="mb-4 text-2xl font-bold">QR Code Generator</h2>
                <div className="flex flex-wrap gap-2">
                  {["1:1", "4:3", "16:9", "custom"].map((ratio) => (
                    <Button
                      key={ratio}
                      variant={aspectRatio === ratio ? "default" : "outline"}
                      onClick={() => handleAspectRatioChange(ratio as AspectRatio)}
                      className="flex-1 min-w-[4rem]"
                    >
                      {ratio}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="w-full space-y-4">
                <div>
                  <Label htmlFor="width">Width: {width}px</Label>
                  <Slider
                    id="width"
                    min={100}
                    max={500}
                    step={10}
                    value={[width]}
                    onValueChange={(value) => handleWidthChange(value[0])}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height: {height}px</Label>
                  <Slider
                    id="height"
                    min={100}
                    max={500}
                    step={10}
                    value={[height]}
                    onValueChange={(value) => handleHeightChange(value[0])}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="orientation" checked={isPortrait} onCheckedChange={setIsPortrait} />
                  <Label htmlFor="orientation">Portrait</Label>
                </div>
                <Button variant="outline" onClick={handleRotateImage}>
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate Image
                </Button>
              </div>
            </section>

            <div className="w-full max-w-[24rem] md:max-w-[40rem] lg:max-w-[40rem] overflow-auto p-4 flex flex-col items-center justify-center rounded-lg flex-2">
              <div
                ref={qrContainerRef}
                className="relative overflow-hidden bg-gray-200 rounded-lg shadow-md"
                style={{
                  width: isPortrait ? width : height,
                  height: isPortrait ? height : width,
                  maxWidth: "100%",
                  maxHeight: "calc(100vh - 16rem)",
                }}
              >
                {image && (
                  <img
                    src={image || "/placeholder.svg"}
                    alt="Uploaded"
                    className="object-contain w-full h-full transition-transform duration-300 ease-in-out"
                    style={{ transform: `rotate(${imageRotation}deg)` }}
                  />
                )}
                <QrCode setSize={setQrSize}>
                  <QRCode
                    value={currentQrValue}
                    size={qrSize}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 ${qrSize} ${qrSize}`}
                  />
                </QrCode>
                <div className="absolute px-2 py-1 text-sm font-semibold bg-white rounded bottom-2 left-2">
                  {tableName}
                </div>
              </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

            {showTables && (
              <TableSelectionPopup
                allTables={allTables}
                selectedTableIds={selectedTableIds}
                toggleTableIds={toggleTableIds}
                handleDownloadAll={handleDownloadAll}
                onClose={() => setShowTables(false)}
                show={showTables}
              />
            )}

          </div>
            <AdvancedBottomButton
              maxWidth="30rem"
              position="mid"
              buttons={[
                {
                  text: "Close",
                  onClick: () => setGenerateQr(false),
                  isBackButton: true,
                  className: "rounded pl-3",
                },
                {
                  text: "Upload Image",
                  onClick: () => fileInputRef.current?.click(),
                  color: "purple",
                  className: "rounded-md",
                },
                {
                  text: "Next",
                  onClick: () => setShowTables(true),
                  className: "rounded-md",
                },
              ]}
            />
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

