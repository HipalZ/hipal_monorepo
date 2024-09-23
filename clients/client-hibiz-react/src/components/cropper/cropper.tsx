import {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
  memo,
  useCallback,
} from "react";
import Cropper from "react-easy-crop";
import { useCroppedImage } from "@/components/store/useCroppedImage";

// Function to crop the image using canvas
const cropImage = (
  imageSrc,
  pixelCrop,
  mimeType = "image/webp",
  quality = 0.9,
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to create canvas context"));
        return;
      }

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // Draw the image onto the canvas
      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      // Convert the canvas into a data URL
      resolve(canvas.toDataURL(mimeType, quality));
    };

    img.onerror = (error) => reject(error);
  });
};

const MemoReactCropperEasy = forwardRef(({ image }, ref) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const setCroppedImage = useCroppedImage((state) => state.setCroppedImage);

  // Called when crop is complete
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels); // Store the cropped area pixels
  }, []);

  // Expose the cropping logic to the parent component
  useImperativeHandle(ref, () => ({
    getCroppedImage: async () => {
      if (!croppedAreaPixels) return;

      try {
        const croppedDataUrl = await cropImage(image, croppedAreaPixels);
        setCroppedImage(croppedDataUrl); // Set the cropped image to the store
        return croppedDataUrl;
      } catch (error) {
        console.error("Error cropping image:", error);
      }
    },
  }));

  return (
    <div
      className="crop-container"
      style={{ position: "relative", width: "100%", height: "400px" }}
    >
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={1} // For a 1:1 aspect ratio (square crop)
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />
    </div>
  );
});

const ReactCropperEasy = memo(MemoReactCropperEasy);
export default ReactCropperEasy;
