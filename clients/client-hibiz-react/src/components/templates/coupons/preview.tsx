"use client";
import { memo, useRef, useState, useCallback, lazy, Suspense } from "react";
import { cn } from "@hi/common";
import useCouponsStore from "@/components/store/useCouponsStore";
import { FaPlus, FaTimes } from "react-icons/fa";
import { compressImage } from "@/components/utils/helper";
import useMenuPageStore from "@/components/store/useMenuStorage";
import Cropper from "react-easy-crop";
import LoadingSpinner from "@/components/atom/loadingSpinner";
const Background = lazy(() => import("@/components/atom/feildBackground"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const AfterGrabbingCoupon = lazy(
  () => import("./previewTypes/afterGrabbingCard"),
);

const MemoPreview = () => {
  const { bgColor, setBgColor, couponImage, setCouponImage, setSelectedPage } =
    useCouponsStore((s) => ({
      bgColor: s.bgColor,
      setBgColor: s.setBgColor,
      couponImage: s.couponImage,
      setCouponImage: s.setCouponImage,
      setSelectedPage: s.setSelectedPage,
    }));

  const { setSelectedFile } = useMenuPageStore((s) => ({
    setSelectedFile: s.setSelectedFile,
  }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (compressedFile: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageSrc(reader.result as string);
          setIsCropping(true);
        };
        reader.readAsDataURL(compressedFile);
      });
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = (imageSrc, croppedAreaPixels) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const { width, height } = croppedAreaPixels;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          width,
          height,
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const file = new File([blob], "croppedImage.jpeg", {
            type: "image/jpeg",
          });
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            resolve({ base64: reader.result, file });
          };
        }, "image/jpeg");
      };
      image.onerror = (err) => reject(err);
    });
  };

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

  const removeImage = useCallback(() => {
    setCouponImage("");
    setSelectedFile(null);
  }, [couponImage]);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <Suspense fallback={<LoadingSpinner />}>
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
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  minZoom={1}
                  maxZoom={3}
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
              accept="image/jpeg, image/png, image/heif, image/heic"
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
    </Suspense>
  );
};

const Preview = memo(MemoPreview);
export default Preview;
