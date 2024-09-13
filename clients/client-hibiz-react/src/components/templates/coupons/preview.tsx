"use client";
import { memo, useRef } from "react";
import { cn } from "@hi/common";
import useCouponsStore from "@/components/store/useCouponsStore";
import Background from "@/components/atom/feildBackground";
import { FaPlus, FaTimes } from "react-icons/fa";
import BottomButton from "@/components/atom/bottomButton";
import AfterGrabbingCoupon from "./previewTypes/afterGrabbingCard";

const MemoPreview = () => {
  const { bgColor, setBgColor, couponImage, setCouponImage, setSelectedPage } =
    useCouponsStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCouponImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCouponImage("");
  };
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

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            ref={fileInputRef}
          />
        </div>
      </Background>
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
    </section>
  );
};

const Preview = memo(MemoPreview);
export default Preview;
