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
  bannerLayouts7,
  BannerType,
  truncateDescription,
} from "@/components/utils/bannerLayouts";
import { cn, hexToRGBA } from "@/components/utils/helper";
import { useIsExplorePage } from "@/hooks/useExplore";

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
    backgroundColor: buttonStyle?.color || "#808080",
    color: buttonStyle?.buttonColor || "white",
    background: `linear-gradient(137.02deg, ${
      buttonStyle?.color || "white"
    }80 1.64%,${buttonStyle?.color || "white"}30 98.36%)`,
  };

  const buttonOutlineStyleTags = {
    backgroundColor: "transparent",
    color: buttonStyle?.color || "white",
    border: `1px solid ${buttonStyle?.color || "white"}`,
  };

  const isExplorePage = useIsExplorePage();

  const paragraphPropsStyle = {
    color:
      paragraphStyle?.color === "transparent" ? "white" : paragraphStyle?.color,
  };

  return (
    <>
      {bannerLayouts.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <div
            className={cn(
              "flex flex-col shrink-0 relative",
              isExplorePage ? "h-full max-h-[12rem] w-[12rem]" : "",
              "border border-1 border-[#00000050]",
            )}
            key={layout?._id}
            onClick={
              isExplorePage ? undefined : () => handleEditBanner(banner || {})
            }
          >
            <article
              key={layout?._id}
              className={cn(isExplorePage ? "h-full max-h-[12rem]" : "")}
            >
              <figure>
                <img
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  className={cn(
                    "w-full rounded-t-xl h-full max-h-[8.3rem] object-cover object-top",
                    isExplorePage ? "h-full max-h-[8.5rem]" : "md:w-[15rem]",
                  )}
                />
              </figure>
            </article>
            <article
              style={{
                background: `linear-gradient(137.02deg, ${
                  selectedColor?.bgColor || "white"
                }80 1.64%,${selectedColor?.bgColor || "white"}30 98.36%)`,
              }}
              className={cn(
                "p-2 rounded-b-xl border border-[#000000]",
                isExplorePage
                  ? "max-w-[12rem] "
                  : "w-full md:max-w-[15rem] min-h-[3.7rem]",
              )}
            >
              <div className="flex justify-between ">
                <h1
                  style={paragraphPropsStyle}
                  className={cn(
                    "md:text-[1rem] leading-0 md:leading-5  truncate",
                    layout?.isButton ? "w-[70%]" : "w-[100%]",
                    isExplorePage
                      ? "text-[0.75rem]"
                      : "text-[0.75rem] md:text-[1rem]",
                  )}
                >
                  {heading ?? "Heading"}
                </h1>
                {layout?.isButton && (
                  <div
                    style={buttonStyleTags}
                    className="flex items-center px-2 py-0.5 text-[0.6rem] rounded-full space-x-0.5 scale-75 -mr-1"
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
                  ...paragraphPropsStyle,
                }}
                className="text-[0.5rem] leading-3 mt-0.5"
              >
                {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
              </p>
            </article>
          </div>
        );
      })}
      {bannerLayouts2.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        const backgroundColor =
          selectedColor?.bgColor === "transparent"
            ? "transparent"
            : selectedColor?.bgColor
              ? hexToRGBA(selectedColor.bgColor, 0.4)
              : "transparent";
        return (
          <section key={layout?._id} className="shrink-0 ">
            <article
              className="relative flex justify-center w-full"
              onClick={
                isExplorePage ? null : () => handleEditBanner(banner || {})
              }
            >
              <figure className="rounded-2xl">
                <img
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  className={cn(
                    "rounded-2xl w-[12rem] h-[12rem] object-cover object-top",
                    isExplorePage ? "" : "md:w-[15rem]",
                  )}
                />
              </figure>
              <article
                style={{
                  backgroundColor: backgroundColor,
                }}
                className={cn(
                  "absolute bottom-2 p-2 rounded-xl mx-2 backdrop-blur-sm",
                  isExplorePage
                    ? "w-[90%] max-w-[11rem] max-h-[12rem] md:max-w-[11rem]"
                    : "w-[92%] max-w-[10.5rem] md:max-w-[11.5rem] md:w-[11.5rem]",
                )}
              >
                <div className="flex justify-between">
                  <h1
                    style={paragraphPropsStyle}
                    className="text-[0.7rem] truncate"
                  >
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
                    ...paragraphPropsStyle,
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
          <section key={layout?._id} className="shrink-0 ">
            <article
              className="relative flex justify-center shrink-0 max-w-[13rem]"
              onClick={
                isExplorePage ? null : () => handleEditBanner(banner || {})
              }
            >
              <figure className="rounded-2xl max-h-[13rem] ">
                <img
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  className="rounded-xl h-[12rem] w-[13rem] object-cover object-top"
                />
              </figure>
              <article
                style={{
                  background:
                    selectedColor?.bgColor === "transparent"
                      ? null
                      : `linear-gradient(to bottom, transparent 10%, ${
                          selectedColor?.bgColor || "black"
                        }80 90%)`,
                }}
                className="absolute bottom-0 w-full p-2 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <h1
                    style={paragraphPropsStyle}
                    className="text-[0.7rem] truncate text-white mb-1"
                  >
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={buttonOutlineStyleTags}
                      className="flex items-center border border-1 px-2 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1"
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
                    ...paragraphPropsStyle,
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
          <article
            key={layout?._id}
            className="shrink-0 relative flex justify-center h-[12rem] max-w-[15rem]"
            onClick={
              isExplorePage ? null : () => handleEditBanner(banner || {})
            }
          >
            <figure className="max-w-[15rem] rounded-2xl">
              <img
                src={img?.logo || layout?.image}
                alt={layout?.title}
                className={cn(
                  "rounded-xl h-[12rem] object-cover object-top",
                  isExplorePage ? "w-[12rem] md:w-[13rem]" : " w-[15rem]",
                )}
              />
            </figure>
            <article
              style={{
                background:
                  selectedColor?.bgColor === "transparent"
                    ? null
                    : `linear-gradient(to bottom, transparent 10%, ${
                        selectedColor?.bgColor || "black"
                      }95 40%, transparent 90%)`,
              }}
              className="bg-black absolute bottom-1/2 translate-y-1/2 w-full max-w-[15rem] flex flex-col items-center justify-center p-2 rounded-xl h-[7rem]"
            >
              <h1
                style={paragraphPropsStyle}
                className="text-[0.7rem] truncate text-white"
              >
                {heading ? truncateDescription(heading) : "Heading"}
              </h1>
              <p
                style={{
                  WebkitLineClamp: 2,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  ...paragraphPropsStyle,
                }}
                className="text-[0.5rem] text-white bg-opacity-50"
              >
                {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
              </p>
              {layout?.isButton && (
                <div
                  style={buttonOutlineStyleTags}
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
        );
      })}
      {bannerLayouts5.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <article
            key={layout?._id}
            className="relative flex justify-center shrink-0 max-w-[15rem]"
            onClick={
              isExplorePage ? null : () => handleEditBanner(banner || {})
            }
          >
            <figure className="w-full max-w-[15rem] rounded-2xl">
              <img
                src={img?.logo || layout?.image}
                alt={layout?.title}
                className={cn(
                  "rounded-xl h-[12rem] object-cover object-top",
                  isExplorePage ? "w-[12rem] " : "w-[15rem] ",
                )}
              />
            </figure>
            <article
              style={{
                background:
                  selectedColor?.bgColor === "transparent"
                    ? null
                    : `linear-gradient(to top, transparent 10%, ${
                        selectedColor?.bgColor || "black"
                      } 90%)`,
              }}
              className="absolute top-0 flex flex-col items-start justify-center w-full p-2 bg-black rounded-xl"
            >
              <h1
                style={paragraphPropsStyle}
                className="text-[0.7rem] truncate text-white"
              >
                {heading ? truncateDescription(heading) : "Heading"}
              </h1>
              <p
                style={{
                  WebkitLineClamp: 2,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  ...paragraphPropsStyle,
                }}
                className="text-[0.5rem] text-white bg-opacity-50"
              >
                {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
              </p>
              {layout?.isButton && (
                <div
                  style={buttonOutlineStyleTags}
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
            className={cn(
              isExplorePage
                ? "h-[12rem] aspect-square lg:max-w-[12rem] shrink-0"
                : "flex-1 flex-shrink-0 w-full md:max-w-[13rem] h-[13rem]",
            )}
          >
            <article
              className={cn(
                "relative w-full h-full rounded-xl",
                isExplorePage
                  ? ""
                  : "min-h-[11rem] max-h-[12rem] max-w-[13rem] ",
              )}
              onClick={
                isExplorePage ? null : () => handleEditBanner(banner || {})
              }
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
                  style={paragraphPropsStyle}
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
                    ...paragraphPropsStyle,
                  }}
                  className="text-[0.5rem] text-white bg-opacity-50 text-justify"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div
                    style={buttonOutlineStyleTags}
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
      {bannerLayouts7.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <section
            key={layout?._id}
            className="border border-1 border-[#000] rounded-2xl overflow-hidden shrink-0 max-w-[13rem]"
            onClick={
              isExplorePage ? null : () => handleEditBanner(banner || {})
            }
          >
            <img
              src={img?.logo || layout?.image}
              alt={layout?.title}
              className="w-full h-[12rem] object-cover object-top"
            />
          </section>
        );
      })}
    </>
  );
};

const CreatedBannersLayouts = memo(MemoCreatedBannersLayout);
export default CreatedBannersLayouts;
