/**
 * Image Processing Web Worker
 *
 * Processes images using OffscreenCanvas in a background thread.
 * Resizes to max 1080x1080px and compresses to JPEG (quality 0.8).
 */

self.onmessage = async (e) => {
  const { file, maxWidth = 1080, maxHeight = 1080, imageId } = e.data;

  try {
    // Create bitmap from file
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;
    const ratio = Math.min(maxWidth / width, maxHeight / height);

    // Only resize if the image is larger than our target
    if (ratio < 1) {
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    // Create OffscreenCanvas and draw resized image
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Convert to blob with compression
    const blob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.8,
    });

    // Send result back to main thread (include imageId so we can match it)
    self.postMessage({
      blob,
      originalName: file.name,
      imageId: imageId, // Send back the imageId
      processedWidth: width,
      processedHeight: height,
    });

    // Crucial: Free up memory immediately
    bitmap.close();
  } catch (error) {
    self.postMessage({
      error: error.message,
      originalName: file.name,
      imageId: imageId, // Include imageId in error response too
    });
  }
};
