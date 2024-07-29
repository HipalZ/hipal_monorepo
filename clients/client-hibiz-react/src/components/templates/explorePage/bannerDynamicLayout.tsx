import { useBannerStore } from "@/components/store/useBannerStore";
import { type CSSProperties, memo } from "react";
import {
  bannerLayouts,
  bannerLayouts2,
  bannerLayouts3,
  bannerLayouts4,
  bannerLayouts5,
  bannerLayouts6,
  BannerType,
  truncateDescription,
} from "@/components/utils/bannerLayouts";
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

  const buttonStyleTags = {
    backgroundColor: buttonStyle?.color || "red",
    color: buttonStyle?.buttonColor || "black",
  };

  const buttonOutlineStyleTags = {
    backgroundColor: "transparent",
    color: buttonStyle?.color || "black",
    border: `1px solid ${buttonStyle?.color || "black"}`,
  };

  const buttonClassNames =
    "flex items-center px-2 py-1 text-[0.7rem] text-white rounded-full space-x-0.5 scale-75 -mr-1";

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
            <article key={layout?._id} className="shadow-2xl">
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
                className="w-full rounded-b-xl max-w-[14rem] px-2 py-0.5 h-[3.5rem]"
              >
                <div className="flex items-start justify-between">
                  <h1 style={paragraphStyle} className="text-[1rem] truncate">
                    {heading ?? "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div style={buttonStyleTags} className={buttonClassNames}>
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
              <figure className="w-full rounded-2xl">
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
                className="absolute bottom-2 mx-2 px-2 py-1 rounded-xl w-[90%]"
              >
                <div className="flex justify-between w-full">
                  <h1
                    style={paragraphStyle}
                    className="text-[1rem] truncate w-2/3"
                  >
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div style={buttonStyleTags} className={buttonClassNames}>
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
                  className="text-[0.8rem]"
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
            <article className="relative flex justify-center shrink-0 max-w-[14rem] ">
              <figure className="w-full max-w-[14rem] rounded-2xl max-h-[14rem] ">
                <img
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl aspect-square h-[14rem] bg-cover"
                />
              </figure>
              <article
                style={{
                  background: `linear-gradient(to bottom, transparent 10%, ${
                    selectedColor?.bgColor ? selectedColor?.bgColor : "black"
                  } 90%)`,
                }}
                className="absolute bottom-0 w-full p-2 pb-6 rounded-xl"
              >
                <div className="flex justify-between">
                  <h1
                    style={paragraphStyle}
                    className="text-[1rem] truncate text-white"
                  >
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={buttonOutlineStyleTags}
                      className={buttonClassNames}
                    >
                      <button type="button">{callToAction || "Explore"}</button>{" "}
                      <span className="text-[0.8rem]">
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
                  className="text-[0.8rem] text-white -mb-4"
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
            <article className="relative flex justify-center shrink-0 max-w-[14rem]">
              <figure className="w-full max-w-[14rem] rounded-2xl">
                <img
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[14rem] aspect-square bg-cover"
                />
              </figure>
              <article
                style={{
                  background: `linear-gradient(to bottom, transparent 10%, ${
                    selectedColor?.bgColor ? selectedColor?.bgColor : "black"
                  } 50%, transparent 90%)`,
                }}
                className="bg-black absolute bottom-1/2 translate-y-1/2 w-full flex flex-col items-center justify-center p-2 rounded-xl h-[10rem]"
              >
                <h1
                  style={paragraphStyle}
                  className="text-[1rem] truncate text-white"
                >
                  {heading ? truncateDescription(heading) : "Heading"}
                </h1>
                <p
                  style={{
                    WebkitLineClamp: 2,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    ...paragraphStyle,
                  }}
                  className="text-[0.8rem] text-white bg-opacity-50"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div
                    style={buttonOutlineStyleTags}
                    className={buttonClassNames}
                  >
                    <button type="button">{callToAction || "Explore"}</button>{" "}
                    <span className="text-[0.8rem]">
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
                  className="rounded-xl h-[12rem] aspect-square bg-cover"
                />
              </figure>
              <article
                style={{
                  background: `linear-gradient(to top, transparent 10%, ${
                    selectedColor?.bgColor ? selectedColor?.bgColor : "black"
                  } 90%)`,
                }}
                className="absolute top-0 flex flex-col items-start justify-center w-full p-2 bg-black rounded-xl"
              >
                <h1
                  style={paragraphStyle}
                  className="text-[1rem] truncate text-white"
                >
                  {heading ? truncateDescription(heading) : "Heading"}
                </h1>
                <p
                  style={{
                    WebkitLineClamp: 2,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    ...paragraphStyle,
                  }}
                  className="text-[0.8rem] text-white bg-opacity-50"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div
                    style={buttonOutlineStyleTags}
                    className={`${buttonClassNames} -ml-2`}
                  >
                    <button type="button">{callToAction || "Explore"}</button>{" "}
                    <span className="text-[0.8rem]">
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
                  className="text-[1rem] truncate text-white"
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
                  className="text-[0.8rem] text-white bg-opacity-50"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div style={buttonStyleTags} className={buttonClassNames}>
                    <button type="button">{callToAction || "Explore"}</button>{" "}
                    <span className="text-[0.8rem]">
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
