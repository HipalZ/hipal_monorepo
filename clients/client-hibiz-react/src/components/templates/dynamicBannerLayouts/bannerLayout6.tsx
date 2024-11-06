import {
  useBannerStyles,
  useLayoutObject,
} from "@/components/helpers/bannersHelper";
import { useBannerStore } from "@/components/store/useBannerStore";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import {
  BannerType,
  truncateDescription,
} from "@/components/utils/bannerLayouts";
import { memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";

const MemoBannerLayout6 = () => {
  const {
    buttonStyle,
    callToAction,
    heading,
    paragraph,
    paragraphStyle,
    selectedColor,
  } = useBannerTemp((s) => ({
    buttonStyle: s.buttonStyle,
    callToAction: s.callToAction,
    heading: s.heading,
    paragraph: s.paragraph,
    paragraphStyle: s.paragraphStyle,
    selectedColor: s.selectedColor,
  }));

  const { selectedBannerType, openPreview } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
    openPreview: s.openPreview,
  }));
  const {
    buttonOutlineStyleTags,
    sizeClasses,
    buttonClassNames,
    arrowButtonStyles,
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
  const color =
    layout?._id === BannerType.BANNER_TYPE_12 ? "#678BFF" : "#E03030";
  const patternColor = "#00000050";
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
            className={paragraphTextStyle}
          >
            {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
          </p>
          {layout?.isButton && (
            <div style={buttonOutlineStyleTags} className={buttonClassNames}>
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
};

const BannerLayout6 = memo(MemoBannerLayout6);
export default BannerLayout6;
