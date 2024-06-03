import { useCroppedImage } from "@/components/store/useCroppedImage";
import React, { useRef } from "react";
import {
  FixedCropper,
  ImageRestriction,
  FixedCropperRef,
} from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";

export const ReactCropper = ({ image }: any) => {
  const setCroppedImage = useCroppedImage((s) => s.setCroppedImage);
  const cropImage = (imageSrc: any, coordinates: any) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // This enables CORS
      img.src = imageSrc;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = coordinates.width;
        canvas.height = coordinates.height;
        ctx &&
          ctx.drawImage(
            img,
            coordinates.left,
            coordinates.top,
            coordinates.width,
            coordinates.height,
            0,
            0,
            coordinates.width,
            coordinates.height
          );
        resolve(canvas.toDataURL());
      };
      img.onerror = (err) => {
        reject(err);
      };
    });
  };
  const cropperRef = useRef<FixedCropperRef>(null);
  const onChange = async (cropper: FixedCropperRef) => {
    const coordinates = cropper.getCoordinates();
    try {
      const croppedDataUrl = await cropImage(image, coordinates);
      if (typeof croppedDataUrl === "string") {
        setCroppedImage(croppedDataUrl);
      }
    } catch (err) {}
  };

  return (
    <>
      <FixedCropper
        ref={cropperRef}
        src={image}
        onChange={onChange}
        stencilProps={{
          movable: false,
          resizable: false,
        }}
        stencilSize={{
          width: 100,
          height: 100,
        }}
        imageRestriction={ImageRestriction.stencil}
      />
    </>
  );
};
