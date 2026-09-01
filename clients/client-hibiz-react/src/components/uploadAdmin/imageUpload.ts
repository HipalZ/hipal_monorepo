import axios from "axios"
import toast from "react-hot-toast"

export async function storeImageAfterSave(
  image: File,
  imagePreview: string | null,
  setIsLoading?: (loading: boolean) => void,
) {
  if (!image || !imagePreview) {
    console.error("Missing image or preview")
    return null
  }

  // Validate file type
  const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"]
  if (!validTypes.includes(image.type)) {
    console.error("Invalid file type:", image.type)
    toast.error(`Invalid file type: ${image.name}. Only PNG, JPEG, JPG, GIF, and WEBP are allowed.`)
    return null
  }

  const imageId = crypto.randomUUID()
  setIsLoading?.(true)

  try {
    console.log("Processing image for upload:", image.name)

    // Validate Base64 string
    const base64Index = imagePreview.indexOf(",")

    if (base64Index === -1) {
      console.error("Invalid image preview format")
      return null
    }

    const base64Data = imagePreview.split(",")[1]
    const blobBin = atob(base64Data)
    const array = new Uint8Array(blobBin.length)

    for (let i = 0; i < blobBin.length; i++) {
      array[i] = blobBin.charCodeAt(i)
    }

    const file = new Blob([array], { type: image.type })
    const formData = new FormData()
    formData.append("fileData", file)
    formData.append("fileName", `${imageId}`)
    formData.append("bucketName", "assets")

    console.log("Sending upload request to server")
    const response = await axios.post("https://storage.hipalz.com/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Upload response:", response)

    if (response.status === 201 || response.status === 200) {
      setIsLoading?.(false)
      return response.data.url
    } else {
      console.error("Upload failed with status:", response.status)
      return null
    }
  } catch (error) {
    console.error("Failed to store image:", error)
    setIsLoading?.(false)
    toast.error("Failed to upload image. Please check the image format.")
    return null
  }
}

const hotelBannerMediaTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "video/mp4",
]

const extensionByMimeType: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "video/mp4": "mp4",
}

const videoFileExtensions = new Set(["mp4"])
const mimeTypeByExtension: Record<string, string> = {
  mp4: "video/mp4",
}

const safeExtensionFromFile = (file: File) => {
  const fromMime = extensionByMimeType[file.type]
  if (fromMime) return fromMime

  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "")
  if (fromName) return fromName

  if (file.type.startsWith("image/")) return file.type.split("/")[1]?.replace(/[^a-z0-9]/g, "") || "img"
  if (file.type.startsWith("video/")) return file.type.split("/")[1]?.replace(/[^a-z0-9]/g, "") || "mp4"
  return "bin"
}

const isVideoFile = (file: File) => {
  const extension = safeExtensionFromFile(file)
  return file.type === "video/mp4" || videoFileExtensions.has(extension)
}

const effectiveMimeType = (file: File) => {
  if (file.type) return file.type
  return mimeTypeByExtension[safeExtensionFromFile(file)] || "application/octet-stream"
}

export async function storeHotelBannerMediaAfterSave(
  media: File,
  mediaPreview: string | null,
  setIsLoading?: (loading: boolean) => void,
) {
  if (!media || !mediaPreview) {
    console.error("Missing media or preview")
    return null
  }

  const maxSize = 10 * 1024 * 1024
  if (media.size > maxSize) {
    toast.error("File size exceeds 10MB.")
    return null
  }

  const isHotelBannerImage = hotelBannerMediaTypes.includes(media.type)
  const isHotelBannerVideo = isVideoFile(media)

  if (!isHotelBannerImage && !isHotelBannerVideo) {
    console.error("Invalid hotel banner media type:", media.type)
    toast.error(`Invalid file type: ${media.name}. Use an image or MP4 video.`)
    return null
  }

  const mediaId = crypto.randomUUID()
  const extension = safeExtensionFromFile(media)
  setIsLoading?.(true)

  try {
    const base64Index = mediaPreview.indexOf(",")

    if (base64Index === -1) {
      console.error("Invalid media preview format")
      return null
    }

    const base64Data = mediaPreview.split(",")[1]
    const blobBin = atob(base64Data)
    const array = new Uint8Array(blobBin.length)

    for (let i = 0; i < blobBin.length; i++) {
      array[i] = blobBin.charCodeAt(i)
    }

    const file = new Blob([array], { type: effectiveMimeType(media) })
    const formData = new FormData()
    formData.append("fileData", file)
    formData.append("fileName", `${mediaId}.${extension}`)
    formData.append("bucketName", "assets")

    const response = await axios.post("https://storage.hipalz.com/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    if (response.status === 201 || response.status === 200) {
      setIsLoading?.(false)
      return response.data.url
    }

    console.error("Upload failed with status:", response.status)
    return null
  } catch (error) {
    console.error("Failed to store hotel banner media:", error)
    setIsLoading?.(false)
    toast.error("Failed to upload media. Please check the file format.")
    return null
  }
}
