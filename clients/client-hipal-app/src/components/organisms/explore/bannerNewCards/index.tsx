"use client";
import { type CSSProperties, memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import pastaDummy from "@/assets/pastaDummy.png";
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
import { cn } from "@hi/common";
import { useParams, useRouter } from "next/navigation";
import { useActiveClass } from "@/components/store/useActiveClass";
import ShimmerImage from "@/components/atoms/imageshimmer";
import useTableData from "@/components/store/useTableData";

interface Props {
  redirectionId?: string;
  heading?: string;
  paragraph?: string;
  callToAction?: string;
  img?: { logo: string };
  selectedColor?: { bgColor: string; textColor: string };
  paragraphStyle?: CSSProperties;
  buttonStyle?: { color: string; buttonColor?: string };
  selectedLayout?: string;
  redirectionName?: string;
  redirectionType?: string;
  center?: boolean;
}
const MemoBannersLayout = (props: Props) => {
  const {
    redirectionId,
    redirectionName,
    heading,
    paragraph,
    callToAction,
    img,
    selectedColor,
    paragraphStyle,
    buttonStyle,
    selectedLayout,
    redirectionType,
    center,
  } = props;

  const {
    setActiveType,
    setActiveCategory,
    setActiveChildCategory,
    setObserverActive,
  } = useActiveClass((s) => ({
    setActiveType: s.setActiveType,
    setActiveCategory: s.setActiveCategory,
    setActiveChildCategory: s.setActiveChildCategory,
    setObserverActive: s.setObserverActive,
  }));
  const tableName = useTableData((s) => s.tableName);

  const buttonStyleTags = {
    backgroundColor:
      buttonStyle?.color === "transparent"
        ? "transparent"
        : buttonStyle?.color || "#808080",
    color: buttonStyle?.buttonColor || "black",
  };
  const buttonOutlineStyleTags = {
    backgroundColor: "transparent",
    color: buttonStyle?.color || "white",
    border: `1px solid ${buttonStyle?.color || "white"}`,
    transition: "background-color 300ms ease, color 300ms ease",
  };

  const defaultButtonStyle =
    "px-2.5 h-6 -mt-[0.125rem] flex items-center transition-all duration-300 ease-in-out transform shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 text-[0.7rem] text-white rounded-full space-x-0.5 -mr-1";

  const router = useRouter();
  const customLink = useParams()?.businessId;
  const handleNavigation = (
    id: string,
    redirectionName: string,
    redirectionType: string,
  ) => {
    console.log("id", id, redirectionName, redirectionType);
    if (redirectionName === "EXTERNAL") {
      let url = id;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      window.open(url, "_blank");
      return;
    }
    if (id) {
      setActiveType(redirectionType);
      setActiveChildCategory(id);
      setActiveCategory(id);
      setObserverActive(false);
      router.push(`/${customLink}/category?${tableName ? `tableName=${tableName}` : ""}`);
    }
  };

  const paragraphPropsStyle = {
    color:
      paragraphStyle?.color === "transparent"
        ? "#ffffff"
        : paragraphStyle?.color,
  };

  return (
    <>
      {bannerLayouts.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <article
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            className="relative "
            key={layout?._id}
          >
            <figure className={"w-full rounded-2xl aspect-square relative"}>
              <ShimmerImage
                src={img?.logo || layout?.image}
                alt={layout?.title}
                width={320}
                height={320}
                className={"rounded-xl aspect-square object-contain"}
                hide
              />
              <article
                style={{
                  background: selectedColor?.bgColor || "#000000",
                }}
                className="w-full rounded-b-xl max-w-[20rem] px-3 pb-2 absolute bottom-0"
              >
                <div className="flex items-start justify-between mt-2">
                  <h1
                    style={paragraphStyle}
                    className="mt-0.5 text-base space-grotesk-700 font-semibold leading-5 capitalize truncate"
                  >
                    {heading ? heading : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div style={buttonStyleTags} className={defaultButtonStyle}>
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
                  className={"text-xs leading-4 mt-2 text-left opacity-70 pb-1"}
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
              </article>
            </figure>
          </article>
        );
      })}
      {bannerLayouts2.map((layout) => {
        if (layout?._id !== selectedLayout) return null;

        return (
          <article
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="relative text-left"
          >
            <figure className={"w-full rounded-2xl aspect-square relative"}>
              <ShimmerImage
                src={img?.logo || layout?.image || pastaDummy}
                alt={layout?.title}
                className="object-contain rounded-xl aspect-square"
                height={320}
                width={320}
              />
            </figure>
            <article
              style={{
                backgroundColor: selectedColor?.bgColor,
              }}
              className="absolute w-[95%] px-2 py-1 mx-2 shadow-xl bottom-2 rounded-xl bg-opacity-60"
            >
              <div className="flex justify-between pb-2">
                <h1
                  style={paragraphPropsStyle}
                  className="text-base space-grotesk-700 font-semibold truncate mt-[0.125rem]"
                >
                  {heading ? truncateDescription(heading) : "Heading"}
                </h1>
                {layout?.isButton && (
                  <div
                    style={buttonStyleTags}
                    className={`${defaultButtonStyle} !mt-0.5`}
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
                  ...paragraphPropsStyle,
                }}
                className="pb-1 text-xs leading-4 opacity-70"
              >
                {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
              </p>
            </article>
          </article>
        );
      })}
      {bannerLayouts3.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <article
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="relative w-full text-left rounded-2xl aspect-square"
          >
            <figure className="w-full max-w-[20rem] rounded-2xl max-h-[20rem]">
              <ShimmerImage
                src={img?.logo || layout?.image}
                alt={layout?.title}
                className="object-contain rounded-xl aspect-square"
                width={320}
                height={320}
              />
            </figure>
            <article
              style={{
                background:
                  selectedColor?.bgColor === "transparent"
                    ? "transparent"
                    : `linear-gradient(to top, ${selectedColor?.bgColor} 10%, ${selectedColor?.bgColor}80 50%, transparent 100%)`,
              }}
              className="absolute bottom-0 w-full px-3 pb-2 rounded-b-xl"
            >
              <div className="flex items-center justify-between">
                <h1
                  style={paragraphStyle}
                  className="mt-0.5 text-base space-grotesk-700 font-semibold leading-5 capitalize truncate"
                >
                  {heading ? truncateDescription(heading) : "Heading"}
                </h1>
                {layout?.isButton && (
                  <div
                    style={buttonOutlineStyleTags}
                    className={defaultButtonStyle}
                  >
                    <button type="button">{callToAction || "Explore"}</button>{" "}
                    <span className="text-[0.8rem]">
                      <LuArrowUpRight />
                    </span>
                  </div>
                )}
              </div>
              <div
                style={{
                  WebkitLineClamp: 2,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  ...paragraphStyle,
                }}
                className="pb-1 mt-2 text-xs leading-4 text-left opacity-70"
              >
                {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
              </div>
            </article>
          </article>
        );
      })}
      {bannerLayouts4.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <article
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="relative"
          >
            <figure className="w-full max-w-[20rem] rounded-2xl">
              <ShimmerImage
                src={img?.logo || layout?.image || pastaDummy}
                alt={layout?.title}
                className={"rounded-xl aspect-square object-contain"}
                width={320}
                height={320}
              />
            </figure>
            <center
              style={{
                background:
                  selectedColor?.bgColor === "transparent"
                    ? "transparent"
                    : `linear-gradient(to bottom, transparent 10%, ${
                        selectedColor?.bgColor === "transparent" ||
                        selectedColor?.bgColor === ""
                          ? "#000000"
                          : selectedColor?.bgColor
                      }95 40%, transparent 90%)`,
              }}
              className="absolute w-full px-4 py-[5rem] top-12 rounded-xl"
            >
              <h1
                style={paragraphPropsStyle}
                className="text-base text-white truncate bungee-inline"
              >
                {heading ? truncateDescription(heading) : "Heading"}
              </h1>
              <div
                style={{
                  WebkitLineClamp: 2,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  ...paragraphPropsStyle,
                }}
                className="text-[0.8rem] leading-5 text-white space-grotesk-700  bg-opacity-50 pb-2"
              >
                {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
              </div>
              {layout?.isButton && (
                <button
                  type="button"
                  style={buttonOutlineStyleTags}
                  className={defaultButtonStyle}
                >
                  {callToAction || "Explore"}
                  <LuArrowUpRight />
                </button>
              )}
            </center>
          </article>
        );
      })}
      {bannerLayouts5.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <article
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="relative text-left"
          >
            <figure className="w-full max-w-[20rem] rounded-2xl">
              <ShimmerImage
                src={img?.logo || layout?.image || pastaDummy}
                alt={layout?.title}
                className="object-contain rounded-xl aspect-square"
                width={320}
                height={320}
              />
            </figure>
            <article
              style={{
                background:
                  selectedColor?.bgColor === "transparent"
                    ? "transparent"
                    : `linear-gradient(to top, transparent 10%, ${
                        selectedColor?.bgColor || "black"
                      } 100%)`,
              }}
              className="absolute top-0 flex flex-col items-start justify-center w-full p-2 bg-black rounded-xl"
            >
              <h1
                style={paragraphPropsStyle}
                className="mt-2 text-base text-white truncate bungee-inline"
              >
                {heading ? truncateDescription(heading) : "Heading"}
              </h1>
              <p
                style={{
                  WebkitLineClamp: 1,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  ...paragraphPropsStyle,
                }}
                className="text-[0.8rem] space-grotesk-700 text-white bg-opacity-50 -mt-2"
              >
                {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
              </p>
              {layout?.isButton && (
                <div
                  style={buttonOutlineStyleTags}
                  className={cn(defaultButtonStyle, "absolute top-4 right-4")}
                >
                  <button type="button">{callToAction || "Explore"}</button>{" "}
                  <span className="text-[0.8rem]">
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
          <article
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="relative w-full aspect-square max-w-[20rem] rounded-xl"
            style={{
              backgroundColor: selectedColor?.bgColor || color,
            }}
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
                className="text-base leading-10 text-white truncate bungee-inline"
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
                className="text-[0.8rem] space-grotesk-700 leading-5 text-white bg-opacity-50 mb-2"
              >
                {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
              </p>
              {layout?.isButton && (
                <div
                  style={buttonOutlineStyleTags}
                  className={defaultButtonStyle}
                >
                  <button type="button">{callToAction || "Explore"}</button>{" "}
                  <span className="text-[0.8rem]">
                    <LuArrowUpRight />
                  </span>
                </div>
              )}
            </article>
          </article>
        );
      })}
      {bannerLayouts7.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <article
            key={layout?._id}
            className="relative"
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
          >
            <ShimmerImage
              src={img?.logo || layout?.image || pastaDummy}
              alt={layout?.title}
              className="object-contain rounded-xl aspect-square"
              width={320}
              height={320}
            />
          </article>
        );
      })}
    </>
  );
};

const BannerLayouts = memo(MemoBannersLayout);
export default BannerLayouts;
