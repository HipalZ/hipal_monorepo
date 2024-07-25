import { useCroppedImage } from "@/components/store/useCroppedImage";
import { forwardRef, memo, useImperativeHandle, useRef } from "react";
import {
  Cropper,
  FixedCropper,
  type FixedCropperRef,
  ImageRestriction,
} from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";

const DEFAULT_MIME_TYPE = "image/webp";
const DEFAULT_QUALITY = 0.9;

export const cropImage = (
  imageSrc: string,
  coordinates,
  mimeType = DEFAULT_MIME_TYPE,
  quality = DEFAULT_QUALITY,
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = coordinates.width;
        canvas.height = coordinates.height;
        ctx.drawImage(
          img,
          coordinates.left,
          coordinates.top,
          coordinates.width,
          coordinates.height,
          0,
          0,
          coordinates.width,
          coordinates.height,
        );
        resolve(canvas.toDataURL(mimeType, quality));
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };

    img.onerror = (err) => {
      reject(err);
    };
  });
};

const MemoReactCropper = forwardRef(({ image, width, height }, ref) => {
  const setCroppedImage = useCroppedImage((s) => s.setCroppedImage);
  const cropperRef = useRef<FixedCropperRef>(null);

  useImperativeHandle(ref, () => ({
    getCoordinates: () => cropperRef.current?.getCoordinates(),
  }));

  const onChange = async (cropper) => {
    const coordinates = cropper.getCoordinates();
    try {
      const croppedDataUrl = await cropImage(image, coordinates);
      if (typeof croppedDataUrl === "string") {
        setCroppedImage(croppedDataUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="z-100 flex justify-center items-start lg:h-[600px] lg:w-full">
      <FixedCropper
        ref={cropperRef}
        src={image}
        onChange={onChange}
        stencilProps={{
          movable: false,
          resizable: true,
        }}
        stencilSize={{
          width: width ? width : 100,
          height: height ? height : 100,
        }}
        imageRestriction={ImageRestriction.stencil}
      />
    </section>
  );
});

const ReactCropper = memo(MemoReactCropper);
export default ReactCropper;
