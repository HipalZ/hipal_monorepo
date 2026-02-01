import axios from "axios";
import FormData from "form-data";

// ✅ STEP 1: Update limit to 5MB to match your storage server
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Downloads from WhatsApp.
 * Throws "FILE_TOO_LARGE" if metadata indicates size > 5MB.
 */
async function downloadWhatsAppMedia(mediaId: string, token: string) {
  try {
    const urlResponse = await axios.get(
      `https://graph.facebook.com/v21.0/${mediaId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const { url: downloadUrl, mime_type, file_size } = urlResponse.data;

    // ✅ GATEKEEPER: Check Size (Pre-download)
    if (file_size && file_size > MAX_FILE_SIZE_BYTES) {
      const error: any = new Error("File too large (Metadata check)");
      error.code = "FILE_TOO_LARGE";
      throw error;
    }

    const fileResponse = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
      headers: { Authorization: `Bearer ${token}` },
    });

    const buffer = Buffer.from(fileResponse.data);

    let extension = mime_type.split("/")[1];
    if (extension === "jpeg") extension = "jpg";
    if (extension === "plain") extension = "txt";

    return { buffer, mimeType: mime_type, extension };
  } catch (error) {
    throw error;
  }
}

/**
 * Uploads to your custom storage.
 * Catches the specific 400 Error from your server.
 */
async function uploadToPermanentStorage(
  buffer: Buffer,
  userId: string,
  extension: string,
  mimeType: string,
): Promise<string> {
  try {
    const formData = new FormData();
    const fileName = `whatsapp_${userId}_${Date.now()}.${extension}`;

    formData.append("file", buffer, {
      filename: fileName,
      contentType: mimeType,
    });

    const uploadResponse = await axios.post(
      "https://storage.test.hipalz.com/upload",
      formData,
      {
        headers: { ...formData.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );

    return uploadResponse.data?.url || uploadResponse.data?.location || "";
  } catch (error: any) {
    // ✅ STEP 2: Catch Storage Server Rejection
    // Your log showed: status 400 and data "File size exceeds the 5 MB limit."
    if (
      error.response?.status === 400 &&
      error.response?.data?.includes("limit")
    ) {
      const customError: any = new Error("Storage server rejected file size");
      customError.code = "FILE_TOO_LARGE";
      throw customError;
    }

    console.error("[Storage] Upload failed:", error.message);
    throw error;
  }
}

export { downloadWhatsAppMedia, uploadToPermanentStorage };
