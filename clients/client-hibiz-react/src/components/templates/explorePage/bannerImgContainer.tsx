import PlusButton from "@/components/atom/plusButton";
import { useBannerStore } from "@/components/store/useBannerStore";
import { cn, handleClick } from "@/components/utils/helper";
import { memo, useCallback, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import {
  preDefinedColors,
  useCustomColor,
  useHeadingChange,
  useImageChange,
  useParagraphChange,
  useRemoveImage,
} from "./bannerHelpers";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import { TfiPaintBucket } from "react-icons/tfi";
import { CiNoWaitingSign } from "react-icons/ci";
import SubHeader from "@/components/atom/subHeader";

const MemoBannerImgContainer = () => {
  const { onlyImage } = useBannerStore((s) => ({
    onlyImage: s.onlyImage,
  }));
  const {
    img,
    heading,
    paragraph,
    paragraphStyle,
    selectedColor,
    setColorWheelBackground,
    colorWheelBackground,
    colorWheelParagraph,
    setColorWheelParagraph,
  } = useBannerTemp((s) => ({
    img: s.img,
    heading: s.heading,
    paragraph: s.paragraph,
    setParagraphStyle: s.setParagraphStyle,
    paragraphStyle: s.paragraphStyle,
    setSelectedColor: s.setSelectedColor,
    selectedColor: s.selectedColor,
    setButtonStyle: s.setButtonStyle,
    setColorWheelBackground: s.setColorWheelBackground,
    colorWheelBackground: s.colorWheelBackground,
    colorWheelParagraph: s.colorWheelParagraph,
    setColorWheelParagraph: s.setColorWheelParagraph,
  }));
  const bannerRef = useRef<HTMLInputElement | null>(null);
  const { isPatternExists } = useBannerStore((s) => ({
    isPatternExists: s.isPatternExists,
  }));
  const { handleRemoveImage } = useRemoveImage();
  const { handleImageChange } = useImageChange();
  const { handleCustomColor } = useCustomColor();
  const { handleHeadingChange } = useHeadingChange();
  const { handleParagraphChange } = useParagraphChange();

  const handleParagraphColor = useCallback(() => {
    setColorWheelParagraph(!colorWheelParagraph);
  }, [colorWheelParagraph]);

  return (
    <section className="mt-[18rem] lg:mt-16 mx-4 md:mt-[30rem]">
      <SubHeader text="Banner Details" />
      <section className="w-full bg-white rounded-2xl">
        <section className="flex items-center justify-between flex-1 p-4 mt-4 space-x-4 md:justify-start">
          <section className="flex gap-4 md:gap-6">
            {isPatternExists ? null : (
              <article>
                <h1 className="mb-2 text-gray-500">Image</h1>
                <article
                  className={cn(
                    "shrink-0 relative rounded-xl h-[6rem] w-[6rem] md:h-[8rem] md:w-[8rem] inline-block",
                    img ? "" : "border-dashed border-2 border-[#8C63FF]",
                  )}
                >
                  <input
                    ref={bannerRef}
                    onClick={(e) => handleClick(e, bannerRef)}
                    type="file"
                    id="logoBanner"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                    data-type="logo"
                  />
                  <label
                    htmlFor="logoBanner"
                    className="relative flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl"
                  >
                    {img ? (
                      <>
                        <img src={img} alt="Logo" />
                        <button
                          type="button"
                          className="absolute p-0.5 bg-white backdrop-blur-3xl rounded-full top-1 right-1"
                          onClick={handleRemoveImage}
                        >
                          <FaTimes size={12} />
                        </button>
                      </>
                    ) : (
                      <PlusButton />
                    )}
                  </label>
                </article>
              </article>
            )}
            {onlyImage ? null : (
              <article>
                <h1 className="mb-2 text-gray-500">Banner Color</h1>
                <article
                  onClick={() => setColorWheelBackground(!colorWheelBackground)}
                  style={{
                    background: selectedColor.bgColor || "transparent",
                    border:
                      selectedColor.bgColor === "transparent" ||
                      selectedColor.bgColor === ""
                        ? "2px dashed #8C63FF"
                        : "1px solid black",
                  }}
                  className={cn(
                    "relative px-3 py-2 rounded-full h-[6rem] w-[6rem] md:h-[8rem] md:w-[8rem] flex justify-center items-center",
                  )}
                >
                  <PlusButton />
                  <span className="absolute px-4 py-2 bg-white border border-black rounded-full border-1 -bottom-4">
                    <TfiPaintBucket size={16} />
                  </span>
                </article>
              </article>
            )}
            {onlyImage ? null : (
              <section className="mb-4">
                <h1 className="mb-2 text-gray-500">Colors</h1>
                <article className="grid grid-cols-2 gap-4">
                  {preDefinedColors.map((color) => {
                    return (
                      <article
                        key={color}
                        onClick={() => handleCustomColor("banner", color)}
                        onKeyDown={() => handleCustomColor("banner", color)}
                        style={{
                          background: color === "transparent" ? "none" : color,
                          border: "1px solid",
                        }}
                        className="w-8 h-8 rounded-full"
                      >
                        {color === "transparent" && (
                          <span className="flex items-center justify-center w-full h-full text-xs text-center border rounded-full border-1">
                            <CiNoWaitingSign size={20} />
                          </span>
                        )}
                      </article>
                    );
                  })}
                </article>
              </section>
            )}
          </section>
        </section>
        {onlyImage ? null : (
          <article>
            <section className="m-4">
              <div className="relative">
                <input
                  maxLength={20}
                  type="text"
                  className="w-full rounded-2xl"
                  value={heading}
                  onChange={handleHeadingChange}
                  placeholder="Heading"
                />
                <small className="absolute text-gray-700 bottom-3 right-2">
                  {heading?.length || 0}/20
                </small>
              </div>
            </section>
            <section className="m-4">
              <div className="relative">
                <textarea
                  maxLength={70}
                  className="w-full h-24 resize-none rounded-2xl"
                  value={paragraph}
                  onChange={handleParagraphChange}
                  placeholder="Description"
                />
                <small className="absolute text-gray-700 bottom-4 right-2">
                  {paragraph?.length || 0}/70
                </small>
              </div>
            </section>
          </article>
        )}
      </section>
      {onlyImage ? null : (
        <article className="flex justify-around pt-4 bg-white rounded-t-2xl md:justify-start md:pl-6 md:gap-16">
          <h1 className="text-gray-500">Text Color</h1>
          <h1 className="text-gray-500">Colors</h1>
        </article>
      )}
      {onlyImage ? null : (
        <section className="rounded-b-2xl flex items-center justify-around md:justify-start bg-white pb-[2rem] p-4 md:gap-4">
          <section>
            <article
              onClick={handleParagraphColor}
              onKeyDown={handleParagraphColor}
              style={{
                background: paragraphStyle?.color || "transparent",
                border:
                  paragraphStyle?.color === "transparent"
                    ? "2px dashed #8C63FF"
                    : "1px solid black",
              }}
              className={cn(
                "relative px-3 py-2 rounded-full h-[6rem] w-[6rem] md:h-[8rem] md:w-[8rem] flex justify-center items-center",
                paragraphStyle?.color?.length
                  ? ""
                  : "border-dashed border-2  border-[#8C63FF]",
              )}
            >
              <PlusButton />
              <span className="absolute px-4 py-2 bg-white border border-black rounded-full border-1 -bottom-4">
                <TfiPaintBucket size={16} />
              </span>
            </article>
          </section>
          <article className="grid grid-cols-2 gap-4">
            {preDefinedColors.map((color) => {
              return (
                <article
                  key={color}
                  onClick={() => handleCustomColor("paragraph", color)}
                  onKeyDown={() => handleCustomColor("paragraph", color)}
                  style={{ background: color }}
                  className="w-8 h-8 rounded-full border border-1 border-[#000]"
                >
                  {color === "transparent" && (
                    <span className="flex items-center justify-center w-full h-full text-xs text-center border rounded-full border-1">
                      <CiNoWaitingSign size={20} />
                    </span>
                  )}
                </article>
              );
            })}
          </article>
        </section>
      )}
      <article className="flex-2" />
    </section>
  );
};

const BannerImgContainer = memo(MemoBannerImgContainer);
export default BannerImgContainer;
