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

interface Props {
  heading?: string;
  paragraph?: string;
  callToAction?: string;
  img?: { logo: string };
  selectedColor?: { bgColor: string; textColor: string };
  paragraphStyle?: CSSProperties;
  buttonStyle?: { color: string; buttonColor?: string };
  selectedLayout?: string;
}
const MemoBannersLayout = (props: Props) => {
  const {
    heading,
    paragraph,
    callToAction,
    img,
    selectedColor,
    paragraphStyle,
    buttonStyle,
    selectedLayout,
  } = props;

  return (
    <>
      {bannerLayouts.map((layout) => {
        if (layout?._id !== selectedLayout) return null;
        return (
          <div className="flex flex-col shrink-0" key={layout?._id}>
            <article key={layout?._id} className="max-h-[13rem]">
              <figure className="w-full rounded-2xl">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-t-xl w-[12rem] h-[8.5rem]"
                  width={136}
                  height={192}
                />
              </figure>
              <article
                style={{
                  backgroundColor: selectedColor?.bgColor || "white",
                }}
                className="w-full max-w-[12rem] p-2 rounded-b-xl h-[3.5rem] shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h1 style={paragraphStyle} className="text-[0.7rem]">
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={{
                        backgroundColor: buttonStyle?.color || "red",
                      }}
                      className="px-2 h-4 flex items-center text-[0.6rem] text-white rounded-full space-x-0.5 -mr-1"
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
            <article className="relative flex justify-start">
              <figure className="w-full max-h-[12rem] rounded-2xl">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[12rem] bg-cover aspect-square shrink-0"
                  height={136}
                  width={136}
                />
              </figure>
              <article
                style={{
                  backgroundColor: selectedColor?.bgColor || "white",
                }}
                className="absolute bottom-2 w-[11rem] md:max-w-[11rem] mx-2 p-2 rounded-xl h-[3rem]"
              >
                <div className="flex justify-between">
                  <h1 style={paragraphStyle} className="text-[0.7rem] truncate">
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div className="flex items-center bg-red-700 px-1 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1">
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
            <article className="relative flex justify-center shrink-0 max-w-[12rem]">
              <figure className="w-full max-w-[14rem] rounded-2xl max-h-[12rem] ">
                <Image
                  src={img?.logo || layout?.image}
                  alt={layout?.title}
                  className="rounded-xl aspect-square h-[12rem] bg-cover shrink-0"
                  width={136}
                  height={136}
                />
              </figure>
              <article
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 10%, black 90%)",
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
            <article className="relative flex justify-center max-w-[12rem]">
              <figure className="w-full max-w-[12rem] rounded-2xl aspect-square">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[12rem] aspect-square bg-cover w-full"
                  width={136}
                  height={136}
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
        if (layout?._id !== selectedLayout) return null;
        return (
          <section key={layout?._id}>
            <article className="relative flex justify-center shrink-0 max-w-[12rem]">
              <figure className="w-full max-w-[12rem] rounded-2xl">
                <Image
                  src={img?.logo || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className="rounded-xl h-[12rem] aspce-square bg-cover"
                  width={136}
                  height={136}
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
        if (layout?._id !== selectedLayout) return null;
        const color =
          layout?._id === BannerType.BANNER_TYPE_12 ? "#678BFF" : "#E03030";
        const patternColor = "#00000050";
        return (
          <section key={layout?._id} className="w-[12rem] h-[12rem] shrink-0">
            <article
              className="relative h-[12rem] max-w-[12rem] rounded-xl"
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

const BannerLayouts = memo(MemoBannersLayout);
export default BannerLayouts;
