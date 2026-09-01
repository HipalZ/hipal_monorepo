import axios from 'axios';
import FormData from 'form-data';

// 10 MB cap for WhatsApp media. Other features (banners, explore, etc.) keep
// their own smaller frontend checks; this is WhatsApp-specific.
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Downloads from WhatsApp.
 * Throws "FILE_TOO_LARGE" if metadata indicates size > 10MB.
 */
async function downloadWhatsAppMedia(mediaId: string, token: string) {
  try {
    const urlResponse = await axios.get(`https://graph.facebook.com/v21.0/${mediaId}`, { headers: { Authorization: `Bearer ${token}` } });

    const { url: downloadUrl, mime_type, file_size } = urlResponse.data;

    // ✅ GATEKEEPER: Check Size (Pre-download)
    if (file_size && file_size > MAX_FILE_SIZE_BYTES) {
      const error: any = new Error('File too large (Metadata check)');
      error.code = 'FILE_TOO_LARGE';
      throw error;
    }

    const fileResponse = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      headers: { Authorization: `Bearer ${token}` },
    });

    const buffer = Buffer.from(fileResponse.data);

    let extension = mime_type.split('/')[1];
    if (extension === 'jpeg') extension = 'jpg';
    if (extension === 'plain') extension = 'txt';

    return { buffer, mimeType: mime_type, extension };
  } catch (error) {
    throw error;
  }
}

/**
 * Uploads to your custom storage.
 * Catches the specific 400 Error from your server.
 */
async function uploadToPermanentStorage(buffer: Buffer, userId: string, extension: string, mimeType: string): Promise<string> {
  try {
    const formData = new FormData();
    const fileName = `whatsapp_${userId}_${Date.now()}.${extension}`;

    formData.append('file', buffer, {
      filename: fileName,
      contentType: mimeType,
    });

    const uploadResponse = await axios.post('https://storage.hipalz.com/upload', formData, {
      headers: { ...formData.getHeaders() },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return uploadResponse.data?.url || uploadResponse.data?.location || '';
  } catch (error: any) {
    // Catch storage server rejection for any file-size limit message (the
    // server can return "5 MB" or "10 MB" depending on its current config).
    if (error.response?.status === 400 && typeof error.response?.data === 'string' && error.response.data.includes('limit')) {
      const customError: any = new Error('Storage server rejected file size');
      customError.code = 'FILE_TOO_LARGE';
      throw customError;
    }

    console.error('[Storage] Upload failed:', error.message);
    throw error;
  }
}

export { downloadWhatsAppMedia, uploadToPermanentStorage };
