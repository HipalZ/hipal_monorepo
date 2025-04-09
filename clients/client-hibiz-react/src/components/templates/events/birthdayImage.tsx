import { useRef, useState } from "react"
import { storeImageAfterSave } from "@/components/utils/helper"
import { BiPlus, BiX } from "react-icons/bi"
import { cn } from "@/lib/utils"

interface Props {
    onUploadSuccess: (url: string) => void
    image: string | null
}

export default function BirthdayImageUploader({ onUploadSuccess, image }: Props) {
    const templateImageRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            setPreview(base64)

            const uploadedUrl = await storeImageAfterSave(selectedFile, base64)
            if (uploadedUrl) {
                onUploadSuccess(uploadedUrl)
            }
        }

        reader.readAsDataURL(selectedFile)
    }

    const handleRemoveImage = () => {
        setPreview(null);
    };

    return (
        <div className="space-y-2 mt-2">
            <div
                className={cn(
                    "relative w-32 mb-4 bg-white rounded-lg h-32",
                    preview ? "" : "border-2 border-gray-300 border-dashed",
                )}
            >
                <input
                    ref={templateImageRef}
                    type="file"
                    id="headerImage"
                    className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={handleFileChange}
                />
                {(preview || image) ? (
                    <div className="relative w-full h-full">
                        <img
                            src={preview ?? image ?? undefined}
                            alt="birthdayImage"
                            className="object-cover w-full h-full rounded-lg"
                        />
                        <button
                            type="button"
                            className="absolute p-1 m-2 text-white bg-gray-700 rounded-full -top-4 -right-4 hover:bg-gray-700"
                            onClick={handleRemoveImage}
                        >
                            <BiX className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="absolute inset-0 w-full mt-16 transform -translate-x-1/2 -translate-y-1/2 min-h-56 left-1/2 top-1/2">
                        <BiPlus className="w-6 h-6 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-center text-gray-600">
                            Click to upload image
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
