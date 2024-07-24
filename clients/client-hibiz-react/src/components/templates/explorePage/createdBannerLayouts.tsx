import { type CSSProperties, memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import type { IBannerPayload } from "@/components/types/businessData";
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

interface Props {
  heading?: string;
  paragraph?: string;
  callToAction?: string;
  img?: { logo: string };
  selectedColor?: { bgColor: string; textColor: string };
  paragraphStyle?: CSSProperties;
  buttonStyle?: { color: string; buttonColor?: string };
  handleEditBanner?: (banner: IBannerPayload) => void;
  selectedLayout?: string;
  banner?: IBannerPayload;
}
const MemoCreatedBannersLayout = (props: Props) => {
  const {
    heading,
    paragraph,
    callToAction,
    img,
    selectedColor,
    paragraphStyle,
    buttonStyle,
    handleEditBanner,
    selectedLayout,
    banner,
  } = props;

  const buttonStyleTags = {
    backgroundColor: buttonStyle?.color || "red",
    color: buttonStyle?.buttonColor || "white",
  };

  return (
    <>
      {bannerLayouts.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <div
            className="flex flex-col shrink-0"
            key={layout?._id}
            onClick={() => handleEditBanner(banner || {})}
          >
            <article key={layout?._id} className="max-h-[13rem]">
              <figure className="w-full rounded-2xl">
                <img
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  className="rounded-t-xl w-[12rem] h-[8.5rem]"
                />
              </figure>
              <article
                style={{
                  backgroundColor: selectedColor?.bgColor || "white",
                }}
                className="w-full max-w-[12rem] p-2 rounded-b-xl h-[3.5rem] shadow-2xl"
              >
                <div className="flex justify-between">
                  <h1 style={paragraphStyle} className="text-[0.7rem]">
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={buttonStyleTags}
                      className="flex items-center px-1 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
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
        if (layout?._id !== selectedLayout) return null;
        return (
          <section key={layout?._id} className="shrink-0">
            <article
              className="relative flex justify-center"
              onClick={() => handleEditBanner(banner)}
            >
              <figure className="w-full max-h-[12rem] rounded-2xl">
                <img
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  className="rounded-xl w-full h-[12rem] bg-cover aspect-square"
                />
              </figure>
              <article
                style={{
                  backgroundColor: selectedColor?.bgColor || "white",
                }}
                className="absolute bottom-2 w-[90%] max-h-[12rem] md:max-w-[11rem] p-2 rounded-xl h-[3rem]"
              >
                <div className="flex justify-between">
                  <h1 style={paragraphStyle} className="text-[0.7rem] truncate">
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={buttonStyleTags}
                      className="flex items-center bg-red-700 px-1 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
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
                  className="text-[0.5rem]"
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
        if (layout?._id !== selectedLayout) return null;
        return (
          <section key={layout?._id} className="shrink-0">
            <article
              className="relative flex justify-center shrink-0 max-w-[12rem] "
              onClick={() => handleEditBanner(banner)}
            >
              <figure className="w-full max-w-[14rem] rounded-2xl max-h-[12rem] ">
                <img
                  src={img?.logo || layout?.image}
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
                      style={buttonStyleTags}
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
        if (layout?._id !== selectedLayout) return null;
        return (
          <section key={layout?._id} className="shrink-0">
            <article
              className="relative flex justify-center max-w-[12rem]"
              onClick={() => handleEditBanner(banner || {})}
            >
              <figure className="w-[11rem] max-w-[12rem] rounded-2xl lg:max-w-[13rem]">
                <img
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  className="rounded-xl h-[12rem] aspect-square bg-cover"
                />
              </figure>
              <article
                style={{
                  background: `linear-gradient(to bottom, transparent 10%, ${
                    selectedColor?.bgColor ? selectedColor?.bgColor : "black"
                  } 50%, transparent 80%)`,
                }}
                className="bg-black absolute bottom-1/2 translate-y-1/2 w-full max-w-[11rem] flex flex-col items-center justify-center p-2 rounded-xl h-[7rem]"
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
                    style={buttonStyleTags}
                    className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
                  >
                    <button type="button">{callToAction || "Explore"}</button>{" "}
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
        if (layout?._id !== selectedLayout) return null;
        return (
          <section key={layout?._id} className="shrink-0">
            <article
              className="relative flex justify-center shrink-0 max-w-[12rem]"
              onClick={() => handleEditBanner(banner || {})}
            >
              <figure className="w-full max-w-[12rem] rounded-2xl">
                <img
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  className="rounded-xl h-[12rem] aspce-square bg-cover"
                />
              </figure>
              <article
                style={{
                  background: `linear-gradient(to bottom, transparent 10% , ${
                    selectedColor?.bgColor ? selectedColor?.bgColor : "black"
                  } 50%, transparent 80%)`,
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
                    style={buttonStyleTags}
                    className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
                  >
                    <button type="button">{callToAction || "Explore"}</button>{" "}
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
        if (layout?._id !== selectedLayout) return null;
        const color =
          layout?._id === BannerType.BANNER_TYPE_12 ? "#678BFF" : "#E03030";
        const patternColor = "#00000050";
        return (
          <section
            key={layout?._id}
            className="h-[12rem] aspect-square lg:max-w-[12rem] shrink-0"
          >
            <article
              className="relative w-full h-full min-h-[11rem] max-h-[12rem] lg:max-w-[12rem] w-full max-w-[12rem] rounded-xl"
              onClick={() => handleEditBanner(banner || {})}
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
                    style={buttonStyleTags}
                    className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] rounded-full space-x-0.5 scale-75 -mr-1"
                  >
                    <button type="button">{callToAction || "Explore"}</button>{" "}
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

const CreatedBannersLayouts = memo(MemoCreatedBannersLayout);
export default CreatedBannersLayouts;
