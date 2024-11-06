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

const MemoBannerLayout4 = () => {
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
    sizeClasses,
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
            {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
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
};

const BannerLayout4 = memo(MemoBannerLayout4);
export default BannerLayout4;
