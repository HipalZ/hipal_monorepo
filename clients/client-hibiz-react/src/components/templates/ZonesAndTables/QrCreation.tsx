import { useRef, useCallback, useState, memo, lazy, Suspense } from "react"
import QRCode from "react-qr-code"
import { toPng } from "html-to-image"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import PopUp from "@/components/atom/popUp"
import { LetterTextIcon } from "lucide-react"
import QrCode from "./Qr.Code"
import useZoneStore from "@/components/store/useZone"
import toast from "react-hot-toast"
import DraggableText from "./DragText"
import { Upload } from "lucide-react"
import { useQr } from "@/components/store/useQr"
import LoadingSpinner from "@/components/atom/loadingSpinner"

const TextStyle = lazy(() => import("./TextStyle"))
const TableSelectionPopup = lazy(() => import("./TableSelection"))
const BottomStyleSection = lazy(() => import("./BottomStyleSection"))


const MemoQrCreation = () => {

  const {
    generateQr,
    setGenerateQr,
    setAspectRatio,
    width,
    setWidth,
    height,
    setHeight,
    isPortrait,
    setIsPortrait,
    image,
    setImage,
    qrSize,
    setQrSize,
    tableName,
    setTableName,
    currentQrValue,
    setCurrentQrValue,
    showTables,
    setShowTables,
    hideTableNames,
    editTextModal,
    toggleEditTextModal,
  } = useQr(s => ({
    generateQr: s.generateQr,
    setGenerateQr: s.setGenerateQr,
    aspectRatio: s.aspectRatio,
    setAspectRatio: s.setAspectRatio,
    width: s.width,
    setWidth: s.setWidth,
    height: s.height,
    setHeight: s.setHeight,
    isPortrait: s.isPortrait,
    setIsPortrait: s.setIsPortrait,
    image: s.image,
    setImage: s.setImage,
    qrSize: s.qrSize,
    setQrSize: s.setQrSize,
    tableName: s.tableName,
    setTableName: s.setTableName,
    currentQrValue: s.currentQrValue,
    setCurrentQrValue: s.setCurrentQrValue,
    showTables: s.showTables,
    setShowTables: s.setShowTables,
    hideTableNames: s.hideTableNames,
    setHideTableNames: s.setHideTableNames,
    editTextModal: s.editTextModal,
    toggleEditTextModal: s.toggleEditTextModal,
  }))
  const { selectedTableIds, allTables, setSelectedTableIds } = useZoneStore()
  const [imageRotation, setImageRotation] = useState<number>(0)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [currentDownloadIndex, setCurrentDownloadIndex] = useState<number>(0)

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
  }, [])



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
    setIsDownloading(true)
    setDownloadProgress(0)
    setCurrentDownloadIndex(0)

    for (let i = 0; i < links.length; i++) {
      const { name, link } = links[i]
      setCurrentQrValue(link)
      setCurrentDownloadIndex(i)
      setTableName(name)

      const progress = Math.round(((i + 1) / links.length) * 100)
      setDownloadProgress(progress)

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (qrContainerRef.current) {
        try {
          const dataUrl = await toPng(qrContainerRef.current, {
            quality: 1.0,
            pixelRatio: 10,
            backgroundColor: "transparent",
          })
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

    setTimeout(() => {
      setIsDownloading(false)
      resetStates()
    }, 500)
  }, [getLinksFromTables, resetStates])




  const handleRotateImage = () => {
    setImageRotation((prev) => (prev + 90) % 360)
  }



  return (
    <div>
      {generateQr && (
        <PopUp
          height="h-[100dvh] lg:h-[90dvh]"
          hide
          width="w-full max-w-[33rem]"
          show={generateQr}
          onClose={() => setGenerateQr(false)}
        >
          <div className="relative h-[100dvh] md:h-auto overflow-auto">

            <div className="w-full max-w-[24rem] md:max-w-[40rem] p-4 lg:max-w-[40rem] overflow-auto">
              <div
                ref={qrContainerRef}
                className="relative overflow-hidden bg-gray-200 shadow-md"
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
                  />
                </QrCode>
                {
                  !hideTableNames &&
                  <DraggableText className="text-sm font-semibold">
                    {tableName}
                  </DraggableText>
                }
              </div>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <BottomStyleSection handleRotateImage={handleRotateImage} />
            </Suspense>

            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

          </div>

          <AdvancedBottomButton
            maxWidth="33rem"
            position="mid"
            buttons={[
              {
                text: "Close",
                onClick: () => setGenerateQr(false),
                isBackButton: true,
                className: "rounded pl-3",
              },
              {
                text: " Image",
                icon: <Upload size={16} className="" />,
                onClick: () => fileInputRef.current?.click(),
                color: "purple",
                className: "rounded-md w-[20%]",
              },
              {
                text: "",
                icon: <LetterTextIcon size={24} className="" />,
                onClick: toggleEditTextModal,
                className: "rounded-md w-[20%]",
              },
              {
                text: "Next",
                onClick: () => setShowTables(true),
                className: "rounded-md w-[50%]",
              },
            ]}
          />

        </PopUp>
      )}

      {isDownloading && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-xl font-semibold">Downloading QR Codes</h3>
            <div className="mb-4">
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full transition-all duration-300 bg-purple-600 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-right text-gray-600">{downloadProgress}%</p>
            </div>
            <div className="flex items-center justify-center">
              <LoadingSpinner />
              <p className="ml-3 text-gray-600">
                {downloadProgress < 100 ? `Downloading QR code ${currentDownloadIndex + 1}...` : "Download complete!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {showTables && (
        <Suspense fallback={<LoadingSpinner />}>
          <TableSelectionPopup
            handleDownloadAll={handleDownloadAll}
            onClose={() => setShowTables(false)}
            show={showTables}
          />
        </Suspense>
      )}

      {
        editTextModal && (
          <PopUp hide show={editTextModal} onClose={toggleEditTextModal} width="w-[30rem]" height="h-[100dvh] lg:h-[40rem]">
            <Suspense fallback={<LoadingSpinner />}>
              <TextStyle />
            </Suspense>
          </PopUp>
        )
      }

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

const QrCreation = memo(MemoQrCreation)
export default QrCreation

