"use client";
import { memo, useRef, useState, useCallback } from "react";
import { cn } from "@hi/common";
import useCouponsStore from "@/components/store/useCouponsStore";
import Background from "@/components/atom/feildBackground";
import { FaPlus, FaTimes } from "react-icons/fa";
import BottomButton from "@/components/atom/bottomButton";
import AfterGrabbingCoupon from "./previewTypes/afterGrabbingCard";
import { compressImage } from "@/components/utils/helper";
import useMenuPageStore from "@/components/store/useMenuStorage";
import Cropper from "react-easy-crop";

const MemoPreview = () => {
  const { bgColor, setBgColor, couponImage, setCouponImage, setSelectedPage } =
    useCouponsStore((s) => ({
      bgColor: s.bgColor,
      setBgColor: s.setBgColor,
      couponImage: s.couponImage,
      setCouponImage: s.setCouponImage,
      setSelectedPage: s.setSelectedPage,
    }));

  const { selectedFile, setSelectedFile } = useMenuPageStore((s) => ({
    selectedFile: s.selectedFile,
    setSelectedFile: s.setSelectedFile,
  }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State variables for cropping
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  // Handle image upload and compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (compressedFile: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageSrc(reader.result as string); // For cropping
          setIsCropping(true); // Show cropper
        };
        reader.readAsDataURL(compressedFile);
      });
    }
  };

  // Handle crop completion
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Create image for cropping
  const createImage = (url) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.setAttribute("crossOrigin", "anonymous");
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });

  // Get cropped image
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    // Return both the base64 string and the file
    return new Promise<{ base64: string; file: File }>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "croppedImage.jpeg", {
              type: "image/jpeg",
            });
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              resolve({ base64: base64data, file });
            };
            reader.readAsDataURL(file);
          } else {
            reject(new Error("Canvas is empty"));
          }
        },
        "image/jpeg",
        1,
      );
    });
  };

  // Show cropped image and update state
  const showCroppedImage = useCallback(async () => {
    try {
      const { base64, file } = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCouponImage(base64);
      setSelectedFile(file);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  // Remove image
  const removeImage = () => {
    setCouponImage("");
    setSelectedFile(null);
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <section
      style={{
        backgroundColor: bgColor || "#9267EC",
      }}
      className={cn(
        "overflow-y-auto pb-[10rem] relative flex flex-col lg:flex-row gap-0 lg:gap-6 items-center lg:items-start justify-center",
      )}
    >
      <AfterGrabbingCoupon />
      <Background className="w-[90%] mx-4 max-w-[24rem] lg:mt-12">
        <div className="mt-2">
          <h3 className="text-lg font-semibold">Select Background Color</h3>
          <div className="flex justify-between gap-4 mt-4">
            {["#FFC93C", "#67A5EC", "#9267EC", "#EC678D", "#70EC67"].map(
              (color) => (
                <button
                  type="button"
                  key={color}
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: color }}
                  onClick={() => setBgColor(color)}
                />
              ),
            )}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="mb-4 text-lg font-semibold">Upload Coupon Image</h3>
          {isCropping && imageSrc ? (
            <div
              className="cropper-container"
              style={{ position: "relative", width: "100%", height: "300px" }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          ) : (
            <article
              className={cn(
                "h-[10rem] w-full rounded-xl flex justify-center items-center relative",
                couponImage
                  ? "border-none"
                  : "border-2 border-black border-dashed",
              )}
              style={{
                backgroundImage: couponImage ? `url(${couponImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: `${bgColor}20`,
              }}
              onClick={triggerFileInput}
            >
              {!couponImage && (
                <FaPlus
                  style={{
                    color: bgColor || "#9267EC",
                  }}
                  className="text-xl"
                />
              )}
              {couponImage && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute p-1 text-white bg-black rounded-full top-2 right-2"
                >
                  <FaTimes />
                </button>
              )}
            </article>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            ref={fileInputRef}
          />
        </div>
      </Background>
      {isCropping ? (
        <BottomButton
          fixed
          buttons={[
            {
              text: "Back",
              onClick: () => setIsCropping(false),
            },
            {
              text: "Save",
              onClick: showCroppedImage,
            },
          ]}
        />
      ) : (
        <BottomButton
          fixed
          buttons={[
            {
              text: "Back",
              onClick: () => setSelectedPage("Terms"),
            },
            {
              text: "save & next",
              onClick: () => setSelectedPage("CUSTOM"),
            },
          ]}
        />
      )}
    </section>
  );
};

const Preview = memo(MemoPreview);
export default Preview;
