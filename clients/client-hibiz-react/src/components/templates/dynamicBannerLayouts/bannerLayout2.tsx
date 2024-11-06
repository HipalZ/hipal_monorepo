import {
  useBannerStyles,
  useLayoutObject,
} from "@/components/helpers/bannersHelper";
import { useBannerStore } from "@/components/store/useBannerStore";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import { truncateDescription } from "@/components/utils/bannerLayouts";
import { hexToRGBA } from "@/components/utils/helper";
import { LuArrowUpRight } from "react-icons/lu";
import pastaDummy from "@/assets/pastaDummy.png";
import { memo } from "react";

const MemoBannerLayout2 = () => {
  const {
    buttonStyle,
    callToAction,
    heading,
    img,
    paragraph,
    paragraphStyle,
    selectedColor,
  } = useBannerTemp((s) => ({
    buttonStyle: s.buttonStyle,
    callToAction: s.callToAction,
    heading: s.heading,
    img: s.img,
    paragraph: s.paragraph,
    paragraphStyle: s.paragraphStyle,
    selectedColor: s.selectedColor,
  }));

  const { selectedBannerType, openPreview } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
    openPreview: s.openPreview,
  }));
  const {
    buttonStyleTags,
    buttonClassNames,
    headingTextStyle,
    paragraphTextStyle,
    paragraphPropsStyle,
  } = useBannerStyles({
    buttonStyle,
    paragraphStyle,
    openPreview,
    selectedBannerType,
  });
  const layout = useLayoutObject(selectedBannerType);
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
            {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
          </p>
        </article>
      </article>
    </section>
  );
};

const BannerLayout2 = memo(MemoBannerLayout2);
export default BannerLayout2;
