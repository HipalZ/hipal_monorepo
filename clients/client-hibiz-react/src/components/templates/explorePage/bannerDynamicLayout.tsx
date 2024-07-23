import { useBannerStore } from "@/components/store/useBannerStore";
import {
  bannerLayouts,
  bannerLayouts2,
  bannerLayouts3,
  bannerLayouts4,
  bannerLayouts5,
  bannerLayouts6,
  truncateDescription,
  BannerType,
} from "@hi/common/src/bannerLayouts";
import { type CSSProperties, memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import type { IBannerPayload } from "@/components/types/businessData";
import pastaDummy from "@/assets/pastaDummy.png";

interface Props {
  heading?: string;
  paragraph?: string;
  callToAction?: string;
  img?: { logo: string };
  selectedColor?: { bgColor: string; textColor: string };
  paragraphStyle?: CSSProperties;
  buttonStyle?: { color: string; buttonColor?: string };
  handleEditBanner?: (banner: IBannerPayload) => void;
  layoutId?: string;
}
const MemoBannerDynamicLayout = (props: Props) => {
  const {
    heading,
    paragraph,
    callToAction,
    img,
    selectedColor,
    paragraphStyle,
    buttonStyle,
    handleEditBanner,
    layoutId,
  } = props;

  const { selectedBannerType } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
  }));

  return (
    <>
      {bannerLayouts.map((layout) => {
        if (layout?._id !== selectedBannerType) return null;
        return (
          <div
            className="flex flex-col"
            key={layout?._id}
            onClick={() => handleEditBanner(layoutId)}
          >
            <article key={layout?._id} className="max-h-[12rem] shadow-2xl">
              <figure className="w-full rounded-2xl">
                <img
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-t-xl w-[14rem] h-[10rem]"
                />
              </figure>
              <article
                style={{
                  backgroundColor: selectedColor?.bgColor || "white",
                }}
                className="w-full max-w-[14rem] px-2 py-0.5 rounded-b-xl h-[3.5rem] shadow-2xl"
              >
                <div className="flex items-start justify-between">
                  <h1 style={paragraphStyle} className="text-[0.85rem]">
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={{
                        backgroundColor: buttonStyle?.color || "red",
                      }}
                      className="flex items-center px-1 mb-1 text-[0.8rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
                    >
                      <button type="button">{callToAction || "Explore"}</button>{" "}
                      <span className="text-[0.6rem]">
                        <LuArrowUpRight />
                      </span>
                    </div>
                  )}
                </div>
                <p
                  style={{
                    WebkitLineClamp: 2,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    ...paragraphStyle,
                  }}
                  className="text-[0.5rem]"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
              </article>
            </article>
          </div>
        );
      })}
      {bannerLayouts2.map((layout) => {
        if (layout?._id !== selectedBannerType) return null;
        return (
          <section key={layout?._id}>
            <article className="relative flex justify-start shrink-0">
              <figure className="w-full max-h-[12rem] rounded-2xl">
                <img
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[13rem] w-[13rem] bg-cover aspect-square"
                />
              </figure>
              <article
                style={{
                  backgroundColor: selectedColor?.bgColor || "white",
                }}
                className="absolute -bottom-2 mx-2 px-2 py-1 rounded-xl h-[3rem]"
              >
                <div className="flex justify-between">
                  <h1
                    style={paragraphStyle}
                    className="text-[0.85rem] truncate"
                  >
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={{
                        backgroundColor: buttonStyle?.color || "red",
                      }}
                      className="flex items-center bg-red-700 px-1 pb-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
                    >
                      <button type="button">{callToAction || "Explore"}</button>{" "}
                      <span className="text-[0.6rem]">
                        <LuArrowUpRight />
                      </span>
                    </div>
                  )}
                </div>
                <p
                  style={{
                    WebkitLineClamp: 1,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    ...paragraphStyle,
                  }}
                  className="text-[0.5rem] mt-1"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
              </article>
            </article>
          </section>
        );
      })}
      {bannerLayouts3.map((layout) => {
        if (layout?._id !== selectedBannerType) return null;
        return (
          <section key={layout?._id}>
            <article className="relative flex justify-center shrink-0 max-w-[12rem] ">
              <figure className="w-full max-w-[14rem] rounded-2xl max-h-[12rem] ">
                <img
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl aspect-square h-[12rem] bg-cover"
                />
              </figure>
              <article
                style={{
                  background: `linear-gradient(to bottom, transparent 10%, ${
                    selectedColor?.bgColor ? selectedColor?.bgColor : "black"
                  } 90%)`,
                }}
                className="absolute bottom-0 w-full p-2 rounded-xl h-[3rem]"
              >
                <div className="flex justify-between">
                  <h1
                    style={paragraphStyle}
                    className="text-[0.7rem] truncate text-white"
                  >
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={{
                        backgroundColor: buttonStyle?.color || "red",
                      }}
                      className="flex items-center border border-1 px-1 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
                    >
                      <button type="button">{callToAction || "Explore"}</button>{" "}
                      <span className="text-[0.6rem]">
                        <LuArrowUpRight />
                      </span>
                    </div>
                  )}
                </div>
                <p
                  style={{
                    WebkitLineClamp: 1,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    ...paragraphStyle,
                  }}
                  className="text-[0.5rem] text-white"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
              </article>
            </article>
          </section>
        );
      })}
      {bannerLayouts4.map((layout) => {
        if (layout?._id !== selectedBannerType) return null;
        return (
          <section key={layout?._id}>
            <article className="relative flex justify-center shrink-0 max-w-[12rem]">
              <figure className="w-full max-w-[12rem] rounded-2xl">
                <img
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[12rem] aspect-square bg-cover"
                />
              </figure>
              <article
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 10% , black 50%, transparent 80%)",
                }}
                className="bg-black absolute bottom-1/2 translate-y-1/2 w-full flex flex-col items-center justify-center p-2 rounded-xl h-[7rem]"
              >
                <h1
                  style={paragraphStyle}
                  className="text-[0.7rem] truncate text-white"
                >
                  {heading ? truncateDescription(heading) : "Heading"}
                </h1>
                <p
                  style={{
                    WebkitLineClamp: 1,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    ...paragraphStyle,
                  }}
                  className="text-[0.5rem] text-white bg-opacity-50"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div
                    style={{
                      backgroundColor: buttonStyle?.color || "red",
                    }}
                    className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
                  >
                    <button
                      style={{
                        border: `1px solid ${
                          buttonStyle?.color || selectedColor?.textColor
                        }`,
                      }}
                      type="button"
                    >
                      {callToAction || "Explore"}
                    </button>{" "}
                    <span className="text-[0.6rem]">
                      <LuArrowUpRight />
                    </span>
                  </div>
                )}
              </article>
            </article>
          </section>
        );
      })}
      {bannerLayouts5.map((layout) => {
        if (layout?._id !== selectedBannerType) return null;
        return (
          <section key={layout?._id}>
            <article className="relative flex justify-center shrink-0 max-w-[12rem]">
              <figure className="w-full max-w-[12rem] rounded-2xl">
                <img
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[12rem] aspce-square bg-cover"
                />
              </figure>
              <article
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 10% , black 50%, transparent 80%)",
                }}
                className="absolute top-0 flex flex-col items-start justify-center w-full p-2 bg-black rounded-xl"
              >
                <h1
                  style={paragraphStyle}
                  className="text-[0.7rem] truncate text-white"
                >
                  {heading ? truncateDescription(heading) : "Heading"}
                </h1>
                <p
                  style={{
                    WebkitLineClamp: 1,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    ...paragraphStyle,
                  }}
                  className="text-[0.5rem] text-white bg-opacity-50"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div
                    style={{
                      backgroundColor: buttonStyle?.color || "red",
                    }}
                    className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
                  >
                    <button
                      style={{
                        border: `1px solid ${
                          buttonStyle?.color || selectedColor?.textColor
                        }`,
                      }}
                      type="button"
                    >
                      {callToAction || "Explore"}
                    </button>{" "}
                    <span className="text-[0.6rem]">
                      <LuArrowUpRight />
                    </span>
                  </div>
                )}
              </article>
            </article>
          </section>
        );
      })}
      {bannerLayouts6.map((layout) => {
        if (layout?._id !== selectedBannerType) return null;
        const color =
          layout?._id === BannerType.BANNER_TYPE_12 ? "#678BFF" : "#E03030";
        const patternColor = "#00000050";
        return (
          <section key={layout?._id} className="w-[14rem] h-[14rem]">
            <article
              className="relative h-[14rem] max-w-[14rem] rounded-xl"
              style={{ backgroundColor: selectedColor?.bgColor || color }}
            >
              <figure className="absolute top-2 left-2">
                {layout?.isPattern && <layout.pattern color={patternColor} />}
              </figure>
              <figure className="absolute -rotate-180 bottom-2 right-2">
                {layout?.isPattern && <layout.pattern color={patternColor} />}
              </figure>
              <article className="absolute flex flex-col items-center justify-center w-full p-2 translate-y-1/2 bottom-1/2 rounded-xl">
                <h1
                  style={paragraphStyle}
                  className="text-[0.7rem] truncate text-white"
                >
                  {heading ? truncateDescription(heading) : "Heading"}
                </h1>
                <p
                  style={{
                    WebkitLineClamp: 3,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    ...paragraphStyle,
                  }}
                  className="text-[0.5rem] text-white bg-opacity-50"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div
                    style={{
                      backgroundColor: buttonStyle?.color || "red",
                      color: buttonStyle?.buttonColor || "white",
                    }}
                    className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] rounded-full space-x-0.5 scale-75 -mr-1"
                  >
                    <button
                      style={{
                        border: `1px solid ${
                          buttonStyle?.color || selectedColor?.textColor
                        }`,
                      }}
                      type="button"
                    >
                      {callToAction || "Explore"}
                    </button>{" "}
                    <span className="text-[0.6rem]">
                      <LuArrowUpRight />
                    </span>
                  </div>
                )}
              </article>
            </article>
          </section>
        );
      })}
    </>
  );
};

const BannerDynamicLayout = memo(MemoBannerDynamicLayout);
export default BannerDynamicLayout;
