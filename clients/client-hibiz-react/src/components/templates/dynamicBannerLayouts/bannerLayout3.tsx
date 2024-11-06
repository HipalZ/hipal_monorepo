import {
  useBannerStyles,
  useLayoutObject,
} from "@/components/helpers/bannersHelper";
import { useBannerStore } from "@/components/store/useBannerStore";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import { memo } from "react";
import pastaDummy from "@/assets/pastaDummy.png";
import { truncateDescription } from "@/components/utils/bannerLayouts";
import { LuArrowUpRight } from "react-icons/lu";

const MemoBannerLayout3 = () => {
  const { callToAction, heading, img, paragraph, selectedColor } =
    useBannerTemp((s) => ({
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
    buttonOutlineStyleTags,
    buttonClassNames,
    arrowButtonStyles,
    headingTextStyle,
    paragraphTextStyle,
    paragraphPropsStyle,
    sizeClasses,
  } = useBannerStyles({
    openPreview,
    selectedBannerType,
  });
  const layout = useLayoutObject(selectedBannerType);
  return (
    <>
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
              {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
            </p>
          </article>
        </article>
      </section>
    </>
  );
};

const BannerLayout3 = memo(MemoBannerLayout3);
export default BannerLayout3;
