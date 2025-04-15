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
    const response = await axios.post("https://storage.test.hipalz.com/upload", formData, {
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
