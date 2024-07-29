"use client";
import { type CSSProperties, memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import pastaDummy from "@/assets/pastaDummy.png";
import Image from "next/image";
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
import { cn } from "@hi/common";
import { useParams, useRouter } from "next/navigation";

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
  } = props;

  const buttonStyleTags = {
    backgroundColor: buttonStyle?.color || "red",
    color: buttonStyle?.buttonColor || "black",
  };
  const buttonOutlineStyleTags = {
    backgroundColor: "transparent",
    color: buttonStyle?.color || "black",
    border: `1px solid ${buttonStyle?.color || "black"}`,
  };

  const defaultButtonStyle =
    "px-2 h-6 flex items-center text-[0.7rem] text-white rounded-full space-x-0.5 -mr-1";

  const router = useRouter();
  const customLink = useParams()?.businessId;
  const handleNavigation = (id: string, redirectionName: string) => {
    if (redirectionName === "EXTERNAL") {
      let url = id;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      window.open(url, "_blank");
      return;
    }
    router.push(`/${customLink}/category#${id}`);
  };

  return (
    <>
      {bannerLayouts.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <div
            className="flex flex-col shrink-0 h-[20rem] aspect-square"
            key={layout?._id}
            onClick={() =>
              handleNavigation(redirectionId || "", redirectionName || "")
            }
          >
            <article key={layout?._id} className="max-h-[20rem]">
              <figure className="w-full rounded-2xl">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl w-[20rem] h-[20rem]"
                  width={240}
                  height={240}
                />
              </figure>
              <article
                style={{
                  backgroundColor: selectedColor?.bgColor || "white",
                }}
                className="absolute bottom-0 z-10 w-full max-w-[20rem] p-2 rounded-b-xl"
              >
                <div className="flex items-center justify-between">
                  <h1
                    style={paragraphStyle}
                    className={cn(
                      "text-[1rem] leading-5",
                      layout?.isButton ? "w-[70%]" : "w-[100%]",
                    )}
                  >
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={buttonStyleTags}
                      className={cn(
                        defaultButtonStyle,
                        "absolute right-4 bottom-8",
                      )}
                    >
                      <button type="button">{callToAction || "Explore"}</button>
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
                  className="text-[0.8rem] leading-5 mt-2"
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
          <section
            onClick={() => handleNavigation(redirectionId, redirectionName)}
            key={layout?._id}
            className="shrink-0 h-[20rem]"
          >
            <article className="relative flex justify-start">
              <figure className="w-full max-h-[20rem] rounded-2xl aspect-square">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[20rem] bg-cover aspect-square shrink-0"
                  height={320}
                  width={320}
                />
              </figure>
              <article
                style={{
                  backgroundColor: selectedColor?.bgColor || "white",
                }}
                className="absolute bottom-2 w-[19rem] md:max-w-[20rem] mx-2 p-2 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <h1
                    style={paragraphStyle}
                    className={cn(
                      "text-[1rem] truncate",
                      layout?.isButton ? "w-[70%]" : "w-[90%]",
                    )}
                  >
                    {heading ? truncateDescription(heading) : "Heading"}
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
                  className="text-[0.8rem] leading-5"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}{" "}
                </p>
              </article>
            </article>
          </section>
        );
      })}
      {bannerLayouts3.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <section
            onClick={() => handleNavigation(redirectionId, redirectionName)}
            key={layout?._id}
            className="shrink-0 h-[20rem]"
          >
            <article className="relative flex justify-center shrink-0 max-w-[20rem] aspect-square">
              <figure className="w-full max-w-[20rem] rounded-2xl max-h-[14rem]">
                <Image
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  className="rounded-xl aspect-square h-[20rem] bg-cover shrink-0"
                  width={320}
                  height={320}
                />
              </figure>
              <article
                style={{
                  background: `linear-gradient(to bottom, transparent 10%, ${
                    selectedColor?.bgColor ? selectedColor?.bgColor : "black"
                  } 90%)`,
                }}
                className="absolute bottom-0 w-full p-2 rounded-xl h-[5rem]"
              >
                <div className="flex items-center justify-between">
                  <h1
                    style={paragraphStyle}
                    className="my-2 text-base leading-5 text-white truncate"
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
                  className="text-[0.8rem] text-white leading-none"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </div>
              </article>
            </article>
          </section>
        );
      })}
      {bannerLayouts4.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <section
            onClick={() => handleNavigation(redirectionId, redirectionName)}
            key={layout?._id}
            className="shrink-0 h-[20rem]"
          >
            <article className="relative flex justify-center shrink-0 max-w-[20rem] aspect-square">
              <figure className="w-full max-w-[20rem] rounded-2xl max-h-[14rem]">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[20rem] aspect-square bg-cover w-full"
                  width={240}
                  height={240}
                />
              </figure>
              <article
                style={{
                  background: `linear-gradient(to bottom, transparent 10%, ${
                    selectedColor?.bgColor ? selectedColor?.bgColor : "black"
                  } 50%, transparent 90%)`,
                }}
                className="absolute flex flex-col items-center justify-center w-full px-2 py-8 translate-y-[40%] bg-black rounded-xl"
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
                  className="text-[0.8rem] leading-5 text-white bg-opacity-50 pb-2"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
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
          </section>
        );
      })}
      {bannerLayouts5.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <section
            onClick={() => handleNavigation(redirectionId, redirectionName)}
            key={layout?._id}
            className="shrink-0 h-[20rem]"
          >
            <article className="relative flex justify-center shrink-0 max-w-[20rem]">
              <figure className="w-full max-w-[20rem] rounded-2xl">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[20rem] aspect-square bg-cover"
                  width={320}
                  height={320}
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
                    WebkitLineClamp: 1,
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
            onClick={() => handleNavigation(redirectionId, redirectionName)}
            key={layout?._id}
            className="w-[20rem] h-[20rem] shrink-0"
          >
            <article
              className="relative h-[20rem] max-w-[20rem] rounded-xl"
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
                  className="text-[1rem] leading-10 truncate text-white"
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
                  className="text-[0.8rem] leading-5 text-white bg-opacity-50 text-justify mb-2"
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
          </section>
        );
      })}
    </>
  );
};

const BannerLayouts = memo(MemoBannersLayout);
export default BannerLayouts;
