import { memo, useRef, useState, useCallback, lazy, Suspense } from "react";
import { cn } from "@hi/common";
import useCouponsStore from "@/components/store/useCouponsStore";
import { FaTimes } from "react-icons/fa";
import { compressImage } from "@/components/utils/helper";

import useMenuPageStore from "@/components/store/useMenuStorage";
import Cropper from "react-easy-crop";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import PopUp from "@/components/atom/popUp";
import toast from "react-hot-toast";
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

  const goNext = useCallback(() => {
    if (!imageSrc && !couponImage) {
      return toast.error("Please select image before proceeding");
    }
    setSelectedPage("CUSTOM");
  }, [imageSrc]);

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
        <div className="relative">
          <AfterGrabbingCoupon />
          {!couponImage && (
            <MdOutlineAddPhotoAlternate
              onClick={triggerFileInput}
              size={42}
              className="absolute p-2 text-white bg-black rounded-full top-3 right-3"
            />
          )}
          {couponImage && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute p-2 text-xl text-white bg-black rounded-full top-3 right-3"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <Background className="w-[90%] mx-4 max-w-[24rem] lg:mt-12">
          <div className="mt-2">
            <h3 className="text-lg font-semibold opacity-60">
              Select Background Color
            </h3>
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
          <input
            type="file"
            accept="image/jpeg, image/png, image/heif, image/heic"
            onChange={handleImageUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <div className="flex items-center justify-between gap-4 mt-6">
            <h3 className="text-base font-semibold opacity-60">
              Upload Coupon Image
            </h3>
            <button
              className="bg-[#000000] px-3 py-2 rounded-full text-white text-sm"
              type="button"
              onClick={triggerFileInput}
            >
              + Upload Image
            </button>
          </div>
        </Background>
        {isCropping && (
          <PopUp show={isCropping} onClose={() => setIsCropping(false)}>
            <div
              className="cropper-container max-w-[20rem] mx-auto mt-[3rem] mb-[7rem]"
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
            <BottomButton
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
          </PopUp>
        )}

        <BottomButton
          fixed
          buttons={[
            {
              text: "Back",
              onClick: () => setSelectedPage("EXPIRED"),
            },
            {
              text: "save & next",
              onClick: goNext,
            },
          ]}
        />
      </section>
    </Suspense>
  );
};

const Preview = memo(MemoPreview);
export default Preview;
