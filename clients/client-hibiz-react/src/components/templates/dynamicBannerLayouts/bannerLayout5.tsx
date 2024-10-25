import { memo } from "react";
import pastaDummy from "@/assets/pastaDummy.png";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import { useBannerStore } from "@/components/store/useBannerStore";
import {
  useBannerStyles,
  useLayoutObject,
} from "@/components/helpers/bannersHelper";
import { truncateDescription } from "@/components/utils/bannerLayouts";
import { LuArrowUpRight } from "react-icons/lu";

const MemoBannerLayout5 = () => {
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
    buttonOutlineStyleTags,
    buttonClassNames,
    headingTextStyle,
    paragraphTextStyle,
    paragraphPropsStyle,
    sizeClasses,
  } = useBannerStyles({
    buttonStyle,
    paragraphStyle,
    openPreview,
    selectedBannerType,
  });
  const layout = useLayoutObject(selectedBannerType);
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
            {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
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
};

const BannerLayout5 = memo(MemoBannerLayout5);
export default BannerLayout5;
