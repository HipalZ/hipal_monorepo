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
  bannerLayouts7,
  BannerType,
  truncateDescription,
} from "@/components/utils/bannerLayouts";
import { cn } from "@hi/common";
import { useParams, useRouter } from "next/navigation";
import { hexToRGBA } from "@/components/utils/helpers";
import { useActiveClass } from "@/components/store/useActiveClass";

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
  } = props;

  const { setActiveType, setActiveCategory } = useActiveClass((s) => ({
    setActiveType: s.setActiveType,
    setActiveCategory: s.setActiveCategory,
  }));

  const buttonStyleTags = {
    backgroundColor:
      buttonStyle?.color === "transparent"
        ? "transparent"
        : buttonStyle?.color || "#808080",
    color: buttonStyle?.buttonColor || "white",
    background: `linear-gradient(137.02deg, ${
      buttonStyle?.color || "white"
    }80 1.64%,${buttonStyle?.color || "white"}30 98.36%)`,
  };
  const buttonOutlineStyleTags = {
    backgroundColor: "transparent",
    color: buttonStyle?.color || "white",
    border: `1px solid ${buttonStyle?.color || "white"}`,
    transition: "background-color 300ms ease, color 300ms ease",
  };

  const defaultButtonStyle =
    "px-2 h-6 flex items-center transition-all duration-300 ease-in-out transform shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 text-[0.7rem] text-white rounded-full space-x-0.5 -mr-1";

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
    setActiveType(redirectionType);
    setActiveCategory(id);
    router.push(`/${customLink}/category#${id}`);
  };

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
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            className="flex flex-col embla__parallax"
            key={layout?._id}
          >
            <article key={layout?._id}>
              <figure className={"w-full rounded-2xl"}>
                <Image
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  width={320}
                  height={224}
                  className={
                    "rounded-t-xl w-[20rem] h-[14rem] embla__parallax__img object-cover object-top"
                  }
                />
              </figure>
              <article
                style={{
                  background: `linear-gradient(137.02deg, ${
                    selectedColor?.bgColor || "white"
                  }80 1.64%,${selectedColor?.bgColor || "white"}30 98.36%)`,
                }}
                className="h-[6rem] w-full rounded-b-xl max-w-[20rem] border border-1 border-[#000] px-2 py-0.5 "
              >
                <div className="flex items-start justify-between mt-2">
                  <h1
                    style={paragraphStyle}
                    className="truncate text-[1rem] leading-5"
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
                  className={"text-[0.8rem] leading-5 mt-2 text-justify"}
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
        const backgroundColor =
          selectedColor?.bgColor === "transparent"
            ? "transparent"
            : selectedColor?.bgColor
              ? hexToRGBA(selectedColor.bgColor, 0.4)
              : "transparent";
        return (
          <section
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="shrink-0 h-[20rem]"
          >
            <article className="relative flex justify-center">
              <figure className="max-h-[20rem] w-full rounded-2xl">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[20rem] w-full object-cover object-top shrink-0"
                  height={320}
                  width={320}
                />
              </figure>
              <article
                style={{
                  backgroundColor: backgroundColor,
                }}
                className="absolute w-[17rem] px-2 py-1 mx-2 shadow-xl bottom-2 rounded-xl backdrop-blur-sm bg-opacity-60"
              >
                <div className="flex justify-between">
                  <h1
                    style={paragraphPropsStyle}
                    className="text-[1rem] truncate w-2/3"
                  >
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={buttonStyleTags}
                      className={`${defaultButtonStyle} mt-2`}
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
                  className="text-[0.8rem] text-white leading-5"
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
          <article
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="relative flex justify-center shrink-0 max-w-[20rem] h-[20rem]"
          >
            <figure className="w-full max-w-[20rem] rounded-2xl max-h-[20rem]">
              <Image
                src={img?.logo || layout?.image}
                alt={layout?.title}
                className="rounded-xl aspect-square h-[20rem] object-cover object-top shrink-0"
                width={320}
                height={320}
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
                className="text-[0.8rem] text-white leading-4 "
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
          <section
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="shrink-0 h-[20rem]"
          >
            <article className="relative flex justify-center shrink-0 max-w-[20rem] aspect-square">
              <figure className="w-full max-w-[20rem] rounded-2xl max-h-[14rem]">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[20rem] aspect-square object-cover object-top shrink-0"
                  width={320}
                  height={320}
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
                className="absolute flex flex-col items-center justify-center w-full px-2 py-8 translate-y-[48%] bg-black rounded-xl"
              >
                <h1
                  style={paragraphStyle}
                  className="text-base text-white truncate"
                >
                  {heading ? truncateDescription(heading) : "Heading"}
                </h1>
                <div
                  style={{
                    WebkitLineClamp: 2,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    ...paragraphStyle,
                  }}
                  className="text-[0.8rem] leading-5 text-white bg-opacity-50 pb-2 text-justify"
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </div>
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
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="shrink-0 h-[20rem]"
          >
            <article className="relative flex justify-center shrink-0 max-w-[20rem]">
              <figure className="w-full max-w-[20rem] rounded-2xl">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[20rem] aspect-square object-cover object-top"
                  width={320}
                  height={320}
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
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
            key={layout?._id}
            className="w-full h-[20rem] shrink-0"
          >
            <article
              className="relative h-[20rem] max-w-[20rem] rounded-xl"
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
      {bannerLayouts7.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <section
            key={layout?._id}
            className="border border-1 h-[20rem] border-[#000] rounded-2xl overflow-hidden"
            onClick={() =>
              handleNavigation(redirectionId, redirectionName, redirectionType)
            }
          >
            <Image
              src={img?.logo || layout?.image || pastaDummy}
              alt={layout?.title}
              className="h-[20rem] w-full object-cover object-top rounded-2xl"
              width={320}
              height={320}
            />
          </section>
        );
      })}
    </>
  );
};

const BannerLayouts = memo(MemoBannersLayout);
export default BannerLayouts;
