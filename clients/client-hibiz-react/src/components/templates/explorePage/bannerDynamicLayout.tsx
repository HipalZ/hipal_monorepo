import { useBannerStore } from "@/components/store/useBannerStore";
import { type CSSProperties, memo } from "react";
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
import { LuArrowUpRight } from "react-icons/lu";
import pastaDummy from "@/assets/pastaDummy.png";
import { hexToRGBA } from "@/components/utils/helper";

interface Props {
  heading?: string;
  paragraph?: string;
  callToAction?: string;
  img?: string;
  selectedColor?: { bgColor: string; textColor: string };
  paragraphStyle?: CSSProperties;
  buttonStyle?: { color: string; buttonColor?: string };
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
  } = props;

  const { selectedBannerType, openPreview } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
    openPreview: s.openPreview,
  }));

  const buttonStyleTags = {
    backgroundColor:
      buttonStyle?.color === "transparent" || buttonStyle?.color === "#808080"
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

  const buttonClassNames = `flex items-center justify-center md:px-3
  rounded-full space-x-1 transition-all duration-300 ease-in-out transform shadow-sm
  hover:scale-105 active:scale-95 shadow-inner ${
    openPreview
      ? "text-[0.75rem] px-3 py-1"
      : "text-[0.5rem] px-1.5 py-0.5 md:text-[1rem]"
  }`;

  const arrowButtonStyles = `${
    openPreview ? "text-[0.9rem]" : "text-[0.6rem] md:text-[1rem]"
  }`;
  const headingTextStyle = `${
    selectedBannerType !== BannerType.BANNER_TYPE_1 ? "text-white" : ""
  } ${openPreview ? "text-[1.2rem]" : "text-[0.85rem] md:text-[1.5rem]"}`;

  const paragraphTextStyle = `${
    selectedBannerType !== BannerType.BANNER_TYPE_1 ? "text-white" : ""
  } ${
    openPreview
      ? "text-[0.8rem] text-justify"
      : "text-[0.6rem] md:text-[1.25rem] text-justify"
  }`;

  const paragraphPropsStyle = {
    color:
      paragraphStyle?.color === "transparent" ? "white" : paragraphStyle?.color,
  };

  return (
    <>
      {bannerLayouts.map((layout) => {
        if (layout?._id !== selectedBannerType) return null;
        return (
          <div
            className={`flex flex-col ${
              openPreview ? "w-[20rem] h-[25rem]" : "md:w-[25rem] md:h-[25rem]"
            }`}
            key={layout?._id}
          >
            <article key={layout?._id}>
              <figure
                className={`w-full rounded-2xl ${
                  openPreview
                    ? "w-[20rem] h-[17rem]"
                    : "md:w-[25rem] md:h-[18rem]"
                }`}
              >
                <img
                  src={img || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className={`rounded-t-xl w-[14rem] h-[10rem] shadow-xl object-cover ${
                    openPreview
                      ? "w-[20rem] h-[17rem]"
                      : "md:w-[25rem] md:h-[18rem]"
                  }`}
                />
              </figure>
              <article
                style={{
                  background:
                    selectedColor?.bgColor === "transparent"
                      ? "transparent"
                      : `linear-gradient(137.02deg, ${
                          selectedColor?.bgColor || "black"
                        }80 1.64%, ${
                          selectedColor?.bgColor || "black"
                        }30 98.36%)`,
                }}
                className={`w-full rounded-b-xl max-w-[14rem] shadow-xl px-2 py-0.5 ${
                  openPreview
                    ? "max-w-[20rem] max-h-[7rem] h-[7rem] px-3 pt-2"
                    : "md:w-[25rem] md:max-w-[25rem] md:h-[7rem] h-[3.5rem]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h1
                    style={paragraphPropsStyle}
                    className={`${headingTextStyle} truncate`}
                  >
                    {heading ? heading : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={buttonStyleTags}
                      className={`${buttonClassNames} mt-0.5 pl-2 py-1`}
                    >
                      <button type="button">{callToAction || "Explore"}</button>{" "}
                      <span className={arrowButtonStyles}>
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
                  className={`${paragraphTextStyle}`}
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

        const backgroundColor =
          selectedColor?.bgColor === "transparent"
            ? "transparent"
            : selectedColor?.bgColor
              ? hexToRGBA(selectedColor.bgColor, 0.4)
              : "transparent";

        return (
          <section
            key={layout?._id}
            className={`${
              openPreview ? "w-[20rem] h-[25rem]" : ""
            } md:h-[25rem] md:w-[25rem]`}
          >
            <article
              className={`relative flex justify-start ${
                openPreview ? "justify-center shrink-0" : ""
              } md:justify-center md:shrink-0`}
            >
              <figure className="w-full rounded-2xl">
                <img
                  src={img || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className={`rounded-xl h-[13rem] w-[13rem] object-cover ${
                    openPreview ? "h-[25rem] w-[25rem]" : ""
                  } md:h-[25rem] md:w-[25rem] bg-cover aspect-square`}
                />
              </figure>
              <article
                style={{
                  backgroundColor: backgroundColor,
                }}
                className={`absolute bottom-2 mx-2 px-2 py-1 rounded-xl w-[90%] shadow-xl backdrop-blur-sm bg-opacity-60 ${
                  openPreview ? "p-4 space-y-1 min-h-[5rem]" : ""
                } md:p-4 md:space-y-1 md:min-h-[5rem]`}
              >
                <div className="flex justify-between w-full">
                  <h1 style={paragraphPropsStyle} className={headingTextStyle}>
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div style={buttonStyleTags} className={buttonClassNames}>
                      <button type="button">{callToAction || "Explore"}</button>{" "}
                      <span
                        className={`text-[0.5rem] ${
                          openPreview ? "text-[0.75rem]" : ""
                        } md:text-[1rem]`}
                      >
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
                  className={paragraphTextStyle}
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
        const sizeClasses = openPreview
          ? "w-[20rem] h-[25rem]"
          : "md:w-[25rem] md:h-[25rem] w-[14rem] h-[14rem]";
        return (
          <section key={layout?._id}>
            <article
              className={`relative flex justify-center shrink-0 ${sizeClasses}`}
            >
              <figure className={`w-full rounded-2xl ${sizeClasses}`}>
                <img
                  src={img || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className={`rounded-xl aspect-square object-cover ${sizeClasses}`}
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
                <div className="flex justify-between mb-2 text-white">
                  <h1 style={paragraphPropsStyle} className={headingTextStyle}>
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  {layout?.isButton && (
                    <div
                      style={buttonOutlineStyleTags}
                      className={buttonClassNames}
                    >
                      <button type="button">{callToAction || "Explore"}</button>{" "}
                      <span className={arrowButtonStyles}>
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
                  className={paragraphTextStyle}
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
        const sizeClasses = openPreview
          ? "w-[20rem] h-[25rem]"
          : "md:w-[25rem] md:h-[25rem] w-[14rem] h-[14rem]";
        return (
          <section key={layout?._id}>
            <article
              className={`relative flex justify-center shrink-0 ${sizeClasses}`}
            >
              <figure className={`w-full rounded-2xl ${sizeClasses}`}>
                <img
                  src={img || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className={`bg-cover rounded-xl aspect-square ${sizeClasses}`}
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
                className="absolute bottom-1/2 translate-y-1/2 w-full flex flex-col items-center justify-center p-2 rounded-xl h-[10rem]"
              >
                <h1 style={paragraphPropsStyle} className={headingTextStyle}>
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
                  className={paragraphTextStyle}
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div
                    style={buttonOutlineStyleTags}
                    className={`mt-1 ${buttonClassNames}`}
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
        const sizeClasses = openPreview
          ? "w-[20rem] h-[25rem]"
          : "md:w-[25rem] md:h-[25rem] w-[14rem] h-[14rem]";
        return (
          <section key={layout?._id}>
            <article
              className={`relative flex justify-center shrink-0 ${sizeClasses}`}
            >
              <figure className={`w-full rounded-2xl ${sizeClasses}`}>
                <img
                  src={img || layout?.image || pastaDummy}
                  alt={layout?.title}
                  className={`${sizeClasses} rounded-2xl`}
                />
              </figure>
              <article
                style={{
                  background:
                    selectedColor?.bgColor === "transparent"
                      ? null
                      : `linear-gradient(to top, transparent 10%, ${
                          selectedColor?.bgColor || "black"
                        }60 90%)`,
                }}
                className="absolute top-0 flex flex-col items-start justify-center w-full p-2 space-y-2 rounded-xl"
              >
                <h1 style={paragraphPropsStyle} className={headingTextStyle}>
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
                  className={paragraphTextStyle}
                >
                  {paragraph
                    ? truncateDescription(paragraph)
                    : layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div
                    style={buttonOutlineStyleTags}
                    className={`${buttonClassNames}`}
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
        const sizeClasses = openPreview
          ? "w-[20rem] h-[25rem]"
          : "md:w-[25rem] md:h-[25rem] w-[14rem] h-[14rem]";
        return (
          <section key={layout?._id} className={sizeClasses}>
            <article
              className={`relative rounded-xl ${sizeClasses}`}
              style={{ backgroundColor: selectedColor?.bgColor || color }}
            >
              <figure className="absolute top-2 left-2">
                {layout?.isPattern && <layout.pattern color={patternColor} />}
              </figure>
              <figure className="absolute -rotate-180 bottom-2 right-2">
                {layout?.isPattern && <layout.pattern color={patternColor} />}
              </figure>
              <article className="absolute flex flex-col items-center justify-center w-full p-2 space-y-2 translate-y-1/2 bottom-1/2 rounded-xl">
                <h1 style={paragraphPropsStyle} className={headingTextStyle}>
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
                  // className="text-[0.8rem] bg-opacity-50 text-justify"
                  className={paragraphTextStyle}
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
                    <span className={arrowButtonStyles}>
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
        if (layout?._id !== selectedBannerType) return null;
        const sizeClasses = openPreview
          ? "w-[20rem] h-[20rem]"
          : "md:w-[20rem] md:h-[20rem] xl:w-[20rem] xl:h-[20rem] w-[14rem] h-[14rem]";
        return (
          <section
            key={layout?._id}
            className="border border-1 border-[#000] rounded-2xl overflow-hidden"
          >
            <img
              src={img || layout?.image || pastaDummy}
              alt={layout?.title}
              className={`${sizeClasses} aspect-square object-cover`}
            />
          </section>
        );
      })}
    </>
  );
};

const BannerDynamicLayout = memo(MemoBannerDynamicLayout);
export default BannerDynamicLayout;
